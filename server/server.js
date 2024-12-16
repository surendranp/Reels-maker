const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const multer = require('multer'); // Add multer for file uploads
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Global error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1); // Exit to avoid unstable state
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/output', express.static(path.join(__dirname, 'output')));

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  }
});
const upload = multer({ storage: storage });

// Route for uploading image files (adjust as needed for multiple files)
app.post('/upload-images', upload.array('images', 10), (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No images uploaded.' });
  }

  res.json({ message: 'Images uploaded successfully!', files });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Route to search images from Unsplash
app.get('/search-images', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ message: 'Query parameter q is required.' });
  }

  try {
    const images = await fetchImagesFromUnsplash(query);
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error.message);
    res.status(500).json({ message: 'Error fetching images.' });
  }
});

// Route to generate audio from text
app.post('/generate-audio', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Text is required to generate audio.' });
  }

  try {
    const audioPath = await generateAudio(text);
    res.json({ audioPath });
  } catch (error) {
    console.error('Error generating audio:', error.message);
    res.status(500).json({ message: 'Error generating audio.' });
  }
});

// Route to create video from images and audio
app.post('/create-video', async (req, res) => {
  const { images, durationPerImage, audioPath } = req.body;

  if (!images || !durationPerImage || !audioPath) {
    return res.status(400).json({ message: 'Images, durationPerImage, and audioPath are required.' });
  }

  try {
    const videoPath = await createVideo(images, durationPerImage, audioPath);
    res.json({ message: 'Video created successfully!', videoPath: `/output/output_video.mp4` });
  } catch (error) {
    console.error('Error creating video:', error.message);
    res.status(500).json({ message: 'Error creating video.' });
  }
});

// Function to fetch images from Unsplash
async function fetchImagesFromUnsplash(query) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`;
  try {
    const response = await axios.get(url);
    const results = response.data.results;
    return results.map(image => ({
      url: image.urls ? image.urls.regular : null,
    })).filter(image => image.url !== null);
  } catch (error) {
    console.error('Error fetching images from Unsplash:', error.message);
    throw new Error('Error fetching images from Unsplash');
  }
}

// Function to generate audio using Eleven Labs API
async function generateAudio(text) {
  const audioPath = path.join(__dirname, 'output', 'output_audio.mp3');
  try {
    const response = await axios.post('https://api.elevenlabs.io/v1/text-to-speech/pqHfZKP75CvOlQylNhV4', {
      text: text
    }, {
      headers: {
        'xi-api-key': process.env.ELEVEN_LABS_API_KEY,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    });

    fs.writeFileSync(audioPath, response.data);
    return audioPath;
  } catch (error) {
    console.error('Error generating audio:', error.message);
    throw new Error('Failed to generate audio');
  }
}

// Function to create video using FFmpeg
async function createVideo(images, durationPerImage, audioPath) {
  const tempDir = path.join(__dirname, 'uploads');
  const videoOutputPath = path.join(__dirname, 'output', 'output_video.mp4');

  // Ensure directories exist
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  if (!fs.existsSync(path.join(__dirname, 'output'))) fs.mkdirSync(path.join(__dirname, 'output'), { recursive: true });

  await Promise.all(images.map(async (image, index) => {
    if (!image.url) throw new Error('Image URL is undefined');

    const filePath = path.join(tempDir, `image${index + 1}.jpg`);
    const response = await axios({
      url: image.url,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(fs.createWriteStream(filePath));
    return new Promise((resolve, reject) => {
      response.data.on('end', resolve);
      response.data.on('error', reject);
    });
  }));

  return new Promise((resolve, reject) => {
    const ffmpegCommand = `ffmpeg -framerate 1/${durationPerImage} -i ${tempDir}/image%d.jpg -i ${audioPath} -c:v libx264 -r 30 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest ${videoOutputPath}`;

    console.log('Running FFmpeg command:', ffmpegCommand);

    exec(ffmpegCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('FFmpeg error:', error.message);
        console.error('FFmpeg stderr:', stderr);
        reject(error);
      } else {
        console.log('FFmpeg stdout:', stdout);
        console.log('Video created successfully at:', videoOutputPath);
        resolve(videoOutputPath);
      }
    });
  });
}

// Route to reset (delete temporary files)
app.delete('/reset', async (req, res) => {
  const tempDir = path.join(__dirname, 'uploads');
  const outputDir = path.join(__dirname, 'output');

  const deleteFiles = async (dir) => {
    try {
      const files = await fs.promises.readdir(dir);
      const deletePromises = files.map(file => fs.promises.unlink(path.join(dir, file)));
      await Promise.all(deletePromises);
    } catch (err) {
      console.error('Error deleting files:', err.message);
      throw new Error('Error deleting files');
    }
  };

  try {
    await deleteFiles(tempDir);
    await deleteFiles(outputDir);
    res.json({ message: 'Files deleted successfully.' });
  } catch (error) {
    console.error('Error deleting files:', error.message);
    res.status(500).json({ message: 'Error deleting files.' });
  }
});
// Cleanup temporary files logic
const tempDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');

function cleanupFiles() {
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.rmSync(outputDir, { recursive: true, force: true });
    console.log('Temporary files cleaned up');
  } catch (error) {
    console.error('Error cleaning up files:', error.message);
  }
}

// Schedule cleanup every 1 hour
setInterval(cleanupFiles, 60 * 60 * 1000);
// Ensure app uses dynamic port for deployment on platforms like Railway
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

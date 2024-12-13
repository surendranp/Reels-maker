// Get form elements and containers
const imageForm = document.getElementById('imageForm');
const loading = document.getElementById('loading');
const imageContainer = document.getElementById('imageContainer');
const downloadSection = document.getElementById('downloadSection');
const resetButton = document.getElementById('resetButton');
const generateButton = document.createElement('button');
generateButton.id = 'generateButton';
generateButton.innerText = 'Generate Video';
generateButton.style.display = 'none';
document.body.appendChild(generateButton);

// Initialize event listener for form submission
imageForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const query = document.getElementById('query').value;
    const duration = document.getElementById('duration').value;
    const textInput = document.getElementById('textInput').value; // Added text input for user text

    // Show loading spinner
    loading.style.display = 'block';
    imageContainer.innerHTML = '';
    downloadSection.innerHTML = '';

    try {
        // Fetch images from the server
        const response = await fetch(`/search-images?q=${encodeURIComponent(query)}`);
        const images = await response.json();

        // Display images for selection
        images.forEach((image, index) => {
            const imgWrapper = document.createElement('div');
            imgWrapper.classList.add('image-wrapper');
            imgWrapper.innerHTML = `<img src="${image.url}" alt="Image from Unsplash" />`;

            imgWrapper.addEventListener('click', () => {
                imgWrapper.classList.toggle('selected');
            });

            imageContainer.appendChild(imgWrapper);
        });

        // Show the generate video button
        generateButton.style.display = 'block';

        generateButton.onclick = async () => {
            const selectedImages = [...document.querySelectorAll('.image-wrapper.selected img')].map(img => img.src);

            if (selectedImages.length === 0) {
                alert('Please select at least one image to create a video.');
                return;
            }

            try {
                // Create video with audio
                const videoResponse = await fetch('/create-video', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        images: selectedImages.map(url => ({ url })),
                        durationPerImage: duration,
                        text: textInput // Pass user input text to server
                    }),
                });

                const videoData = await videoResponse.json();
                if (videoData.videoPath) {
                    // Create download link for the generated video
                    const downloadLink = document.createElement('a');
                    downloadLink.href = videoData.videoPath;
                    downloadLink.innerText = 'Download Video';
                    downloadLink.target = '_blank';
                    downloadSection.appendChild(downloadLink);
                } else {
                    alert(videoData.message);
                }
            } catch (error) {
                console.error('Error creating video:', error);
                alert('Error creating video.');
            } finally {
                loading.style.display = 'none';
            }
        };

    } catch (error) {
        console.error('Error fetching images:', error);
        alert('Error fetching images.');
        loading.style.display = 'none';
    }
});

// Reset files on server
resetButton.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all files?')) {
        try {
            await fetch('/reset', { method: 'DELETE' });
            alert('Files reset successfully.');
            location.reload();
        } catch (error) {
            console.error('Error resetting files:', error);
            alert('Error resetting files.');
        }
    }
});

// Reset files on server
resetButton.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all files?')) {
        try {
            await fetch('/reset', { method: 'DELETE' });
            alert('Files reset successfully.');
            location.reload();
        } catch (error) {
            console.error('Error resetting files:', error);
            alert('Error resetting files.');
        }
    }
});

const fs = require('fs');
const axios = require('axios');

async function generateVoice(text) {
    try {
        const response = await axios.post('https://api.elevenlabs.io/text-to-speech/generate', {
            text: text,
            voice:onwK4e9ZLuTAKqWW03F9,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.ELEVEN_LABS_API_KEY}`,
                'Content-Type': 'application/json' 
            },
            responseType: 'arraybuffer'
        });

        const audioFilePath = `./uploads/audio_${Date.now()}.mp3`;
        fs.writeFileSync(audioFilePath, response.data);
        return audioFilePath;
    } catch (error) {
        console.error('Error generating voice:', error);
        throw error;
    }
}

module.exports = { generateVoice };

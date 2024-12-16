// src/components/DownloadVideo.js
import React, { useState } from 'react';

const DownloadVideo = () => {
    const [text, setText] = useState('');

    const handleAddAudio = async () => {
        const response = await fetch('/add-audio-to-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, videoFilename: 'your_video_file.mp4' })
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'final_video_with_audio.mp4';
            a.click();
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Enter text for audio"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <button onClick={handleAddAudio}>Download Video with Audio</button>
        </div>
    );
};

export default DownloadVideo;

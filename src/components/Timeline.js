// Timeline.js
import React, { useState } from 'react';
import axios from 'axios';

function Timeline() {
    const [text, setText] = useState("");
    // const [images, setImages] = useState([]);
    const [videoPath, setVideoPath] = useState(null);

    const handleGenerate = async () => {
        try {
            const response = await axios.post('/generate', { text, images });
            setVideoPath(response.data.videoPath);
        } catch (error) {
            console.error("Error generating video:", error);
        }
    };

    return (
        <div>
            <textarea 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                placeholder="Enter text for speech and subtitle" 
            />
            <button onClick={handleGenerate}>Generate Video with Subtitles</button>

            {videoPath && (
                <div>
                    <h3>Video Generated with Subtitles!</h3>
                    <video controls src={videoPath}></video>
                </div>
            )}
        </div>
    );
}

export default Timeline;

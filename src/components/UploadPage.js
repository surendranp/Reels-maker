// UploadPage.js (React Component)
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const UploadPage = () => {
    const [images, setImages] = useState([]);
    const [text, setText] = useState('');
    const [durations, setDurations] = useState([]);
    const [videoUrl, setVideoUrl] = useState(null);

    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        onDrop: (acceptedFiles) => setImages(acceptedFiles)
    });

    const handleTextChange = (e) => setText(e.target.value);

    const handleDurationChange = (index, duration) => {
        const newDurations = [...durations];
        newDurations[index] = duration;
        setDurations(newDurations);
    };

    const handleRearrangeImages = (fromIndex, toIndex) => {
        const reorderedImages = [...images];
        const [movedImage] = reorderedImages.splice(fromIndex, 1);
        reorderedImages.splice(toIndex, 0, movedImage);
        setImages(reorderedImages);
    };

    const handleBuildVideo = async () => {
        const formData = new FormData();
        images.forEach((image) => formData.append('images', image));
        formData.append('text', text);
        formData.append('durations', JSON.stringify(durations));

        const response = await fetch('/build-video', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        setVideoUrl(data.videoUrl); // Set the video URL for preview
    };

    return (
        <div>
            <h1>Upload Images</h1>
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag & Drop images here, or click to select</p>
            </div>
            
            <div>
                {images.map((image, index) => (
                    <div key={index}>
                        <img src={URL.createObjectURL(image)} alt="upload" />
                        <input
                            type="text"
                            placeholder="Enter text"
                            value={text}
                            onChange={handleTextChange}
                        />
                        <input
                            type="number"
                            value={durations[index] || 3}
                            onChange={(e) => handleDurationChange(index, e.target.value)}
                            min={1}
                        />
                    </div>
                ))}
            </div>

            <button onClick={handleBuildVideo}>Build Video</button>

            {videoUrl && (
                <div>
                    <video controls>
                        <source src={videoUrl} type="video/mp4" />
                    </video>
                    <a href={videoUrl} download="video.mp4">Download Video</a>
                </div>
            )}
        </div>
    );
};

export default UploadPage;

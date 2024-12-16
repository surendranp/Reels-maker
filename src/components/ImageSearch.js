// src/components/ImageSearch.js
import React, { useState } from 'react';

const ImageSearch = ({ onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null); // State to handle errors

    const handleSearch = async () => {
        setError(null); // Reset error state
        try {
            const response = await fetch(`https://api.unsplash.com/search/photos?query=${searchTerm}&client_id=HyC_eNY925pluSTS2LTZnBmO8nmA2GcZVHl7aKfuA9o`); // Replace with your actual Unsplash API access key
            if (!response.ok) {
                throw new Error('Error fetching images');
            }
            const data = await response.json();
            setImages(data.results); // Update state with the fetched images
        } catch (err) {
            setError(err.message); // Set error message
            console.error('Error fetching images:', err);
        }
    };

    const handleImageSelect = (url) => {
        onSelect(url); // Pass the selected image URL back to the parent component
    };

    return (
        <div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for images..."
            />
            <button onClick={handleSearch}>Search</button>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
            <div className="image-results">
                {images.map((image) => (
                    <img
                        key={image.id}
                        src={image.urls.small}
                        alt={image.description || 'Image'}
                        onClick={() => handleImageSelect(image.urls.small)} // Select the image on click
                        style={{ cursor: 'pointer', margin: '10px', width: '500px' }} // Style the images
                    />
                ))}
            </div>
        </div>
    );
};

export default ImageSearch;

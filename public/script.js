document.getElementById('imageForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const queryField = document.getElementById('query');
    const durationField = document.getElementById('duration');
    const textInputField = document.getElementById('textInput');
    const loading = document.getElementById('loading');
    const imageContainer = document.getElementById('imageContainer');
    const downloadSection = document.getElementById('downloadSection');
    const resetButton = document.getElementById('resetButton');
    const generateVideoButton = document.getElementById('generateVideoButton');

    // Ensure reset button is visible from the start
    resetButton.style.display = 'block';

    const query = queryField.value.trim();
    const duration = durationField.value.trim();
    const textInput = textInputField.value.trim();

    if (!query || !duration || !textInput) {
        alert('Please fill in all fields.');
        return;
    }

    // Show the loader immediately as the process begins
    loading.style.display = 'block';
    console.log('Loading spinner should be visible');

    downloadSection.innerHTML = '';
    imageContainer.innerHTML = '';

    try {
        // Use dynamic base URL
        const baseUrl = window.location.origin;

        const response = await fetch(`${baseUrl}/search-images?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Error fetching images.');

        const images = await response.json();
        if (images.length === 0) {
            alert('No images found for the given query.');
            return;
        }

        images.forEach(image => {
            const imgWrapper = document.createElement('div');
            imgWrapper.classList.add('image-wrapper');
            imgWrapper.innerHTML = `<img src="${image.url}" alt="Image from Unsplash">`;

            imgWrapper.addEventListener('click', () => {
                imgWrapper.classList.toggle('selected');
            });

            imageContainer.appendChild(imgWrapper);
        });

        generateVideoButton.style.display = 'block';

        generateVideoButton.onclick = async () => {
            // Keep the loader visible during video creation process
            loading.style.display = 'block';
            console.log('Loading spinner visible during video generation process');

            const selectedImages = [...document.querySelectorAll('.image-wrapper.selected img')].map(img => img.src);

            if (selectedImages.length === 0) {
                alert('Please select at least one image to create a video.');
                return;
            }

            try {
                // Generate audio first
                const audioResponse = await fetch(`${baseUrl}/generate-audio`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: textInput })
                });

                if (!audioResponse.ok) {
                    alert('Error generating audio.');
                    return;
                }

                const audioData = await audioResponse.json();
                const audioPath = audioData.audioPath;

                // Now create the video with selected images and generated audio
                const videoResponse = await fetch(`${baseUrl}/create-video`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        images: selectedImages.map(url => ({ url })),
                        durationPerImage: parseInt(duration),
                        audioPath
                    })
                });

                if (!videoResponse.ok) {
                    alert('Error creating video.');
                    return;
                }

                const videoData = await videoResponse.json();
                const videoPath = videoData.videoPath;
                const videoUrl = `${baseUrl}${videoPath}`;

                // Update the UI with a download link and embedded video player
                downloadSection.innerHTML = `
                    <a href="${videoUrl}" download="output_video.mp4">Download Video</a>
                    <br>
                    <video controls>
                        <source src="${videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
            } catch (error) {
                console.error('Error generating video:', error);
                alert('Failed to generate video: ' + error.message);
            } finally {
                // Hide the loader after everything is complete
                console.log('Hiding loader after video generation');
                loading.style.display = 'none';
            }
        };
    } catch (error) {
        console.error('Error:', error.message);
        alert('An error occurred, please try again.');
    } finally {
        // Hide the loader in case of error or after fetching images
        console.log('Hiding loader after image fetching');
        loading.style.display = 'none';
    }
});

// Reset functionality to clear all uploaded files, video, and input fields
document.getElementById('resetButton').addEventListener('click', async () => {
    try {
        const baseUrl = window.location.origin;

        const response = await fetch(`${baseUrl}/reset`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Error resetting files.');

        alert('Files deleted successfully.');
        document.getElementById('imageContainer').innerHTML = '';
        document.getElementById('downloadSection').innerHTML = '';

        // Clear input fields
        document.getElementById('query').value = '';
        document.getElementById('duration').value = '';
        document.getElementById('textInput').value = '';
    } catch (error) {
        console.error('Error:', error.message);
        alert('An error occurred while deleting files.');
    }
});

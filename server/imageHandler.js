// /server/imageHandler.js
const axios = require('axios');

// Function to register routes
const registerImageRoutes = (app) => {
    app.get('/search-images', async (req, res) => {
        const query = req.query.q;

        try {
            const response = await axios.get(`https://api.unsplash.com/search/photos`, {
                params: {
                    query: query,
                    client_id: 'HyC_eNY925pluSTS2LTZnBmO8nmA2GcZVHl7aKfuA9o', // Replace with your actual Unsplash API access key
                },
            });

            const images = response.data.results.map(image => ({
                url: image.urls.small,
            }));

            res.json(images);
        } catch (error) {
            console.error('Error fetching images:', error);
            res.status(500).json({ error: 'Image search failed' });
        }
    });
};

module.exports = { registerImageRoutes };
 
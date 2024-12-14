// // src/App.js
// import React, { useState } from 'react';
// import ImageSearch from './components/ImageSearch';
// import Timeline from './components/Timeline';
// import MusicUpload from './components/MusicUpload';

// const App = () => {
//     const [images, setImages] = useState([]);
//     const [musicPath, setMusicPath] = useState('');
//     const [videoUrl, setVideoUrl] = useState('');

//     const handleSelectImage = (imageUrl) => {
//         setImages([...images, { url: imageUrl, id: Date.now().toString() }]);
//     };

//     const handleReorderImages = (reorderedImages) => {
//         setImages(reorderedImages);
//     };

//     const handleMusicUpload = (path) => {
//         setMusicPath(path);
//     };

//     const handleCreateVideo = async () => {
//         try {
//             const response = await fetch('/create-video', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ images, musicPath }),
//             });

//             if (!response.ok) {
//                 console.error(`Server error: ${response.status}`);
//                 return;
//             }

//             const data = await response.json();
//             setVideoUrl(`/downloads/${data.videoUrl}`);
//         } catch (error) {
//             console.error('Error creating video:', error);
//         }
//     };

//     return (
//         <div>
//             <h1>Reels Maker</h1>
//             <ImageSearch onSelect={handleSelectImage} />
//             <Timeline images={images} onReorder={handleReorderImages} />
//             <MusicUpload onUpload={handleMusicUpload} />
//             <button onClick={handleCreateVideo}>Create Video</button>

//             {videoUrl && (
//                 <div>
//                     <h2>Generated Video:</h2>
//                     <video width="600" controls>
//                         <source src={videoUrl} type="video/mp4" />
//                         Your browser does not support the video tag.
//                     </video>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default App;

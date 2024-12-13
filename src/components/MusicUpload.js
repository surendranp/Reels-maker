// // src/components/MusicUpload.js
// import React from 'react';

// const MusicUpload = ({ onUpload }) => {
//     const handleFileChange = (event) => {
//         const file = event.target.files[0];
//         if (file) {
//             // Assuming you have a function to upload the file and get the path
//             const musicPath = `uploads/music/${file.name}`; // Placeholder for uploaded file path
//             console.log('Uploading music:', file);
//             onUpload(musicPath); // Call the onUpload prop with the music path
//         }
//     };

//     return (
//         <div>
//             <h2>Upload Music</h2>
//             <input type="file" accept="audio/*" onChange={handleFileChange} />
//         </div>
//     );
// };

// export default MusicUpload;


const cloudinary = require('cloudinary').v2;

// Configure cloudinary ONCE
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary configured successfully");

module.exports = cloudinary;






// const cloudinary = require('cloudinary').v2;
// const sendResponse = require('../Utils/sendResponse');

// const cloudinaryConnect = async () => {
//     try {
//         cloudinary.config({
//             cloud_name: process.env.CLOUDINARY_NAME,
//             api_key: process.env.CLOUDINARY_API_KEY,
//             api_secret: process.env.CLOUDINARY_API_SECRET,
//         }); 
//         console.log('Cloudinary connected successfully');
//     } catch (error) {
//         console.log('Error while connecting to Cloudinary', error);
//         // sendResponse(res, 500, error.message || 'Internal Server Error');
//     }
// }

// module.exports = cloudinaryConnect;




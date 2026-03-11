const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const imagePath = 'c:/Users/9751a/OneDrive/Desktop/Shri_ji - Copy/hemohive/public/images/ayush.jpeg';

cloudinary.uploader.upload(imagePath, {
  folder: 'hemohive_profile',
  public_id: 'ayush_profile'
}, (error, result) => {
  if (error) {
    console.error('Upload Error:', error);
    process.exit(1);
  } else {
    console.log('Upload Success!');
    console.log('URL:', result.secure_url);
    fs.writeFileSync('cloudinary_url.txt', result.secure_url);
    process.exit(0);
  }
});

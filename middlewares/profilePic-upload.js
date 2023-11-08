const multer = require('multer');
const uuid = require('uuid').v4;
const storage = multer.diskStorage({
    destination: 'data/images/profilePictures',
    filename: (req, file, cb) => {
        // determine the filename
        cb(null, uuid() + 'profilePicture' + file.originalname);
    }
})

const upload = multer({storage: storage})

// returns an express middleware to handle the image with the id profilePicture
const profilePicUploadMiddleware = upload.single('profilePicture');


module.exports = profilePicUploadMiddleware;
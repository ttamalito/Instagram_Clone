const multer = require('multer');
const uuid = require('uuid').v4;

const storage = multer.diskStorage({
    destination: 'data/images/posts',
    filename: (req, file, cb) => {
        // determine the filename
        cb(null, uuid() + req.session.userId + file.originalname )
    }
});

const upload = multer({
    storage: storage
});

const postPictureMiddleware = upload.single('fileToUpload');

module.exports = postPictureMiddleware;
const multer = require("multer");

var excelStorage = multer.diskStorage({
    destination: './upload',
    filename: function (req, file, cb) {
        return cb(null, file.originalname)
    }
});

var excelUploads = multer({storage:excelStorage}); 

module.exports = {excelUploads}
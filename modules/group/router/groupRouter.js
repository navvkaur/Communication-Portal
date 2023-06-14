const router = require('express').Router()
const controller = require('../controller/groupController')
var multer = require('multer');
const tokenVerification = require("../../../middleware/jwt");
const { token } = require('morgan');
const upload = multer({
    dest: './upload/',
    limits: {
      fileSize: 1000000,
    }
  })
router.post('/addgroup',tokenVerification.verifyToken, controller.addGroup)
router.put('/updategroup/:id', tokenVerification.verifyToken, controller.updateGroup)
router.get('/getgroup/:name/:id',tokenVerification.verifyToken,controller.getGroup)
router.delete('/deletegroup/:id',tokenVerification.verifyToken,controller.deleteGroup)
router.post('/excel/:id', upload.single("file"),controller.uploadexcel)
router.post('/copyWithoutData/:groupId', controller.copyWithoutData)
router.post('/copyWithData/:groupId', controller.copyWithData)

module.exports = router;


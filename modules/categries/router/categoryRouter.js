const router = require('express').Router()
var multer = require('multer')
const storage = multer.diskStorage({
  destination: './uploadFiles/',
  filename(req, file, cb) {
      console.log(file)
      const newFileName = `${Date.now()}-${file.originalname}`
      cb(null, newFileName);
  }
})
const uploadImage = multer({
  storage: storage
}).single("image");

const categoryController = require('../controller/categoryController')
const tokenVerifaction = require("../../../middleware/jwt")


router.post('/createCategories',tokenVerifaction.verifyToken,uploadImage,categoryController.createCategories)
router.get('/getCategories/:name',tokenVerifaction.verifyToken,categoryController.getCategories)
router.put('/updateCategories/:id', uploadImage, categoryController.updateCategories) 
router.delete('/deleteCategories/:key',categoryController.deleteCategories)
// router.post("/getcolumName/:groupId", controller.findGroupColumnsName)
// router.post("/getGroupUserDetail/:id", controller.findAllUserBycolumnName)
module.exports = router;
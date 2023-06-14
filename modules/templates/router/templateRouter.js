const router = require('express').Router()
const controller = require('../controller/templateController')
const {validate} = require("../../../middleware/request-validator")
const templateRegister =require('../router/templateSchema')
const tokenVerifaction = require("../../../middleware/jwt")

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
}).fields([{name:"file",maxCount:5},{name:"attachment",maxCount:5}])
const uploadImageSingle = multer({
  storage: storage
}).single("audioFile");

//Email Router
router.post('/addEmailTemplate',tokenVerifaction.verifyToken,uploadImage,controller.addEmailTemplate)
router.put('/updateEmailTemplate/:id', uploadImage, controller.updateEmailTemplate)
router.get('/getEmailTemplate/:name/:key/:id?',tokenVerifaction.verifyToken,controller.getEmailTemplate)
router.delete('/deleteEmailTemplate/:id',tokenVerifaction.verifyToken,controller.deleteEmailTemplate)
router.post('/getEmailTemplates',tokenVerifaction.verifyToken,controller.getEmailTemplates)
//IvrRouter
router.post('/addIvr' ,tokenVerifaction.verifyToken,uploadImageSingle,controller.addIvr)
router.put('/updatetemplateIvr/:id', uploadImageSingle, controller.updateTemplateIvr)   
router.get('/getIvrTemplate/:name/:key/:id?',tokenVerifaction.verifyToken,controller.getIvrTemplate) 
router.delete('/deleteIvrTemplate/:id',tokenVerifaction.verifyToken,controller.deleteIvrTemplate)
router.post('/getIvrTemplates',tokenVerifaction.verifyToken,controller.getIvrTemplates)
// Message Router       
router.post('/addMessageTemplate',tokenVerifaction.verifyToken,controller.addMessageTemplate) 
router.put('/updateTemplateMessage/:id', controller.updateTemplateMessage)   
router.get('/getMessageTemplate/:name/:key/:id?',tokenVerifaction.verifyToken,controller.getMessageTemplate)  
router.delete('/deleteMessageTemplate/:id',tokenVerifaction.verifyToken,controller.deleteMessageTemplate)
router.post('/getMessageTemplates',tokenVerifaction.verifyToken,controller.getSmsTemplates)
//Whatsapp Router   
router.post('/addWhatsappTemplate',tokenVerifaction.verifyToken,uploadImage,controller.addWhatsappTemplate) 
router.put('/updateWhatsappTemplate/:id', uploadImage, controller.updateWhatsappTemplate)
router.get('/getWhatsappTemplate/:name/:key/:id?',tokenVerifaction.verifyToken,controller.getWhatsappTemplate)
router.delete('/deleteWhatsappTemplate/:id',tokenVerifaction.verifyToken,controller.deleteWhatsappTemplate)
router.post('/getWhatsappTemplates',tokenVerifaction.verifyToken,controller.getWhatsappTemplates)
//filterApi
router.get("/getcolumName/:groupId", controller.findGroupColumnsName)
router.get("/getGroupUserDetail/:id", controller.findAllUserBycolumnName)


module.exports = router;
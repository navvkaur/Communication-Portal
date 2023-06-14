const router = require('express').Router()
const httpStatus = require('http-status');
const controller = require('../controller/createcampaignController')
var multer = require('multer')
const tokenVerification = require("../../../middleware/jwt")

const maxSize = 2 * 1024 * 1024;
const storage = multer.diskStorage({
  destination: './uploadFiles/',
  filename(req, file, cb) {
    console.log(file)
    const newFileName = `${Date.now()}-${file.originalname}`
    cb(null, newFileName);
  }
})

const uploadImage = multer({
      storage: storage,
      limits: { fileSize: maxSize }
    }).fields([{ name: "file", maxCount: 5 }, { name: "attachment", maxCount: 5 },{name:"audioFile"}])


    

//send campaign
router.post('/sendemailcampaign',tokenVerification.verifyToken, uploadImage, controller.sendCampaign)
//get all schedules
router.get('/getsentschedules', tokenVerification.verifyToken,controller.getsentschedule)
//get one sent 
router.get('/getsentemail/:id',controller.getsent)
router.delete('/deletesent/:id', tokenVerification.verifyToken,controller.deletesent)

//get pending schedule
router.get('/getpendingschedules/:id', tokenVerification.verifyToken,controller.getpendingschedule)
//get one schedule
router.get('/getscheduleemail/:id',controller.getschedule)
//schedule 
router.post('/scheduleemailcampaign',tokenVerification.verifyToken, uploadImage, controller.schedule)
//delete schedule
router.delete('/deleteschedule/:id', tokenVerification.verifyToken,controller.deleteschedule)//------
//edit schedule
router.post('/editschedule/:id', tokenVerification.verifyToken,uploadImage, controller.editschedule) //

//draft 
router.post('/draftcampaign' ,tokenVerification.verifyToken,uploadImage, controller.draftCampaign)
//get drafts
router.get('/getdrafts',tokenVerification.verifyToken,controller.getDrafts)
//get one draft
router.get('/getdraft/:id',tokenVerification.verifyToken,controller.getDraft)
//delete draft
router.delete('/deletedraft/:id',tokenVerification.verifyToken,controller.deleteDraft)
//router edit 
router.put('/editdraft/:id',tokenVerification.verifyToken,controller.editDraft)
router.get('/emailcount/:groupid',controller.emailcount)






module.exports = router;

//sending Whatsapp Message Router


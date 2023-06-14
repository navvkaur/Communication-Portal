const router = require('express').Router()
const controller = require('../controller/verifyidController')
const tokenVerification = require("../../../middleware/jwt")
router.post('/sendotp' ,tokenVerification.verifyToken,controller.sendOTP) //-done
router.post('/verifyotp' ,controller.verifyOTP) //done
router.post('/resendotp' ,controller.resendOtp) //done
router.post('/dltIds'  , tokenVerification.verifyToken,controller.dltIds) //done
//------------
router.get('/getdltwhatapp',tokenVerification.verifyToken,controller.getdltWhatapp)//done
router.get('/getdltsms/:name?',tokenVerification.verifyToken ,controller.getdltSms)//done
router.get('/getemail/:name?',tokenVerification.verifyToken,controller.getEmail) //done
router.get('/getpendingrequestcount/:id',controller.getPendingRequestCount)
router.get("/getpendingrequest/:id",controller.getPendingRequest)
//router.get("/getwhatsapppendingrequest",controller.getWhatsappPendingRequest)
router.put("/request/:id",tokenVerification.verifyToken,controller.updateRequest)
//router.post("/whatsapprequest/:id",controller.updateWhatsappRequest)
module.exports=router;
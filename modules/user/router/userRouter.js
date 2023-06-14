const router = require('express').Router()
const controller = require('../controller/userController')
const {validate} = require("../../../middleware/request-validator")
const schema = require("./userSchema")
var multer = require('multer')
const storage = multer.diskStorage({
  destination: './uploadFiles/',
  filename(req, file, cb) {
    console.log(file)
    const newFileName = `${Date.now()}-${file.originalname}`
    cb(null, newFileName);
  }
})


const uploadImageSingle = multer({
  storage: storage
}).single("profile");


// router.post('/register', validate(schema.register) ,wrapAsync(controller.addUser))
router.post('/register', validate(schema.register) ,controller.addUser)
router.post('/login', validate(schema.login),controller.login)
router.put('/updateById/:id',uploadImageSingle,controller.updateById)
router.post("/forgetPassword",validate(schema.forgetPwd),controller.forgetPassword);
router.post("/verifyOTP",controller.verifyOTP)
router.put("/updatePassword",validate(schema.updatePassword),controller.updatePassword)
router.put("/changePassword",validate(schema.changePassword),controller.changePassword)
router.delete("/deleteUser/:name/:id",controller.deleteUser)
router.put("/resendOtp",controller.resendOtp)
router.get("/countryState",controller.countryState)
router.get("/stateDistrict/:stateId",controller.stateDistrict)
router.get("/getUser/:id",controller.getUser)











module.exports = router

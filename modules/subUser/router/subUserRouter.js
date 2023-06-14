const router = require("express").Router()
const controller = require("../controller/subUserController")
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
  }).single("profile");
  
router.post('/login',controller.login)
router.get("/getSubUser/:name/:id?", controller.getsubUser)
router.post("/createSubUser",tokenVerifaction.verifyToken,uploadImage, controller.createSubUser)
router.put("/updateUserInformation/:id",uploadImage, controller.updateUserDeatial)
router.put("/forgetPassword", controller.forgetPassword)
router.put("/verifyOtp", controller.verifyTop)
router.put("/updatePassword", controller.updatePassword)
router.put("/changePassword", controller.changePassword)
router.put("/blockOrUnblock/:id",tokenVerifaction.verifyToken, controller.blockOrUnblock)
router.delete("/blockOrUnblock/:id",tokenVerifaction.verifyToken, controller.blockOrUnblock)
router.put("/updateSubUserPermission/:id",tokenVerifaction.verifyToken, controller.updateSubUserPermission)





module.exports = router
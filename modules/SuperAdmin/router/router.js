const   router = require('express').Router()
const controller = require('../controller/controller')
const {validate} = require("../../../middleware/request-validator")
// const schema = require("./userSchema")
const tokenVerifaction = require("../../../middleware/jwt")

router.post('/login',controller.login)
router.put('/updateAdmin/:id',controller.updateAdmin)
router.post("/forgetPassword",controller.forgetPassword);
router.post("/verifyOTP",controller.verifyOTP)
router.put("/updatePassword",controller.updatePassword)
router.get("/findTotalUser",controller.findTotalUser)
router.put("/changePassword",controller.changePassword)
router.get("/getAllUSer",controller.getAllUSer)
router.get("/transactionHistoryAllUser",tokenVerifaction.verifyToken,controller.transactionHistoryAllUser)
router.get("/totalRevenue",controller.totalRevenue)






module.exports = router

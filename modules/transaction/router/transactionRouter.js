const router = require('express').Router()
const controller = require('../controller/transactionController')
const {validate} = require("../../../middleware/request-validator")
const tokenVerifaction = require("../../../middleware/jwt")


// router.post('/register', validate(schema.register) ,wrapAsync(controller.addUser))
router.post('/purchasePlan',tokenVerifaction.verifyToken,controller.purchasePlan)
router.get('/viewMyPlan',tokenVerifaction.verifyToken,controller.viewMyPlan)
router.put('/upgradePlan/:id',tokenVerifaction.verifyToken,controller.upgradePlan)








module.exports = router

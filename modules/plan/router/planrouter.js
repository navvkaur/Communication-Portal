const router = require("express").Router()
const planController = require("../controller/planController")
const { validate } = require("../../../middleware/request-validator")
const tokenVerifaction = require("../../../middleware/jwt")
// const schema = require("./planSchema")

router.post("/addPlan",tokenVerifaction.verifyToken, planController.addPlan)
router.get("/getPlan",tokenVerifaction.verifyToken, planController.getplan)
router.put("/updatePlan/:id",tokenVerifaction.verifyToken, planController.updatePlan)
router.delete("/deletedPlan/:id", tokenVerifaction.verifyToken, planController.deletedPlan)
router.put("/planStatusChange/:id", tokenVerifaction.verifyToken, planController.planStatusChange)


module.exports = router
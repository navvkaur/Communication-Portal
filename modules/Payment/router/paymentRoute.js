const router = require('express').Router()
const controller = require('../controller/paymentController')
const tokenVerifaction = require("../../../middleware/jwt")

router.post('/checkout', controller.checkout)
router.post('/paymentverification',controller.paymentVerification)
router.post('/downloadInvoice',controller.downloadInvoice)

router.get('/fetchOrder/:orderId',controller.fetchOrder)
router.get('/transactionHistory',tokenVerifaction.verifyToken,controller.transactionHistory)

router.get("/getkey", (req, res) =>
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
);
module.exports = router;
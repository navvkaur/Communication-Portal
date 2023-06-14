const express = require('express')
const  Razorpay = require('razorpay'); 
const app = express()
const { connection } = require('./dbconfig')
require('dotenv').config()
const routes = require('./routes')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const morgan = require('morgan')
const helmet = require('helmet')
const {dailyUserReport,sendScheduled,changeStatus}=require("./helper/cron")
 
//CORS
var corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(morgan('dev'))
app.use(helmet())
app.use(express.urlencoded())
app.use(bodyParser.urlencoded({ extended: true }))
 //app.use(fileUpload())
// DB CONNECTION
;(async () => await connection())()
        //payment instance
exports.instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_APT_SECRET,
});

// TESTING
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.json(['SERVER IS LIVE!'])
})

// ROUTING API URL OF EACH MODULE
app.use(express.json())
routes.map(route => {
  app.use(route.path, route.handler)
})

// LAUNCHING THE SERVER
const PRT = process.env.PORT || 8000
app.listen(PRT, () => {
  console.log(
    `________________________________\n 🚀 Server running on PORT ${PRT}\n________________________________\n`
  )
})
dailyUserReport.start()
sendScheduled.start()
changeStatus.start()
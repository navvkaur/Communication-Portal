const mongoose = require('mongoose')
const bcrypt=require("bcryptjs")
const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      
    },
    email: {
      type: String,
    },
    password: {
         type: String,
          
         },
    userType:{
      type:String,
      enum:["ADMIN","USER"],
      default:"ADMIN"
  },
    
    otpVerify: {
      type: Boolean,
      default: false
  },
    phoneNumber:{
        type:Number,
        unique: true,
    },
    otp: { type: String },
    expireOTP: { type: String }
  },

  {
    timestamps: true,
    versionKey: false
  }
)

const admin = mongoose.model('admin',adminSchema)

module.exports = {
    admin
}
admin.findOne(
    {  userType: "ADMIN" },
    (userErr, userRes) => {
      if (userErr) {
      } else if (userRes) {
        console.log("Default admin already exist");
      } else {
        let createAdmin = {
          name: "AkshaySharma",
          email: "akshaysharma@parangat.com",
          phoneNumber: 1234567890,
          password: bcrypt.hashSync("1234"),
          userType: "ADMIN",
          otpVerify: true,
        };  
       let saveResult= admin(createAdmin).save() 
       if(saveResult){
        console.log("successfull created Admin")
       }
       else{
        console.log("error")
  
       }
      }  
    } 
   ); 
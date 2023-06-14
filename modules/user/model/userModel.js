const mongoose = require('mongoose')
const planSchema = new mongoose.Schema ({
  planName:{
    type:String,
  },
  totalWhatsapp:{
    type:Number,
},
totalEmail:{
    type:Number
},
totalMessage:{
    type:Number
},
totalIVR:{
    type:Number
},
planValidity:{
    type:Number
},


  },
  {_id:false});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: 'Please enter name'
    },
    profile:{
      type:String
    },
    dateofbirth:{
      type :String
    },
    email: {
      type: String,
      required: 'Please enter email',
      unique: true
    },
    password: {
         type: String,
          required: 'please enter Password'
         },
    status: {
      type: String,
      enum: ['Active', 'In-Active'],
      default: 'Active'
    },
    userType:{
      type:String,
      enum:["SUBUSER","USER","ADMIN"],
      default:"USER"
  },
    businessName:{
        type:String
    },
    otpVerify: {
      type: Boolean,
      default: false
  },
    gstNumber:{
        type:String
    },
    authorization:{
        type:String
    },
    phoneNumber:{
        type:Number,
    },
    addressLine1:{
        type:String
    },
    addressLine2:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    postalCode:{
        type:Number
    },
    country:{
        type:String
    },
    plan: {
      type:Object(planSchema)},
      
    otp: { type: String },
    expireOTP: { type: String }
  },

  {
    timestamps: true,
    versionKey: false
  }
)

const user = mongoose.model('user', userSchema)

module.exports = {
    user
}

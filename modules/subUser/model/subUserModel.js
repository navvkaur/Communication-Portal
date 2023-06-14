const { boolean } = require("joi");
const mongoose = require("mongoose")
const permissionSchema = new mongoose.Schema({
 
  emailCategory: {
    create:{
      type:Boolean,
      default:false
    },
    manage:{
      type:Boolean,
      default:false
    },
    subCategories:[],
    templates:{
      create:{
        type:Boolean,
        default:false
      },
      manage:{
        type:Boolean,
        default:false
      },
      subTemplates:[],
    }
  },
  whatsappCategory: {
    create:{
      type:Boolean,
      default:false
    },
    manage:{
      type:Boolean,
      default:false
    },
    subCategories:[],
    templates:{
      create:{
        type:Boolean,
        default:false
      },
      manage:{
        type:Boolean,
        default:false
      },
      subTemplates:[],
    }
  },
  ivrCategory: {
    create:{
      type:Boolean,
      default:false
    },
    manage:{
      type:Boolean,
      default:false
    },
    subCategories:[],
    templates:{
      create:{
        type:Boolean,
        default:false
      },
      manage:{
        type:Boolean,
        default:false
      },
      subTemplates:[],
    }
  },
  messageCategory: {
    create:{
      type:Boolean,
      default:false
    },
    manage:{
      type:Boolean,
      default:false
    },
    subCategories:[],
    templates:{
      create:{
        type:Boolean,
        default:false
      },
      manage:{
        type:Boolean,
        default:false
      },
      subTemplates:[],
    }
  },
  createGroup: {
    create:{
      type:Boolean,
      default:false
    },
    manage:{
      type:Boolean,
      default:false
    },
    subGroup:[],
  },
  
  sendEmailCampaign: {
    send:{
      type:Boolean,
      default:false
    },
    verifyid:[],
  },

  sendIvrCampaign: {
    type: Boolean,
    default:false
  },
  
  sendMessageCampaign: {
    send:{
      type:Boolean,
      default:false
    },
    verifyid:[],
  },
  sendWhatsappCampaign: {
    send:{
      type:Boolean,
      default:false
    },
    verifyid:[],
  },


},
  { _id: false });


const subUserModel = new mongoose.Schema(
  {
    firstName: {
      type: String,
      index: true,
      required:true
    },
    lastName: {
      type: String,
      index: true
    },
    userId: {
      type: String,
      required:true
    },
    emailId: {
      type: String,
      required:true
    },
    password: {
      type: String,
      required:true

    },
    userType: {
      type: String,
      enum: ["USER", "SUBUSER", "ADMIN"],
      default: "SUBUSER"
    },
    phoneNumber: {
      type: Number,
    },

    otp: { type: String },
    expireOTP: { type: String },
    otpVerify: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ["Active", "In-Active"],
      default: "Active"
    },
    permission: {
      type: Object(permissionSchema),
      default: {}
    },
    profile:{
      type:String
    }


  },
  {
    timestamps: true,
    versionKey: false,
    // strict:false
  }
)

const SubUser = mongoose.model('SubUser', subUserModel)

module.exports = {
  SubUser
}
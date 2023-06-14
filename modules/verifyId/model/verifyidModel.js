const mongoose = require('mongoose')
const verifyemailSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    otp: {
        type: String,
    },
    expireOtp: {
        type: String
    },
    verifyid: {
        type: String,
        enum: ["REJECTED", "APPROVED"],
        default: "REJECTED"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    subuserId: {
        type: mongoose.Schema.Types.ObjectId,
    }
},
    {
        timestamps: true,
        versionKey: false
    }
)
const dltIdSchema = new mongoose.Schema({
    dltType: {
        type: String,   
        enum: ["SMS", "WHATSAPP"],
        required:true
    },
    dltId:{
        type: String ,
        required:true
    },
    verifyId: {
        type: String,
        enum: ["REJECTED", "PENDING","APPROVED"],
        default: "PENDING"
    },
    businessName:{
        type : String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    subuserId: {
        type: mongoose.Schema.Types.ObjectId,
    }
},
    {
        timestamps: true,
        versionKey: false
    }
)
// const dltIdWhatsappSchema = new mongoose.Schema({
//     dltWhatappId: {
//         type: String,
//     },
//     verifyId: {
//         type: String,
//         enum: ["REJECTED","PENDING", "APPROVED"],
//         default: "PENDING"
//     },
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//     },
//     subuserId: {
//         type: mongoose.Schema.Types.ObjectId,
//     }
// },
//     {
//         timestamps: true,
//         versionKey: false
//     }
// )
const verifyid = mongoose.model('verifyid', verifyemailSchema)
const dltid = mongoose.model('dltid', dltIdSchema)
//const dltidwhatsapp = mongoose.model('dltidwhatsapp', dltIdWhatsappSchema)

module.exports = {
    verifyid, dltid
    //, dltidwhatsapp
}
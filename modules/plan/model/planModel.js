const mongoose = require("mongoose")

const planSchema = new mongoose.Schema({
    planName:{
        type:String
    },
    userType: {
        type: String,
        default: "ADMIN"
    },
    totalWhatsapp: {
        type: Number,
        required: true
    },
    
    totalEmail: {
        type: Number,
        required: true
    },
    totalMessage: {
        type: Number,
        required: true
    },

    totalIVR: {
        type: Number,
        required: true
    },
    planValidity: {
        type: Number,
        required: true
    },
    planMonthlyPrice: {
        type: Number,
        required: true
    },
    planYearlyPrice: {
        type: Number,
        // required: true
    },
    Description: {
        type: String,
        required: true
    },

    planType: {
        type: String,
        enum: ["Activate", "Deactivate"],
        default: "Activate"
    },
    
},
    {
        timestamps: true,
        versionKey: false
    }
)

const plan = mongoose.model("plan", planSchema)
module.exports = { plan }

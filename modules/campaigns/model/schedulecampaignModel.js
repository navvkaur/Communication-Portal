const mongoose = require('mongoose')

const scheduleCampaignModel = new mongoose.Schema(
  {

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      
    },
    groupName: {
      type: String
    },

    categoriesType: {
      type: String,
      enum: ['Email', 'Message', 'Whatsapp', 'IVR'],
    },
    file: {
      type: Array
    },
    from: {
      type: String,
      required: true,
    },
    every: {
      type: String,
      default: 'week'
    },
    to: {
      type: [],
      required: true,
    },
    audioFile:{
      type:Array
    },
    subject: {
      type: String,
      
    },
    content: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true

    },
    subuserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      
    },
    attachment: {
      type: Array
    },
    daysofweek: {
      type: Object,
      default: { "sunday": true, "monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": true }

    },
    scheduledEmail:{
      type:Number
    },
    scheduledIvr:{
      type:Number
    },
    scheduledMessage:{
      type:Number
    },
    scheduledWhatsapp:{
      type:Number
    },
    status: {
      type: String,
      default: 'SCHEDULED'
    }
  },

  {
    timestamps: true,
    versionKey: false
  }
)
const scheduleCampaign = mongoose.model('scheduleCampaign', scheduleCampaignModel)

module.exports = {
  scheduleCampaign
}

const mongoose = require('mongoose')

const CampaignModel = new mongoose.Schema(
  {

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
     
    },
    groupName:{
      type:String
    },
    subuserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      
    },
    categoriesType: {
      type: String,
      enum: ['Email', 'Message', 'Whatsapp', 'IVR'],
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: [],
      required: true,
    },
    subject: {
      type: String,
      
    },
    content: {
      type: String,
      required: true,
    },
    attachment: {
      type: Array
    },
    audioFile: {
      type: Array
    },
    status: {
      type: String,
      default: 'Pending'
    },
    sent_at: {
      type: String
    }

  },

  {
    timestamps: true,
    versionKey: false
  }
)
const Campaign = mongoose.model('Campaign',CampaignModel)

module.exports = {
  Campaign
}

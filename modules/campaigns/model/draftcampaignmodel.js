const mongoose = require('mongoose')

const DraftCampaignModel = new mongoose.Schema(
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
      
    },
    attachment: {
      type: Array
    },
    audioFile:{
      type:Array
    },
   
    

  },

  {
    timestamps: true,
    versionKey: false
  }
)
const DraftCampaign = mongoose.model('draftCampaign', DraftCampaignModel)

module.exports = {
  DraftCampaign
}

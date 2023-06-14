const mongoose = require('mongoose')



const managegroup = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: 'Please enter group name'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    subuserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'subuser'
    },
    totalNumberOfAudience:{
      type:Number
    },

    status: {
      type: String,
      enum: ['Active', 'In-Active'],
      default: 'Active'
    },
  
  },
  {
    timestamps: true,
    versionKey: false,
  }
)
const manageGroup = mongoose.model('manageGroup', managegroup)

module.exports = {
  manageGroup
}
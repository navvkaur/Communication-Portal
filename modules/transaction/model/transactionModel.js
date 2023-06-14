const mongoose = require('mongoose')
const {user}=require('../../user/model/userModel')
const {plan}=require('../../plan/model/planModel')
const transactionSchema = new mongoose.Schema(
  {
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    planId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'plan'
    },
    buyPlan:{
      type:String
    },
    buyPlanTime:{
      type: Date, 
      default: Date.now()
    },
    expirePlan:{
      type: Date,
     },
    status: {
      type: String,
      enum: ['Active', 'In-Active'],
      default: 'Active'
    },

  },

  {
    timestamps: true,
    versionKey: false
  }
)

const transaction = mongoose.model('transaction', transactionSchema)

module.exports = {
    transaction
}

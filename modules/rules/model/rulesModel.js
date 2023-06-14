const { boolean } = require('joi');
const mongoose = require('mongoose')

const rulesSchema = new mongoose.Schema ({
     columnName:{
       type:String
     },
      dataType: {
        type:String,
        enum: ['string', 'number','dob'],
        default: 'string'
      },
      validation: {
        type:String,
        enum: ['email', 'number','string',"mobilenumber","dob"],
        default: 'string'
      },
      maximumLength:{
        type:Number,
        default:50
      },
      required:{
        type:Boolean,
        default:false
    },
    unique:{
      type:Boolean,
      default:false
  },
  groupId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"manageGroup"
  }
  
  
    },);
 const rules = mongoose.model('rules', rulesSchema)

module.exports = {
  rules
}

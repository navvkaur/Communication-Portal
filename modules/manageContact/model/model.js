const { boolean } = require('joi');
const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const manageContactSchema = new mongoose.Schema ({
  
  groupId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"manageGroup"
  },
  audienceType:{
    type:String,
   enum:["Active","In-Active"],
   default:"Active"
  }
  
   
    },{strict: false,versionKey:false});
    // manageContactSchema.plugin(mongoosePaginate);
 const manageContact = mongoose.model('manageContact', manageContactSchema)

module.exports = {
  manageContact
}

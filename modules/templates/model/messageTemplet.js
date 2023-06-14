const { string } = require('joi')
const mongoose = require('mongoose')

const messageTempletModel = new mongoose.Schema(
    {
        subject: {
            type: String,
            
        },
        templateName: {
            type: String,
            required: true
        },
        categoryId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'category',
            required:true
        },
        from:{
            type:String
        },
        to:{
            type:String
        },
        dltApprovel:{
            type:String,
            enum:["APPROVED","PENDING","REJECTED"] ,
            default: "PENDING"
        },
        templateStatus:{
            type:String,
            enum:["APPROVED","PENDING","REJECTED"] ,
            default:"PENDING"    
          },
          subUserId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'SubUser',
            
        },
      
    },

    {
        timestamps: true,
        versionKey: false
    }
)

const messageTemplate = mongoose.model('messageTemplate', messageTempletModel)

module.exports = {
    messageTemplate
}

const { string, required } = require('joi')
const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const manageaddTemplate = new mongoose.Schema(
    {
        subject: {
            type: String,
            
        },
        content: {
            type: String,
   
        },
        subUserId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'SubUser',
            
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
        file:{
            type:Array
        },
        attachment:{
            type:Array
        },
        templateStatus:{
            type:String,
            enum:["APPROVED","PENDING","REJECTED"] ,
            default:"PENDING" 
          },
        //   userVariable:[userVariableschema],
          groupId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"manageGroup"
          }

        
    },

    {
        timestamps: true,
        versionKey: false
    }
)

const template = mongoose.model('template', manageaddTemplate)

module.exports = {
    template
}

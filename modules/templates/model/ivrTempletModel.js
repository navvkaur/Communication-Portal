const { string } = require('joi')
const mongoose = require('mongoose')

const ivrTempletModel = new mongoose.Schema(
    {
        templateName: {
            type: String,
            required: true
        },
        subject: {
            type: String,

        },
        subUserId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'SubUser',
            
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'category'
        },
        from: {
            type: String
        },
        to: {
            type: String
        }
        ,
        audioFile: {
            type: String,
            required: true
        },
        templateStatus:{
            type:String,
            enum:["APPROVED","PENDING","REJECTED"] ,
            default:"PENDING"    
          },
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

const ivrTemplate = mongoose.model('ivrTemplate', ivrTempletModel)

module.exports = {
    ivrTemplate
}

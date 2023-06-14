const { string } = require('joi')
const mongoose = require('mongoose')

const whatsappTempletModel = new mongoose.Schema(
    {
        subject: {
            type: String,

        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'category'
        },
        from: {
            type: String
        },
        templateName: {
            type: String,
            required: true
        },
        to: {
            type: String
        },
        dltApprovel: {
            type: String,
            enum:["APPROVED","PENDING","REJECTED"] ,
            default: "PENDING"
        },
        content: {
            type: String,

        },
        file: {
            type: Array
        },
        attachment: {
            type: Array
        },
        templateStatus: {
            type: String,
            enum:["APPROVED","PENDING","REJECTED"] ,
            default: "PENDING"
        },
        subUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubUser',

        },


    },

    {
        timestamps: true,
        versionKey: false
    }
)

const whatsappTemplate = mongoose.model('whatsappTemplate', whatsappTempletModel)

module.exports = {
    whatsappTemplate
}

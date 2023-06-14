const mongoose = require('mongoose')

const categoryModel = new mongoose.Schema(
    {
        categoriesType: {
            type: String,
            enum: ['Email', 'Message','Whatsapp','IVR'],
        },
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user',
            required: true,
            
        },
        subUserId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'SubUser',
            
        },
        categoryName:{
            type:String,
            required: true,      
          },
          categoryStatus:{
            type:String,
            enum:["Active","In-Active"] ,
            default:"Active"    
          },
        image:{
            type:String
        }
    },

    {
        timestamps: true,
        versionKey: false
    }
)

const category = mongoose.model('category', categoryModel)

module.exports = {
    category
}

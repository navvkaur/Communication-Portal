const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    razorpay_order_id: {
        type: String,
        required: true,
    },
    razorpay_payment_id: {
        type: String,
        required: true,
    },
    razorpay_signature: {
        type: String,
        required: true,
    },
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    status:{
        type:String,
        enum:["failed","success"],
        default:"failed"
    },
    amount:{
        type:Number,
        required:true
    },
    plan:{
        type:String,
        required:true
    }
    

},
    {
        timestamps: true,
        versionKey: false
    }
);
 const Payment = mongoose.model("payment", paymentSchema);
 module.exports = {
    Payment
}

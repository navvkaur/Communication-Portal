const { Payment } = require('../model/paymentModel')
// const { instance } = require('../../../server')
const response = require("../../../utils/response")
const httpStatus = require('http-status');
const fs = require('fs');
var easyinvoice = require('easyinvoice');
const os = require('os');
const path = require('path');
const transaction = require('../../transaction/business/transactionBusiness')

const crypto = require('crypto');
const Razorpay = require('razorpay');
const {user}=require('../../user/model/userModel')

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_APT_SECRET,
});

exports.checkout = async (req, res) => {
  try {
    console.log(req.body)
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_API_KEY,
      key_secret: process.env.RAZORPAY_APT_SECRET,
    });

    const options = {
      amount: Number(req.body.amount * 100),//req.body.amount

      currency: "INR"

    };
    const order = await instance.orders.create(options);
    const userId = req.body.userId;
    const plan = req.body.plan;
    res.status(200).json({
      success: true,
      order
    });
    console.log(userId,plan)
  } catch (error) {
    console.log(error)
  }
};
exports.paymentVerification = async (req, res) => {
  console.log(req.body)

  try {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
      .update(body.toString())
      .digest("hex"); 
    const isAuthentic = expectedSignature === razorpay_signature;
    if (isAuthentic) {
      console.log(isAuthentic, "12345")
      let payment = new Payment({
        "razorpay_order_id": razorpay_order_id,
        "razorpay_payment_id": razorpay_payment_id,
        "razorpay_signature": razorpay_signature,
        "status":"success",

        "userId":req.query.userId,
        "plan":req.query.plan,
        "amount":req.query.amount

      }) 

      // req.body.status="sucessful"
     let savePaymentTransaction= await payment.save()
     await transaction.purchasePlan(req,res) 
    // return response.success({ message: "PAYMENT_SUCCESSFUL", data: savePaymentTransaction }, res, httpStatus.CREATED)
     
      res.redirect(
        `http://43.204.37.76/final-step?reference=${razorpay_payment_id}`
      );
    } else {
      return response.success({ message: "PAYMENT_FAILURE" }, res, httpStatus.UNAUTHORIZED)

    } 
  } catch (error) {
    console.log(error.message)
    return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

  }
};
exports.fetchOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId
    instance.orders.fetch(orderId, (err, order) => {
      if (err) {
        console.error(err);
        // handle error
      } else {
        res.status(400).json({
          success: false  ,
        }); 
      }
    })

  } catch (error) {
    console.log(error.message)
  }
};
exports.downloadInvoice=async (req,res)=>{

  const plan1 = {
    name: "Plan A",
    amount: 100,
    interval: "month",
    duration: 3
  };
  const customerDetails = {
    name: "John Doe",
    email: "john.doe@example.com",
    address: "123 Main St, Anytown USA"
  };
  
  
var data = {
    // Customize enables you to provide your own templates
    // Please review the documentation for instructions and examples
    "customize": {
        //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
    },
    "images": {
        // The logo on top of your invoice
        "logo": "https://communicationportal.s3.ap-south-1.amazonaws.com/Logo.png",
        // The invoice background
        // "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
    },
    // Your own data
    "sender": `${customerDetails}`,
    // Your recipient
    "client": {
        "company": "Client Corp",
        "address": "Clientstreet 456",
        "zip": "4567 CD",
        "city": "Clientcity",
        "country": "Clientcountry"
        // "custom1": "custom value 1",
        // "custom2": "custom value 2",
        // "custom3": "custom value 3"
    },
    "information": {
        // Invoice number
        "number": "2021.0001",
        // Invoice data
        "date": "12-12-2021",
        // Invoice due date
        "due-date": "31-12-2021"
    },
    // The products you would like to see on your invoice
    // Total values are being calculated automatically
    "products": [
        {
            "quantity": 2,
            "description": "Product 1",
            "tax-rate": 6,
            "price": 33.87
        },
        {
            "quantity": 4.1,
            "description": "Product 2",
            "tax-rate": 6,
            "price": 12.34
        },
        {
            "quantity": 4.5678,
            "description": "Product 3",
            "tax-rate": 21,
            "price": 6324.453456
        }
    ],
    // The message you would like to display on the bottom of your invoice
    "bottom-notice": "Kindly pay your invoice within 15 days.",
    // Settings to customize your invoice
    "settings": {
        "currency": "USD", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
        // "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')        
        // "margin-top": 25, // Defaults to '25'
        // "margin-right": 25, // Defaults to '25'
        // "margin-left": 25, // Defaults to '25'
        // "margin-bottom": 25, // Defaults to '25'
        // "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
        // "height": "1000px", // allowed units: mm, cm, in, px
        // "width": "500px", // allowed units: mm, cm, in, px
        // "orientation": "landscape", // portrait or landscape, defaults to portrait
    },
    // Translate your invoice to your preferred language
    "translate": {
        // "invoice": "FACTUUR",  // Default to 'INVOICE'
        // "number": "Nummer", // Defaults to 'Number'
        // "date": "Datum", // Default to 'Date'
        // "due-date": "Verloopdatum", // Defaults to 'Due Date'
        // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
        // "products": "Producten", // Defaults to 'Products'
        // "quantity": "Aantal", // Default to 'Quantity'
        // "price": "Prijs", // Defaults to 'Price'
        // "product-total": "Totaal", // Defaults to 'Total'
        // "total": "Totaal", // Defaults to 'Total'
        // "vat": "btw" // Defaults to 'vat'
    },
};

//Create your invoice! Easy!

easyinvoice.createInvoice(data, async function (result) {
    //The response will contain a base64 encoded PDF file
    console.log('PDF base64 string: ', result.pdf);

    // await fs.writeFileSync("invoice.pdf",result.pdf,'base64');

    const downloadFolder = path.join(os.homedir(), 'Downloads');
    const filePath = path.join(downloadFolder, 'invoice.pdf')

    fs.writeFile(filePath, result.pdf,'base64', function(error) {
      if(error) {
        console.log(error);
      } else {
        console.log('Invoice downloaded successfully!');
      }
    }); 
});

  
}
exports.transactionHistory=async(req,res)=>{
  try {
    const token=req.token;
  
    console.log(token)
    const findUserHistory= await user.findOne({_id:token._id}).lean()
    if(findUserHistory){
        const findTransaction=await Payment.find({userId:token._id}).lean()
        if(findTransaction){
          return response.success({ message: "FETCH_DATA", data: findTransaction }, res, httpStatus.OK)
        }
        else{
          return response.error({ message: "NOT_FOUND" }, res, httpStatus.FORBIDDEN)
        }
    }
    else{
      return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.FORBIDDEN)
    }
  } catch (error) {
    return response.error({ message: 'INTERNAL_SERVER_ERROR', error: error }, res, httpStatus.INTERNAL_SERVER_ERROR);
    
  }
 
  
} 



























// let customer =async () => {

//   const instance = new Razorpay({
//     key_id: process.env.RAZORPAY_API_KEY,
//     key_secret: process.env.RAZORPAY_APT_SECRET,
//   });
//   const check=await user.findById({_id:"644b2866af99f7af96932ae9"}).lean()
// // console.log(check)
//   instance.customers.create(
//     {
//       name: check.name,
//       email: check.email,
//       contact: "+919999999999",
//       notes: {
//         description: "Customer for testing purpose",
//       },
//     },
//     function (error, customer) {
//       if (error) {
//         console.log(error);
//         return;
//       }
//       console.log(customer); 
//     }
//   );
// }
// let item=()=>{
//   const instance = new Razorpay({
//     key_id: process.env.RAZORPAY_API_KEY,
//     key_secret: process.env.RAZORPAY_APT_SECRET,
//   }); 
//   // 
  
//   instance.items.create({
//     "name": "silver",
//     "description": "comm plan.",
//     "amount": 1000, 
//     "currency": "INR"
//   }).then((response) => {
//     console.log(response);
//   }).catch((error) => {
//     console.log(error);
//   });
// }
// // item() 

// // customer()

// // let invoice = () => {
  
// //   const instance = new Razorpay({
// //     key_id: process.env.RAZORPAY_API_KEY,
// //     key_secret: process.env.RAZORPAY_APT_SECRET,
// //   });
  
  
  
  
// // }
// // invoice()
// let find=async()=>{
//   const instance = new Razorpay({
//     key_id: process.env.RAZORPAY_API_KEY,
//     key_secret: process.env.RAZORPAY_APT_SECRET,
//   }); 
//   //
//   const invoice=await instance.invoices.create({
//     type: "invoice",
//     date: Math.floor(Date.now() / 1000),
//     customer_id: "cust_LlsK1ZxxKSyLBE",
//     line_items: [
//       { 
//         name: "plan 1",
//         description: "Description of Product 1",
//         amount: 200,
//         currency: "INR",
//         quantity: 1
//       }
//     ]
//   }) 
//   console.log(invoice) 
  
//   // 
//   const payment = await instance.payments.fetch('pay_LlxW3ss1cErPll');
//   payment.invoice_id=invoice.id
//   console.log("paymet-==========",payment)
//   const invoiceId = payment.invoice_id;
//   console.log("123456789",invoiceId)



//   easyinvoice.createInvoice(invoice, async function (result) {
//     //The response will contain a base64 encoded PDF file
//     console.log('PDF base64 string: ', result.pdf);

//     // await fs.writeFileSync("invoice.pdf",result.pdf,'base64');

//     const downloadFolder = path.join(os.homedir(), 'Downloads');
//     const filePath = path.join(downloadFolder, 'invoice.pdf');

//     fs.writeFile(filePath, result.pdf,'base64', function(error) {
//       if(error) {
//         console.log(error);
//       } else {
//         console.log('Invoice downloaded successfully!');
//       }
//     }); 
// });

 



 
//   // const invoices = await instance.invoices.fetch('invoiceId');

// // Download invoice PDF
// // const pdf = await axios.get(invoices.pdf_url, { responseType: 'arraybuffer' });
// // fs.writeFileSync('invoice.pdf', pdf.data);
// //   const pdf = await instance.invoices.pdf(invoiceId);
  
// // // Save the PDF to a file 
// // fs.writeFileSync('invoice.pdf', pdf, 'binary'); 
// }
// find()
// let findone=async()=>{
//   const instance = new Razorpay({
//     key_id: process.env.RAZORPAY_API_KEY,
//     key_secret: process.env.RAZORPAY_APT_SECRET,
//   });
  
//   instance.items.create({
//     "name": "Book / English August",
//     "description": "An indian story, Booker prize winner.",
//     "amount": 20000, 
//     "currency": "INR"
//   }).then((response) => {
//     console.log(response);
//   }).catch((error) => {
//     console.log(error);
//   });
// }
// // findone()  


// let pdffile=()=>{
//   const instance = new Razorpay({
//     key_id: process.env.RAZORPAY_API_KEY,
//     key_secret: process.env.RAZORPAY_APT_SECRET,
//   }); 
// const invoiceId = 'inv_LlxY0MapDFWPOX'; // replace with the ID of the invoice you want to download

// instance.invoices.pdf(invoiceId, function(error, data) {
//   if(error) {
//     console.log(error);
//   } else {
//     fs.writeFile('invoice.pdf', data, function(error) {
//       if(error) {
//         console.log(error);
//       } else {
//         console.log('Invoice downloaded successfully!');
//       }
//     });
//   }
// });
// } 
// // pdffile()
// //////////////////





// var data = {
//     // Customize enables you to provide your own templates
//     // Please review the documentation for instructions and examples
//     "customize": {
//         //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
//     },
//     "images": {
//         // The logo on top of your invoice
//         "logo": "https://communicationportal.s3.ap-south-1.amazonaws.com/Logo.png",
//         // The invoice background
//         // "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
//     },
//     // Your own data
//     "sender": {
//         "company": "Communication-Portal",
//         "address": "Delhi",
//         "zip": "1234",
//         "city": "Delhi",
//         "country": "India"
//         //"custom1": "custom value 1",
//         //"custom2": "custom value 2",
//         //"custom3": "custom value 3"
//     },
//     // Your recipient
//     "client": {
//         "company": "Client Corp",
//         "address": "Clientstreet 456",
//         "zip": "4567 CD",
//         "city": "Clientcity",
//         "country": "Clientcountry"
//         // "custom1": "custom value 1",
//         // "custom2": "custom value 2",
//         // "custom3": "custom value 3"
//     },
//     "information": {
//         // Invoice number
//         "number": "2021.0001",
//         // Invoice data
//         "date": "12-12-2021",
//         // Invoice due date
//         "due-date": "31-12-2021"
//     },
//     // The products you would like to see on your invoice
//     // Total values are being calculated automatically
//     "products": [
//         {
//             "quantity": 2,
//             "description": "Product 1",
//             "tax-rate": 6,
//             "price": 33.87
//         },
//         {
//             "quantity": 4.1,
//             "description": "Product 2",
//             "tax-rate": 6,
//             "price": 12.34
//         },
//         {
//             "quantity": 4.5678,
//             "description": "Product 3",
//             "tax-rate": 21,
//             "price": 6324.453456
//         }
//     ],
//     // The message you would like to display on the bottom of your invoice
//     "bottom-notice": "Kindly pay your invoice within 15 days.",
//     // Settings to customize your invoice
//     "settings": {
//         "currency": "USD", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
//         // "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')        
//         // "margin-top": 25, // Defaults to '25'
//         // "margin-right": 25, // Defaults to '25'
//         // "margin-left": 25, // Defaults to '25'
//         // "margin-bottom": 25, // Defaults to '25'
//         // "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
//         // "height": "1000px", // allowed units: mm, cm, in, px
//         // "width": "500px", // allowed units: mm, cm, in, px
//         // "orientation": "landscape", // portrait or landscape, defaults to portrait
//     },
//     // Translate your invoice to your preferred language
//     "translate": {
//         // "invoice": "FACTUUR",  // Default to 'INVOICE'
//         // "number": "Nummer", // Defaults to 'Number'
//         // "date": "Datum", // Default to 'Date'
//         // "due-date": "Verloopdatum", // Defaults to 'Due Date'
//         // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
//         // "products": "Producten", // Defaults to 'Products'
//         // "quantity": "Aantal", // Default to 'Quantity'
//         // "price": "Prijs", // Defaults to 'Price'
//         // "product-total": "Totaal", // Defaults to 'Total'
//         // "total": "Totaal", // Defaults to 'Total'
//         // "vat": "btw" // Defaults to 'vat'
//     },
// };

// //Create your invoice! Easy!

// // easyinvoice.createInvoice(data, async function (result) {
// //     //The response will contain a base64 encoded PDF file
// //     console.log('PDF base64 string: ', result.pdf);

// //     // await fs.writeFileSync("invoice.pdf",result.pdf,'base64');

// //     const downloadFolder = path.join(os.homedir(), 'Downloads');
// //     const filePath = path.join(downloadFolder, 'invoice.pdf');

// //     fs.writeFile(filePath, result.pdf,'base64', function(error) {
// //       if(error) {
// //         console.log(error);
// //       } else {
// //         console.log('Invoice downloaded successfully!');
// //       }


// //     }); 


// // });

 

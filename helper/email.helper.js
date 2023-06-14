const nodemailer = require('nodemailer')

exports.autoMail = async (from,email, subject,text,attachment,html) => {
  //Nodemailer TRANSPORTER
  // console.log(text,html)
  const transporter = nodemailer.createTransport({
    host: process.env.EHOST,
    service: "gmail",
    port: 587,
    secure: true,
    auth: {
      user: 'testmacapp2@gmail.com',
      pass: 'enomueztwdulnvpr'
      // user: process.env.EMAIL,
      // pass: process.env.EPASS
    }
  })
  //Nodemailer OPTIONS
  const options = {
    from: {
      name:from,
      address:from
    },
    to: email,
    subject: subject,
    text: text,
    attachments:attachment,
    html: html
  }

  
  //Sending EMAIL
  await transporter.sendMail(options, (err, info) => {
    if (err) {
      console.log(`Cannot send email >>> ${err.message}`);
      
    } else {
      console.log(`Email sent successfully: ${info.response}`);
    }
  })
}
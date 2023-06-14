const { user } = require('../model/userModel')
const { msg } = require('../../../messages')
const bcrypt = require('bcryptjs')
const response = require("../../../utils/response")
const httpStatus = require('http-status');
const emailHelper = require("../../../helper/email.helper")
const jwt = require("../../../middleware/jwt")
const { transaction } = require('../../transaction/model/transactionModel')
const axios = require("axios")
let country_state_district = require('@coffeebeanslabs/country_state_district');
const { verifyid } = require("../../verifyId/model/verifyidModel")
const ImageController = require("../../../helper/imageHelper");
const { Transaction } = require('mongodb');
const cron = require('node-cron');

function AddmintuesToCurrentDate(date, mintue) {
  return new Date(date.getTime() + mintue * 30000)
}

exports.register = async (req, res) => {
  try {
    let data = req.body
    data.email = req.body.email.toLowerCase()
    let userResult = await user.findOne({
      email: data.email
    })
    if (userResult) {
      return response.error({ message: 'EMAIL_ALREADY_EXISTS' }, res, httpStatus.ALREADY_REPORTED)
    }
    else {
      if (req.body.password == req.body.confirmPassword) {
        req.body.password = bcrypt.hashSync(req.body.password)

        const otp = parseInt(Math.random() * 1000 + 1000)
        console.log(otp)
        req.body.expireOTP = Date.now() + 45 * 1000;
        data.otp = otp
        let subject = "VerifyOtp";
        let text = `otp is ${otp},valid for 45 Seconds only `
        let html = `<!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Document</title>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                          </style>
                
                    </head>
                    <body style="margin:0;padding:0;">
                        <div>
                            <div style="width: 640px; margin: auto;position:
                                relative;border: 2px solid #f3f3f3;background-color: #fff;">
                                <div style="padding:10px 80px;">
                                    <div
                                        style="background-position: center;background-repeat:
                                        no-repeat;height: 96px;
                                        width: 96px;">
                                        <img src="https://communicationportal.s3.ap-south-1.amazonaws.com/Logo.png" alt="logo">
                                    </div>
                                    <div style="padding-top: 24px;">
                                        <h1 style="font-family: 'inter', sans-serif;font-weight:
                                        600;font-size:52px;margin:0px">Your OTP</h1>
                                    </div>
                                    <div style="padding-top: 10px;">
                                        <p style="font-weight:500; font-size:16px; font-family:Inter;letter-spacing: -0.02em; line-height: 24px;"><b> 4-digit code below into the number fields of your sign-in process.</b></p>
                                    </div>
                                </div>
                                <div >
                                <div style="padding:0px 80px;">
                                    <h1 style="border:1px solid black ;text-align: center;padding: 30px  182px 37px 183px;font-size: 40px;font-weight: 600;font-family: 'Inter', sans-serif;border-radius: 24px; line-height: 52px; letter-spacing: -0.05em; ">${otp}</h1>
                                </div>
                            </div>
                
                
                                <div
                                    style="background-size:contain;background-position:
                                    center;background-repeat:no-repeat;padding:5px 80px;">
                                    <p
                                        style="font-size: 16px;font-weight:400; font-family:
                                        Inter, sans-serif;color: #757575; letter-spacing: -0.02em; line-height: 24px;">
                                        Please note: the code will be valid for the next 45
                                        seconds.</p>
                                    <p
                                        style="font-size:16px;font-weight:400;letter-spacing:
                                        -0.02em;color: #7A869A; font-family:Inter,
                                        sans-serif;color:#757575 ;line-height: 24px;">
                                        If you didn’t try to sign-in or create an account on
                                        Wireframes, you can safely ignore this email.</p>
                                </div>
                                <div>
                                    <div style="background-color: #F5F8FF; margin:10px
                                        80px;padding: 32px;">
                                        <div>
                                            <p style="font-family:Inter;font-size:
                                                14px;font-weight:400;padding-bottom: 40px; ">Need
                                                help?<i
                                                    style="color: #3964EA;"> <u>Contact our
                                                        support team </u></i>or no longer
                                                interested in our
                                                newsletters?<i style="color: #3964EA;">
                                                    <u>Unsubscribe here.</u></i> Want to give us
                                                feedback? Let us know what you think on our
                                                <i style="color: #3964EA;"><u>feedback site.</u></i></p>
                                        </div>
                                        <div style=" text-align: left;">
                                            <a href="#"><img src="https://communicationportal.s3.ap-south-1.amazonaws.com/Vector+(1).png"
                                                    style="height: 16.5px;width: 16.5px;"></a>
                                            <a href="#"><img src="https://communicationportal.s3.ap-south-1.amazonaws.com/Vector+(2).png"
                                                    style="height: 16.5px;width:
                                                    16.5px;margin-left: 25.5px;"></a>
                                            <a href="#"><img
                                                    src="https://communicationportal.s3.ap-south-1.amazonaws.com/Vector+(3).png"
                                                    style="height: 16.5px;width:
                                                    16.5px;margin-left: 25.5px;"></a>
                                            <a href=""><img
                                                    src="https://communicationportal.s3.ap-south-1.amazonaws.com/Vector.png"
                                                    style="height: 16.5px;width:
                                                    16.5px;margin-left: 25.5px;"></a>
                                        </div>
                                    </div>
                
                                </div>
                
                            </body>
                        </html>`
        let attachment = []
        const send = emailHelper.autoMail(from = process.env.EMAIL, email = data.email, subject = subject, text = text, attachment, html = html)

        if (send) {
          console.log('====================================', req.body)
          console.log('Mail Sent Successfully >>> ')
          let result = new user(req.body)

          let res1 = await result.save()
          console.log("======1234567", res1)

          //////////
          console.log(res1)
          const token = await jwt.generateAuthJwt({
            email: req.body.email,
            _id: res1._id,
            userType: "USER",
            status: res1.status,
            expires_in: process.env.TOKEN_EXPIRES_IN

          })
          const finalresult = { res1, token }
          //////
          if (res1) {
            let copyToVerifyId = await verifyid({
              userId: res1._id,
              email: res1.email,
            }).save();
            return response.success({ message: "SIGNUP_SUCCESSFUL", data: finalresult }, res, httpStatus.CREATED)
          }
          else {
            return response.error({ message: "SIGNUP_FAILED" }, res, httpStatus.FORBIDDEN)
          }

        } else {
          console.log('Mail Not Sent >>>')
          return response.error({ message: "EMAIL_FAILURE" }, res, httpStatus.FORBIDDEN)
        }
      }
      else {
        return response.error({ message: "PASSWORD_MISS_MATCH" }, res, httpStatus.FORBIDDEN)

      }
    }
  } catch (error) {
    console.log(error.message)
    return response.error({ message: 'INTERNAL_SERVER_ERROR', error: error }, res, httpStatus.INTERNAL_SERVER_ERROR);
  }
}
exports.login = async (req, res) => {
  try {
    let result1 = ""
    const data = req.body
    data.email = req.body.email.toLowerCase()
    result1 = await user.findOne({ email: data.email, otpVerify: true }).lean()

    //console.log("========>57", result1)
    if (!result1) {
      return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
    }
    else if (result1.status == "In-Active") {
      return response.error({ message: 'IN_ACTIVE_STATUS' }, res, httpStatus.UNAUTHORIZED)
    }

    else {
      let passCheck = bcrypt.compareSync(req.body.password, result1.password);
      if (!passCheck) {
        return response.error({ message: "INCORRECT_PASSWORD" }, res, httpStatus.UNAUTHORIZED)
      }


      else {
        const token = await jwt.generateAuthJwt({
          email: req.body.email,
          _id: result1._id,
          userType: "USER",
          status: result1.status,
          expires_in: process.env.TOKEN_EXPIRES_IN

        })
        const finalresult = { result1, token }
        return response.success({ message: "LOGIN_SUCCESSFUL", data: finalresult }, res, httpStatus.OK)
      }

    }
  } catch (error) {
    return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

  }


}
exports.updateById = async (req, res) => {
  try {
    let findResult = await user.findById({ _id: req.params.id })
    console.log(findResult)

    if (req?.file) {
      let imageUrl = findResult.profile

      if (imageUrl) {

        var url = await imageUrl.split('/');
        console.log(url)
        var updated_url = await url[url.length - 1]

        console.log("===============1255555555", updated_url)

        const ImageData1 = await ImageController.deleteFile(updated_url);

      }


      let fileDetails = req.file


      let uploadCategory = await ImageController.fileUpload(fileDetails.filename,
        fileDetails.destination,
        fileDetails.mimetype,
        '/');
      console.log(uploadCategory.Location)


      req.body.profile = uploadCategory.Location
    }
    const data = req.body
    const newResult1 = await user.findByIdAndUpdate(
      { _id: req.params.id },
      data,
      {
        new: true
      })

    if (newResult1) {
      return response.success({ message: "P_UPDATE", data: newResult1 }, res, httpStatus.OK)

    }
    else {
      return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)

    }
  } catch (error) {
    console.log(error.message)
    return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

  }
}
exports.forgetPwd = async (req, res) => {
  try {
    const data = req.body
    data.email = req.body.email.toLowerCase()
    const validUser = await user.findOne({
      email: data.email
    }).lean()
    console.log("1234567", validUser)
    if (!validUser) {
      return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)

    }
    else {
      const otp = parseInt(Math.random() * 1000 + 1000)
      console.log(otp)
      req.body.expireOTP = Date.now() + 45 * 1000;
      let otpTime = req.body.expireOTP
      let subject = 'OTP varification for forgot password';
      let text = `Your OTP for verification : ${otp}`;
      let html = `<!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Document</title>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                          </style>
                
                    </head>
                    <body style="margin:0;padding:0;">
                        <div>
                            <div style="width: 640px; margin: auto;position:
                                relative;border: 2px solid #f3f3f3;background-color: #fff;">
                                <div style="padding:10px 80px;">
                                    <div
                                        style="background-position: center;background-repeat:
                                        no-repeat;height: 96px;
                                        width: 96px;">
                                        <img src="https://communicationportal.s3.ap-south-1.amazonaws.com/Logo.png" alt="logo">
                                    </div>
                                    <div style="padding-top: 24px;">
                                        <h1 style="font-family: 'inter', sans-serif;font-weight:
                                        600;font-size:52px;margin:0px">Your OTP</h1>
                                    </div>
                                    <div style="padding-top: 10px;">
                                        <p style="font-weight:500; font-size:16px; font-family:Inter;letter-spacing: -0.02em; line-height: 24px;"><b> 4-digit code below into the number fields of your sign-in process.</b></p>
                                    </div>
                                </div>
                                <div >
                                <div style="padding:0px 80px;">
                                    <h1 style="border:1px solid black ;text-align: center;padding: 30px  182px 37px 183px;font-size: 40px;font-weight: 600;font-family: 'Inter', sans-serif;border-radius: 24px; line-height: 52px; letter-spacing: -0.05em; ">${otp}</h1>
                                </div>
                            </div>
                
                
                                <div
                                    style="background-size:contain;background-position:
                                    center;background-repeat:no-repeat;padding:5px 80px;">
                                    <p
                                        style="font-size: 16px;font-weight:400; font-family:
                                        Inter, sans-serif;color: #757575; letter-spacing: -0.02em; line-height: 24px;">
                                        Please note: the code will be valid for the next 45
                                        seconds.</p>
                                    <p
                                        style="font-size:16px;font-weight:400;letter-spacing:
                                        -0.02em;color: #7A869A; font-family:Inter,
                                        sans-serif;color:#757575 ;line-height: 24px;">
                                        If you didn’t try to sign-in or create an account on
                                        Wireframes, you can safely ignore this email.</p>
                                </div>
                                <div>
                                    <div style="background-color: #F5F8FF; margin:10px
                                        80px;padding: 32px;">
                                        <div>
                                            <p style="font-family:Inter;font-size:
                                                14px;font-weight:400;padding-bottom: 40px; ">Need
                                                help?<i
                                                    style="color: #3964EA;"> <u>Contact our
                                                        support team </u></i>or no longer
                                                interested in our
                                                newsletters?<i style="color: #3964EA;">
                                                    <u>Unsubscribe here.</u></i> Want to give us
                                                feedback? Let us know what you think on our
                                                <i style="color: #3964EA;"><u>feedback site.</u></i></p>
                                        </div>
                                        <div style=" text-align: left;">
                                            <a href="#"><img src="https://communicationportal.s3.ap-south-1.amazonaws.com/Vector+(1).png"
                                                    style="height: 16.5px;width: 16.5px;"></a>
                                            <a href="#"><img src="https://communicationportal.s3.ap-south-1.amazonaws.com/Vector+(2).png"
                                                    style="height: 16.5px;width:
                                                    16.5px;margin-left: 25.5px;"></a>
                                            <a href="#"><img
                                                    src="https://communicationportal.s3.ap-south-1.amazonaws.com/Vector+(3).png"
                                                    style="height: 16.5px;width:
                                                    16.5px;margin-left: 25.5px;"></a>
                                            <a href=""><img
                                                    src="https://communicationportal.s3.ap-south-1.amazonaws.com/Vector.png"
                                                    style="height: 16.5px;width:
                                                    16.5px;margin-left: 25.5px;"></a>
                                        </div>
                                    </div>
                
                                </div>
                
                            </body>
                        </html>`
      let attachment = []
      let send = emailHelper.autoMail(from = process.env.EMAIL, email = data.email, subject = subject, text = text, attachment, html = html)
      if (send) {
        let otpUpdate = await user.findOneAndUpdate({ email: req.body.email, }, { $set: { otp: otp, otpVerify: false, expireOTP: otpTime } }, { new: true })
        if (otpUpdate) {
          return response.success({ message: "OTP_SENT" }, res, httpStatus.OK)
        }
        else {
          console.log('Mail Not Sent >>>', update)
          return response.error({ message: "EMAIL_FAILURE" }, res, httpStatus.FORBIDDEN)

        }
      }
    }
    //  else {
    //     const otp = parseInt(Math.random() * 1000 + 1000)
    //     console.log(otp)
    //     const currentDate = new Date()
    //     const expireOtp = AddmintuesToCurrentDate(currentDate, 10)
    //     data.expireOTP = expireOtp
    //     data.otp = otp
    //     const update = await user.findOneAndUpdate(
    //         {
    //             email: req.body.email,
    //         },
    //         { $set: { otp: otp, otpVerify: false } },
    //         { new: true }
    //     )
    //     console.log(update)

    //     let subject = "forget Password";
    //     let text = `otp is ${otp},valid for 6 Minutes only `
    //     const send = emailHelper.autoMail(from=process.env.EMAIL,email =data.email,subject = subject, text =text)

    //     if (send) {
    //         console.log('Mail Sent Successfully >>> ')
    //         return response.success({ message: "OTP_SENT" }, res, httpStatus.OK)


    //     } else {
    //         console.log('Mail Not Sent >>>', update)
    //         return response.error({ message: "EMAIL_FAILURE" }, res, httpStatus.FORBIDDEN)

    //     }

    // }

  } catch (error) {
    return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

  }

}
exports.verifyOTP = async (req, res) => {
  try {
    //
    let data = req.body
    data.email = req.body.email.toLowerCase()
    let resultVerify = await user.findOne(
      {
        email: data.email,
      })

    if (!resultVerify) {
      return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)


    } else {
      if (resultVerify.otpVerify == true) {
        return response.error({ message: "ALREADY_VERIFY" }, res, httpStatus.ALREADY_REPORTED)

      }
      else {
        let currentTime = Date.now();

        if (req.body.otp == resultVerify.otp) {
          if (resultVerify.expireOTP >= currentTime) {
            let resVerify = await user.findByIdAndUpdate(
              { _id: resultVerify._id },
              { $set: { otpVerify: true } },
              { new: true })
            if (!resVerify) {
              return response.error({ message: "ALREADY_VERIFY" }, res, httpStatus.ALREADY_REPORTED)
            } else {
              let verifyIdStatus = await verifyid.updateOne({ email: data.email }, { $set: { verifyid: "APPROVED" } }, { new: true })
              if (verifyIdStatus) {
                return response.success({ message: "OTP_VERIFY_SUCCESSfULLY", data: resVerify }, res, httpStatus.OK)

              }
              else {
                return response.error({ message: "VERIFY_ID_ERROR" }, res, httpStatus.FORBIDDEN)

              }


            }

          }
          else {
            return response.error({ message: "OTP_EXPIRED" }, res, httpStatus.FORBIDDEN)

          }

        } else {
          return response.error({ message: "INVALID_OTP" }, res, httpStatus.FORBIDDEN)

        }


      }
    }
  }
  catch (err) {
    return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

  }
}
exports.updatePassword = async (req, res) => {
  try {
    let data = req.body
    data.email = req.body.email.toLowerCase()
    let userResult1 = await user.findOne(
      {
        email: data.email,

      }
    );
    if (!userResult1) {
      return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)

    }
    else {
      if (req.body.newPassword == req.body.confirmNewPassword) {
        req.body.newPassword = bcrypt.hashSync(req.body.newPassword)
        let userUpdate = await user.findByIdAndUpdate(
          { _id: userResult1._id },
          { $set: { password: req.body.newPassword, otpVerify: true, } },
          { new: true })
        if (!userUpdate) {
          return response.error({ message: "ALREADY_VERIFY" }, res, httpStatus.ALREADY_REPORTED)
        } else {
          return response.success({ message: "PASSWORD_UPDATED", data: userUpdate }, res, httpStatus.OK)
        }
      }
      else {
        return response.error({ message: "PASSWORD_MISS_MATCH" }, res, httpStatus.FORBIDDEN)

      }
    }
  } catch (error) {
    return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

  }
}
exports.changePassword = async (req, res) => {
  try {
    const data = req.body
    data.email = req.body.email.toLowerCase()
    const validUser = await user.findOne({
      email: data.email,
      status: "Active"
    }).lean()
    if (!validUser) {

      return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)

    }
    else {
      let passCheck = bcrypt.compareSync(req.body.password, validUser.password);
      if (passCheck == false) {
        return response.error({ message: "INCORRECT_PASSWORD" }, res, httpStatus.UNAUTHORIZED)

      }
      else {
        let newPassword = data.newPassword;
        let confirmNewPassword = data.confirmNewPassword
        if (newPassword != confirmNewPassword) {
          return response.error({ message: "PASSWORD_MISS_MATCH" }, res, httpStatus.FORBIDDEN)

        }
        else {

          req.body.newPassword = bcrypt.hashSync(newPassword)

          let userUpdate = await user.findByIdAndUpdate(
            { _id: validUser._id },
            { $set: { password: req.body.newPassword, } },
            { new: true })
          if (!userUpdate) {
            return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)

          } else {
            return response.success({ message: "PASSWORD_UPDATED", data: userUpdate }, res, httpStatus.OK)
          }
        }
      }
    }
  } catch (error) {
    return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

  }
}
exports.resendOtp = async (req, res) => {
  try {
    let data = req.body
    data.email = req.body.email.toLowerCase()
    let userResult = await user.findOne({ email: data.email });
    if (!userResult) {
      return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)

    } else {
      const otp = parseInt(Math.random() * 1000 + 1000)
      let expireTime = Date.now() + 45 * 1000;;
      let subject = 'OTP for verify';
      let text = `${otp}`;
      let html = `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Document</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                      </style>
            
                </head>
                <body style="margin:0;padding:0;">
                    <div>
                        <div style="width: 640px; margin: auto;position:
                            relative;border: 2px solid #f3f3f3;background-color: #fff;">
                            <div style="padding:10px 80px;">
                                <div
                                    style="background-position: center;background-repeat:
                                    no-repeat;height: 96px;
                                    width: 96px;">
                                    <img src="https://communicationportal.s3.ap-south-1.amazonaws.com/Logo.png" alt="logo">
                                </div>
                                <div style="padding-top: 24px;">
                                    <h1 style="font-family: 'inter', sans-serif;font-weight:
                                    600;font-size:52px;margin:0px">Your OTP</h1>
                                </div>
                                <div style="padding-top: 10px;">
                                    <p style="font-weight:500; font-size:16px; font-family:Inter;letter-spacing: -0.02em; line-height: 24px;"><b> 4-digit code below into the number fields of your sign-in process.</b></p>
                                </div>
                            </div>
                            <div >
                            <div style="padding:0px 80px;">
                                <h1 style="border:1px solid black ;text-align: center;padding: 30px  182px 37px 183px;font-size: 40px;font-weight: 600;font-family: 'Inter', sans-serif;border-radius: 24px; line-height: 52px; letter-spacing: -0.05em; ">${otp}</h1>
                            </div>
                        </div>
            
            
                            <div
                                style="background-size:contain;background-position:
                                center;background-repeat:no-repeat;padding:5px 80px;">
                                <p
                                    style="font-size: 16px;font-weight:400; font-family:
                                    Inter, sans-serif;color: #757575; letter-spacing: -0.02em; line-height: 24px;">
                                    Please note: the code will be valid for the next 45
                                    seconds.</p>
                                <p
                                    style="font-size:16px;font-weight:400;letter-spacing:
                                    -0.02em;color: #7A869A; font-family:Inter,
                                    sans-serif;color:#757575 ;line-height: 24px;">
                                    If you didn’t try to sign-in or create an account on
                                    Wireframes, you can safely ignore this email.</p>
                            </div>
                            <div>
                                <div style="background-color: #F5F8FF; margin:10px
                                    80px;padding: 32px;">
                                    <div>
                                        <p style="font-family:Inter;font-size:
                                            14px;font-weight:400;padding-bottom: 40px; ">Need
                                            help?<i
                                                style="color: #3964EA;"> <u>Contact our
                                                    support team </u></i>or no longer
                                            interested in our
                                            newsletters?<i style="color: #3964EA;">
                                                <u>Unsubscribe here.</u></i> Want to give us
                                            feedback? Let us know what you think on our
                                            <i style="color: #3964EA;"><u>feedback site.</u></i></p>
                                    </div>
                                    <div style=" text-align: left;">
                                        <a href="#"><img src="https://communicationportal.s3.ap-south-1.amazonaws.com/Vector+(1).png"
                                                style="height: 16.5px;width: 16.5px;"></a>
                                        <a href="#"><img src="https://communicationportal.s3.ap-south-1.amazonaws.com/Vector+(2).png"
                                                style="height: 16.5px;width:
                                                16.5px;margin-left: 25.5px;"></a>
                                        <a href="#"><img
                                                src="https://communicationportal.s3.ap-south-1.amazonaws.com/Vector+(3).png"
                                                style="height: 16.5px;width:
                                                16.5px;margin-left: 25.5px;"></a>
                                        <a href=""><img
                                                src="https://communicationportal.s3.ap-south-1.amazonaws.com/Vector.png"
                                                style="height: 16.5px;width:
                                                16.5px;margin-left: 25.5px;"></a>
                                    </div>
                                </div>
            
                            </div>
            
                        </body>
                    </html>`
      let attachment = []
      let mailResult = emailHelper.autoMail(from = process.env.EMAIL, email = data.email, subject = subject, text = text, attachment, html = html);
      if (mailResult) {
        let updateUser = await user.findByIdAndUpdate({ _id: userResult._id }, { $set: { otpVerify: false, otp: otp, expireOTP: expireTime } }, { new: true })
        if (updateUser) {
          return response.success({ message: "RESEND_OTP" }, res, httpStatus.OK)

        }

      }
      else {
        return response.error({ message: "EMAIL_FAILURE" }, res, httpStatus.FORBIDDEN)

      }
    }
  } catch (error) {
    return response.error({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message, });
  }
},
  exports.deleteUser = async (req, res) => {
    try {
      if (req.params.name == 'Delete') {

        let result = await user.findByIdAndDelete({ _id: req.params.id })
        if (result) {
          return response.success({ message: "DELETED" }, res, httpStatus.OK)
        }
        else {
          return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.FORBIDDEN)

        }
      }

      else if (req.params.name == 'SetStatus') {
        let result = await user.findByIdAndUpdate(
          { _id: req.params.id },
          { status: req.body.status },
          { new: true }
        ).lean()

        if (!result) {
          return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.FORBIDDEN)

        }
        else {
          return res.success({ message: "SET_STATUS", data: result }, res, httpStatus.OK)

        }
      }
    } catch (err) {
      throw err
    }
  },
  exports.countryState = async (req, res) => {
    try {
      let countries = country_state_district.getAllCountries();
      console.log(countries)
      let states = country_state_district.getStatesByCountryId(1);
      if (states) {
        return response.success({ message: "FETCH_DATA", data: states }, res, httpStatus.OK)
      }
      else {
        return response.error({ message: "NOT_FOUND" }, res, httpStatus.NOT_FOUND)
      }
    } catch (error) {
      return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message, });

    }

  }
exports.stateDistrict = async (req, res) => {
  try {
    let districts = country_state_district.getDistrictsByStateId(req.params.stateId);
    console.log("====================>", districts)
    if (districts) {
      return response.success({ message: "FETCH_DATA", data: districts }, res, httpStatus.OK)
    }
    else {
      return response.error({ message: "NOT_FOUND" }, res, httpStatus.NOT_FOUND)

    }
  } catch (error) {
    return response.error({ message: 'INTERNAL_SERVER_ERROR', error: error }, res, httpStatus.INTERNAL_SERVER_ERROR);
  }
}
exports.getUser = async (req, res) => {
  try {
    const singleUser = await user.findOne({ _id: req.params.id, status: "Active" })
    if (singleUser) {
      return response.success({ message: "FETCH_DATA", data: singleUser }, res, httpStatus.OK)
    }
    else {
      return response.error({ message: "NOT_FOUND" }, res, httpStatus.NOT_FOUND)

    }


  } catch (error) {
    return response.error({ message: 'INTERNAL_SERVER_ERROR', error: error }, res, httpStatus.INTERNAL_SERVER_ERROR);
  }
}







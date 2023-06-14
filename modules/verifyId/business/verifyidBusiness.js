const { verifyid } = require('../model/verifyidModel')
const { dltid } = require('../model/verifyidModel')
const { dltidwhatsapp } = require('../model/verifyidModel')
const response = require("../../../utils/response")
const httpStatus = require('http-status');
const emailHelper = require("../../../helper/email.helper");
const { read } = require('xlsx');
var mongoose = require('mongoose');
const { user } = require('../../user/model/userModel')
const { SubUser } = require('../../subUser/model/subUserModel')
const ObjectId = require("mongoose/lib/types/objectid");
const { admin } = require('../../SuperAdmin/model/model')
exports.sendOtp = async (req, res) => {
    try {

        let Id = req.token._id // user or subuser _id
        let access = false;
        let auth = await user.findOne({ _id: ObjectId(Id) }) //_id

        if (auth) {
            req.body.userId = Id
            access = true;
        }
        else {
            console.log('Data_NOTA_FOUND')
            return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
        }
        // if (!auth) {

        //     let auth = await SubUser.findOne({ _id: mongoose.Types.ObjectId(Id), status: 'Active' }) //_id
        //     let { permission: { sendEmailCampaign } } = auth
        //     if (sendEmailCampaign == "authorized") {
        //         access = true;
        //         req.body.userId = auth.userId
        //         req.body.subuserId = Id
        //     }

        // }
        if (access) {
            console.log(req.body)
            let data = req.body
            req.body.email = req.body.email.toLowerCase()
            let result = await verifyid.findOne({ email: data.email })
            console.log(result)
            const otp = parseInt(Math.random() * 1000 + 1000)
            req.body.expireOtp = Date.now() + 45 * 1000;;
            let subject = 'OTP for verify';
            let text = `${otp}`;
            if (!result) {
                let mailResult = emailHelper.autoMail(from = process.env.EMAIL, email = data.email, subject = subject, text = text);
                if (mailResult) {
                    req.body.otp = otp;

                    let result = new verifyid(req.body)
                    let x = await result.save()
                    return response.success({ message: "EMAIL_SENT", data: x }, res, httpStatus.OK)
                }
                else {
                    return response.error({ message: "EMAIL_FAILURE" }, res, httpStatus.FORBIDDEN)
                }
            }
            else {
                if (result.verifyid == "REJECTED") {
                    let mailResult = emailHelper.autoMail(from = process.env.EMAIL, email = data.email, subject = subject, text = text

                    );
                    if (mailResult) {
                        let updateUser = await verifyid.findByIdAndUpdate({ _id: result._id }, { $set: { otpVerify: "REJECTED", otp: otp, expireOtp: req.body.expireOtp } }, { new: true })
                        if (updateUser) {
                            return response.success({ message: "RESEND_OTP", data: updateUser }, res, httpStatus.OK)
                        }
                    }
                    else {
                        return response.error({ message: "EMAIL_FAILURE" }, res, httpStatus.FORBIDDEN)
                    }

                }
                else {
                    return response.error({ message: "ALREADY_VERIFY" }, res, httpStatus.ALREADY_REPORTED)
                }
            }


        }
        else {
            console.log('Data_NOTA_FOUND')
            return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
        }

    } catch (error) {
        console.log(error.message)
        return response.error({ message: 'INTERNAL_SERVER_ERROR', error: error }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.verifyOTP = async (req, res) => {
    try {

        let data = req.body
        data.email = req.body.email.toLowerCase()
        let resultVerify = await verifyid.findOne(
            {
                email: data.email,
            })
        if (!resultVerify) {
            return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
        } else {
            if (resultVerify.verifyid == "APPROVED") {
                return response.error({ message: "ALREADY_VERIFY" }, res, httpStatus.ALREADY_REPORTED)
            }
            else {
                let currentTime = Date.now();
                if (req.body.otp == resultVerify.otp) {
                    if (resultVerify.expireOtp >= currentTime) {
                        let resVerify = await verifyid.findByIdAndUpdate(
                            { _id: resultVerify._id },
                            { $set: { verifyid: "APPROVED" } },
                            { new: true })
                        if (!resVerify) {
                            return response.error({ message: "ALREADY_VERIFY" }, res, httpStatus.ALREADY_REPORTED)
                        } else {

                            return response.success({ message: "OTP_VERIFY_SUCCESSfULLY", data: resVerify }, res, httpStatus.OK)
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
exports.resendOtp = async (req, res) => {
    try {
        let data = req.body
        data.email = req.body.email.toLowerCase()
        let userResult = await verifyid.findOne({ email: data.email });
        if (!userResult) {
            return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
        } else {
            const otp = parseInt(Math.random() * 1000 + 1000)
            let expireTime = Date.now() + 45 * 1000;;
            let subject = 'OTP for verify';
            let text = `${otp}`;
            let mailResult = emailHelper.autoMail(from = process.env.EMAIL, email = data.email, subject = subject, text = text);
            if (mailResult) {
                let updateUser = await verifyid.findByIdAndUpdate({ _id: userResult._id }, { $set: { otpVerify: "REJECTED", otp: otp, expireOTP: expireTime } }, { new: true })
                if (updateUser) {
                    return response.success({ message: "RESEND_OTP", data: updateUser }, res, httpStatus.OK)
                }
            }
            else {
                return response.error({ message: "EMAIL_FAILURE" }, res, httpStatus.FORBIDDEN)
            }
        }
    } catch (error) {
        return response.error({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message, });
    }
}
exports.dltIds = async (req, res) => {
    try {
        let data = req.body
        const token = req.token
        let access = false
        let checkUser = await user.findOne({ _id: token._id, status: "Active" }).lean()
        if (checkUser) {
            req.body.userId = token._id
            access = true;
        }
        else {
            response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
        }

        if (access) {
            data.dltId = data.dltId.toLowerCase()
            const checkId = await dltid.findOne({ dltId: data.dltId, dltType: data.dltType }).lean()
            if (checkId) {
                return response.error({ message: "ID_ALREADY_EXISTS" }, res, httpStatus.FORBIDDEN)
            }
            else {
                console.log(data)
                let result = new dltid(data)
                let newResult = await result.save()
                return response.success({ message: "DLT_ID_SENT_TO_THE_SUPER_ADMIN", data: newResult }, res, httpStatus.OK)
            }
        }

    } catch (error) {
        return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message, });

    }
}
exports.getdltSms = async (req, res) => {
    try {
        const token = req.token
        let result;
        if (token.userType == "USER") {
            let userResult = await user.findOne({ _id: token._id, status: "Active" }).lean()
            if (userResult) {
                if(req.params.name=="findAll"){
                    result = await dltid.find({ userId: token._id, dltType: 'SMS' }).lean()
                }
                else if(req.params.name=="APPROVED"){
                    result = await dltid.find({ userId: token._id, dltType: 'SMS',verifyId:"APPROVED" }).lean()

                }
            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            }
        }
        else if (token.userType == "SUBUSER") {
            let subUser = await SubUser.findOne({ _id: token._id, status: 'Active' }).lean()
            if (subUser) {
                let { permission: { sendMessageCampaign } } = subUser
                if (sendMessageCampaign.send) {
                    let verify = sendMessageCampaign.verifyid
                    result = await dltid.find({
                        _id: { $in: verify }, dltType: "SMS"
                    }).lean()
                }
                else {
                    response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)
                }
            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            }
        }
        else {
            response.error({ message: "INVALID_REQUEST" }, res, httpStatus.UNAUTHORIZED)

        }
        if (result) {
            return response.success({ message: "API_SUCCESS", data: result }, res, httpStatus.OK)
        }
        else {
            return response.error({ message: "FAILED_TO_FATCH_DATA" }, res, httpStatus.FORBIDDEN)
        }

    } catch (error) {
        return response.error({ message: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.getdltWhatapp = async (req, res) => {
    try {
        const token = req.token
        let result;
        if (token.userType == "USER") {
            let userResult = await user.findOne({ _id: token._id, status: "Active" }).lean()
            if (userResult) {
                if(req.params.name=="findAll"){
                    result = await dltid.find({ userId: token._id, dltType: 'WHATSAPP' }).lean()
                }
                else if(req.params.name=="APPROVED"){
                    result = await dltid.find({ userId: token._id, dltType: 'WHATSAPP',verifyId:"APPROVED" }).lean()
                }
            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            }
        }
        else if (token.userType == "SUBUSER") {
            let subUser = await SubUser.findOne({ _id: token._id, status: 'Active' }).lean() //_id
            if (subUser) {
                let { permission: { sendWhatsappCampaign } } = subUser
                if (sendWhatsappCampaign.send) {
                    let verify = sendWhatsappCampaign.verifyid
                    result = await dltid.find({
                        _id: { $in: verify }, dltType: "WHATSAPP"
                    }).lean()
                }
                else {
                    response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)
                }
            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)

            }

        }
        else {
            response.error({ message: "INVALID_REQUEST" }, res, httpStatus.UNAUTHORIZED)
        }
        if (result) {
            return response.success({ message: "API_SUCCESS", data: result }, res, httpStatus.OK)
        }
        else {
            return response.error({ message: "FAILED_TO_FATCH_DATA" }, res, httpStatus.FORBIDDEN)
        }

    }
    catch (error) {
        return response.error({ message: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.getEmail = async (req, res) => {
    try {
        const token = req.token
        let result;
        if (token.userType == "USER") {
            let userResult = await user.findOne({ _id: token._id, status: "Active" }).lean()
            if (userResult) {
                if (req.params.name == "findAll") {
                    result = await verifyid.find({ userId: token._id }).lean()
                }
                else if (req.params.name == "APPROVED") {
                    result = await verifyid.find({ userId: token._id, verifyid: "APPROVED" }).lean()
                }

            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            }
        }
        else if (token.userType == "SUBUSER") {
            let subUser = await SubUser.findOne({ _id: token._id, status: 'Active' }).lean() //_id
            if (subUser) {

                let { permission: { sendEmailCampaign } } = subUser
                if (sendEmailCampaign.send) {
                    let verify = sendEmailCampaign.verifyid
                    result = await verifyid.find({
                        _id: { $in: verify }, verifyid: "APPROVED"
                    }).lean()
                }
                else {
                    return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)
                }
            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)

            }

        }
        else {
            response.error({ message: "INVALID_REQUEST" }, res, httpStatus.UNAUTHORIZED)
        }
        if (result) {
            return response.success({ message: "API_SUCCESS", data: result }, res, httpStatus.OK)
        }
        else {
            return response.error({ message: "FAILED_TO_FATCH_DATA" }, res, httpStatus.FORBIDDEN)
        }


    } catch (error) {
        return response.error({ message: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
//Admin
exports.getPendingRequestCount = async (req, res) => {
    try {
        const checkAdmin = await admin.findOne({ _id: req.params.id, userType: "ADMIN" }).lean()
        if (checkAdmin) {
            let count = await dltid.countDocuments({ verifyId: "PENDING" }).lean()
            if (count) {
                return response.success({ message: "API_SUCCESS", data: count }, res, httpStatus.OK)
            }
            else {
                return response.error({ message: "FAILED_TO_FATCH_DATA" }, res, httpStatus.FORBIDDEN)
            }
        }
        else {
            return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)
        }


    }
    catch (error) {
        return response.error({ message: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
//-------------------------------
// exports.getPendingRequestCount = async (req, res) => {
//     try {

//           let count = await dltid.countDocuments({verifyId:"PENDING"})
//          // let count2 = await dltidwhatsapp.countDocuments({verifyId:"PENDING"})
//           if(count){
//             return response.success({ message: "API_SUCCESS", data: count}, res, httpStatus.OK)
//           }
//           else {
//             return response.error({ message: "FAILED_TO_FATCH_DATA" }, res, httpStatus.FORBIDDEN)
//         }
//     }
// catch (error) {
//     return response.error({ message: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
// }
// }
exports.getPendingRequest = async (req, res) => {
    try {
        const checkAdmin = await admin.findOne({ _id: req.params.id, userType: "ADMIN" }).lean()
        if (checkAdmin) {
            let result = await dltid.find().lean();
        if (result) {
            return response.success({ message: "API_SUCCESS", data: result }, res, httpStatus.OK)
        }
        else {
            return response.error({ message: "FAILED_TO_FATCH_DATA" }, res, httpStatus.FORBIDDEN)
        }

        }
        else {
            return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)
        }
       
    }
    catch (error) {
        return response.error({ message: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
// exports.getWhatsappPendingRequest = async (req, res) => {
//     try {
//         let result = await dltidwhatsapp.find({ verifyId: "PENDING" })
//         if (result) {
//             return response.success({ message: "API_SUCCESS", data: result }, res, httpStatus.OK)
//         }
//         else {
//             return response.error({ message: "FAILED_TO_FATCH_DATA" }, res, httpStatus.FORBIDDEN)
//         }
//         //console.log(result) 
//     }
//     catch (error) {
//         return response.error({ message: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
//     }
// }
exports.updateRequest = async (req, res) => {
    try {
        const token =req.token
        const checkAdmin = await admin.findOne({ _id:token._id, userType: "ADMIN" }).lean()
        if (checkAdmin) {
            const verifyId = req.body.verifyId
            const newResult1 = await dltid.findByIdAndUpdate(
                { _id: req.params.id },{$set:{
                    verifyId:verifyId
                }},
                { 
                    new: true,runValidators: true
                })
    
            if (newResult1) {
                return response.success({ message: "P_UPDATE", data: newResult1 }, res, httpStatus.OK)
            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            }
        }
        else {
            return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)
        }
    }
    catch (error) {
        return response.error({ message: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}


 
const { SubUser } = require("../model/subUserModel")
const response = require("../../../utils/response")
const bcrypt = require("bcryptjs")
const httpStatus = require("http-status")
const jwt = require("../../../middleware/jwt")
const emailHelper = require("../../../helper/email.helper")
const ImageController = require('../../../helper/imageHelper')
const { user } = require('../../user/model/userModel')
const ObjectId = require("mongoose/lib/types/objectid");
const { admin } = require("../../SuperAdmin/model/model")
exports.createSubUser = async (req, res) => {
    try {
        const checkAdmin = req.token
        let findUser = await user.findById({ _id: ObjectId(checkAdmin._id), userType: "USER", status: "Active" })
        console.log(findUser)
        if (findUser) {
            req.body.userId = findUser._id
            const data = req.body
            data.emailId = data.emailId.toLowerCase()
            const findSubUser = await SubUser.findOne({ emailId: data.emailId})

            if (findSubUser) {
                return response.error({ message: "EMAIL_ALREADY_EXISTS" }, res, httpStatus.CONFLICT)
            }
            else {
                if (req?.file) {
                    let fileDetails = req.file
                    console.log(fileDetails)
                    let uploadCategory = await ImageController.fileUpload(fileDetails.filename,
                        fileDetails.destination,
                        fileDetails.mimetype,
                        '/');
                    req.body.profile = uploadCategory.Location
                }
                console.log(req.body.profile)
                let { password, emailId, firstName, lastName, phoneNumber, permission } = req.body
                let subject = "Sub-User Credentials";
                console.log(password, emailId)
                let text = `your email - ${emailId} password - ${password}, for Login SubUser `
                let attachment = []
                const send = emailHelper.autoMail(from = process.env.EMAIL, email = data.emailId, subject = subject, text = text)

                if (send) {
                    console.log('====================================', req.body)
                    console.log('Mail Sent Successfully >>> ')
                    let register = new SubUser(data)
                    let saveData = await register.save()
                    console.log(saveData)
                    return response.success({ message: "SUB_USER_CREATE", data: saveData }, res, httpStatus.CREATED)
                } 
                else {
                    return response.error({ message: "FAILED_TO_ADD" }, res, httpStatus.FORBIDDEN)
                }
            }
        }
        else {
            return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)

        }

    } catch (error) {
        console.log(error.message)
        return response.error({ message: 'INTERNAL_SERVER_ERROR', error: error }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.login = async (req, res) => {
    try {
        const data = req.body
        data.emailId = data.emailId.toLowerCase()
        const result = await SubUser.findOne({ $and: [{ emailId: data.emailId }, { otpVerify: true }, { status: "Active" }] }).lean()
        if (!result) {
            return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
        }
        else if (result.status == "In-Active") {
            return response.error({ message: 'IN_ACTIVE_STATUS' }, res, httpStatus.UNAUTHORIZED)
        }

        else {
            if (req.body.password != result.password) {
                return response.error({ message: "INCORRECT_PASSWORD" }, res, httpStatus.UNAUTHORIZED)

            }
            else {
                const token = await jwt.generateAuthJwt({
                    emailId: req.body.emailId,
                    _id: result._id,
                    userType: result.userType,
                    status: result.status,
                    userId: result.userId,
                    expires_in: process.env.TOKEN_EXPIRES_IN

                })
                const finalresult = { result, token }
                return response.success({ message: "LOGIN_SUCCESSFUL", data: finalresult }, res, httpStatus.OK)
            }

        }
    } catch (error) {
        console.log(error)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

    }
}
exports.forgetPassword = async (req, res) => {
    try {
 
        let { emailId } = req.body
        emailId=emailId.toLowerCase()
        const checkUserExist = await SubUser.findOne({ emailId: emailId, status: "Active" }).lean()
        if (checkUserExist) {
            console.log(checkUserExist)
            const otp = parseInt(Math.random() * 1000 + 1000)
            console.log(otp)
            const expireOTP = Date.now() + 45 * 1000;
            // data.otp = otp 
            let subject = "VerifyOtp";
            let text = `otp is ${otp},valid for 6 Minutes only `
            
            const send = emailHelper.autoMail(from = process.env.EMAIL, email = emailId, subject = subject, text = text)
            if (send) {
                const otpUpdateToSubadmin = await SubUser.findByIdAndUpdate({ _id: checkUserExist._id }, { $set: { otp: otp, expireOTP: expireOTP, otpVerify: false } })
                let data = { otpUpdateToSubadmin, otp }
                return response.success({ message: "OTP_SENT", }, res, httpStatus.CREATED)
            }
            else {
                return response.error({ message: "EMAIL_FAILURE" }, res, httpStatus.FORBIDDEN)
            }
        }
        return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.CONFLICT)

    } catch (error) {
        console.log(error.message)
        return response.error({ message: 'INTERNAL_SERVER_ERROR', error: error }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.verifyotp = async (req, res) => {
    try {
        let { emailId, otp } = req.body
        let currentTime = Date.now()
        emailId = emailId.toLowerCase()
        
        const findUser = await SubUser.findOne({ emailId: emailId, status: "Active" })
        if (findUser) {
            if (findUser.otp == otp) {
                if (findUser.expireOTP >= currentTime) {
                    const verification = await SubUser.findByIdAndUpdate({ _id: findUser._id }, { $set: { otpVerify: true } }, { new: true })
                    return response.success({ message: "OTP_VERIFY_SUCCESSfULLY", data: verification }, res, httpStatus.CREATED)
                }
                return response.error({ message: "OTP_EXPIRED" }, res, httpStatus.CONFLICT)
            }
            return response.error({ message: "INVALID_OTP" }, res, httpStatus.CONFLICT)
        }
        return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.CONFLICT)
    } catch (error) {
        console.log(error.message)
        return response.error({ message: 'INTERNAL_SERVER_ERROR', error: error }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.updatePassword = async (req, res) => {
    try {
        const { emailId, newPassword, confirmPassword } = req.body
        const findUser = await SubUser.findOne({ emailId: emailId, status: "Active", otpVerify: true })
        if (findUser) {
            if (newPassword == confirmPassword) {
                const newValue = await SubUser.updateOne(
                    { emailId: emailId },
                    { $set: { password: newPassword } },
                    { new: true })

                return response.success({ message: "PASSWORD_UPDATED" }, res, httpStatus.CREATED)
            }
            else {
                return response.error({ message: "PASSWORD_MISS_MATCH" }, res, httpStatus.CONFLICT)

            }
        }
        else {
            return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
        }
    } catch (error) {
        console.log(error.message)
        return response.error({ message: 'INTERNAL_SERVER_ERROR', error: error }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.changePassword = async (req, res) => {
    try {
        let { emailId, oldPassword, newPassword, confirmPassword } = req.body
        const findUser = await SubUser.findOne({ emailId: emailId, status: "Active" })
        console.log("______------------__________---------______", findUser)
        if (findUser) {
            // let checkPassword = await bcrypt.compare(oldPassword, findUser.password)
            if (findUser.password === oldPassword) {
                if (newPassword === confirmPassword) {
                    // let password = bcrypt.hashSync(newPassword)
                    const result = await SubUser.updateOne({ email: findUser.email }, { $set: { password: newPassword } })
                    return response.success({ message: "PASSWORD_UPDATED", data: result }, res, httpStatus.CREATED)
                }
                else {
                    return response.error({ message: "PASSWORD_MISS_MATCH" }, res, httpStatus.CONFLICT)

                }

            }
            else {
                return response.error({ message: "OLD_NEW_PASSWORD" }, res, httpStatus.CONFLICT)

            }


        }
        return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)

    } catch (error) {
        console.log(error)
        return response.error({ message: 'INTERNAL_SERVER_ERROR', error: error }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.getSubUser = async (req, res) => {
    try {
        const { id, name } = req.params
        console.log(req.params)
        let findUser;
        if (name == "findOne") {
            findUser = await SubUser.findOne({ $and: [{ status: "Active" }, { _id: id }] }).lean()
        }
        if (name == "findAll") {
            findUser = await SubUser.find({ userId: id, status: "Active" }).lean()
        }
        if (findUser) {
            return response.success({ message: "API_SUCCESS", data: findUser }, res, httpStatus.OK)
        }
        else {
            return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)

        }

    } catch (error) {
        console.log(error)
        return response.error({ message: 'INTERNAL_SERVER_ERROR', error: error }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.updateUserDetail = async (req, res) => {
     try {
        const { id } = req.params
        let { firstName, lastName, phoneNumber, profile } = req.body
        const findUser = await SubUser.findOne({ _id: id, status: "Active" })
        if (findUser) {
            if (req?.file) {
                let imageUrl = findUser.profile
                if(imageUrl){
                    console.log(imageUrl)
                var url = await imageUrl.split('/');
                console.log(url)
                var updated_url = await url[url.length - 1]

                console.log("===============1255555555", updated_url)

                const ImageData1 = await ImageController.deleteFile(updated_url);
                }

                let fileDetails = req.file
                console.log(fileDetails)
                let uploadCategory = await ImageController.fileUpload(fileDetails.filename,
                    fileDetails.destination,
                    fileDetails.mimetype,
                    '/');
                req.body.profile = uploadCategory.Location
            }
            profile = req.body.profile
            const UpdateUserInformation = await SubUser.findByIdAndUpdate({ _id: findUser._id }, { firstName, lastName, phoneNumber, profile}, { new: true })
            if (UpdateUserInformation) {
                return response.success({ message: "API_SUCCESS", data: UpdateUserInformation }, res, httpStatus.OK)
            }

        }
        else {
            return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)

        }
    } catch (error) {
        console.log(error)
        return response.error({ message: 'INTERNAL_SERVER_ERROR', error: error }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.blockOrUnblock = async (req, res) => {
    try {
        let token =req.token
        console.log(token)
        let findUser= await user.findOne({_id:token._id,userType:"USER"})
            if(findUser){
                    const { id } = req.params
                if (req.method === 'DELETE') {
                    const HardDelete = await SubUser.findByIdAndDelete({ _id:id });
                    return response.success({ message: "DELETED" }, res, httpStatus.OK);
                }
                else if (req.method === 'PUT') {
                    const updateUserStatus = await SubUser.findByIdAndUpdate({  _id:id  }, { $set: { status: req.body.status } }, { new: true, runValidators: true});
                    return response.success({ message: "CHANGE_STATUS", data: updateUserStatus }, res, httpStatus.OK); 
                }
                else {
                    return response.error({ message: "INVALID_CREDENTIALS" }, res, httpStatus.METHOD_NOT_ALLOWED);
                }
                
            }
        else{
        return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.NOT_FOUND) }
        
    } catch (error) {
        console.log(error)
        return response.error({ message: 'INTERNAL_SERVER_ERROR', error: error }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.updateSubUserPermission = async (req, res) => {
    try {
        const token = req.token
        console.log(token)
        const checkAdmin = await user.findById({ _id: token._id, userType: "USER" })
        if (checkAdmin) {
            const { id } = req.params
            const findUser = await SubUser.findOne({ _id: id, status: "Active" })
            if (findUser) {

                const UpdateUserInformation = await SubUser.findByIdAndUpdate({ _id: findUser._id }, { $set: { permission: req.body.permission } }, { new: true })
                if (UpdateUserInformation) {
                    return response.success({ message: "API_SUCCESS", data: UpdateUserInformation }, res, httpStatus.OK)
                }

            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)

            }
        }
        else {
            return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)

        }

    } catch (error) {
        console.log(error)
        return response.error({ message: 'INTERNAL_SERVER_ERROR', error: error }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
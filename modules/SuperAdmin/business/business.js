const { admin } = require('../model/model')
const bcrypt = require('bcryptjs')
const response = require("../../../utils/response")
const httpStatus = require('http-status');
const emailHelper = require("../../../helper/email.helper")
const jwt = require("../../../middleware/jwt")
const { user } = require("../../user/model/userModel")
const { Payment } = require("../../Payment/model/paymentModel")
function AddmintuesToCurrentDate(date, mintue) {
    return new Date(date.getTime() + mintue * 30000)
}
exports.login = async (req, res) => {
    try {
        let adminResult = await admin.findOne({ email: req.body.email, userType: 'ADMIN' });
        if (!adminResult) {
            return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
        }
        else {
            let passCheck = bcrypt.compareSync(req.body.password, adminResult.password);
            if (passCheck == false) {
                return response.error({ message: "INCORRECT_PASSWORD" }, res, httpStatus.UNAUTHORIZED)

            }
            else {
                const token = await jwt.generateAuthJwt({
                    email: adminResult.email,
                    userType: adminResult.userType,
                    _id: adminResult._id,
                    expires_in: process.env.TOKEN_EXPIRES_IN

                })
                const result = { adminResult, token }
                return response.success({ message: "LOGIN_SUCCESSFUL", data: result }, res, httpStatus.OK)

            }
        }
    } catch (error) {
        return res.send({ responseCode: 500, responseMessage: "Something went wrong!", responseResult: error.message, });
    }
},
    exports.updateAdmin = async (req, res) => {
        try {
            const data = req.body
            const newResult1 = await admin.findByIdAndUpdate(
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
            return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

        }
    }
exports.forgetPwd = async (req, res) => {
    try {
        const data = req.body
        const validUser = await admin.findOne({
            email: req.body.email
        }).lean()
        if (!validUser) {
            return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)

        } else {
            const otp = parseInt(Math.random() * 1000 + 1000)
            console.log(otp)
            const currentDate = new Date()
            const expireOtp = AddmintuesToCurrentDate(currentDate, 10)
            data.expireOTP = expireOtp
            data.otp = otp
            const update = await admin.findOneAndUpdate(
                {
                    email: req.body.email,
                },
                { $set: { otp: otp, otpVerify: false } },
                { new: true }
            )
            console.log(update)

            let subject = "forget Password";
            let text = `otp is ${otp},valid for 6 Minutes only `
            const send = emailHelper.autoMail(from = process.env.EMAIL, email = data.email, subject = subject, text = text

            )

            if (send) {
                console.log('Mail Sent Successfully >>> ')
                return response.success({ message: "OTP_SENT" }, res, httpStatus.OK)


            } else {
                console.log('Mail Not Sent >>>', update)
                return response.error({ message: "EMAIL_FAILURE" }, res, httpStatus.FORBIDDEN)

            }

        }
    } catch (error) {
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

    }

}

//
exports.verifyOTP = async (req, res) => {
    try {
        //
        let resultVerify = await admin.findOne(
            {
                email: req.body.email,
            })

        if (!resultVerify) {
            return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)


        } else {
            if (resultVerify.otpVerify == true) {
                return response.error({ message: "ALREADY_VERIFY" }, res, httpStatus.ALREADY_REPORTED)

            }
            else {

                if (req.body.otp == resultVerify.otp) {

                    let resVerify = await admin.findByIdAndUpdate(
                        { _id: resultVerify._id },
                        { $set: { otpVerify: true } },
                        { new: true },)
                    if (!resVerify) {
                        return response.error({ message: "ALREADY_VERIFY" }, res, httpStatus.ALREADY_REPORTED)
                    } else {
                        return response.success({ message: "OTP_VERIFY_SUCCESSfULLY", data: resVerify }, res, httpStatus.OK)

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
        let userResult1 = await admin.findOne(
            {
                email: req.body.email,

            }
        );
        if (!userResult1) {
            return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)

        }
        else {
            if (req.body.newPassword == req.body.confirmNewPassword) {
                req.body.newPassword = bcrypt.hashSync(req.body.newPassword)
                let userUpdate = await admin.findByIdAndUpdate(
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
        const validUser = await admin.findOne({
            email: req.body.email,

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

                    let userUpdate = await admin.findByIdAndUpdate(
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
        return response.error({ message: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

    }
}
exports.findTotalUser = async (req, res) => {
    try {
        const count = await user.countDocuments();
        return response.success({ message: "API_SUCCESS", data: count }, res, httpStatus.OK)

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }

}
exports.getAllUSer = async (req, res) => {
    try {

        const count = await user.find({}, 'businessName name email phoneNumber plan.planName status')
        console.log(count)
        return response.success({ message: "API_SUCCESS", data: count }, res, httpStatus.OK)

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }

}
exports.transactionHistoryAllUser = async (req, res) => {
    try {
        let token = req.token
        console.log(token)
        const checkAdmin = await admin.findById({ _id: req.token._id }).lean()
        console.log(checkAdmin)
        if (checkAdmin) {
            const findTransaction = await Payment.find({},).populate('userId')
            console.log(findTransaction)
            if (findTransaction) {
                return response.success({ message: "FETCH_DATA", data: findTransaction }, res, httpStatus.OK)
            }
            else {
                return response.error({ message: "NOT_FOUND" }, res, httpStatus.FORBIDDEN)
            }
        }

        else {
            return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.FORBIDDEN)
        }
    } catch (error) {
        return response.error({ message: 'INTERNAL_SERVER_ERROR', error: error }, res, httpStatus.INTERNAL_SERVER_ERROR);

    }


}
exports.totalRevenue = async (req, res) => {
    try {
        const totalRevenue = await Payment.aggregate([
            {
              $match: { status: "success" } // Optional: If you want to filter documents based on a specific status
            },
            {
              $group: {
                _id: null, // Group all documents together
                total: { $sum: "$amount" }
              }
            }
          ]);
          const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
          return response.success({ message: "FETCH_DATA", data:revenue  }, res, httpStatus.OK)


    } catch (error) {
        return response.error({ message: 'INTERNAL_SERVER_ERROR', error: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);

    } 
}



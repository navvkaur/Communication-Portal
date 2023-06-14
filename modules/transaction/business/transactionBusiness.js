const { transaction } = require('../model/transactionModel')
const bcrypt = require('bcryptjs')
const response = require("../../../utils/response")
const httpStatus = require('http-status');
const { user } = require("../../user/model/userModel")
const emailHelper = require("../../../helper/email.helper")
const { plan } = require('../../plan/model/planModel')
const mongoose = require('mongoose')
const dateModule = require('date-and-time')
const { Payment } = require("../../Payment/model/paymentModel")


exports.purchasePlan = async (req, res) => {
    try {
        const findUser = await user.findById({ _id: req.query.userId, status: "Active" }).lean()
        console.log(findUser)
        if (findUser) {
            let checkPlan = await plan.findById({ _id: req.query.planId }).lean()
            if (checkPlan) {
                let findTransaction = await transaction.findOne({ userId: findUser._id, status: "Active" }).lean()
                if (findTransaction) {
                    const nowDate = new Date();
                    if (findTransaction.expirePlan >= nowDate) {
                        const { totalWhatsapp, totalEmail, totalMessage, totalIVR, planValidity } = findUser.plan
                        console.log(totalWhatsapp, totalEmail, totalMessage, totalIVR, planValidity)

                        let ExtendPlanData = user.updateOne({ _id: req.query.userId }, {
                            $set: {
                                "plan": {
                                    "totalWhatsapp": totalWhatsapp + checkPlan.totalWhatsapp,
                                    "totalEmail": totalEmail + checkPlan.totalEmail,
                                    "totalMessage": totalMessage + checkPlan.totalMessage,
                                    "totalIVR": totalIVR + checkPlan.totalIVR,
                                    "planValidity": planValidity + checkPlan.planValidity,
                                    "planName": checkPlan.planName
                                }
                            }
                        })
                        let planUpdate = transaction.updateOne({ _id: findTransaction._id }, { $set: { status: "In-Active" } }, { new: true })
                        await Promise.all([ExtendPlanData, planUpdate])
                        let validity = planValidity + checkPlan.planValidity
                        let userId = req.query.userId
                        let planId = checkPlan._id
                        const currentDate = new Date();
                        const expiredPlan = new Date(currentDate.getTime() + validity * 24 * 60 * 60 * 1000)
                        const newTransaction = new transaction({
                            userId: userId,
                            planId: planId,
                            expirePlan: expiredPlan
                        });
                        let updateTransaction = await newTransaction.save()
                        if (updateTransaction) {
                            return updateTransaction
                            // res.send({responseResult:"New transaction inserted",data:updateTransaction})
                        }
                        else {
                            console.log(`Error occurred while inserting new transaction: ${err}`);
                        }


                        // return response.error({ message: "PLAN_ALREAY_SELECTED" }, res, httpStatus.FORBIDDEN)
                    }
                    // else {
                    //     let updateUser = await user.updateOne({ _id: req.token._id }, { $unset: { plan: "" } })
                    //     let removePlan = await transaction.findOneAndUpdate({ userId: result._id },{$set:{status:"In-Active"}})
                    //     return response.success({ message: "PLAN_NOT_FOUND", }, res, httpStatus.OK)

                    // }
                }
                else {
                    //addData
                    req.body.status = "Active"
                    console.log(checkPlan)
                    let validity = checkPlan.planValidity
                    let userPush = await user.updateOne({ _id: req.query.userId }, {
                        $set: {
                            "plan": {
                                "totalWhatsapp": checkPlan.totalWhatsapp,
                                "totalEmail": checkPlan.totalEmail,
                                "totalMessage": checkPlan.totalMessage,
                                "totalIVR": checkPlan.totalIVR,
                                "planValidity": checkPlan.planValidity,
                                "planName": checkPlan.planName
                            }
                        }
                    })

                    if (userPush) {
                        let userId = req.query.userId
                        const currentDate = new Date();
                        const expiredPlan = new Date(currentDate.getTime() + validity * 24 * 60 * 60 * 1000)
                        let planId = checkPlan._id
                        console.log("successfull add user ", userPush)
                        let dbObj = new transaction({
                            userId: userId,
                            planId: planId,
                            expirePlan: expiredPlan
                        })
                        let res1 = await dbObj.save()
                        return res1 
                        // let saveResult = { res1, checkPlan }
                        // return response.success({ message: "PLAN_SELECT", data: saveResult }, res, httpStatus.OK)
                    }
                    else {
                        return response.error({ message: "UPDATE_ERROR" }, res, httpStatus.NOT_FOUND)

                    }
                }
            }
            else {
                return response.error({ message: "PLAN_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            }
        }
        else {
            return response.error({ message: "NOT_FOUND" }, res, httpStatus.NOT_FOUND)
        }

    } catch (error) {
        console.log(error.message)
        return response.error({ message: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.viewMyPlan = async (req, res) => {
    try {
        console.log('================40', req.token._id)
        let result = await transaction.findOne({ userId: req.token._id ,status:"Active"}).populate('planId')
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
exports.upgradePlan = async (req, res) => {
    try {

        let findTransaction = await transaction.findById({ _id: req.params.id })
        console.log("=====59", findTransaction)
        if (findTransaction) {

            let findPlan = await plan.findOne({ _id: req.body.planId })
            console.log("12345", findPlan)
            if (findPlan) {
                let Email = findPlan.totalEmail
                let whatsapp = findPlan.totalWhatsapp
                let message = findPlan.totalMessage
                let ivr = findPlan.totalIVR

                let now = new Date()
                const value = dateModule.addDays(now, findPlan.planValidity);
                let updatePlanId = await transaction.findOneAndUpdate({ userId: req.token._id },
                    { $set: { planId: req.body.planId, buyPlanTime: now }, expirePlan: value }, { new: true }).populate('planId')

                if (updatePlanId) {
                    let validity = findPlan.planValidity
                    let setValidity = user.updateOne(
                        { _id: req.token._id },
                        {
                            $set: { "plan.planValidity": validity },
                        },);
                    let upgradeData = user.updateOne({ _id: req.token._id },
                        {
                            $inc: {

                                "plan.totalWhatsapp": whatsapp,
                                "plan.totalEmail": Email,
                                "plan.totalMessage": message,
                                "plan.totalIVR": ivr


                            }
                        })

                    let result = await Promise.all([setValidity, upgradeData])
                    if (result) {

                        console.log("successfully")
                        return response.success({ message: "PLAN_UPDATE", }, res, httpStatus.OK)
                    }
                    else {
                        return response.error({ message: "UPDATE_ERROR" }, res, httpStatus.FORBIDDEN)

                    }

                }
                else {
                    return response.error({ message: "UPDATE_ERROR" }, res, httpStatus.FORBIDDEN)
                }

            }
            else {
                console.log("planNotFound")
                return response.error({ message: "PLAN_NOT_FOUND" }, res, httpStatus.FORBIDDEN)
            }
        }

    } catch (error) {
        console.log(error.message)
        return response.error({ message: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}

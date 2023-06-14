const { plan } = require("../model/planModel")
const httpStatus = require("http-status")
const response = require("../../../utils/response")
const { admin } = require('../../SuperAdmin/model/model')

exports.addPlan = async (req, res) => {
    try {
        let adminResult = req.token
        console.log(adminResult)
        let adminConfirmation = await admin.findOne({ _id: adminResult._id, userType: "ADMIN" })
        if (adminConfirmation) {
            const data = req.body
            data.planName = req.body.planName.toLowerCase()
            const planExist = await plan.findOne({planName:data.planName,planType:"Activate"})
            // const planExist = await plan.findOne({ "newPlan": { $regex: new RegExp(data.newPlan, "i") }, planType: "Activate" });
            console.log("🚀 ~ file: bussinessplan.js:10 ~ exports.addPlan=async ", planExist)
            if (planExist) {
                return response.error({ message: "SAME_PLAN" }, res, httpStatus.FORBIDDEN)
            }
            else {
                const newPlan = new plan(data)
                const savePlan = await newPlan.save()
                return response.success({ message: "PLAN_ADD", data: savePlan }, res, httpStatus.CREATED)
            }

        }
        else{
                return response.error({ message: "NOT_FOUND" }, res, httpStatus.NOT_FOUND) 
        }


    } catch (error) {
        console.log("eroooooo", error)
        // throw error
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
},
exports.getPlan = async (req, res) => {
        try {
            token=req.token
            let findPlan
            if(token.userType=="ADMIN"){
                 findPlan = await plan.find({}).lean()
            console.log("______________________", findPlan)
            }
            else if(token.userType=="USER"){
                 findPlan = await plan.find({planType:"Activate"}).lean()
                console.log("______________________", findPlan)
            }
            else if(token.userType=="SUBUSER"){
                findPlan = await plan.find({planType:"Activate"}).lean()
                console.log("______________________", findPlan)
            }
            else{
                return response.error({ message: "INVALID_TOKEN" }, res, httpStatus.FORBIDDEN)
            }
            if (!findPlan) {
                return response.error({ message: "PLAN_NOT_FOUND" }, res, httpStatus.FORBIDDEN)
            }
            else {
                return response.success({ message: "PLAN", data: findPlan }, res, httpStatus.OK)
            }
        }
        catch (error) {
            return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
        }
}
exports.updatePlan = async (req, res) => {
    try {
        const adminResult=req.token
        const findAdmin=await admin.findOne({_id: adminResult._id, userType: "ADMIN"})
        if(findAdmin){
            const planId = req.params.id
            const updateplan = await plan.findByIdAndUpdate({ _id: planId }, { $set: req.body }, { new: true })
            if (updateplan) {
                return response.success({ message: "PLAN_UPDATE", data: updateplan }, res, httpStatus.CREATED)
            }
            else {
                return response.error({ message: "PLAN_NOT_FOUND" }, res, httpStatus.FORBIDDEN)
            }
        }
        else{
            return response.error({ message: "NOT_FOUND" }, res, httpStatus.NOT_FOUND) 

        }
       
    } catch (error) {
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.planStatusChange = async (req, res) => {
    try {
        
        const adminResult=req.token
        const findAdmin=await admin.findOne({_id: adminResult._id, userType: "ADMIN"})
        if(findAdmin){
            const findplan = await plan.findByIdAndUpdate({ _id: req.params.id },{$set:{planType:req.body.planType}},{new:true,runValidators: true})
            if (!findplan) {
                return response.error({ message: "PLAN_NOT_FOUND" }, res, httpStatus.FORBIDDEN)
            }
            return response.success({ message: "CHANGE_STATUS", data: findplan }, res, httpStatus.OK)
        }
        else{
            return response.error({ message: "NOT_FOUND" }, res, httpStatus.NOT_FOUND) 

        }
    } catch (error) {
        console.log(error.message)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.deletedPlan = async (req, res) => {
    try {
        
        const adminResult=req.token
        const findAdmin=await admin.findOne({_id: adminResult._id, userType: "ADMIN"})
        if(findAdmin){
            const findplan = await plan.findByIdAndDelete({ _id: req.params.id })
            if (!findplan) {
                return response.error({ message: "PLAN_NOT_FOUND" }, res, httpStatus.FORBIDDEN)
            }
            return response.success({ message: "DELETED", data: "plan delete successfully" }, res, httpStatus.OK)
        }
        else{
            return response.error({ message: "NOT_FOUND" }, res, httpStatus.NOT_FOUND) 

        }
    } catch (error) {
        console.log(error.message)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
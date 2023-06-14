const businessPlan = require("../bussiness/bussinessplan")

exports.addPlan = async(req,res) => {
    return await businessPlan.addPlan(req,res)
}
exports.getplan = async(req,res) =>{
    return await businessPlan.getPlan(req,res)
}

exports.updatePlan = async(req,res) =>{
    return await businessPlan.updatePlan(req,res)
}

exports.planStatusChange = async(req,res) =>{
    return await businessPlan.planStatusChange(req,res)
}
exports.deletedPlan = async(req,res) =>{
    return await businessPlan.deletedPlan(req,res)
}

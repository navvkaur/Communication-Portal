const bussiness = require("../bussiness/subUserbussiness")

exports.login = async (req, res) => {
    return await bussiness.login(req,res)
  } 
exports.createSubUser = async(req,res) =>{
    return await bussiness.createSubUser(req,res)
}
exports.forgetPassword = async(req,res) => {
    return await bussiness.forgetPassword(req,res)
}
exports.verifyTop = async(req,res) =>{
    return await bussiness.verifyotp(req,res)
}
exports.updatePassword = async(req,res) =>{
    return await bussiness.updatePassword(req,res)
}
exports.changePassword = async(req,res) => {
    return await bussiness.changePassword(req,res)
}
exports.getsubUser = async(req,res) =>{
    return await bussiness.getSubUser(req,res) 
}
exports.updateUserDeatial = async(req,res) => {
    return await bussiness.updateUserDetail(req,res)
}
exports.blockOrUnblock = async(req,res)=>{
    return await bussiness.blockOrUnblock(req,res)
}
exports.updateSubUserPermission = async(req,res) => {
    return await bussiness.updateSubUserPermission(req,res)
}



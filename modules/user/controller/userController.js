const business = require('../business/userBusiness')

exports.addUser = async (req, res) => {
  return await business.register(req,res)
} 
exports.login = async (req, res) => {
  return await business.login(req,res)
}
exports.updateById = async (req, res) => {
  return await business.updateById(req,res)
}
exports.forgetPassword = async (req, res) => {
  return await business.forgetPwd(req,res)
}
exports.verifyOTP = async (req, res) => {
  return await business.verifyOTP(req,res)
}
exports.updatePassword = async (req, res) => {
  return await business.updatePassword(req,res)
}
exports.changePassword = async (req, res) => {
  return await business.changePassword(req,res)
}
exports.deleteUser = async (req, res) => {
  return await business.deleteUser(req,res)
}

exports.resendOtp = async (req, res) => {
  return await business.resendOtp(req,res)
}
exports.countryState= async (req, res) => {
  return await business.countryState(req,res)
}
exports.stateDistrict= async (req, res) => {
  return await business.stateDistrict(req,res)
}
exports.getUser= async (req, res) => {
  return await business.getUser(req,res)
}



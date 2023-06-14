const business = require('../business/business')

// exports.addUser = async (req, res) => {
//   return await business.register(req,res)
// }
exports.login = async (req, res) => {
  return await business.login(req,res)
}
exports.updateAdmin = async (req, res) => {
  return await business.updateAdmin(req,res)
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
exports.findTotalUser = async (req, res) => {
  return await business.findTotalUser(req,res)
}
exports.getAllUSer = async (req, res) => {
  return await business.getAllUSer(req,res)
}
exports.transactionHistoryAllUser = async (req, res) => {
  return await business.transactionHistoryAllUser(req,res)
}
exports.totalRevenue = async (req, res) => {
  return await business.totalRevenue(req,res)
}





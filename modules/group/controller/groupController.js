const business = require('../business/groupBusiness')

exports.addGroup = async (req, res) => {
  return await business.addGroup(req,res)
}
exports.updateGroup = async (req, res) => {
  return await business.updateGroup(req,res)
}
exports.getGroup = async (req, res) => {
  return await business.getGroup(req,res)
}
exports.deleteGroup = async (req, res) => {
  return await business.deleteGroup(req,res)
}
exports.uploadexcel = async (req, res) => {
  return await business.uploadExcelFile(req,res)
}
exports.copyWithoutData = async (req, res) => {
  return await business.copyWithoutData(req,res)
}
exports.copyWithData = async (req, res) => {
  return await business.copyWithData(req,res)
}
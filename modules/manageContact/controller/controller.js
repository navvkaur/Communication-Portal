const business = require('../business/business')

exports.addContact = async (req, res) => {
  return await business.addContact(req,res)
}
exports.getmanageContact = async (req, res) => {
  return await business.getmanageContact(req,res)
}
exports.getExcelNotEnterDb = async (req, res) => {
  return await business.getExcelNotEnterDb(req,res)
}

exports.updateExcelFile = async (req, res) => {
  return await business.updateExcelFile(req,res)
}
exports.filterApi = async (req, res) => {
  return await business.filterApi(req,res)
} 
exports.innerFilter = async (req, res) => {
  return await business.innerFilter(req,res)
}
exports.checkType = async(req,res)=>{
  return await business.checkType(req,res)
}
exports.updateSinglePeople = async(req,res)=>{
  return await business.updateSinglePeople(req,res)
}
exports.updateNotEnterDbSinglePeople = async(req,res)=>{
  return await business.updateNotEnterDbSinglePeople(req,res)
}
exports.deleteAudience = async(req,res)=>{
  return await business.deleteAudience(req,res)
}
exports.restriction = async (req, res) => {
  return await business.restriction(req,res)
}



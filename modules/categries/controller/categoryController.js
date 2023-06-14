const categoryBusiness = require('../business/categoryBusiness')

exports.createCategories = async (req, res) => {
  return await categoryBusiness.createCategories(req,res)
}
exports.getCategories = async (req, res) => {
  return await categoryBusiness.getCategories(req,res)
}
exports.updateCategories = async (req, res) => {
  return await categoryBusiness.updateCategories(req,res)
}

exports.deleteCategories = async (req, res) => {
  return await categoryBusiness.deleteCategories(req,res)
} 
// exports.findGroupColumnsName = async (req,res) => {
//   return await business.findGroupColumnsName(req,res)
// }

// exports.findAllUserBycolumnName = async (req,res) => {
//   return await business.findAllUserBycolumnName(req,res)
// }


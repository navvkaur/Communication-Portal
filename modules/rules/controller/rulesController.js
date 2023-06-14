const business = require('../business/rulesBusiness')

exports.addRules = async (req, res) => {
  return await business.addRules(req,res)
}
exports.deleteRules = async (req, res) => {
  return await business.deleteRules(req,res)
}
exports.getRulesByGroupID = async (req, res) => {
  return await business.getRulesByGroupID(req,res)
} 

exports.updateRule = async (req, res) => {
  return await business.updateRule(req,res)
}

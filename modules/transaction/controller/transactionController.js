const business = require('../business/transactionBusiness')

exports.purchasePlan = async (req, res) => {
  return await business.purchasePlan(req,res)
}
exports.viewMyPlan = async (req, res) => {
  return await business.viewMyPlan(req,res)
}
exports.upgradePlan = async (req, res) => {
  return await business.upgradePlan(req,res)
}



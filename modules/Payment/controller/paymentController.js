const business = require('../../Payment/business/paymentBusiness')
exports.checkout = async (req, res) => {
  return await business.checkout(req,res)
}
exports.paymentVerification = async (req, res) => {
    return await business.paymentVerification(req,res)
  }
exports.fetchOrder = async (req, res) => {
    return await business.fetchOrder(req,res)
  }
  exports.downloadInvoice = async (req, res) => {
    return await business.downloadInvoice(req,res)
  }
  exports.transactionHistory = async (req, res) => {
    return await business.transactionHistory(req,res)
  }

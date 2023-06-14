  const business = require('../business/templatesBusiness')
//Email Templet controller-------------------
exports.addEmailTemplate = async (req, res) => {
  return await business.addEmailTemplate(req,res)
}
exports.getEmailTemplate = async (req, res) => {
  return await business.getEmailTemplate(req,res)
}
exports.getEmailTemplates = async (req, res) => {
  return await business.getEmailTemplates(req,res)
}

exports.getIvrTemplates = async (req, res) => {
  return await business.getIvrTemplates(req,res)
}
exports.getSmsTemplates = async (req, res) => {
  return await business.getSmsTemplates(req,res)
}
exports.getWhatsappTemplates = async (req, res) => {
  return await business.getWhatsappTemplates(req,res)
}
exports.updateEmailTemplate = async (req, res) => {
  return await business.updateEmailTemplate(req,res) 
}

exports.deleteEmailTemplate = async (req, res) => {
  return await business.deleteEmailTemplate(req,res)
}
// Ivr Templet Controller--------------------------
exports.addIvr = async (req, res) => {
  return await business.addIvr(req,res)
}
exports.updateTemplateIvr = async (req, res) => {
  return await business.updateTemplateIvr(req,res)
}
exports.getIvrTemplate = async (req, res) => {
  return await business.getIvrTemplate(req,res)
}
exports.deleteIvrTemplate = async (req, res) => {
  return await business.deleteIvrTemplate(req,res)
}


//MEssage Templet Controller        
 
exports.addMessageTemplate = async (req, res) => {
  return await business.addMessageTemplate(req,res)
}
exports.updateTemplateMessage = async (req, res) => {
  return await business.updateTemplateMessage(req,res)
}
exports.getMessageTemplate = async (req, res) => {
  return await business.getMessageTemplate(req,res)
}
exports.deleteMessageTemplate = async (req, res) => {
  return await business.deleteMessageTemplate(req,res)
}


// Whatsapp Templet Controller

exports.addWhatsappTemplate = async (req, res) => {
  return await business.addWhatsappTemplate(req,res)
}
exports.updateWhatsappTemplate = async (req, res) => {
  return await business.updateWhatsappTemplate(req,res)
}
exports.getWhatsappTemplate = async (req, res) => {
  return await business.getWhatsappTemplate(req,res)
}
exports.deleteWhatsappTemplate = async (req, res) => {
  return await business.deleteWhatsappTemplate(req,res)
}


//filter Api
exports.findGroupColumnsName = async (req,res) => {
  return await business.findGroupColumnsName(req,res)
}
exports.findAllUserBycolumnName = async (req,res) => {
  return await business.findAllUserBycolumnName(req,res)
}
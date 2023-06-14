const business = require('../business/createcampaignBusiness')
exports.sendCampaign = async (req, res) => {
  return await business.sendCampaign(req,res)
}

 exports.draftCampaign = async (req, res) => {
   return await business.draftCampaign(req,res)
 }
 exports.getDrafts= async (req, res) => {
  return await business.getDrafts(req,res)
}

exports.schedule = async (req, res) => {
  return await business.schedule(req,res)
}

exports.deleteschedule = async(req,res)=>{
  return await business.deleteschedule(req,res)
}
exports.deletesent = async(req,res)=>{
  return await business.deletesent(req,res)
}

exports.editschedule =async(req,res)=>{
  return await business.editschedule(req,res)
}

exports.getpendingschedule = async(req,res)=>{
  return await business.getpendingschedules (req,res)
}

exports.getsentschedule = async(req,res)=>{
  return await business.getsentschedules (req,res)
}

exports.getDraft= async (req,res)=>{
  return await business.getDraft(req,res)
}
exports.deleteDraft= async (req,res)=>{
  return await business.deleteDraft(req,res)
}
exports.getsent= async (req,res)=>{
  return await business.getsent(req,res)
}
exports.getschedule= async (req,res)=>{
  return await business.getschedule(req,res)
}
exports.editDraft=async (req,res)=>{
  return await business.editDraft(req,res)
}

exports.emailcount =  async (req,res)=>{
  return await business.emailcount(req,res)
}

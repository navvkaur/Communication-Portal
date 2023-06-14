const business = require('../business/verifyidBusiness')

exports.verifyOTP = async (req, res) => {
    return await business.verifyOTP(req,res)
  }
exports.sendOTP=async(req,res)=>{ 
      return await business.sendOtp(req,res)
  }
exports.resendOtp=async(req,res)=>{
    return await business.resendOtp(req,res)
}
exports.dltIds=async(req,res)=>{
  return await business.dltIds(req,res)
}


exports.getdltWhatapp=async(req,res)=>{
  return await business.getdltWhatapp(req,res)
  }
  exports.getdltSms=async(req,res)=>{
    return await business.getdltSms(req,res)
    }
exports.getEmail=async(req,res)=>{
      return await business.getEmail(req,res)
   }

exports.getPendingRequest=async(req,res)=>{
  return await business.getPendingRequest(req,res)
}

exports.getWhatsappPendingRequest=async(req,res)=>{
  return await business.getWhatsappPendingRequest(req,res)
}
exports.getPendingRequestCount=async(req,res)=>{
  return await business.getPendingRequestCount(req,res)
}

exports.updateRequest=async(req,res)=>{
  return await business.updateRequest(req,res)
}

exports.updateWhatsappRequest=async(req,res)=>{
  return await business.updateWhatsappRequest(req,res)
}

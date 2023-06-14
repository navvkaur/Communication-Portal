const Joi = require("joi")

exports.addPlan = Joi.object({
    newPlan:Joi.string().required(),
    totalWhatsapp:Joi.number().required(),
    totalEmail:Joi.number().required(),
    totalMessage:Joi.number().required(),
    totalIVR:Joi.number().required(),
    planValidity:Joi.number().required()
})
exports.updatePlan = Joi.object({
    newPlan:Joi.string(),
    totalWhatsapp:Joi.number(),
    totalEmail:Joi.number(),
    totalMessage:Joi.number(),
    totalIVR:Joi.number()
})
exports.planId = Joi.object({
    planId:Joi.string().required()
})
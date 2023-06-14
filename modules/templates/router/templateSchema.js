const Joi = require("joi")

const template = Joi.object({
    templateheader: Joi.string().required(),
    templateMessage: Joi.string().required(),
  });
  module.exports = {
    template
  }

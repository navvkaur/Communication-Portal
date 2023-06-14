const Joi = require("joi")

const register = Joi.object({
  email: Joi.string().email().required(),
    password:Joi.string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/
    )
          .message(
            'Password must be minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.'
          )
    .min(8)
    .max(20)
    .required(),
    name: Joi.string().required(),
    confirmPassword: Joi.string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/
    )
          .message(
            'Password must be minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.'
          )
    .min(8)
    .max(20)
    .required()
  });
  const login = Joi.object({
    email: Joi.string()
    .regex(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    .message("Please enter a valid email ").required(),
    password: Joi.string().required()
  });
  const forgetPwd = Joi.object({
    email: Joi.string().email().required(),
  });
  const updatePassword = Joi.object({
    email: Joi.string().email().required(),
    confirmNewPassword:Joi.string() 
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/
    )
          .message(
            'Password must be minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.'
          )
    .min(8)
    .max(20)
    .required(),
    newPassword: Joi.string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/
    )
          .message(
            'Password must be minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.'
          )
    .min(8)
    .max(20)
    .required()

  });
  const changePassword = Joi.object({
    email: Joi.string().email().required(),
    confirmNewPassword:Joi.string().required(),
    newPassword: Joi.string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/
    )
          .message(
            'Password must be minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.'
          )
    .min(8)
    .max(20)
    .required(),
    password:Joi.string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/
    )
          .message(
            'Password must be minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.'
          )
    .min(8)
    .max(20)
    .required()

  });


  module.exports = {
    register,
    login,
    forgetPwd,
    updatePassword,
    changePassword
  }


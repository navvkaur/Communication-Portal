const jwt = require("jsonwebtoken")
const response = require("../utils/response")
const httpStatus = require('http-status');
const SECRET_KEY = process.env.SECRET_KEY

const generateAuthJwt = (payload) =>{
    const {expires_in, ...params} = payload
    const token = jwt.sign(params,SECRET_KEY,{expiresIn: expires_in} )

if(!token){
    return false
}
return token
}

const verifyToken = (req, res, next) => {
    try {
        let token = req.headers.token
        if (!token) {
            return response.error({ msgCode: 'MISSING_TOKEN' }, res, httpStatus.UNAUTHORIZED);
          }
        jwt.verify(token, SECRET_KEY, async (error, decoded) => {
            // console.log('errrrrrrrrrrr',error.message);
            if (error) {
                let msgCode="INVALID_TOKEN"
                if(error.message=="jwt expired"){
                    msgCode='TOKEN_EXPIRED'
                }
                return response.error( {msgCode} , res, httpStatus.UNAUTHORIZED)
            }
            console.log('decode',decoded);
            const {_id} = decoded
            req.token = decoded;
            return next();
        })
    } catch (err) {
        console.log("______________________", err)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR)

    }
}
module.exports = {
    generateAuthJwt,
    verifyToken
}
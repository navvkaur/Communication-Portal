const response = require("../../../utils/response")
const httpStatus = require('http-status');
const { category } = require('../model/categoryModel')
const ImageController = require('../../../helper/imageHelper')
const { template } = require('../../templates/model/templateModel')
const { ivrTemplate } = require('../../templates/model/ivrTempletModel')
const { messageTemplate } = require('../../templates/model/messageTemplet')
const { whatsappTemplate } = require('../../templates/model/whatsappTemplet');
const { SubUser } = require("../../subUser/model/subUserModel");
const { user } = require("../../user/model/userModel");
const ObjectId = require('mongodb');

exports.createCategories = async (req, res) => {
    try {
        const tokenData = req.token
        console.log(tokenData)
        const data = req.body
        let access = false;
        if (tokenData.userType == "USER") {
            let findUser = await user.findOne({ _id: tokenData._id, status: "Active" })
            if (findUser) {

                data.userId = tokenData._id
                access = true;
            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            }
        }
       else if (tokenData.userType == "SUBUSER") {
            let findSubUser = await SubUser.findOne({ _id: tokenData._id, status: "Active" }).lean()
            console.log(findSubUser)
            if (findSubUser) {

                if (data.categoriesType == "Email") {
                    let { permission: { emailCategory: { create } } } = findSubUser
                    console.log(create)
                    if (create) {
                        data.subUserId = tokenData._id
                        data.userId = tokenData.userId
                        access = true;
                    }
                    else {
                        return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)
                    }
                }
                if (data.categoriesType == "Whatsapp") {
                    let { permission: { whatsappCategory: { create } } } = findSubUser
                    console.log(create)
                    if (create) {
                        data.subUserId = tokenData._id
                        data.userId = tokenData.userId
                        access = true;
                    }
                    else {
                        return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)
                    }
                }
                if (data.categoriesType == "Message") {
                    let { permission: { messageCategory: { create } } } = findSubUser
                   
                    if (create) {
                        data.subUserId = tokenData._id
                        data.userId = tokenData.userId
                        access = true;
                    }
                    else {
                        return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)
                    }
                }
                if (data.categoriesType == "IVR") {
                    let { permission: { ivrCategory: { create } } } = findSubUser

                    if (create) {
                        data.subUserId = tokenData._id
                        data.userId = tokenData.userId
                        access = true;
                    }
                    else {
                        return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)
                    }
                }

            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            }

        }
        else{
            return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)
        }

        if (access) {

            console.log(req.file)
            if (req?.file) {


                let fileDetails = req.file
                console.log(fileDetails)
                let uploadCategory = await ImageController.fileUpload(fileDetails.filename,
                    fileDetails.destination,
                    fileDetails.mimetype,
                    '/');
                req.body.image = uploadCategory.Location
            }
            // let data = req.body 
            console.log("42", data)


            let categorySave = new category(data)
            let mongoData = await categorySave.save()
            return response.success({ message: "ADD_CATEGORY", data: mongoData }, res, httpStatus.CREATED)
        }
        else {
            return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)

        }
    } catch (error) {
        console.log(error.message)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.getCategories = async (req, res) => {
    try {
        const token=req.token
        console.log(token)
        let find
        if(token.userType=="USER"){
            if (req.params.name == "Email") {
                find = await category.find({ userId:token._id, categoriesType: "Email",categoryStatus:"Active" }).lean()
            }
            else if (req.params.name == "Message") {
                find = await category.find({ userId:token._id, categoriesType: "Message",categoryStatus:"Active" }).lean()
            }
            else if (req.params.name == "Whatsapp") {
                find = await category.find({ userId:token._id, categoriesType: "Whatsapp",categoryStatus:"Active" }).lean()
            }
            else if (req.params.name == "IVR") {
                find = await category.find({ userId:token._id, categoriesType: "IVR",categoryStatus:"Active" }).lean()
            }
            else{
            return response.error({ message: "INVALID_REQUEST" }, res, httpStatus.UNAUTHORIZED)
            }
        }
        else if(token.userType=="SUBUSER"){
            if (req.params.name == "Email") {
                let findSubUser = await SubUser.findOne({ _id:token._id,status:"Active" }).lean()
                if (findSubUser) {
                    let { permission: { emailCategory: { subCategories } } } = findSubUser
                    console.log(subCategories)
                    let result1 = category.find({ subUserId:token._id, categoriesType: "Email",categoryStatus:"Active" })
                    let result2 = category.find({
                        _id: { $in: subCategories },categoryStatus:"Active"
                    })
                    console.log(result1)
                    let [finalResult1, finalResult2] = await Promise.all([result1, result2])
                    console.log(finalResult1)
                    find = finalResult1.concat(finalResult2)
                }
                else {
                    return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
                }
            }
            else if (req.params.name == "Whatsapp") {
                let findSubUser = await SubUser.findOne({ _id:token._id ,status:"Active"}).lean()
                if (findSubUser) {
                    let { permission: { whatsappCategory: { subCategories } } } = findSubUser
                    console.log(subCategories)
                    let result1 = category.find({ subUserId:token._id, categoriesType: "Whatsapp",categoryStatus:"Active" })
                    let result2 = category.find({
                        _id: { $in: subCategories },categoryStatus:"Active"
                    })
                    console.log(result1)
                    let [finalResult1, finalResult2] = await Promise.all([result1, result2])
                    console.log(finalResult1)
                    find = finalResult1.concat(finalResult2)
                }
                else {
                    return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
    
                }
            }
            else if (req.params.name == "Message") {
                let findSubUser = await SubUser.findOne({ _id: token._id,status:"Active" }).lean()
                if (findSubUser) {
                    let { permission: { messageCategory: { subCategories } } } = findSubUser
                    let result1 = category.find({ subUserId: token._id, categoriesType: "Message",categoryStatus:"Active" })
                    let result2 = category.find({
                        _id: { $in: subCategories },categoryStatus:"Active"
                    })
                    let [finalResult1, finalResult2] = await Promise.all([result1, result2])
                    find = finalResult1.concat(finalResult2)
                }
                else {
                    return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
                }
            }
            else if (req.params.name == "IVR") {
                let findSubUser = await SubUser.findOne({ _id: token._id,status:"Active" }).lean()
                if (findSubUser) {
                    let { permission: { ivrCategory: { subCategories } } } = findSubUser
                    let result1 = category.find({ subUserId: token._id, categoriesType: "IVR",categoryStatus:"Active" })
                    let result2 = category.find({
                        _id: { $in: subCategories },categoryStatus:"Active"
                    })
                    let [finalResult1, finalResult2] = await Promise.all([result1, result2])
                    find = finalResult1.concat(finalResult2)
                }
                else {
                    return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
    
                }
            }
            else {
                return response.error({ message: "MISSING_P" }, res, httpStatus.UNAUTHORIZED)
    
            }
        }
        else{
            return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)
        }
        if (find) {
            return response.success({ message: "API_SUCCESS", data: find }, res, httpStatus.CREATED)

        } else {
            return response.error({ message: 'FAILED_TO_FATCH_DATA' }, res, httpStatus.ALREADY_REPORTED)

        }
    } catch (error) {
        console.log(error.message)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.updateCategories = async (req, res) => {
    try {
        let data = req.body
        console.log(data)
        let result = await category.findById({ _id: req.params.id })
        if (result) {
            if (req?.file) {
                let imageUrl = result.image
                console.log(imageUrl)
                var url = await imageUrl.split('/');
                console.log(url)
                var updated_url = await url[url.length - 1]

                console.log("===============1255555555", updated_url)

                const ImageData1 = await ImageController.deleteFile(updated_url);

                let fileDetails = req.file
                console.log(fileDetails)
                let uploadCategory = await ImageController.fileUpload(fileDetails.filename,
                    fileDetails.destination,
                    fileDetails.mimetype,
                    '/');
                req.body.image = uploadCategory.Location
            }

            let update = await category.findByIdAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true })
            console.log(update)
            if (update) {
                return response.success({ message: "P_UPDATE", data: update }, res, httpStatus.CREATED)

            }
            else {
                return response.error({ message: 'UPDATE_ERROR' }, res, httpStatus.FORBIDDEN)

            }
        }
        else {
            return response.error({ message: 'Data_NOT_FOUND' }, res, httpStatus.NOT_FOUND)

        }



    } catch (error) {
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

    }



}
exports.deleteCategories = async (req, res) => {    
    try {
        let id = req.params.key
        const changeStatus= await category.findByIdAndUpdate({_id:id},{$set:{categoryStatus:"In-Active"}},{new:true})
        if(changeStatus){
            return response.success({ message: 'DELETED' }, res, httpStatus.OK)   
        }
        else{
            return response.error({ message: 'Data_NOT_FOUND' }, res, httpStatus.NOT_FOUND)
        }
    } catch (error) {
        console.log(error.message)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

    }
}

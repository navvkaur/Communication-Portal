const response = require("../../../utils/response")
const httpStatus = require('http-status');
const { template } = require('../model/templateModel')
const { ivrTemplate } = require('../model/ivrTempletModel')
const { messageTemplate } = require('../model/messageTemplet')
const { whatsappTemplate } = require('../model/whatsappTemplet');
const { rules } = require("../../rules/model/rulesModel");
const { manageGroup } = require("../../group/model/groupModel");
const ObjectId = require("mongoose/lib/types/objectid");
const { manageContact } = require("../../manageContact/model/model")
const ImageController = require('../../../helper/imageHelper');
const { user } = require("../../user/model/userModel");
const { SubUser } = require("../../subUser/model/subUserModel");




//EMail Templets-------------------------

exports.addEmailTemplate = async (req, res) => {
    try {
        const tokenData = req.token
        console.log(tokenData)
        let data = req.body
        let access = false;
        if (tokenData.userType == "USER") {
            let findUser = await user.findOne({ _id: tokenData._id, status: "Active" })
            if (findUser) {
                data.templateStatus = "APPROVED"
                access = true;
            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            }
        }
        else if (tokenData.userType == "SUBUSER") {
            const findSubUser = await SubUser.findOne({ _id: tokenData._id, status: "Active" }).lean()
            if (findSubUser) {
                let { permission: { emailCategory: { templates: { create } } } } = findSubUser
                if (create) {
                    req.body.subUserId = tokenData._id
                    data.templateStatus = "PENDING"
                    access = true;
                }
                else {
                    return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)
                }
            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            }

        }
        else {
            return response.error({ message: "INVALID_REQUEST" }, res, httpStatus.UNAUTHORIZED);
        }
        if (access) {
            console.log(data, "----------------------------------------")
            if (req?.files?.file) {
                let fileDetails = req.files.file
                let uploadFile = []

                for (let i = 0; i < fileDetails.length; i++) {
                    let uploadCategory = await ImageController.fileUpload(fileDetails[i].filename,
                        fileDetails[i].destination,
                        fileDetails[i].mimetype,
                        '/');
                    uploadFile.push(uploadCategory.Location)
                    // uploadAttachment.push(uploadCategory.Location)

                }
                req.body.file = uploadFile
                // req.body.attachment = uploadAttachment


            }
            if (req?.files?.attachment) {
                let fileDetails = req.files.attachment
                let uploadAttachment = []
                for (let i = 0; i < fileDetails.length; i++) {
                    let uploadCategory = await ImageController.fileUpload(fileDetails[i].filename,
                        fileDetails[i].destination,
                        fileDetails[i].mimetype,
                        '/');
                    uploadAttachment.push(uploadCategory.Location)

                }
                req.body.attachment = uploadAttachment
            }

            let addContact = new template(data)
            let mongoData = await addContact.save()
            return response.success({ message: "TEMPLATE_ADDED_SUCCESSFULLY", data: mongoData }, res, httpStatus.CREATED)
        }
        else {
            return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED);
        }
        //////////////////

    } catch (error) {
        console.log(error.message)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
},
    exports.updateEmailTemplate = async (req, res) => {

        try {
            console.log(req.body)
            let findResult = await template.findById({ _id: req.params.id })
            console.log(findResult)

            if (req?.files?.file) {
                let imageUrl = findResult.file

                if (imageUrl) {
                    for (let i = 0; i < imageUrl.length; i++) {
                        var url = await imageUrl[i].split('/');
                        console.log(url)
                        var updated_url = await url[url.length - 1]

                        console.log("===============1255555555", updated_url)

                        const ImageData1 = await ImageController.deleteFile(updated_url);
                    }
                }

                let fileDetails = req.files.file
                let uploadFile = []
                // let uploadAttachment = []
                for (let i = 0; i < fileDetails.length; i++) {
                    let uploadCategory = await ImageController.fileUpload(fileDetails[i].filename,
                        fileDetails[i].destination,
                        fileDetails[i].mimetype,
                        '/');
                    uploadFile.push(uploadCategory.Location)

                }
                req.body.file = uploadFile
            }
            if (req?.files?.attachment) {
                let imageUrl = findResult.attachment
                if (imageUrl) {
                    for (let i = 0; i < imageUrl.length; i++) {
                        var url = await imageUrl[i].split('/');
                        console.log(url)
                        var updated_url = await url[url.length - 1]

                        console.log("===============1255555555", updated_url)

                        const ImageData1 = await ImageController.deleteFile(updated_url);
                    }
                }

                let fileDetails = req.files.attachment
                let uploadAttachment = []
                for (let i = 0; i < fileDetails.length; i++) {
                    let uploadCategory = await ImageController.fileUpload(fileDetails[i].filename,
                        fileDetails[i].destination,
                        fileDetails[i].mimetype,
                        '/');

                    uploadAttachment.push(uploadCategory.Location)



                }
                req.body.attachment = uploadAttachment

            }
            const user = await template.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true });
            if (!user) {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            } else {
                return response.success({ message: "P_UPDATE", data: user }, res, httpStatus.OK)
            }
        } catch (error) {

            return response.error({ msgCode: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);
        }
    }
  
    exports.getEmailTemplate = async (req, res) => {
        try {
            let find
            let srch = req.params.key
            const token = req.token
            console.log(token)
            if (token.userType == "USER") {
                const findUser = await user.findById({ _id: token._id, status: "Active", userType: "USER" }).lean()
                if (findUser) {
                    if (req.params.name == "findOne") {
                        find = await template.findOne({ _id: srch }).lean()
                    }
                    if (req.params.name == "allCategoryTemplet") {
                        find = await template.find({ categoryId: srch }).lean()
                    }
                    if (req.params.name == "templateWithgroupId") {
                        find = await template.find({ $and: [{ categoryId: srch }, { groupId: req.params.id }] }).lean()
                    }
                }
            }
            else if (token.userType == "SUBUSER") {
                const findUser = await SubUser.findById({ _id: token._id, status: "Active", userType: "SUBUSER" }).lean()
                if (findUser) {
                    if (req.params.name == "findOne") {
                        find = await template.findOne({ _id: srch }).lean()
                    }
                    if (req.params.name == "allCategoryTemplet") {
                        let { permission: { emailCategory: { templates: { subTemplates } } } } = findUser
                        console.log(subTemplates)
                        let result1 = template.find({ categoryId: srch, subUserId: req.params.id }).lean()

                        let result2 = template.find({
                            categoryId: srch,
                            _id: { $in: subTemplates }
                        })
                        let [finalResult1, finalResult2] = await Promise.all([result1, result2])
                        find = finalResult1.concat(finalResult2)

                    }

                }
            }
            else {
                return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)
            }
            if (find) {
                return response.success({ message: "API_SUCCESS", data: find }, res, httpStatus.CREATED)

            } else {
                return response.error({ message: 'FAILED_TO_FATCH_DATA' }, res, httpStatus.ALREADY_REPORTED)

            }
        } catch (error) {
            return response.error({ message: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);
        }
    }

exports.deleteEmailTemplate = async (req, res) => {
    try {
        let access = false
        const token = req.token
        console.log(token)
        if (token.userType == "USER") {
            const findUser = await user.findById({ _id: token._id, status: "Active" }).lean()
            if (findUser) {
                access = true
            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            }
        }
        else if (token.userType == "SUBUSER") {
            const findSubUser = await SubUser.findById({ _id: token._id, status: "Active" }).lean()
            if (findSubUser) {
                const findTemplates = await template.findOne({ _id: req.params.id, subUserId: token._id }).lean()
                if (findSubUser) {
                    access = true
                }
                else {
                    return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED);
                }
            }

        }
        else {
            return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)
        }

        if (access) {
            const user = await template.findOneAndDelete({ _id: req.params.id });
            console.log(user)
            if (!user) {
                return response.error({ message: 'TEMPLATE_NOT_FOUND' }, res, httpStatus.FORBIDDEN)
            } else {
                console.log(user)
                if (user.file || user.attachment) {
                    console.log(user.file)
                    console.log(user.attachment)
                    let imageUrl = user.file
                    let attachmentUrl = user.attachment
                    if (imageUrl) {
                        for (let i = 0; i < imageUrl.length; i++) {
                            var url = await imageUrl[i].split('/');
                            console.log(url)
                            var updated_url = await url[url.length - 1]

                            console.log("===============1255555555", updated_url)

                            const ImageData1 = await ImageController.deleteFile(updated_url);
                        }
                    }
                    if (attachmentUrl) {
                        for (let i = 0; i < attachmentUrl.length; i++) {
                            var url = await attachmentUrl[i].split('/');
                            console.log(url)
                            var updated_url = await url[url.length - 1]

                            console.log("===============1255555555", updated_url)

                            const ImageData1 = await ImageController.deleteFile(updated_url);
                        }
                    }

                }
                response.success({ message: 'DELETED', data: "Template has been deleted" }, res, httpStatus.OK)
            }
        }
        else {
            return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED);
        }

    } catch (error) {
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

    }
}

//Ivr Templet Api
exports.addIvr = async (req, res) => {
    try {

        const tokenData = req.token
        console.log(tokenData)
        let data = req.body
        let access = false;
        if (tokenData.userType == "USER") {
            let findUser = await user.findOne({ _id: tokenData._id, status: "Active" }).lean()
            if (findUser) {
                console.log(findUser)
                data.templateStatus = "APPROVED"
                access = true;
            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            }
        }
        else if (tokenData.userType == "SUBUSER") {
            let findSubUser = await SubUser.findOne({ _id: tokenData._id, status: "Active" }).lean()
            if (findSubUser) {
                let { permission: { ivrCategory: { templates: { create } } } } = findSubUser
                if (create) {
                    req.body.subUserId = tokenData._id
                    data.templateStatus = "PENDING"
                    access = true;
                }
                else {
                    return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)
                }
            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            }

        }
        else {
            return response.error({ message: "INVALID_REQUEST" }, res, httpStatus.UNAUTHORIZED);
        }

        if (access) {
            let audioFile = req.file
            if (audioFile) {

                let fileDetails = audioFile
                let uploadCategory = await ImageController.fileUpload(fileDetails.filename,
                    fileDetails.destination,
                    fileDetails.mimetype,
                    '/')

                req.body.audioFile = uploadCategory.Location
                let addContact = new ivrTemplate(req.body)
                let mongoData = await addContact.save()
                console.log(mongoData)
                return response.success({ message: "TEMPLATE_ADDED_SUCCESSFULLY", data: mongoData }, res, httpStatus.CREATED)


            }
            else {
                return response.error({ message: 'AUDIO_FILE_REQUIRE' }, res, httpStatus.FORBIDDEN);

            }

        }
        else {
            return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED);

        }
    } catch (error) {
        console.log(error.message)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.updateTemplateIvr = async (req, res) => {
    try {
        console.log(req.body)
        let findResult = await ivrTemplate.findById({ _id: req.params.id })
        console.log(findResult)
        console.log("22", req.file)
        if (req?.file) {
            let imageUrl = findResult.audioFile
            if (imageUrl) {
                var url = await imageUrl.split('/');
                console.log(url)
                var updated_url = await url[url.length - 1]

                console.log("===============1255555555", updated_url)

                const ImageData1 = await ImageController.deleteFile(updated_url);

            }

            let fileDetails = req.file

            let uploadCategory = await ImageController.fileUpload(fileDetails.filename,
                fileDetails.destination,
                fileDetails.mimetype,
                '/');

            req.body.audioFile = uploadCategory.Location

        }

        const user = await ivrTemplate.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true });
        if (!user) {
            return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
        } else {
            return response.success({ message: "P_UPDATE", data: user }, res, httpStatus.OK)
        }
    } catch (error) {

        return response.error({ msgCode: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.getIvrTemplate = async (req, res) => {
    console.log(req.body)
    try {
        let find
        let srch = req.params.key
        const token = req.token
        console.log(token)
        if (token.userType == "USER") {
            const findUser = await user.findById({ _id: token._id, status: "Active", userType: "USER" }).lean()
            if (findUser) {
                if (req.params.name == "findOne") {
                    find = await ivrTemplate.findOne({ _id: srch }).lean()
                }
                if (req.params.name == "allCategoryTemplet") {
                    find = await ivrTemplate.find({ categoryId: srch }).lean()
                }
                if (req.params.name == "templateWithgroupId") {
                    find = await ivrTemplate.find({ $and: [{ categoryId: srch }, { groupId: req.params.id }] }).lean()
                }
            }
        }
        if (token.userType == "SUBUSER") {
            const findUser = await SubUser.findById({ _id: token._id, status: "Active", userType: "SUBUSER" }).lean()
            if (findUser) {
                if (req.params.name == "findOne") {
                    find = await ivrTemplate.findOne({ _id: srch }).lean()
                }
                if (req.params.name == "allCategoryTemplet") {
                    let { permission: { ivrCategory: { templates: { subTemplates } } } } = findUser
                    console.log(subTemplates)
                    let result1 = ivrTemplate.find({ categoryId: srch, subUserId: req.params.id }).lean()

                    let result2 = ivrTemplate.find({
                        categoryId: srch,
                        _id: { $in: subTemplates }
                    })
                    let [finalResult1, finalResult2] = await Promise.all([result1, result2])
                    find = finalResult1.concat(finalResult2)

                }

            }
        }
        if (find) {
            return response.success({ message: "API_SUCCESS", data: find }, res, httpStatus.CREATED)

        } else {
            return response.error({ message: 'FAILED_TO_FATCH_DATA' }, res, httpStatus.ALREADY_REPORTED)

        }
    } catch (error) {
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
},
    exports.deleteIvrTemplate = async (req, res) => {

        try {
            let access = false
            const token = req.token
            console.log(token)
            if (token.userType == "USER") {
                const findUser = await user.findById({ _id: token._id, status: "Active" }).lean()
                if (findUser) {
                    access = true
                }
                else {
                    return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
                }
            }
            if (token.userType == "SUBUSER") {
                const findSubUser = await SubUser.findById({ _id: token._id, status: "Active" }).lean()
                if (findSubUser) {
                    const findTemplates = await ivrTemplate.findOne({ _id: req.params.id, subUserId: token._id }).lean()
                    if (findSubUser) {
                        access = true
                    }
                    else {
                        return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED);
                    }
                }

            }
            if (access) {
                const user = await ivrTemplate.findOneAndDelete({ _id: req.params.id });
                console.log(user)
                if (!user) {
                    return response.error({ message: 'TEMPLATE_NOT_FOUND' }, res, httpStatus.FORBIDDEN)
                } else {
                    console.log(user)
                    if (user.audioFile) {
                        console.log(user.audioFile)
                        let imageUrl = user.audioFile
                        if (imageUrl) {
                            var url = await imageUrl.split('/');
                            console.log(url)
                            var updated_url = await url[url.length - 1]

                            console.log("===============1255555555", updated_url)

                            const ImageData1 = await ImageController.deleteFile(updated_url);
                        }
                    }
                    response.success({ message: 'DELETED', data: "Template has been deleted" }, res, httpStatus.OK)
                }
            }


        } catch (error) {
            return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

        }
    }

//Message Templet Api================================
exports.addMessageTemplate = async (req, res) => {
    try {
        const tokenData = req.token
        console.log(tokenData)
        let data = req.body
        let access = false;
        if (tokenData.userType == "USER") {
            let findUser = await user.findOne({ _id: tokenData._id, status: "Active" })
            if (findUser) {
                data.templateStatus = "APPROVED"
                access = true;
            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            }
        }
        else if (tokenData.userType == "SUBUSER") {
            let findSubUser = await SubUser.findOne({ _id: tokenData._id, status: "Active" })
            if (findSubUser) {
                let { permission: { messageCategory: { templates: { create } } } } = findSubUser
                console.log(create)
                if (create) {
                    req.body.subUserId = tokenData._id
                    data.templateStatus = "PENDING"
                    access = true;
                }
                else {
                    return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)
                }
            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            }

        }
        else {
            return response.error({ message: "INVALID_REQUEST" }, res, httpStatus.UNAUTHORIZED);
        }
        if (access) {
            let addContact = new messageTemplate(data)
            let mongoData = await addContact.save()
            if (mongoData) {
                return response.success({ message: "TEMPLATE_ADDED_SUCCESSFULLY", data: mongoData }, res, httpStatus.CREATED)

            }
            else {
                return response.error({ msgCode: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);

            }
        }
        else {
            return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)

        }


    } catch (error) {
        console.log(error.message)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
},
    exports.updateTemplateMessage = async (req, res) => {
        try {
            console.log(req.body)
            const user = await messageTemplate.findByIdAndUpdate({ _id: req.params.id }, { $set: { subject: req.body.subject, templateName: req.body.templateName } }, { new: true });
            if (!user) {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            } else {
                return response.success({ message: "P_UPDATE", data: user }, res, httpStatus.OK)
            }
        } catch (error) {

            return response.error({ msgCode: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);
        }
    }
exports.getMessageTemplate = async (req, res) => {
    console.log(req.body)
    try {
        let find
        let srch = req.params.key
        const token = req.token
        console.log(token)
        if (token.userType == "USER") {
            const findUser = await user.findById({ _id: token._id, status: "Active", userType: "USER" }).lean()
            if (findUser) {
                if (req.params.name == "findOne") {
                    find = await messageTemplate.findOne({ _id: srch }).lean()
                }
                if (req.params.name == "allCategoryTemplet") {
                    find = await messageTemplate.find({ categoryId: srch }).lean()
                }
                if (req.params.name == "templateWithgroupId") {
                    find = await messageTemplate.find({ $and: [{ categoryId: srch }, { groupId: req.params.id }] }).lean()
                }
            }
        }
        if (token.userType == "SUBUSER") {
            const findUser = await SubUser.findById({ _id: token._id, status: "Active", userType: "SUBUSER" }).lean()
            if (findUser) {
                if (req.params.name == "findOne") {
                    find = await messageTemplate.findOne({ _id: srch }).lean()
                }
                if (req.params.name == "allCategoryTemplet") {
                    let { permission: { messageCategory: { templates: { subTemplates } } } } = findUser
                    console.log(subTemplates)
                    let result1 = messageTemplate.find({ categoryId: srch, subUserId: req.params.id }).lean()

                    let result2 = messageTemplate.find({
                        categoryId: srch,
                        _id: { $in: subTemplates }
                    })
                    let [finalResult1, finalResult2] = await Promise.all([result1, result2])
                    find = finalResult1.concat(finalResult2)

                }

            }
        }
        if (find) {
            return response.success({ message: "API_SUCCESS", data: find }, res, httpStatus.CREATED)

        } else {
            return response.error({ message: 'FAILED_TO_FATCH_DATA' }, res, httpStatus.ALREADY_REPORTED)

        }
    } catch (error) {
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
},
    exports.deleteMessageTemplate = async (req, res) => {

        try {
            let access = false
            const token = req.token
            console.log(token)
            if (token.userType == "USER") {
                const findUser = await user.findById({ _id: token._id, status: "Active" }).lean()
                if (findUser) {
                    access = true
                }
                else {
                    return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
                }
            }
            if (token.userType == "SUBUSER") {
                const findSubUser = await SubUser.findById({ _id: token._id, status: "Active" }).lean()
                if (findSubUser) {
                    const findTemplates = await messageTemplate.findOne({ _id: req.params.id, subUserId: token._id }).lean()
                    if (findSubUser) {
                        access = true
                    }
                    else {
                        return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED);
                    }
                }

            }
            if (access) {
                const user = await messageTemplate.findOneAndDelete({ _id: req.params.id });
                console.log(user)
                if (!user) {
                    return response.error({ message: 'TEMPLATE_NOT_FOUND' }, res, httpStatus.FORBIDDEN)
                } else {
                    response.success({ message: 'DELETED', data: "Template has been deleted" }, res, httpStatus.OK)

                }
            }
            else {
                return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED);
            }


        } catch (error) {
            return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

        }
    }

//Whatsapp Templet Api

exports.addWhatsappTemplate = async (req, res) => {
    try {

        const tokenData = req.token
        console.log(tokenData)
        let data = req.body
        let access = false;
        if (tokenData.userType == "USER") {
            let findUser = await user.findOne({ _id: tokenData._id, status: "Active" }).lean()
            if (findUser) {
                data.templateStatus = "APPROVED"
                access = true;
            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            }
        }
        else if (tokenData.userType == "SUBUSER") {
            let findSubUser = await SubUser.findOne({ _id: tokenData._id, status: "Active" }).lean()
            if (findSubUser) {
                let { permission: { whatsappCategory: { templates: { create } } } } = findSubUser

                if (create) {
                    req.body.subUserId = tokenData._id
                    data.templateStatus = "PENDING"
                    access = true;
                }
                else {
                    return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED)
                }
            }
            else {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            }
        }
        else {
            return response.error({ message: "INVALID_REQUEST" }, res, httpStatus.UNAUTHORIZED);
        }

        if (access) {
            console.log(req.files, "++++++++++++++++++++++++")
            if (req?.files?.file) {
                console.log("running 1")
                console.log(req.files, '-----------------')
                let fileDetails = req.files.file
                let uploadFile = []
                for (let i = 0; i < fileDetails.length; i++) {
                    let uploadCategory = await ImageController.fileUpload(fileDetails[i].filename,
                        fileDetails[i].destination,
                        fileDetails[i].mimetype,
                        '/');
                    uploadFile.push(uploadCategory.Location)
                    // uploadAttachment.push(uploadCategory.Location)
                }
                req.body.file = uploadFile
                // req.body.attachment = uploadAttachment


            }
            if (req?.files?.attachment) {
                let fileDetails = req.files.attachment
                let uploadAttachment = []
                for (let i = 0; i < fileDetails.length; i++) {
                    let uploadCategory = await ImageController.fileUpload(fileDetails[i].filename,
                        fileDetails[i].destination,
                        fileDetails[i].mimetype,
                        '/');
                    uploadAttachment.push(uploadCategory.Location)

                }
                req.body.attachment = uploadAttachment
            }
            let addContact = new whatsappTemplate(data)
            let mongoData = await addContact.save()
            return response.success({ message: "TEMPLATE_ADDED_SUCCESSFULLY", data: mongoData }, res, httpStatus.CREATED)
        }

    } catch (error) {
        console.log(error.message)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
},
    exports.updateWhatsappTemplate = async (req, res) => {

        try {
            console.log(req.body)
            let findResult = await whatsappTemplate.findById({ _id: req.params.id })
            console.log(findResult)

            if (req?.files?.file) {
                let imageUrl = findResult.file

                if (imageUrl) {
                    for (let i = 0; i < imageUrl.length; i++) {
                        var url = await imageUrl[i].split('/');
                        console.log(url)
                        var updated_url = await url[url.length - 1]

                        console.log("===============1255555555", updated_url)

                        const ImageData1 = await ImageController.deleteFile(updated_url);
                    }
                }

                let fileDetails = req.files.file
                let uploadFile = []
                // let uploadAttachment = []
                for (let i = 0; i < fileDetails.length; i++) {
                    let uploadCategory = await ImageController.fileUpload(fileDetails[i].filename,
                        fileDetails[i].destination,
                        fileDetails[i].mimetype,
                        '/');
                    uploadFile.push(uploadCategory.Location)
                }
                req.body.file = uploadFile
            }
            if (req?.files?.attachment) {
                let imageUrl = findResult.attachment
                if (imageUrl) {
                    for (let i = 0; i < imageUrl.length; i++) {
                        var url = await imageUrl[i].split('/');
                        console.log(url)
                        var updated_url = await url[url.length - 1]

                        console.log("===============1255555555", updated_url)

                        const ImageData1 = await ImageController.deleteFile(updated_url);
                    }
                }

                let fileDetails = req.files.attachment
                let uploadAttachment = []
                for (let i = 0; i < fileDetails.length; i++) {
                    let uploadCategory = await ImageController.fileUpload(fileDetails[i].filename,
                        fileDetails[i].destination,
                        fileDetails[i].mimetype,
                        '/');

                    uploadAttachment.push(uploadCategory.Location)



                }
                req.body.attachment = uploadAttachment

            }

            const user = await whatsappTemplate.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true });
            if (!user) {
                return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
            } else {
                return response.success({ message: "P_UPDATE", data: user }, res, httpStatus.OK)
            }
        } catch (error) {

            return response.error({ msgCode: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);
        }
    },
    exports.getWhatsappTemplate = async (req, res) => {
        console.log(req.body)
        try {
            let find
            let srch = req.params.key
            const token = req.token
            console.log(token)
            if (token.userType == "USER") {
                const findUser = await user.findById({ _id: token._id, status: "Active", userType: "USER" }).lean()
                if (findUser) {
                    if (req.params.name == "findOne") {
                        find = await whatsappTemplate.findOne({ _id: srch }).lean()
                    }
                    if (req.params.name == "allCategoryTemplet") {
                        find = await whatsappTemplate.find({ categoryId: srch }).lean()
                    }
                    if (req.params.name == "templateWithgroupId") {
                        find = await whatsappTemplate.find({ $and: [{ categoryId: srch }, { groupId: req.params.id }] }).lean()
                    }
                }
            }
            if (token.userType == "SUBUSER") {
                const findUser = await SubUser.findById({ _id: token._id, status: "Active", userType: "SUBUSER" }).lean()
                if (findUser) {
                    if (req.params.name == "findOne") {
                        find = await whatsappTemplate.findOne({ _id: srch }).lean()
                    }
                    if (req.params.name == "allCategoryTemplet") {
                        let { permission: { whatsappCategory: { templates: { subTemplates } } } } = findUser
                        console.log(subTemplates)
                        let result1 = whatsappTemplate.find({ categoryId: srch, subUserId: req.params.id }).lean()

                        let result2 = whatsappTemplate.find({
                            categoryId: srch,
                            _id: { $in: subTemplates }
                        })
                        let [finalResult1, finalResult2] = await Promise.all([result1, result2])
                        find = finalResult1.concat(finalResult2)
                    }
                }
            }
            if (find) {
                return response.success({ message: "API_SUCCESS", data: find }, res, httpStatus.CREATED)

            } else {
                return response.error({ message: 'FAILED_TO_FATCH_DATA' }, res, httpStatus.ALREADY_REPORTED)

            }
        } catch (error) {
            return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
        }
    },
    exports.deleteWhatsappTemplate = async (req, res) => {
        try {
            let access = false
            const token = req.token
            console.log(token)
            if (token.userType == "USER") {
                const findUser = await user.findById({ _id: token._id, status: "Active" }).lean()
                if (findUser) {
                    access = true
                }
                else {
                    return response.error({ message: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
                }
            }
            if (token.userType == "SUBUSER") {
                const findSubUser = await SubUser.findById({ _id: token._id, status: "Active" }).lean()
                if (findSubUser) {
                    const findTemplates = await whatsappTemplate.findOne({ _id: req.params.id, subUserId: token._id }).lean()
                    if (findSubUser) {
                        access = true
                    }
                    else {
                        return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED);
                    }
                }

            }
            if (access) {
                const user = await whatsappTemplate.findOneAndDelete({ _id: req.params.id });
                console.log(user)
                if (!user) {
                    return response.error({ message: 'TEMPLATE_NOT_FOUND' }, res, httpStatus.FORBIDDEN)
                } else {
                    console.log(user)
                    if (user.file || user.attachment) {
                        console.log(user.file)
                        console.log(user.attachment)
                        let imageUrl = user.file
                        let attachmentUrl = user.attachment
                        if (imageUrl) {
                            for (let i = 0; i < imageUrl.length; i++) {
                                var url = await imageUrl[i].split('/');
                                console.log(url)
                                var updated_url = await url[url.length - 1]

                                console.log("===============1255555555", updated_url)

                                const ImageData1 = await ImageController.deleteFile(updated_url);
                            }
                        }
                        if (attachmentUrl) {
                            for (let i = 0; i < attachmentUrl.length; i++) {
                                var url = await attachmentUrl[i].split('/');
                                console.log(url)
                                var updated_url = await url[url.length - 1]

                                console.log("===============1255555555", updated_url)

                                const ImageData1 = await ImageController.deleteFile(updated_url);
                            }
                        }

                    }
                    response.success({ message: 'DELETED', data: "Template has been deleted" }, res, httpStatus.OK)
                }
            }
            else {
                return response.error({ message: "PERMISSION_ERROR" }, res, httpStatus.UNAUTHORIZED);
            }

        } catch (error) {
            return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

        }
    }
//filter Api 

exports.findGroupColumnsName = async (req, res) => {
    try {
        const groupById = req.params.id
        // const groupCreatedByUser = await rules.find({_id:groupById}, )
        let groupColumsName = await rules.aggregate([{
            $match: {
                groupId: ObjectId(req.params.groupId)
            }
        }, {
            $project: {
                columnName: 1
            }
        }])
        if (groupColumsName) {
            const a = [...new Set(groupColumsName.map((item) => item.columnName))]
            return response.success({ message: "", data: a }, res, httpStatus.OK)
        }
        return response.error({ message: "", }, res, httpStatus.CONFLICT)

    }
    catch (error) {
        console.log(error)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

    }
}
exports.findAllUserBycolumnName = async (req, res) => {
    try {
        const userFilter = await manageContact.findOne({ groupId: req.params.id })
        if (userFilter) {
            let result = []
            const columName = userFilter.arrToEnterDb.filter((item) => { result.push(item[req.body.type]) })
            console.log(columName.length <= 0)
            // if(columName.length <= 0){
            //     return response.error({message:"COLUMN_NOT_FOUND"}, res, httpStatus.CONFLICT)
            // }
            return response.success({ message: "API_SUCCESS", data: result }, res, httpStatus.OK)
        }
        return response.error({ message: "GROUP_NOT_FOUND" }, res, httpStatus.CONFLICT)


    } catch (error) {
        console.log(error)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);

    }
}
//get multiple category template api
exports.getWhatsappTemplates = async (req, res) => {
    try {
        const token = req.token
        let find;
        console.log(token)
        if (token.userType == "USER") {
            const findUser = await user.findById({ _id: token._id, status: "Active", userType: "USER" }).lean()
            if (findUser) {

                find = await whatsappTemplate.find({ categoryId:{$in : req.body.categories}}).lean()
            }

        }
        if (find) {
            return response.success({ message: "API_SUCCESS", data: find }, res, httpStatus.CREATED)

        } else {
            return response.error({ message: 'FAILED_TO_FATCH_DATA' }, res, httpStatus.ALREADY_REPORTED)

        }
    } catch (error) {
        return response.error({ message: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.getSmsTemplates = async (req, res) => {
    try {
        const token = req.token
        let find;
        console.log(token)
        if (token.userType == "USER") {
            const findUser = await user.findById({ _id: token._id, status: "Active", userType: "USER" }).lean()
            if (findUser) {

                find = await messageTemplate.find({ categoryId:{$in : req.body.categories}}).lean()
            }

        }
        if (find) {
            return response.success({ message: "API_SUCCESS", data: find }, res, httpStatus.CREATED)

        } else {
            return response.error({ message: 'FAILED_TO_FATCH_DATA' }, res, httpStatus.ALREADY_REPORTED)

        }
    } catch (error) {
        return response.error({ message: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.getEmailTemplates = async (req, res) => {
    try {
        const token = req.token
        let find;
        console.log(token)
        if (token.userType == "USER") {
            const findUser = await user.findById({ _id: token._id, status: "Active", userType: "USER" }).lean()
            if (findUser) {

                find = await template.find({ categoryId:{$in : req.body.categories}}).lean()
            }

        }
        if (find) {
            return response.success({ message: "API_SUCCESS", data: find }, res, httpStatus.CREATED)

        } else {
            return response.error({ message: 'FAILED_TO_FATCH_DATA' }, res, httpStatus.ALREADY_REPORTED)

        }
    } catch (error) {
        return response.error({ message: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.getIvrTemplates = async (req, res) => {
    try {
        const token = req.token
        let find;
        console.log(token)
        if (token.userType == "USER") {
            const findUser = await user.findById({ _id: token._id, status: "Active", userType: "USER" }).lean()
            if (findUser) {

                find = await ivrTemplate.find({ categoryId:{$in : req.body.categories}}).lean()
            }

        }
        if (find) {
            return response.success({ message: "API_SUCCESS", data: find }, res, httpStatus.CREATED)

        } else {
            return response.error({ message: 'FAILED_TO_FATCH_DATA' }, res, httpStatus.ALREADY_REPORTED)

        }
    } catch (error) {
        return response.error({ message: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}









  // if (req.params.name == "templateWithgroupId") {
            //     find = await template.find({ $and: [{ categoryId: srch }, { groupId: req.params.id }] })
            // }

            // if (req.params.name == "subUserAllCategoryTemplet") {
            //     find = await template.find({ categoryId: srch, subUserId: req.params.id })
            // }
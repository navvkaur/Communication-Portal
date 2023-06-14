const response = require("../../../utils/response")
const httpStatus = require('http-status');
const { msg } = require('../../../messages')
const schedule = require('node-schedule');
var mongoose = require('mongoose');
const ObjectId = require("mongoose/lib/types/objectid");
const emailHelper = require("../../../helper/email.helper")
const cronJob = require('node-cron')
const { Campaign } = require('../model/campaignModel')
const { DraftCampaign } = require('../model/draftcampaignmodel')
const { user } = require('../../user/model/userModel')
const { SubUser } = require('../../subUser/model/subUserModel')
const { scheduleCampaign } = require('../model/schedulecampaignModel');
const { string, object } = require("joi");
const { rules } = require("../../rules/model/rulesModel");
const ImageController = require('../../../helper/imageHelper');
const { attachment } = require("express/lib/response");
const axios = require('axios');


async function getdata(detail, data) {

    let results = []
    var regex = /{'([^'}]+)'}/g;
    while (match = regex.exec(data.content)) {
        results.push(match[1]);
    }
    if (results.length != 0) {
        let replaceWith = []
        replaceWith = await getreplaced(detail, results)
        let mail = data.content
        for (let i = 0; i < results.length; i++) {
            mail = mail.replace(results[i], replaceWith[i]);
        }

        return mail;
    }
    return data.content
}
async function getreplaced(detail, results) {
    let replaced = [];
    for (let key in detail) {
        for (let result of results) {
            if (key == result)
                replaced.push(detail[key])
        }
    }
    return replaced;
}
async function getTo(detail, type) {
    let filteredObject = Object.values(detail)
    if (type == 'Email') {

        for (let i = 0; i < filteredObject.length; i++) {
            let result = filteredObject[i]
            if (result.toString().split('').includes('@')) {
                return (result.toString().split('').join(''))
            }
        }
    }
    else if (type == 'IVR') {
        for (let i = 0; i < filteredObject.length; i++) {
            let result = filteredObject[i]
            if (result.toString().length == 10 && typeof (result) == 'number') {
                return (result)
            }
        }
    }
}
exports.sendmail = async (data) => {
    let sent;
    if (typeof (data.to[0]) == 'object') {
        for (let detail of data.to) {
            let mail = await getdata(detail, data)
            let text = mail.replace(/[{''}]/g, '')
            let to = await getTo(detail, data.categoriesType)
            let html = ''
            html += text
            let attachment = data.attachment

            sent = emailHelper.autoMail(data.from, to, data.subject, text, attachment, html);
        }
    }
    else {
        data.to = data.to[0].split(',');
        console.log(typeof (data.to), data.to)
        for (let detail in data.to) {

            let attachment = data.attachment
            sent = emailHelper.autoMail(from = data.from, to = data.to[detail], data.subject, data.content, attachment, data.content);

        }
    }
    if (sent) {
        // let userr = await user.findOne({ _id: data.userId }).lean()
        // console.log(userr)
        // let { plan } = userr
        // plan.totalEmail = plan.totalEmail - data.to.length
        // console.log(userr)
        
        // let promise1 = await user.findByIdAndUpdate({ _id: data.userId }, { $set: plan }, { new: true })
       
        const nDate = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Calcutta'
        });
        let newScheduledEmail=data.scheduledEmail-data.to.length
        const sendingEmails=await scheduleCampaign.findByIdAndUpdate({_id:data._id},{$set:{scheduledEmail:newScheduledEmail}},{new:true})
        // let promise3 = await scheduleCampaign.findByIdAndUpdate(data._id, { $set: { status: 'SENT' } }, { new: true })
        let promise2 = new Campaign({ from: data.from, to: data.to, subject: data.subject, content: data.content, status: 'SENT', categoriesType: 'Email', userId: data.userId, groupId: data.groupId, attachment: data.attachment, file: data.file, sent_at: nDate })
        // async function update() {
        //     await scheduleCampaign.findByIdAndUpdate(data._id, { $set: { status: 'SCHEDULED' } }, { new: true })
        // }

        let saveData = promise2.save()
        // console.log(nDate,data.end,data)
        // if (new Date(nDate) >= new Date(data.end))
        //     Promise.all([promise2, promise3]).then(async () => {
        //         await promise2.save()

        //         return true
        //     }).catch((err) => {
        //         console.log(err)
        //     })
    }
}
async function replaceUservariable(userVariable, data) {
    let results = []
    var regex = /{{([^}}]+)}}/g;
    while (match = regex.exec(data.content)) {
        results.push(match[1]);
    }
    if (results.length != 0) {
        let mail = data.content
        for (let i = 0; i < results.length; i++) {
            mail = mail.replace(results[i], userVariable[i]);
        }

        return mail;
    }
    return data.content
}
exports.sendCampaign = async (req, res) => {
    try {

        let to = JSON.parse(req.body.to);

        req.body.to = to;
        let Id = req.token._id
        let access = false;
        let subUser = await SubUser.findOne({ _id: mongoose.Types.ObjectId(Id), status: 'Active' }).lean() //_id
        let userr = await user.findOne({ _id: { $in: [ObjectId(Id), subUser && subUser.userId] } }).lean() //_id

        if (userr) {
            if (req.body.categoriesType == 'Email') {
                if ((!subUser) || (subUser && subUser.permission.sendEmailCampaign.send)) {
                    let { plan: { totalEmail } } = userr // change it to user
                    if (totalEmail >= to.length) {
                        access = true;
                        req.body.userId = userr._id
                        req.body.subuserId = subUser && subUser._id
                    }
                    else {
                        return response.error({ message: "INSUFFICIENT_BALANCE", error: `You need ${to.length} emails , but you have only ${totalEmail}` }, res, httpStatus.NOT_FOUND)
                    }
                }
            }
            if (req.body.categoriesType == 'IVR') {
                if ((!subUser) || (subUser && subUser.permission.sendIVRCampaign.send)) {
                    let { plan: { totalIVR } } = userr
                    if (totalIVR >= to.length) {
                        access = true;
                        req.body.userId = userr._id
                        req.body.subuserId = subUser && subUser._id
                    }
                    else {
                        return response.error({ message: "INSUFFICIENT_BALANCE", error: `You need ${to.length} IVR , but you have only ${totalIVR}` }, res, httpStatus.NOT_FOUND)
                    }
                }
            }
            if (req.body.categoriesType == 'Sms') {
                if ((!subUser) || (subUser && subUser.permission.sendSmsCampaign.send)) {
                    let { plan: { totalMessage } } = userr
                    if (totalMessage >= to.length) {
                        access = true;
                        req.body.userId = userr._id
                        req.body.subuserId = subUser && subUser._id
                    }
                    else {
                        return response.error({ message: "INSUFFICIENT_BALANCE", error: `You need ${to.length} Message , but you have only ${totalMessage}` }, res, httpStatus.NOT_FOUND)
                    }
                }
            }
            if (req.body.categoriesType == 'Whatsapp') {
                if ((!subUser) || (subUser && subUser.permission.sendWhatsappCampaign.send)) {
                    let { plan: { totalWhatsapp } } = userr
                    if (totalWhatsapp >= to.length) {
                        access = true;
                        req.body.userId = userr._id
                        req.body.subuserId = subUser && subUser._id
                    }
                    else {
                        return response.error({ message: "INSUFFICIENT_BALANCE", error: `You need ${to.length} Whatsapp , but you have only ${totalWhatsapp}` }, res, httpStatus.NOT_FOUND)
                    }
                }
            }


        }
        if (access) {
            if (req.body.userVariable) {
                let userVariable = (JSON.parse(req.body.userVariable))
                let d = await replaceUservariable(userVariable, req.body)
                d = d.replace(/[{''}]/g, '')

                req.body.content = d;
            }
            if (req?.files?.attachment) {
                let fileDetails = req.files.attachment
                let uploadAttachment = []
                for (let i = 0; i < fileDetails.length; i++) {
                    let name = fileDetails[i].filename
                    let uploadCategory = await ImageController.fileUpload(fileDetails[i].filename,
                        fileDetails[i].destination,
                        fileDetails[i].mimetype,
                        '/');


                    uploadAttachment.push({ filename: fileDetails[i].filename, path: uploadCategory.Location })

                }

                req.body.attachment = uploadAttachment
            }

            if (req?.files?.audioFile) {

                let fileDetails = req.files.audioFile
                console.log(fileDetails)
                let uploadCategory = await ImageController.fileUpload(fileDetails[0].filename,
                    fileDetails[0].destination,
                    fileDetails[0].mimetype,
                    '/')

                req.body.audioFile = uploadCategory.Location
            }

            let addcampaign = new Campaign(req.body)
            let data = await addcampaign.save()
            if (data) {
                let sent;
                if (data.categoriesType == 'Email') {

                    if (typeof (data.to[0]) == 'object') {
                        for (let detail of data.to) {
                            let mail = await getdata(detail, data)
                            let text = mail.replace(/[{''}]/g, '')
                            let to = await getTo(detail, data.categoriesType)
                            let html = text
                            let attachment = data.attachment

                            sent = emailHelper.autoMail(data.from, to, data.subject, text, attachment, html)

                        }
                    }
                    else {

                        // console.log(typeof (data.to), data.to)
                        for (let detail in data.to) {

                            let attachment = data.attachment
                            sent = emailHelper.autoMail(from = data.from, to = data.to[detail], data.subject, data.content, attachment, data.content)

                        }
                    }


                    if (sent) {
                        let { plan } = userr
                        plan.totalEmail = plan.totalEmail - data.to.length
                        console.log(plan)
                        const nDate = new Date().toLocaleString('en-US', {
                            timeZone: 'Asia/Calcutta'
                        });
                        let promise1 = user.findByIdAndUpdate(req.body.userId, { $set: { plan: plan } }, { new: true })
                        let promise2 = Campaign.findByIdAndUpdate(data._id, { $set: { status: 'SENT', sent_at: nDate } }, { new: true })
                        let [updateUser, updateCampaign] = await Promise.all([promise1, promise2]);
                        if (updateUser && updateCampaign) {
                            return response.success({ message: " Sent Succesfully", }, res, httpStatus.CREATED)
                        }
                        else {
                            return response.error({ message: "FAILED_TO_FETCH_DATA" }, res, httpStatus.FORBIDDEN)
                        }

                    }
                }
                else {

                    return response.error({ message: 'FAILED_TO_SEND' }, res, httpStatus.FORBIDDEN)
                }



            }
            if (data.categoriesType == 'IVR') {
                let sent;
                if (typeof (data.to[0]) == 'object') {
                    for (let detail of data.to) {
                        let content = await getdata(detail, data)
                        let text = content.replace(/[{''}]/g, '')
                        let to = await getTo(detail)
                        const sms_text = '<#> Dear User, Your Auro scholar OTP is ' + "1234" + '. Use this to verify your mobile number. AURO-SCHOLAR\n2hf23mGvrVO';
                        const sms_text_encode = encodeURIComponent(text);
                        sent = axios.get(`http://www.smsjust.com/blank/sms/user/urlsms.php?username=${process.env.sms_user}&pass=${process.env.sms_pass}&senderid=${process.env.sms_senderid}&dest_mobileno=${to}&message=${sms_text_encode}&response=Y&dlttempid=${process.env.template_id}`)
                        if (sent) {
                            if (sent) {
                                let userr = await user.findOne({ _id: req.body.userId })
                                let { plan } = userr
                                plan.totalIVR = plan.totalIVR - 1
                                let update_email = await user.findByIdAndUpdate(req.body.userId, { $set: plan }, { new: true })
                                const nDate = new Date().toLocaleString('en-US', {
                                    timeZone: 'Asia/Calcutta'
                                });
                                let promise2 = await Campaign.findByIdAndUpdate(data._id, { $set: { status: 'SENT', sent_at: nDate } }, { new: true })
                                if (promise2) {
                                    return response.success({ message: " Sent Succesfully", }, res, httpStatus.CREATED)
                                }
                                else {
                                    return response.error({ message: "FAILED_TO_FETCH_DATA" }, res, httpStatus.FORBIDDEN)
                                }
                            }
                        }

                        else {
                            data.to = data.to[0].split(',');
                            for (let detail in data.to) {
                                console.log(data.to[detail])
                                const sms_text = '<#> Dear User, Your Auro scholar OTP is ' + "1234" + '. Use this to verify your mobile number. AURO-SCHOLAR\n2hf23mGvrVO';
                                const sms_text_encode = encodeURIComponent(sms_text);
                                let curl = `http://www.smsjust.com/blank/sms/user/urlsms.php?username=${process.env.sms_user}&pass=${process.env.sms_pass}&senderid=${process.env.sms_senderid}&dest_mobileno=${data.to[detail]}&message=${sms_text_encode}&response=Y&dlttempid=${process.env.template_id}`
                                console.log(curl)
                                sent = axios.get(curl)
                                if (sent) {
                                    let userr = await user.findOne({ _id: req.body.userId })
                                    let { plan } = userr
                                    plan.totalIVR = plan.totalIVR - 1
                                    let update_email = await user.findByIdAndUpdate(req.body.userId, { $set: plan }, { new: true })
                                    const nDate = new Date().toLocaleString('en-US', {
                                        timeZone: 'Asia/Calcutta'
                                    });
                                    let promise2 = await Campaign.findByIdAndUpdate(data._id, { $set: { status: 'SENT', sent_at: nDate } }, { new: true })
                                    if (promise2) {
                                        return response.success({ message: " Sent Succesfully", }, res, httpStatus.CREATED)
                                    }
                                    else {
                                        return response.error({ message: "FAILED_TO_FETCH_DATA" }, res, httpStatus.FORBIDDEN)
                                    }
                                }
                                else {

                                    return response.error({ message: 'FAILED_TO_SEND' }, res, httpStatus.FORBIDDEN)
                                }
                            }
                        }
                    }

                }






            }
        }
        else {
            console.log('Data_NOTA_FOUND')
            return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
        }
    }
    catch (error) {
        console.log(error.message)
        return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message, });
    }
}
exports.getDrafts = async (req, res) => {
    try {

        let loginId = req.token._id// user or subuser _id 
        let auth = await user.findOne({ _id: ObjectId(loginId), status: 'Active' }) //_id

        if (auth) {
            let result = await DraftCampaign.find({ userId: ObjectId(loginId) })

            if (result) {
                return response.success({ message: "API_SUCCESS", data: result }, res, httpStatus.OK)
            }
            else {
                return response.error({ message: "FAILED_TO_FETCH_DATA" }, res, httpStatus.FORBIDDEN)
            }
        }
        if (!auth) {

            let auth = await SubUser.findOne({ _id: mongoose.Types.ObjectId(loginId), status: 'Active' }) //_id

            if (auth) {

                let result = await DraftCampaign.find({ subuserId: ObjectId(loginId) })

                if (result) {
                    return response.success({ message: "API_SUCCESS", data: result }, res, httpStatus.OK)
                }
                else {
                    return response.error({ message: "FAILED_TO_FETCH_DATA" }, res, httpStatus.FORBIDDEN)
                }

            }
            else {
                console.log('Data_NOTA_FOUND')
                response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
            }

        }



    }
    catch (error) {
        console.log(error.message)
        return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message, });
    }
}

exports.draftCampaign = async (req, res) => {
    try {

        let Id = req.token._id // user or subuser _id
        let access = false;
        let auth = await user.findOne({ _id: ObjectId(Id) }) //_id
        console.log(req.files)
        if (auth) {
            req.body.userId = Id
            access = true;
        }
        if (!auth) {

            let auth = await SubUser.findOne({ _id: mongoose.Types.ObjectId(Id), status: 'Active' }) //_id
            if (auth) {
                if (req.body.categoriesType == 'Email') {
                    let { permission: { sendEmailCampaign } } = auth
                    if (sendEmailCampaign.send) {
                        access = true;
                        req.body.userId = auth.userId
                        req.body.subuserId = Id
                    }
                }
                if (req.body.categoriesType == 'IVR') {
                    let { permission: { sendIVRCampaign } } = auth

                    if (sendIVRCampaign) {
                        access = true;
                        req.body.userId = auth.userId
                        req.body.subuserId = Id
                    }
                }
                if (req.body.categoriesType == 'Sms') {
                    let { permission: { sendSmsCampaign } } = auth

                    if (sendSmsCampaign.send) {
                        access = true;
                        req.body.userId = auth.userId
                        req.body.subuserId = Id
                    }
                }
                if (req.body.categoriesType == 'Whatsapp') {
                    let { permission: { sendWhatsappCampaign } } = auth

                    if (sendWhatsappCampaign.send) {
                        access = true;
                        req.body.userId = auth.userId
                        req.body.subuserId = Id
                    }
                }
            }
            else {
                console.log('Data_NOTA_FOUND')
                return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
            }
        }
        if (access) {
            if (req?.files?.attachment) {
                let fileDetails = req.files.attachment
                let uploadAttachment = []
                for (let i = 0; i < fileDetails.length; i++) {
                    let name = fileDetails[i].filename
                    let uploadCategory = await ImageController.fileUpload(fileDetails[i].filename,
                        fileDetails[i].destination,
                        fileDetails[i].mimetype,
                        '/');
                    uploadAttachment.push({ filename: fileDetails[i].filename, path: uploadCategory.Location })
                }

                req.body.attachment = uploadAttachment

            }

            if (req?.files?.audioFile) {

                let fileDetails = req.files.audioFile
                console.log(fileDetails)
                let uploadCategory = await ImageController.fileUpload(fileDetails[0].filename,
                    fileDetails[0].destination,
                    fileDetails[0].mimetype,
                    '/')

                req.body.audioFile = uploadCategory.Location
            }
            req.body.to = JSON.parse(req.body.to)
            let adddraft = new DraftCampaign(req.body)
            let data = await adddraft.save()
            if (data) {
                return response.success({ message: "Mail saved Succesfully", }, res, httpStatus.CREATED)
            }

            else {
                return response.error({ message: 'FAILED_TO_DRAFT_MAIL' }, res, httpStatus.FORBIDDEN)
            }
        }
        else {
            console.log('Data_NOTA_FOUND')
            return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
        }
    }


    catch (error) {
        console.log(error.message)
        return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message, });
    }
}
exports.scheduleyearly = async (data) => {
    let startdate = Date.parse(data.startDate);
    let endDate = Date.parse(data.endDate);
    let time = data.time;
    const [hrs, mins] = time.split(':');
    const nDate = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Calcutta'
    });
    let end = new Date(nDate)
    if (end <= endDate && end >= startdate) {
        if (new Date(startdate).getMonth() == end.getMonth() && new Date(startdate).getDate() == end.getDate()) {
            if (hrs == end.getHours() && mins == end.getMinutes()) {
                return true;
            }
            else return false;
        }
        else return false;
    }
    else return false;
}
exports.schedulemonthly = async (data) => {
    let startdate = Date.parse(data.startDate);
    let endDate = Date.parse(data.endDate);
    let time = data.time;
    const [hrs, mins] = time.split(':');
    const nDate = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Calcutta'
    });
    let end = new Date(nDate)

    if (end <= endDate && end >= startdate) {
        console.log(new Date(startdate).getDate())
        console.log(end.getDate())
        if (new Date(startdate).getDate() == end.getDate()) {
            console.log(end.getHours())
            console.log(end.getMinutes())
            if (hrs == end.getHours() && mins == end.getMinutes()) {

                return true;
            }
            else return false;
        }
        else return false;
    }
    else return false;

}
exports.schedulesame = async (data) => {
    let startdate = Date.parse(data.startDate);
    let endDate = Date.parse(data.endDate);
    let daysofweek = data.daysofweek;
    let time = data.time;
    const [hrs, mins] = time.split(':');
    const nDate = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Calcutta'
    });
    let end = new Date(nDate)
    let arr = Object.values(daysofweek)


    if (end <= endDate && end >= startdate) {

        for (let i = 0; i < arr.length; i++) {
            //console.log(arr[i], i, end.getDay())
            if (arr[i] == true && i == end.getDay()) {
                console.log(end.getHours())
                console.log(end.getMinutes())

                if (hrs == end.getHours() && mins == end.getMinutes()) {

                    return true;
                }
                else
                    return false;
            }

        }

    }
    else
        return false;
}

exports.schedulee = async (data) => {
    let startdate = data.startDate;
    const [year, month, date] = startdate.split('-');
    let time = data.time;
    const [hrs, mins] = time.split(':');
    const nDate = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Calcutta'
    });
    let end = new Date(nDate)

    if (end.getMonth() == month - 1 && end.getDate() == date && end.getFullYear() == year) {
        console.log(end.getHours())
        console.log(end.getMinutes())

        if (hrs == end.getHours() && mins == end.getMinutes()) {
            return true;
        }
        else
            return false;
    }
    else
        return false;
}

// schedule email 
exports.schedule = async (req, res) => {

 
    try {
        let to = JSON.parse(req.body.to);
        let totalSendCount;
        req.body.to = to;
        let Id = req.token._id
        let access = false;
        let subUser = await SubUser.findOne({ _id: mongoose.Types.ObjectId(Id), status: 'Active' }).lean() //_id
        let userr = await user.findOne({ _id: { $in: [ObjectId(Id), subUser && subUser.userId] } }).lean() //_id

        if (userr) {

            if (req.body.categoriesType == 'Email') {
                if ((!subUser) || (subUser && subUser.permission.sendEmailCampaign.send)) {
                    let { plan: { totalEmail } } = userr // change it to user
                    if (req.body.every == "month") {
                        const startDate = new Date(req.body.startDate);
                        const endDate = new Date(req.body.endDate);

                        // Calculate the number of months between start and end date
                        const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                            (endDate.getMonth() - startDate.getMonth());
                        totalSendCount = to.length * monthsDiff
                        if (totalEmail >= totalSendCount) {
                            access = true;
                            req.body.userId = userr._id
                            req.body.subuserId = subUser && subUser._id

                            //****************************************
                            //********************************************* 
                        }
                        else {
                            return response.error({ message: "INSUFFICIENT_BALANCE", error: `You need ${totalSendCount} emails , but you have only ${totalEmail}` }, res, httpStatus.NOT_FOUND)

                        }

                    }
                    else if (req.body.every == "year") {
                        const startDate = new Date(req.body.startDate);
                        const endDate = new Date(req.body.endDate);
                        const yearsDiff = endDate.getFullYear() - startDate.getFullYear();
                        console.log(yearsDiff);
                        totalSendCount = to.length * yearsDiff
                        if (totalEmail >= totalSendCount) {
                            access = true;
                            req.body.userId = userr._id
                            req.body.subuserId = subUser && subUser._id
                        }
                        else {
                            return response.error({ message: "INSUFFICIENT_BALANCE", error: `You need ${totalSendCount} emails , but you have only ${totalEmail}` }, res, httpStatus.NOT_FOUND)

                        }

                    }
                    else if (req.body.every == "week"|| req.body.every=="") {
                        // Define the start and end dates
                        if(req.body.every==""){
                            req.body.every="week"
                        }
                        const startDate = new Date(req.body.startDate);
                        const endDate = new Date(req.body.endDate);
                        console.log(startDate, endDate)
                        startDate.setMonth(startDate.getMonth() - 1);
                        endDate.setMonth(endDate.getMonth() - 1);
                        console.log(startDate, endDate)
                        // Define the dictionary of days
                        const daysDict = JSON.parse(req.body.daysofweek)
                        console.log(daysDict)
                        // Count the number of true days within the date range
                        let count = 0;
                        let currentDate = new Date(startDate);

                        while (currentDate <= endDate) {
                            const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                            if (daysDict[dayOfWeek]) {
                                count++;
                            }
                            currentDate.setDate(currentDate.getDate() + 1);
                        }
                        console.log("Number of true days:", count);

                        totalSendCount = to.length * count
                        if (totalEmail >= totalSendCount) {
                            access = true;
                            req.body.userId = userr._id
                            req.body.subuserId = subUser && subUser._id
                        }
                        else {
                            return response.error({ message: "INSUFFICIENT_BALANCE", error: `You need ${totalSendCount} emails , but you have only ${totalEmail}` }, res, httpStatus.NOT_FOUND)

                        }
                    }
                    else{
                        return response.error({ message: " INVALID_CREDENTIALS", }, res, httpStatus.UNAUTHORIZED)

                    } 
                    let newMailUse=totalEmail-totalSendCount
                   req.body.scheduledEmail= totalSendCount
                    let update=await user.findOneAndUpdate({_id:userr._id},{$set:{"plan.totalEmail":newMailUse}},{new:true})

                    // ======================
                    //  if (totalEmail >= to.length) {
                    //     access = true;
                    //     req.body.userId = userr._id
                    //     req.body.subuserId = subUser && subUser._id
                    // }
                    // else {
                    //     return response.error({ message: "INSUFFICIENT_BALANCE", error: `You need ${to.length} emails , but you have only ${totalEmail}` }, res, httpStatus.NOT_FOUND)
                    // } 
                }
            }
            if (req.body.categoriesType == 'IVR') {
                if ((!subUser) || (subUser && subUser.permission.sendIVRCampaign.send)) {
                    let { plan: { totalIVR } } = userr
                    if (totalIVR >= to.length) {
                        access = true;
                        req.body.userId = userr._id
                        req.body.subuserId = subUser && subUser._id
                    }
                    else {
                        return response.error({ message: "INSUFFICIENT_BALANCE", error: `You need ${to.length} IVR , but you have only ${totalIVR}` }, res, httpStatus.NOT_FOUND)
                    }
                }
            }
            if (req.body.categoriesType == 'Sms') {
                if ((!subUser) || (subUser && subUser.permission.sendSmsCampaign.send)) {
                    let { plan: { totalMessage } } = userr
                    if (totalMessage >= to.length) {
                        access = true;
                        req.body.userId = userr._id
                        req.body.subuserId = subUser && subUser._id
                    }
                    else {
                        return response.error({ message: "INSUFFICIENT_BALANCE", error: `You need ${to.length} Message , but you have only ${totalMessage}` }, res, httpStatus.NOT_FOUND)
                    }
                }
            }
            if (req.body.categoriesType == 'Whatsapp') {
                if ((!subUser) || (subUser && subUser.permission.sendWhatsappCampaign.send)) {
                    let { plan: { totalWhatsapp } } = userr
                    if (totalWhatsapp >= to.length) {
                        access = true;
                        req.body.userId = userr._id
                        req.body.subuserId = subUser && subUser._id
                    }
                    else {
                        return response.error({ message: "INSUFFICIENT_BALANCE", error: `You need ${to.length} Whatsapp , but you have only ${totalWhatsapp}` }, res, httpStatus.NOT_FOUND)
                    }
                }
            }

        }
        if (access) {

            if (req.body.userVariable) {
                let userVariable = (JSON.parse(req.body.userVariable))
                let d = await replaceUservariable(userVariable, req.body)
                d = d.replace(/[{''}]/g, '')
                req.body.content = d;
            }
            if (req.body.every == '')
                req.body.every = 'week'

            let daysofweek = JSON.parse(req.body.daysofweek)
            let count = 0;
            for (const key in daysofweek) {
                if (daysofweek[key] == true)
                    count++;
            }

            if (count == 0)
                req.body.daysofweek = `{"sunday":true,"monday":true,"tuesday":true,"wednesday":true,"thursday":true,"friday":true,"saturday":true}`
            console.log(req.body.daysofweek)
            if (req.body.daysofweek != undefined) {
                let daysofweek = JSON.parse(req.body.daysofweek)
                req.body.daysofweek = daysofweek;
            }

            if (req?.files?.attachment) {
                let fileDetails = req.files.attachment
                let uploadAttachment = []
                for (let i = 0; i < fileDetails.length; i++) {
                    let name = fileDetails[i].filename
                    let uploadCategory = await ImageController.fileUpload(fileDetails[i].filename,
                        fileDetails[i].destination,
                        fileDetails[i].mimetype,
                        '/');

                    uploadAttachment.push({ filename: name, path: uploadCategory.Location })

                }

                req.body.attachment = uploadAttachment
            }
            if (req?.files?.audioFile) {

                let fileDetails = req.files.audioFile
                console.log(fileDetails)
                let uploadCategory = await ImageController.fileUpload(fileDetails[0].filename,
                    fileDetails[0].destination,
                    fileDetails[0].mimetype,
                    '/')

                req.body.audioFile = uploadCategory.Location
            }
            
            let schedulecampaign = new scheduleCampaign(req.body)

            await schedulecampaign.save() 
            // let userr = await user.findOne({ _id: req.body.userId }).lean()
            // console.log(userr)
            // let { plan } = userr
            // plan.totalEmail = plan.totalEmail - totalSendCount
            // console.log(plan)
            // let promise1 = await user.findByIdAndUpdate({_id:userr._id}, { $set: plan }, { new: true })
            return response.success({ message: "Scheduled Successfully" }, res, httpStatus.CREATED)
        }
        else {
            console.log('Data_NOTA_FOUND')
            return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
        }

    }

    catch (error) {
        console.log(error.message)
        return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message, });
    }

}
exports.deleteschedule = async (req, res) => {
    try {
        let token = req.token._id// user or subuser _id
        console.log(token)
        let deleteaccess = false;
        let auth = await user.findOne({ _id: ObjectId(token) })
        console.log(auth)
        if (auth && auth._id == token) {
            deleteaccess=true
        }
        if (!auth) {

            let auth = await SubUser.findOne({ _id:token, status: 'Active' }) //_id
            if (auth && auth._id == token) {
               
                let checkPermission = await scheduleCampaign.findById({ _id:req.params.id })
                if (checkPermission.categoriesType == 'Email') {
                    let { permission: { sendEmailCampaign } } = auth
                    if (sendEmailCampaign.send) {
                        deleteaccess = true;
                    }
                }
                else if (req.body.categoriesType == 'IVR') {
                    let { permission: { sendIVRCampaign } } = auth

                    if (sendIVRCampaign) {
                        let id = req.params.id;
                        deleteaccess = true;
                    }
                }
                else if (req.body.categoriesType == 'Sms') {
                    let { permission: { sendSmsCampaign } } = auth

                    if (sendSmsCampaign.send) {
                        let id = req.params.id;
                        deleteaccess = true;
                    }
                }
                else if (req.body.categoriesType == 'Whatsapp') {
                    let { permission: { sendWhatsappCampaign } } = auth

                    if (sendWhatsappCampaign.send) {
                        let id = req.params.id;
                        deleteaccess = true;
                    }
                }
                else {
                    return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message, });
                } 
            }
        }
                if (deleteaccess) {
                    const findScheduling= await scheduleCampaign.findById({_id:req.params.id}).lean()
                    if(findScheduling){
                      if(findScheduling.scheduledEmail){
                        let newMail=findScheduling.scheduledEmail
                        let sendLeftEmail= user.findOneAndUpdate({_id:findScheduling.userId},{ $inc: { "plan.totalEmail": newMail } },{new:true})
                        const deleteScheduled= scheduleCampaign.findByIdAndDelete({_id:req.params.id})
                        await Promise.all([sendLeftEmail,deleteScheduled])
                        return response.success({ message: "Schedule Deleted Succesfully" }, res, httpStatus.OK)  
                    }
                    
                    //if(findScheduling.scheduledWhatsapp){

                    // }
                }
                else {
                 
                    return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
                }
            }
    }
    catch (error) {
        console.log(error.message)
        return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message, });
    }

}
exports.deletesent = async (req, res) => {
    try {

        let loginId = req.token._id// user or subuser _id
        //console.log(loginId)
        let auth = await user.findOne({ _id: ObjectId(loginId) })
        // console.log(auth)
        if (auth && auth._id == loginId) {
            let id = req.params.id;
            let del = await Campaign.deleteOne({ _id: id }).then((result) => {
                return response.success({ message: "Schedule Deleted Succesfully" }, res, httpStatus.OK)
            }).catch(err => {
                console.log(err)
                throw new Error(err)
            })


        }
        if (!auth) {

            let auth = await SubUser.findOne({ _id: mongoose.Types.ObjectId(loginId), status: 'Active' }) //_id
            if (auth && auth._id == loginId) {
                let deleteaccess = false;
                let d = await Campaign.findById({ _id })
                if (d.categoriesType == 'Email') {
                    let { permission: { sendEmailCampaign } } = auth
                    if (sendEmailCampaign.send) {
                        let id = req.params.id;
                        deleteaccess = true;
                    }
                }
                else if (req.body.categoriesType == 'IVR') {
                    let { permission: { sendIVRCampaign } } = auth

                    if (sendIVRCampaign) {
                        let id = req.params.id;
                        deleteaccess = true;
                    }
                }
                else if (req.body.categoriesType == 'Sms') {
                    let { permission: { sendSmsCampaign } } = auth

                    if (sendSmsCampaign.send) {
                        let id = req.params.id;
                        deleteaccess = true;
                    }
                }
                else if (req.body.categoriesType == 'Whatsapp') {
                    let { permission: { sendWhatsappCampaign } } = auth

                    if (sendWhatsappCampaign.send) {
                        let id = req.params.id;
                        deleteaccess = true;
                    }
                }


                else {
                    return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message, });
                }

                if (deleteaccess) {
                    let del = await Campaign.deleteOne({ _id: id }).then((result) => {
                        return response.success({ message: "Schedule Deleted Succesfully" }, res, httpStatus.OK)
                    }).catch(err => {
                        console.log(err)
                        throw new Error(err)
                    })

                }
                else {

                    return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
                }
            }


        }

    }
    catch (error) {
        console.log(error.message)
        return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message, });
    }

}
exports.getpendingschedules = async (req, res) => {
    try {

        let loginId = req.token._id // user or subuser _id 
        let auth = await user.findOne({ _id: ObjectId(loginId) }) //_id

        if (auth) {
            let result = await scheduleCampaign.find({ status: 'SCHEDULED', userId: ObjectId(loginId) })

            if (result) {
                return response.success({ message: "API_SUCCESS", data: result }, res, httpStatus.OK)
            }
            else {

                return response.error({ message: "FAILED_TO_FETCH_DATA" }, res, httpStatus.FORBIDDEN)
            }
        }
        if (!auth) {

            let auth = await SubUser.findOne({ _id: mongoose.Types.ObjectId(loginId), status: 'Active' }) //_id

            if (auth) {

                let result = await scheduleCampaign.find({ status: 'SCHEDULED', subuserId: ObjectId(loginId) })

                if (result) {
                    return response.success({ message: "API_SUCCESS", data: result }, res, httpStatus.OK)
                }
                else {
                    return response.error({ message: "FAILED_TO_FETCH_DATA" }, res, httpStatus.FORBIDDEN)
                }

            }
            else {
                console.log('Data_NOTA_FOUND')
                return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
            }

        }



    }
    catch (error) {
        console.log(error.message)
        return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message, });
    }

}
exports.getsentschedules = async (req, res) => {
    try {

        let loginId = req.token._id // user or subuser _id 
        let auth = await user.findOne({ _id: ObjectId(loginId) }) //_id

        if (auth) {
            let result = await Campaign.find({ status: 'SENT', userId: ObjectId(loginId) })

            if (result) {
                return response.success({ message: "API_SUCCESS", data: result }, res, httpStatus.OK)
            }
            else {
                return response.error({ message: "FAILED_TO_FETCH_DATA" }, res, httpStatus.FORBIDDEN)
            }
        }
        if (!auth) {

            let auth = await SubUser.findOne({ _id: mongoose.Types.ObjectId(loginId), status: 'Active' }) //_id

            if (auth) {
                let result = await Campaign.find({ status: 'SENT', subuserId: ObjectId(loginId) })

                if (result) {
                    return response.success({ message: "API_SUCCESS", data: result }, res, httpStatus.OK)
                }
                else {
                    return response.error({ message: "FAILED_TO_FETCH_DATA" }, res, httpStatus.FORBIDDEN)
                }
            }
            else {
                console.log('Data_NOTA_FOUND')
                return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
            }

        }




    } catch (error) {
        return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message, });
    }
}
exports.editschedule = async (req, res) => {
    try {
        let Id = req.token._id // user or subuser _id
        let access = false;
        let id = req.params.id;
        let auth = await user.findOne({ _id: ObjectId(Id) }) //_id

        if (auth) {

            access = true;
        }
        if (!auth) {

            let auth = await SubUser.findOne({ _id: mongoose.Types.ObjectId(Id), status: 'Active' }) //_id
            let { permission: { sendEmailCampaign } } = auth
            if (sendEmailCampaign.send) {
                access = true;
            }
        }
        if (access) {

            if (req?.files?.attachment) {
                let findResult = await scheduleCampaign.findById({ _id: id })
                let imageUrl = findResult.attachment
                if (imageUrl) {
                    for (let i = 0; i < imageUrl.length; i++) {
                        console.log(imageUrl[i])
                        var url = await imageUrl[i].path.split('/');
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
            let d = await scheduleCampaign.findByIdAndUpdate({ _id: id }, { $set: req.body }, { new: true })
            if (d) {
                return response.success({ message: "Schedule changed Succesfully" }, res, httpStatus.OK)
            }

            else {
                console.log('Data_NOTA_FOUND')
                return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
            }

        }
    }
    catch (error) {
        console.log(error.message)
        return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message, });
    }
}
////////////


exports.getDraft = async (req, res) => {
    try {
        let id = req.params.id
        let result = await DraftCampaign.findOne({ _id: id })
        if (result) {
            return response.success({ message: "API_SUCCESS", data: result }, res, httpStatus.OK)
        }
        else {
            return response.error({ message: "FAILED_TO_FETCH_DATA" }, res, httpStatus.FORBIDDEN)
        }
    }
    catch (error) {
        console.log(error.message)
        return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message });
    }
}
//this api changes is pending
exports.getsent = async (req, res) => {
    try {
        let id = req.params.id
        let result = await Campaign.findOne({ _id: id })
        if (result) {
            return response.success({ message: "API_SUCCESS", data: result }, res, httpStatus.OK)
        }
        else {
            return response.error({ message: "FAILED_TO_FETCH_DATA" }, res, httpStatus.FORBIDDEN)
        }
    }
    catch (error) {
        console.log(error.message)
        return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message });
    }
}
//this one also
exports.getschedule = async (req, res) => {
    try {
        let id = req.params.id
        let result = await scheduleCampaign.findOne({ _id: id })
        if (result) {
            return response.success({ message: "API_SUCCESS", data: result }, res, httpStatus.OK)
        }
        else {
            return response.error({ message: "FAILED_TO_FETCH_DATA" }, res, httpStatus.FORBIDDEN)
        }
    }
    catch (error) {
        console.log(error.message)
        return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message });
    }
}
exports.emailcount = async (req, res) => {
    try {
        let result = await rules.find({ groupId: req.params.groupid, validation: 'email' })
        if (result) {
            return response.success({ message: "API_SUCCESS", data: result }, res, httpStatus.OK)
        }
        else {
            return response.error({ message: "FAILED_TO_FETCH_DATA" }, res, httpStatus.FORBIDDEN)
        }
    }
    catch (error) {
        console.log(error.message)
        return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message });
    }
}
exports.deleteDraft = async (req, res) => {
    try {
        let loginId = req.token._id// user or subuser _id
        console.log(loginId)
        let auth = await user.findOne({ _id: ObjectId(loginId) })

        if (auth) {
            let id = req.params.id;
            let del = await DraftCampaign.deleteOne({ _id: id }).then((result) => {
                return response.success({ message: "Schedule Deleted Succesfully" }, res, httpStatus.OK)
            }).catch(err => {
                console.log(err)
                throw new Error(err)
            })


        }
        if (!auth) {

            let auth = await SubUser.findOne({ _id: mongoose.Types.ObjectId(loginId), status: 'Active' }) //_id
            let { permission: { sendEmailCampaign } } = auth
            if (sendEmailCampaign.send) {
                let id = req.params.id;
                console.log("--------->", id)
                let del = await DraftCampaign.deleteOne({ _id: id }).then((result) => {
                    return response.success({ message: "Schedule Deleted Succesfully" }, res, httpStatus.OK)
                }).catch(err => {
                    console.log(err)
                    throw new Error(err)
                })

            }

            else {

                return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
            }
        }

    }
    catch (error) {
        console.log(error.message)
        return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message });
    }
}


exports.editDraft = async (req, res) => {
    try {

    }
    catch (error) {
        console.log(error.message)
        return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message });
    }
}
// module.exports={
//     sendmail,
// }

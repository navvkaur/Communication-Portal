const response = require("../../../utils/response")
const httpStatus = require('http-status');
const { rules } = require('../model/rulesModel')
exports.addRules = async (req, res) => {
    let data = req.body;
    console.log(data)
    try {

        let data = req.body
        console.log(data)

        let mongoData = await rules.insertMany(req.body)
        if (mongoData) {
            return response.success({ message: "RULES_ADDED", data: mongoData }, res, httpStatus.CREATED)
        } else {
            return response.error({ message: 'FAILED_TO_ADD_DATA' }, res, httpStatus.FORBIDDEN)
        }

    } catch (error) {
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR', data: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.deleteRules = async (req, res) => {
    const data = req.body
    const result = await rules.findByIdAndDelete({ _id: req.params.id })
    console.log(result)
    if (result) {
        return response.success({ message: "DELETED" }, res, httpStatus.OK)
    }
    else {
        return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.FORBIDDEN)

    }
}
exports.getRulesByGroupID = async (req, res) => {
    try {
        const user = await rules.find({ groupId: req.params.id });
        if (!user) {
            return response.error({ message: 'FAILED_TO_FATCH_DATA' }, res, httpStatus.ALREADY_REPORTED)
        } else {
            return response.success({ message: 'API_SUCCESS', data: user }, res, httpStatus.OK)
        }
    } catch (error) {
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.updateRule = async (req, res) => {
    try {
        let data = req.body
        let find = await rules.find({ groupId: req.params.id })
        console.log(find)
        let arr = []
        let arr1 = []
        for (let i = 0; i < data.length; i++) {
            console.log(data[i])
            let id = data[i]._id
            if (id) {

                var update = await rules.findByIdAndUpdate({
                    _id: id
                },
                    data[i],
                    { new: true })
                console.log(update)
                arr.push(update)
                console.log(find)
            }
            else {
                console.log(data[i])
                let m = await rules.create(data[i])
                arr1.push(m)
            }


        }

        let mongoData = [...arr1, ...arr]
        console.log(mongoData)
        if (mongoData) {
            return response.success({ message: "P_UPDATE", data: mongoData }, res, httpStatus.CREATED)
        } else {
            return response.error({ message: 'UPDATE_ERROR' }, res, httpStatus.FORBIDDEN)
        }

    } catch (error) {
        console.log(error.message)
        return response.error({ msgCode: 'INTERNAL_SERVER_ERROR', message: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);

    }

} 

const response = require("../../../utils/response")
const httpStatus = require('http-status');
const { manageGroup } = require('../model/groupModel')
const { rules } = require('../../rules/model/rulesModel')
const { manageContact } = require("../../manageContact/model/model");
const mongoose = require('mongoose')
const { user } = require('../../user/model/userModel')
const { SubUser } = require('../../subUser/model/subUserModel')
const ObjectId = require("mongoose/lib/types/objectid");
const xlxs = require('xlsx');

exports.addGroup = async (req, res) => {
  let data = req.body;
  console.log(data)
  try {
    let Id = req.token._id // user or subuser _id
    let access = false;
    let auth = await user.findOne({ _id: ObjectId(Id) }) //_id

    if (auth) {
      req.body.userId = Id
      access = true;
    }
    if (!auth) {

      let auth = await SubUser.findOne({ _id: mongoose.Types.ObjectId(Id), status: 'Active' }) //_id
      if (auth) {

        let { permission: { createGroup: { create } } } = auth
        if (create == true) {
          access = true;
          req.body.userId = auth.userId
          req.body.subuserId = Id
        }
      }
      else {
        console.log('Data_NOTA_FOUND')
        return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
      }
    }
    if (access) {
      let result = await manageGroup.findOne({
        $and: [{ userId: req.body.userId },
        { groupName: req.body.groupName }]
      })
      if (result) {
        console.log("duplicate value")
        return response.error({ message: 'DUPLICATE' }, res, httpStatus.ALREADY_REPORTED)

      }
      else {
        let addGroup = new manageGroup(req.body)
        let mongoData = await addGroup.save()
        if (mongoData) {
          return response.success({ message: "GROUP_ADDED", data: mongoData }, res, httpStatus.CREATED)
        } else {
          return response.error({ message: 'FAILED_TO_ADD_DATA' }, res, httpStatus.FORBIDDEN)
        }
      }
    }
    else {
      console.log('Data_NOTA_FOUND')
      return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
    }



  } catch (error) {
    console.log("error________________________________", error)
    return response.error({ msgCode: 'INTERNAL_SERVER_ERROR', data: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);
  }
}
exports.updateGroup = async (req, res) => {
   
  try {
    let Id = req.token._id // user or subuser _id
    let data = req.body
    let update;
    let auth = await user.findOne({ _id: ObjectId(Id) }) //_id

    if (auth) {
       update = await manageGroup.findByIdAndUpdate({
        _id: req.params.id, userId : Id
      },
        data,
        { new: true })
  
    }
    if (!auth) {

      let auth = await SubUser.findOne({ _id: mongoose.Types.ObjectId(Id), status: 'Active' }) //_id
      if (auth) {
        update = await manageGroup.findOneAndUpdate({
          _id: req.params.id, subuserId : Id
        },
          data,
          { new: true })
         if(!update){
          let { permission: { createGroup: { subGroup } } } = auth
          console.log(subGroup,req.params.id)
              if(subGroup.includes(req.params.id)){
                update = await manageGroup.findByIdAndUpdate({
                  _id: req.params.id
                },
                  data,
                  { new: true })
              }
              else{
                console.log('Data_NOTA_FOUND')
                return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
              }
         }
      }
      else {
        console.log('Data_NOTA_FOUND')
        return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
      }
    }
    
    if (update) {
      return response.success({ message: "P_UPDATE", data: update }, res, httpStatus.OK)
    }
    else {
      return response.error({ message: "G_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
    }
  } catch (error) {
    return response.error({ msgCode: 'INTERNAL_SERVER_ERROR', data: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);
  }

}
exports.getGroup = async (req, res) => {
  try {
    let data;
    let Id = req.token._id // user or subuser _id

    if (req.params.name == "findOne") {
      data = await manageGroup.findOne({ _id: req.params.id }).lean();
    }
    if (req.params.name == "findAll") {

      let auth = await user.findOne({ _id: ObjectId(Id) }).lean() //_id

      if (auth) {
        req.body.userId = Id
        data = await manageGroup.find({ userId: req.token._id  }).lean()
      }
      let result1,result2;
      if (!auth) {
        let auth = await SubUser.findOne({ _id: Id, status: 'Active' }) //_id
        if (auth) {
          let { permission: { createGroup: { subGroup } } } = auth
           result1 =  manageGroup.find({ subuserId: req.params.id })
            console.log(result1)
            result2 =  manageGroup.find({
              _id: { $in: subGroup }
            }).lean()
         let [finalresult1,finalresult2] = await Promise.all([result1,result2])
          //console.log(result1, result2)
          data = finalresult1.concat(finalresult2)
        }

        else {
          console.log('Data_NOTA_FOUND')
          return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
        }

      }
    }
console.log(data) 

    if (!data) {
      return response.error({ message: 'FAILED_TO_FATCH_DATA' }, res, httpStatus.ALREADY_REPORTED)
    } else {
      return response.success({ message: 'API_SUCCESS', data: data }, res, httpStatus.OK)
    }


  } catch (error) {
    console.log(error)
    return response.error({ msgCode: 'INTERNAL_SERVER_ERROR' }, res, httpStatus.INTERNAL_SERVER_ERROR);
  }
}

exports.deleteGroup = async (req, res) => {
  try {

    let Id = req.token._id // user or subuser _id
    let data = req.body
    let access = false
    let auth = await user.findOne({ _id: ObjectId(Id) }) //_id

    if (auth) {
      access = true;
  
    }
    if (!auth) {

      let auth = await SubUser.findOne({ _id: mongoose.Types.ObjectId(Id), status: 'Active' }) //_id
      if (auth) {
        access = await manageGroup.findOne({_id: req.params.id, subuserId:Id})
         
      }
      else {
        console.log('Data_NOTA_FOUND')
        return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.NOT_FOUND)
      }
    }

    if(access){
    let deleteRules = rules.deleteMany({ groupId: req.params.id })
    let deleteManageContact = manageContact.deleteMany({ groupId: req.params.id })
    let deleteGroup = manageGroup.deleteOne({ _id: req.params.id })
    let deleteData = await Promise.all([deleteRules, deleteGroup, deleteManageContact])
    if (deleteData) {
      console.log("successfully delete")
      return response.success({ message: "DELETED" }, res, httpStatus.OK)
    }
    else {
      return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.FORBIDDEN)

    }
  }
  else {
    return response.error({ message: "UNAUTHORIZED" }, res, httpStatus.FORBIDDEN)

  }
  } catch (error) {
    return response.error({ msgCode: 'INTERNAL_SERVER_ERROR', data: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);

  }
}

// exports.uploadExcelFile = async(req,res) =>{

//   try{  
//     let  xlFile = xlxs.readFile(req.file.path)
//     let sheet = xlFile.Sheets[xlFile.SheetNames[0]]

//     const posts = []
//     let post ={}

//     // for(let cell in sheet){
//     //     const cellasString = cell.toString()
//     //     if(cellasString[1] !=='m' && cellasString !=='m' && cellasString[1] > 1 ){
//     //         console.log("___________________",cellasString[0])

//     //         if(cellasString[0] === "A"){
//     //             post.emailId = sheet[cell].v
//     //         }
//     //         if(cellasString[0] === "B"){
//     //             post.filename = sheet[cell].v
//     //         }
//     //         if(cellasString[0] === "C"){
//     //             post.lastname = sheet[cell].v
//     //         }
//     //         if(cellasString[0] === "D"){
//     //             post.address = sheet[cell].v
//     //         }
//     //         if(cellasString[0] === "E"){
//     //             post.alternateAddress = sheet[cell].v
//     //         }
//     //         if(cellasString[0] === "F"){
//     //             post.city = sheet[cell].v
//     //         }
//     //         if(cellasString[0] === "G"){
//     //             post.zip = sheet[cell].v
//     //         }
//     //         if(cellasString[0] === "H"){
//     //             post.dob = sheet[cell].v
//     //         }
//     //         if(cellasString[0] === "I"){
//     //             post.country = sheet[cell].v
//     //         }
//     //         if(cellasString[0] === "J"){
//     //             post.phonenumber = sheet[cell].v
//     //         }
//     //         if(cellasString[0] === "K"){
//     //             post.birthday = sheet[cell].v
//     //         }
//     //         if(cellasString[0] === "L"){
//     //             post.status = sheet[cell].v
//     //         }
//     //         if(cellasString[0] === "M"){
//     //             post.use = sheet[cell].v
//     //             posts.push(post)
//     //             post={}
//     //         }
//     //     }
//     // }
//     // for(let cell in sheet){
//     //     const cellasString = cell.toString()
//     //     if(cellasString[1] !=='m' && cellasString !=='m' && cellasString[1] > 1 ){
//     //         // console.log("___________________",cellasString[0])

//     //         if(cellasString[0] === "A"){
//     //             post.firstName = sheet[cell].v
//     //         }
//     //         if(cellasString[0] === "B"){
//     //             post.lastName = sheet[cell].v
//     //         }
//     //         if(cellasString[0] === "C"){
//     //             post.phoneNumber = sheet[cell].v
//     //             posts.push(post)
//     //             post={}
//     //         }
//     //     }
//     // }
//     console.log("___________________", posts)
//     const b = posts

//     let user = await manageGroup.find({ _id: req.params.id });
//     const a = user[0]
//     for(let i=0; i<b.length; i++){
//         for(let j=1; j<a.length; j++){
//             if(!a[0].firstName.includes(b[i].firstName)){
//                 a[0].firstName.push(b[i].firstName)
//             }
//             if(!a[1].lastName.includes(b[i].lastName)){
//                 a[1].lastName.push(b[i].lastName)
//             }
//             if(!a[2].phonenNumber.includes(b[i].phoneNumber)){  
//                 a[2].phonenNumber.push(b[i].phoneNumber)
//             }
//         }
//     }
//     consol.log("___  ______ ________ ______ ______", a)
//     // const addUserDetail = await manageGroup.updateOne({_id:req.params.id},{
//     //     $set:{row:a}
//     // }, {new:true},)
//     // res.status(200).json({data:addUserDetail})
// }catch (error) {
//     console.log("________________",error)
//     return response.error({ msgCode: 'INTERNAL_SERVER_ERROR', data: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);

// }

// }


exports.uploadExcelFile = async (req, res) => {

  try {
    const file = xlxs.readFile(req.file.path)

    let data = []

    const sheets = file.SheetNames

    for (let i = 0; i < sheets.length; i++) {
      const temp = xlxs.utils.sheet_to_json(
        file.Sheets[file.SheetNames[i]])
      temp.forEach((res) => {
        data.push(res)
      })
    }
    console.log("_____ ________ _______ _______ _________ ____", data)
    res.send(data)
  } catch (error) {
    console.log("________________", error)
    return response.error({ msgCode: 'INTERNAL_SERVER_ERROR', data: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);

  }

}
exports.copyWithoutData = async (req, res) => {
  try {

    //-----------------------------------------------------------------------
    //-----------------------------------------------------------------------
    // POST /api/groups/:groupId/copyWithDataFromAnotherModel
    // Copy a group with data from another model
    // Find the original group by ID
    const originalGroup = await manageGroup.findById({ _id: req.params.groupId });

    if (!originalGroup) {
      // Return an error if the original group is not found
      return response.error({ message: "G_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
    }
    // Find the related data from the other model
    const relatedData = await rules.find({ groupId: req.params.groupId });

    // Create a new group with the same name and description as the original
    const newGroup = new manageGroup({
      groupName: originalGroup.groupName + "  (copy Group)",
      userId: originalGroup.userId
    });
    // Copy the related data from the other model to the new group
    for (const data of relatedData) {
      const newData = new rules({
        ...data.toObject(),
        _id: new mongoose.Types.ObjectId(), // Generate a new ID for the copied data
        groupId: newGroup._id // Set the new group as the related group
      });

      await newData.save();
      console.log(newData)
    }
    await newGroup.save();
    // Save the new group to the database

    // Return the new group in the response
    return response.success({ message: "GROUP_ADDED", data: newGroup }, res, httpStatus.CREATED)



    //=====================================================================
    //---------------------------------------
    // Find the original group by ID
    // const originalGroup = await manageGroup.findById({_id:req.params.groupId});

    // if (!originalGroup) {
    //   return res.status(404).send({ message: 'Group not found' });
    // }
    // const newGroup = new manageGroup({
    //   groupName: originalGroup.groupName + "  (copy group)",
    //   userId: originalGroup.userId,
    // });

    // // Save the new group to the database
    // await newGroup.save();

    // // Return the new group in the response
    // res.status(201).send(newGroup);
  } catch (error) {
    console.log("________________", error.message)
    return response.error({ msgCode: 'INTERNAL_SERVER_ERROR', data: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);

  }

}
exports.copyWithData = async (req, res) => {
  try {

    const originalGroup = await manageGroup.findById({ _id: req.params.groupId });

    if (!originalGroup) {
      // Return an error if the original group is not found
      return response.error({ message: "G_NOT_FOUND" }, res, httpStatus.NOT_FOUND)
    }
    // Find the related data from the other model
    const relatedData = await rules.find({ groupId: req.params.groupId });
    const audienceData = await manageContact.find({ groupId: req.params.groupId })
    // Create a new group with the same name and description as the original
    const newGroup = new manageGroup({
      groupName: originalGroup.groupName + "  (copy Group)",
      userId: originalGroup.userId
    });
    // Copy the related data from the other model to the new group
    for (const data of relatedData) {
      const newData = new rules({
        ...data.toObject(),
        _id: new mongoose.Types.ObjectId(), // Generate a new ID for the copied data
        groupId: newGroup._id // Set the new group as the related group
      });

      await newData.save();
      console.log(newData)
    }
    for (const data of audienceData) {
      const newData = new manageContact({
        ...data.toObject(),
        _id: new mongoose.Types.ObjectId(), // Generate a new ID for the copied data
        groupId: newGroup._id // Set the new group as the related group
      });

      await newData.save();
      console.log(newData)
    }
    await newGroup.save();
    return response.success({ message: "GROUP_ADDED", data: newGroup }, res, httpStatus.CREATED)

  } catch (error) {
    console.log("________________", error.message)
    return response.error({ msgCode: 'INTERNAL_SERVER_ERROR', data: error.message }, res, httpStatus.INTERNAL_SERVER_ERROR);

  }
}
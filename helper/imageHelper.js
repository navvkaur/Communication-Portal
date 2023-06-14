require('dotenv').config()
const AWS = require('aws-sdk')
const { msg } = require('../messages');
const fs = require("fs")
class ImageController {
  async fileUpload (fileName, destination, fileType) {
    const s3 = new AWS.S3({
      accessKeyId: 'AKIA3WCR2RFR4ZGJIMHR', //process.env.AWS_ACCESS_KEY,
      secretAccessKey: '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', //process.env.AWS_SECRET_ACCESS_KEY,
      region: 'ap-south-1' //process.env.AWS_REGION
    })
    const uploadParams = {
      Bucket: 'communicationportal',
      Key: '',
      Body: '',
      ACL: 'public-read',
      ContentType: fileType
    } 
    
    let data = fs.readFileSync(`${destination}${fileName}`)
    fileName =fileName.replace(/\s/g, '')
    uploadParams.Key = fileName
    uploadParams.Body = data;

    return s3
      .upload(uploadParams)
      .promise()
      .then(data => {
        console.log("sucess")
        return data
      })
      .catch(err => {
        console.log(err)
        throw err
      }) 
  }

  async deleteFile (fileUrl, s3FolderPath) {
    const s3 = new AWS.S3({
      accessKeyId: 'AKIA3WCR2RFR4ZGJIMHR', //process.env.AWS_ACCESS_KEY,
      secretAccessKey: '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', //process.env.AWS_SECRET_ACCESS_KEY,
      region: 'ap-south-1' //process.env.AWS_REGION
    })

    const params = {
      Bucket: 'communicationportal', 
      Key: fileUrl
    }
   s3.deleteObject(params,(err,data)=>{
      if(data){
        console.log('Delete Successfully')
        return true
      }
      else{
        console.log(err)
      }
    })
    
    // s3.deleteObject(params, function (err, data) { 
    //   console.log(data)
    //   if (err) console.log(err)
    //   else {
    //     console.log('Delete Successfully')
    //     return true
    //   }
    // }) 
  }
  // async getFile (fileUrl, s3FolderPath) {
  //   const s3 = new AWS.S3({
  //     accessKeyId: 'AKIA2ADN4F3MGKAFJOMY', //process.env.AWS_ACCESS_KEY,
  //     secretAccessKey: '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', //process.env.AWS_SECRET_ACCESS_KEY,
  //     region: 'us-east-2' //process.env.AWS_REGION
  //   })

  //   const params = {
  //     Bucket: 'rupantar-react',
  //     Key: fileUrl
  //   }

  //   s3.getObject(params, function (err, data) {
  //     console.log(data)
  //     if (err) console.log(err)
  //     else {
  //       console.log('Delete Successfully')
  //       return data
  //     }
  //   })
  // }
}
module.exports = new ImageController()

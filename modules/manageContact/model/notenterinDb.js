const { boolean } = require('joi');
const mongoose = require('mongoose')

const arrayNotEnterInDb = new mongoose.Schema ({
  
    
    },{strict: false,versionKey:false});
 const notEnterDbmanageContact = mongoose.model('notEnterDbmanageContact', arrayNotEnterInDb)

module.exports = {
    notEnterDbmanageContact
}
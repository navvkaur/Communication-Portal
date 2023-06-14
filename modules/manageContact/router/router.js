const router = require('express').Router()
var multer = require('multer')
const upload = multer({
    dest: './upload/',
    limits: {
      fileSize: 100000000,
    }
  })
const controller = require('../controller/controller')
router.post('/addContact/:id',upload.single("file"), controller.addContact)
router.get('/getmanageContact/:name/:id', controller.getmanageContact)
router.get('/getExcelNotEnterDb/:id', controller.getExcelNotEnterDb)

router.put('/updateExcelFile/:id',upload.single("file"), controller.updateExcelFile)
router.post('/filterApi/:id', controller.filterApi)
router.post('/innerFilter/:id', controller.innerFilter)
router.post("/checktype", controller.checkType)
router.put('/updateSinglePeople/:id', controller.updateSinglePeople)
router.put('/updateNotEnterDbSinglePeople/:id', controller.updateNotEnterDbSinglePeople)
router.delete('/deleteAudience/:name/:id', controller.deleteAudience)

router.post('/restriction/:id',upload.single("file"), controller.restriction)













module.exports = router;
const router = require('express').Router()
const controller = require('../controller/rulesController')
router.post('/addRules', controller.addRules)
router.delete('/deleteRules/:id', controller.deleteRules)
router.get('/getRulesByGroupID/:id', controller.getRulesByGroupID)

router.put('/updateRule/:id', controller.updateRule)


module.exports = router;
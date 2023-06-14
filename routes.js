const user=require("./modules/user/router/userRouter")
const plan = require("./modules/plan/router/planrouter")
const managetemplate= require('./modules/templates/router/templateRouter')
const admin=require('./modules/SuperAdmin/router/router')
const transaction=require('./modules/transaction/router/transactionRouter')
const payment = require('./modules/Payment/router/paymentRoute')
const group= require('./modules/group/router/groupRouter')
const rules= require('./modules/rules/router/rulesRouter')
const manageContact= require('./modules/manageContact/router/router')
const SubUser = require("./modules/subUser/router/subUserRouter")
const category = require("./modules/categries/router/categoryRouter")
const verifyid = require('./modules/verifyId/router/verifyidRouter')
const campaign = require('./modules/campaigns/router/campaignrouter')


module.exports = [
  {
    path: '/api/user',
    handler: user,
    schema: 'user'
  },
  {
    path: '/api/plan',
    handler: plan,
    schema:"plan"
  },
  {
    path: '/api/managetemplate',
    handler: managetemplate,
    schema: 'managetemplate'
  },
  {
    path: '/api/admin',
    handler: admin,
    schema: 'admin'
  },
  {
    path: '/api/transaction',
    handler: transaction,
    schema: 'transaction'
  },
  
    {
      path: '/api/payment',
      handler: payment,
      schema: 'payment'
    },
    {
      path: '/api/group',
      handler: group,
      schema: 'group'
    },
    {
      path: '/api/rules',
      handler: rules,
      schema: 'rules'
    },
   
    {
      path: '/api/manageContact',
      handler: manageContact,
      schema: 'manageContact'
    },
    {
      path:"/api/SubUser",
      handler: SubUser,
      schema: "SubUser"
    },
    {
      path:"/api/category",
      handler: category,
      schema: "category"
    },
    {
      path:"/api/verifyid",
      handler: verifyid,
      schema: "verifyid"
    },
    {
      path:"/api/createcampaign",
      handler: campaign,
      schema: "campaign"
    }
   
 ]

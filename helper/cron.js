const { user } = require('../modules/user/model/userModel')
const emailHelper = require("./email.helper")
const { transaction } = require('../modules/transaction/model/transactionModel')
const cron = require('node-cron');
const { scheduleCampaign } = require('../modules/campaigns/model/schedulecampaignModel');
const fs = require('fs');
const htmlContent = fs.readFileSync('helper/html.html', 'utf-8');
const {sendmail,schedulee,scheduleyearly,schedulemonthly,schedulesame}=require("../modules/campaigns/business/createcampaignBusiness")

const dailyUserReport = cron.schedule(process.env.dailyUserReport, async () => {
    //cron run 12am daily 
    // find all users with an active plan
    const usersWithPlan = await user.find({ plan: { $exists: true } }).lean();

    if (usersWithPlan.length > 0) {
        usersWithPlan.forEach(async (users) => {
            // retrieve current plan validity and decrement by 1
            const currentValidity = users.plan.planValidity;
            const updatedValidity = currentValidity - 1;

            if (updatedValidity <= 0) {
                // plan has expired, update plan status to expired or perform any required actions
                let updateUser = user.updateOne({ _id: users._id }, { $unset: { plan: "" } })
                let removePlan = transaction.findOneAndUpdate({ userId: users._id }, { $set: { status: "In-Active" } }, { new: true })
                await Promise.all([updateUser, removePlan])
                
            }
            else {
                const changeValidity = await user.findByIdAndUpdate({ _id: users._id }, { $set: { "plan.planValidity": updatedValidity } })
                let subject = 'About your plan'
                let text = `About your Plan `
                let attachment = []
                const planName = users.plan.planName;
                const planValidity = users.plan.planValidity;
                const totalEmail = users.plan.totalEmail;
                const totalWhatsapp = users.plan.totalWhatsapp;
                const totalMessage = users.plan.totalMessage;
                const totalIVR = users.plan.totalIVR;

                const htmlWithPlan = htmlContent
                    .replace('{{planName}}', planName)
                    .replace('{{planValidity}}', planValidity)
                    .replace('{{totalEmail}}', totalEmail)
                    .replace('{{totalWhatsapp}}', totalWhatsapp)
                    .replace('{{totalMessage}}',totalMessage)
                    .replace('{{totalIVR}}',totalIVR);



                
                
                const send = emailHelper.autoMail(from = process.env.EMAIL, email = users.email, subject = subject, text = text,attachment,html=htmlWithPlan);
                
                // check if plan validity has expired  
            }

        });
    }
    else {
        console.log("no plan found")
    }
    // loop through each user and update plan validity

})
const sendScheduled=cron.schedule(process.env.updateInMinute, async ()=> {

    let datas = await scheduleCampaign.find({status:'SCHEDULED'}).lean() //5 * * * * *  -- 0 0 * * *
        datas.forEach(async (data) => {

            if (data.every == 'year') {
                let value = await scheduleyearly(data);
                if (value == true) {
                    await sendmail(data)
                    return
               }
            }
            else if (data.every == 'month') {
                let value = await schedulemonthly(data);
                if (value == true) {
                    await sendmail(data)
                    return
                } 
            }
            else if (data.every == 'week') {
                if (data.startDate == data.endDate) {
                    let value = await schedulee(data); 
                    if (value == true) {
                        await sendmail(data)
                        return
                    } 
                }
                else if (data.startDate != data.endDate) {

                    let value = await schedulesame(data)
                    if (value == true) {
                        await sendmail(data)
                        return
                    }
                } 
            }

        },
            {
                timezone: "Asia/Kolkata"
            })
  

})
const changeStatus= cron.schedule(process.env.updateInMinute,async()=>{
    let datas = await scheduleCampaign.find({status:'SCHEDULED'}).lean()
    console.log(datas)
    datas.forEach(async (data) => {
        const date = new Date(Date.now());
        const formattedDate = date.toISOString().split('T')[0];
        console.log(formattedDate,data.endDate)
        if (data.endDate < formattedDate) {
            const changeStatus = await scheduleCampaign.findByIdAndUpdate({_id:data._id},{$set:{status:"SENT"}},{new:true})
            console.log(changeStatus)
             return
           }
        })
        
        
        

})


module.exports = {
    dailyUserReport,
    changeStatus,
    sendScheduled
}



    // const job = cronJob.schedule("5 * * * * *", async function () {
        

    // })







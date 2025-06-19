import { sendEmail } from "../helper/sendEmail";
import Customer from "../apis/v1/customer/schema.customer";
import RewardsCoupon from "../apis/v1/rewardscoupon/schema.rewardscoupon";
import Service from "../apis/v1/service/schema.service";
import { couponService } from "../apis/v1/service.index";

// cron/rewardCheckCron.js
const cron = require('node-cron');


export const runRewardCheck = () => {
    cron.schedule('* * * * *', async () => {
        try {
            console.log('🎁 Starting reward check cron...');
            const rewards = await RewardsCoupon.find({ isActive: true });
            const customers = await Customer.find({
                isDeleted: false,
                cashBackAmount: { $exists: true, $gte: 3000 },
            });



            for (const user of customers) {
                const eligibleRewards = rewards.filter(
                    (reward: any) => user.cashBackAmount >= reward.rewardsPoint
                );

                if (!eligibleRewards.length) continue;

                const couponCode = `REWARD-${user?.customerName.toString().slice(-5)}-${Date.now()}`;
                const issuedAt = new Date();
                const validTill = new Date(issuedAt.getTime() + 90 * 24 * 60 * 60 * 1000);

                // await couponService.createCoupon({
                //     user: user?._id,
                //     referralCode: couponCode,
                //     earnPoint: 0,
                //     quantity: 1,
                //     discountAmount: 25,
                //     valid: validTill,
                //     type: 'COUPON_CODE',
                // });

                console.log(`🟢 User ${user.customerName} has ${user.cashBackAmount} points. Sending reward list.`);

                const rewardHTML = (
                    await Promise.all(
                        eligibleRewards.map(async (reward) => {
                            const services = await Service.find({ _id: { $in: reward.serviceId } });

                            const serviceList = services.map((s: any) => `<li>${s.serviceName}</li>`).join('');

                            return `
        <div style="margin-bottom: 16px; padding: 16px; border: 1px solid #ccc; border-radius: 6px;">
          <h4 style="margin: 0 0 6px;">🎁 Reward (Required: ${reward.rewardsPoint} points)</h4>
          <p><strong>Includes:</strong></p>
          <ul>${serviceList}</ul>
          <button 
            id="claim-btn-${reward._id}"
            onclick="document.getElementById('claim-btn-${reward._id}').innerText='${reward.couponCode}'"
            style="
              display: inline-block;
              margin-top: 10px;
              padding: 8px 16px;
              background-color: #28a745;
              color: white;
              border: none;
              border-radius: 4px;
              font-weight: bold;
              cursor: pointer;
            "
          >
         ${reward.couponCode}
          </button>
        </div>
      `;
                        })
                    )
                ).join('');



                const emailData = {
                    sendTo: 'np.221196.np@gmail.com',
                    emailSubject: `🎉 You're Eligible for Spa Rewards!`,
                    emailBody: `
            <p>Hi ${user.customerName || 'Customer'},</p>
            <p>You've earned <strong>${user.cashBackAmount} reward points</strong>!</p>
            <p>Based on your points, you can now redeem the following rewards:</p>
            ${rewardHTML}
            <p>Copy “Coupan Code” on any reward to redeem it instantly.</p>
            <br/>
            <p>Cheers,</p>
            <p><em>The Spa Durban Team</em></p>
        `,
                };

                const outlet = {};
                // await sendEmail(emailData, outlet);
            }


            console.log('✅ Reward cron completed.', customers);
        } catch (error) {
            console.error('❌ Error in reward cron:', error);
            process.exit(1);
        }
    });
};



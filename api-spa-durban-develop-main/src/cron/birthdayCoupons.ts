import cron from 'node-cron';
import { couponService } from '../apis/v1/service.index';
import Customer from '../../src/apis/v1/customer/schema.customer';
import { sendEmail } from '../../src/helper/sendEmail';


export const startBirthdayCouponCron = () => {
    // ⏰ Run once a day at 12:01 AM
    cron.schedule('1 0 * * *', async () => {
        const today = new Date();
        const oneMonthLater = new Date(today);
        oneMonthLater.setMonth(today.getMonth() + 1);

        const targetDay = oneMonthLater.getDate();
        const targetMonth = oneMonthLater.getMonth() + 1;

        const customers = await Customer.aggregate([
            {
                $addFields: {
                    dobString: { $toString: '$dateOfBirth' },
                },
            },
            {
                $addFields: {
                    isValidDOB: {
                        $regexMatch: {
                            input: '$dobString',
                            regex: /^\d{2}\/\d{2}\/\d{4}$/,
                        },
                    },
                },
            },
            { $match: { isValidDOB: true } },
            {
                $addFields: {
                    dobParts: { $split: ['$dobString', '/'] },
                },
            },
            {
                $addFields: {
                    birthDay: { $toInt: { $arrayElemAt: ['$dobParts', 0] } },
                    birthMonth: { $toInt: { $arrayElemAt: ['$dobParts', 1] } },
                },
            },
            {
                $match: {
                    birthDay: targetDay,
                    birthMonth: targetMonth,
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    dateOfBirth: 1,
                    email: 1,
                },
            },
        ]);

        for (const customer of customers) {
            // ✅ Check if already created coupon for this user and type
            const existing = await couponService.getCouponByFilter({
                user: customer._id,
                type: 'COUPON_CODE',
                referralCode: { $regex: `^BDAY-${customer._id.toString().slice(-5)}` },
            });


            if (existing && existing.valid >= new Date()) {
                // console.log(`Already created for ${customer._id}, skipping`);
                continue;
            }

            const couponCode = `BDAY-${customer._id.toString().slice(-5)}-${Date.now()}`;
            const issuedAt = new Date();
            const validTill = new Date(issuedAt.getTime() + 90 * 24 * 60 * 60 * 1000);

            await couponService.createCoupon({
                user: customer._id,
                referralCode: couponCode,
                earnPoint: 0,
                quantity: 1,
                discountAmount: 25,
                valid: validTill,
                type: 'COUPON_CODE',
            });

            const emailData = {
                sendTo: "np.221196.np@gmail.com",
                emailSubject: `🎉 Happy Early Birthday! Here's 25% Off Just for You`,
                emailBody: `
    <p>Dear ${customer.name || 'Customer'},</p>
    <p>Your birthday is coming up, and we’ve got a gift for you 🎁</p>
    <p>Enjoy <strong>25% off</strong> with your exclusive birthday coupon:</p>
    <p><strong>Coupon Code: ${couponCode}</strong></p>
    <p>This coupon is valid until <strong>${validTill.toDateString()}</strong>.</p>
    <p>Use it on your next visit and make your birthday extra special!</p>
    <br/>
    <p>Cheers,</p>
    <p><em>The Spa Durban Team</em></p>
  `,
            };
            const outlet = {};
            // await sendEmail(emailData, outlet)

            // console.log(`🎉 Coupon created for ${customer._id}`);
        }

        // console.log('[Birthday Coupon Cron]: Completed');
    });

    // console.log('[Birthday Coupon Cron]: Scheduled (daily at 12:01 AM)');
};

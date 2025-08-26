import { Request, Response } from "express";
import httpStatus from "http-status";
import { pick } from "../../../../utilities/pick";
import ApiError from "../../../../utilities/apiError";
import catchAsync from "../../../../utilities/catchAsync";
import { outletService, registerService } from "../service.index";
import {
  getFilterQuery,
  getRangeQuery,
  getSearchQuery,
  checkInvalidParams,
  getDateFilterQuery,
} from "../../../utils/utils";
import Register, { searchKeys, allowedDateFilterKeys } from "./schema.register";
import { UserEnum } from "../../../utils/enumUtils";
import { AuthenticatedRequest } from "../../../utils/interface";
import Invoice from "../invoice/schema.invoice";
import mongoose, { PipelineStage } from "mongoose";
import { Mongoose } from "mongoose";
import puppeteer from 'puppeteer';
import { sendEmail } from '../../../helper/sendEmail';
import CloseRegister from "./schema.closereegister";
import SalesRegister from "./schema.salesreegister";

// export const generatePDFBuffer = async (html: string): Promise<Buffer> => {
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();
//   await page.setContent(html, { waitUntil: 'networkidle0' });
//   const pdf = await page.pdf({ format: 'A4', printBackground: true });
//   await browser.close();
//   return Buffer.from(pdf); // ✅ This is now compatible with nodemailer
// };

export const generatePDFBuffer = async (html: string): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // ✅ Fix for Ubuntu sandbox issue
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({ format: 'A4', printBackground: true });

  await browser.close();
  return Buffer.from(pdf); // ✅ Compatible with nodemailer
};

// const generateCloseRegisterHTML = (
//   closeRegister: any,
//   bankDeposit: any,
//   carryForwardBalance: any,
//   outletData: any,
//   openingBalance: any,
//   cashUsage: any = []
// ) => {
//   const registerRows = closeRegister
//     .map(
//       (item: any) => `
//         <tr>
//           <td>${item.paymentModeName}</td>
//           <td>R ${item.totalAmount}</td>
//           <td>R ${item.manual || '-'}</td>
//         </tr>
//       `
//     )
//     .join('');

//   const usageRows = cashUsage.length
//     ? cashUsage
//       .map(
//         (usage: any, idx: number) => `
//           <tr>
//             <td>${idx + 1}</td>
//             <td>${usage.reason}</td>
//             <td>R ${usage.amount}</td>
//             <td>${usage.proofUrl
//             ? `<a href="${process.env.REACT_APP_BASE_URL}/${usage.proofUrl}" target="_blank">View Proof</a>`
//             : '-'
//           }</td>
//           </tr>
//         `
//       )
//       .join('')
//     : `<tr><td colspan="4">No cash usage entries available.</td></tr>`;

//   return `
//     <html>
//       <head>
//         <style>
//           body {
//             font-family: Arial, sans-serif;
//             padding: 30px;
//             color: #333;
//           }
//           h2, h3 {
//             margin-bottom: 10px;
//           }
//           table {
//             width: 100%;
//             border-collapse: collapse;
//             margin-top: 20px;
//             font-size: 14px;
//           }
//           th, td {
//             border: 1px solid #999;
//             padding: 8px;
//             text-align: left;
//           }
//           th {
//             background-color: #f9f9f9;
//           }
//           a {
//             color: #1a0dab;
//           }
//         </style>
//       </head>
//       <body>
//         <h2>Close Register Summary</h2>
//         <h3>Outlet Name: ${outletData?.name}</h3>

//         <table>
//           <thead>
//             <tr>
//               <th>Payment Mode</th>
//               <th>Total Amount</th>
//               <th>Manual Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${registerRows}
//           </tbody>
//         </table>

//         <p><strong>Opening Balance:</strong> R ${openingBalance}</p>
//         <p><strong>Bank Deposit:</strong> R ${bankDeposit}</p>
//         <p><strong>Carry Forward Balance:</strong> R ${carryForwardBalance}</p>

//         <h3 style="margin-top:40px;">Cash Usage Entries</h3>

//         <table>
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Reason</th>
//               <th>Amount</th>
//               <th>Proof</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${usageRows}
//           </tbody>
//         </table>
//       </body>
//     </html>
//   `;
// };




// const createRegister = catchAsync(
//   async (req: AuthenticatedRequest, res: Response) => {
//     if (!req.userData) {
//       throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
//     }

//     const { outletId, date } = req.body;
//     const userId = req.userData.Id;

//     // Agar date na ho, to aaj ki date lo
//     let inputDate = date ? new Date(date) : new Date();

//     // Date validation (invalid format handle karo)
//     if (isNaN(inputDate.getTime())) {
//       throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
//     }

//     // Start & End of Day set karo (00:00 - 23:59)
//     const startOfDay = new Date(inputDate);
//     startOfDay.setHours(0, 0, 0, 0);

//     const endOfDay = new Date(inputDate);
//     endOfDay.setHours(23, 59, 59, 999);

//     // Check karo agar aaj ka register pehle se exist karta hai
//     const existingRegister = await registerService.findRegister({
//       createdBy: userId,
//       outletId,
//       startOfDay,
//       endOfDay,
//     });

//     if (existingRegister) {
//       throw new ApiError(
//         httpStatus.CONFLICT,
//         "Register entry already exists for this user and outlet today"
//       );
//     }

//     // Naya register create karo
//     const register = await registerService.createRegister({
//       ...req.body,
//       isOpened: true,
//       createdBy: userId,
//       createdAt: new Date(), // Ensure current timestamp is stored
//     });

//     return res.status(httpStatus.CREATED).send({
//       message: "Added successfully!",
//       data: register,
//       status: true,
//       code: "OK",
//       issue: null,
//     });
//   }
// );
// const createCloseRegister = catchAsync(
//   async (req: AuthenticatedRequest, res: Response) => {
//     if (!req.userData) {
//       throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
//     }

//     const { outletId, date, closeRegister, bankDeposit = 0 } = req.body;


//     const userId = req.userData.Id;

//     const paymentsData = closeRegister?.[0]?.payments || [];

//     const flattenedPayments = paymentsData.map((payment: any) => ({
//       paymentModeName: payment.paymentModeName,
//       totalAmount: payment.totalAmount,
//       manual: payment.manual || '',
//       reason: payment.reason || '',
//     }));

//     // Date logic remains the same
//     let inputDate = date ? new Date(date) : new Date();
//     if (isNaN(inputDate.getTime())) {
//       throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
//     }

//     const startOfDay = new Date(inputDate);
//     startOfDay.setHours(0, 0, 0, 0);
//     const endOfDay = new Date(inputDate);
//     endOfDay.setHours(23, 59, 59, 999);

//     const openingRegister = await registerService.findRegister({
//       createdBy: userId,
//       outletId,
//       startOfDay,
//       endOfDay,
//     });

//     if (!openingRegister) {
//       throw new ApiError(
//         httpStatus.CONFLICT,
//         "Please create the opening register first for today before closing."
//       );
//     }

//     // Check karo agar aaj ka register pehle se exist karta hai
//     const existingRegister = await registerService.findCloseRegister({
//       createdBy: userId,
//       outletId,
//       startOfDay,
//       endOfDay,
//     });

//     if (existingRegister) {
//       throw new ApiError(
//         httpStatus.CONFLICT,
//         "Register entry already exists for this user and outlet today"
//       );
//     }

//     // Find the "cash" payment mode from closeRegister
//     const cashEntry = flattenedPayments.find(
//       (entry: any) => entry?.paymentModeName?.toLowerCase() === "cash"
//     );

//     const totalCash = cashEntry ? parseFloat(cashEntry.manual) || 0 : 0;
//     const deposit = parseFloat(bankDeposit) || 0;

//     // Calculate carry forward
//     const carryForwardBalance = Math.max(totalCash - deposit, 0);
//     if (deposit > totalCash) {
//       throw new ApiError(
//         httpStatus.BAD_REQUEST,
//         `Bank deposit (R ${deposit}) cannot be greater than total cash (R ${totalCash})`
//       );
//     }

//     // Naya register create karo
//     const register = await registerService.createCloseRegister({
//       outletId,
//       closeRegister: flattenedPayments,
//       bankDeposit,
//       createdBy: userId,
//       carryForwardBalance,
//       isActive: false,
//       openRegisterId: openingRegister?._id,
//       createdAt: new Date(),
//     });


//     const outletData = await outletService.getOutletById(req.body.
//       outletId
//     )


//     const htmlContent = generateCloseRegisterHTML(flattenedPayments, bankDeposit, carryForwardBalance, outletData, req.body.openingBalance);
//     const pdfBuffer = await generatePDFBuffer(htmlContent);

//     const emailData = {
//       emailSubject: `Close Register Report - ${outletData?.name} - ${new Date().toLocaleDateString('en-ZA')}`,
//       emailBody: '<p>Attached is your daily close register report.</p>',
//       sendTo: 'np.221196.np@gmail.com',
//       sendFrom: 'noreply@yourdomain.com',
//       attachments: [
//         {
//           filename: 'CloseRegister.pdf',
//           content: pdfBuffer,
//         },
//       ],
//     };

//     await sendEmail(emailData, outletData);



//     // return true;
//     return res.status(httpStatus.CREATED).send({
//       message: "Added successfully!",
//       data: register,
//       status: true,
//       code: "OK",
//       issue: null,
//     });
//   }
// );
const generateCloseRegisterHTML = (
  flattenedPayments: any[],
  deposit: number,
  carryForwardBalance: number,
  outletData: any,
  openingBalance: number,
  cashUsage: any[],
  registerInfo: any
) => {
  // group payments by date
  const paymentsByDate: Record<string, any[]> = {};
  flattenedPayments.forEach((p) => {
    const d = new Date(p.date).toDateString();
    if (!paymentsByDate[d]) paymentsByDate[d] = [];
    paymentsByDate[d].push(p);
  });

  return `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        h2,h3 { text-align: center; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
        th { background: #f5f5f5; }
        .right { text-align: right; }
        .red { color: red; }
      </style>
    </head>
    <body>
      <h2>Register Summary</h2>
      <h3>Register Closure Summary</h3>
      <p><strong>Sequence No:</strong> ${registerInfo?._id}</p>
      <p><strong>Open Date:</strong> ${new Date(registerInfo?.createdAt).toLocaleDateString()}</p>
      <p><strong>Close Date:</strong> ${new Date(registerInfo?.closedAt).toLocaleDateString()}</p>
      <p><strong>Outlet:</strong> ${outletData?.name || outletData?._id}</p>
      <p><strong>Opening Balance:</strong> R ${openingBalance.toFixed(2)}</p>
      <p><strong>Bank Deposit:</strong> R ${deposit.toFixed(2)}</p>
      <p><strong>Carry Forward:</strong> R ${carryForwardBalance.toFixed(2)}</p>

      ${Object.keys(paymentsByDate).map(date => `
        <h4>${date}</h4>
        <table>
          <thead>
            <tr>
              <th>Payment Mode</th>
              <th>Expected</th>
              <th>Counted</th>
              <th>Difference</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            ${paymentsByDate[date].map(p => {
    const expected = parseFloat(p.totalAmount || 0);
    const manual = parseFloat(p.manual || 0);
    const diff = manual - expected;
    return `
                <tr>
                  <td>${p.paymentModeName}</td>
                  <td class="right">R ${expected.toFixed(2)}</td>
                  <td class="right">R ${manual.toFixed(2)}</td>
                  <td class="right ${diff !== 0 ? 'red' : ''}">R ${diff.toFixed(2)}</td>
                  <td>${p.reason || '-'}</td>
                </tr>
              `;
  }).join("")}
          </tbody>
        </table>
      `).join("")}

      <h3>Cash Movement</h3>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Date and Time</th>
            <th>User</th>
            <th>Note</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Closing Float</td>
            <td>${new Date(registerInfo?.createdAt).toLocaleString()}</td>
            <td>-</td>
            <td>-</td>
            <td>R ${openingBalance.toFixed(2)}</td>
          </tr>
          ${cashUsage?.map((c: any) => `
            <tr>
              <td>Cash Out</td>
              <td>${new Date(c.createdAt).toLocaleString()}</td>
              <td>-</td>
              <td>${c.reason || '-'}</td>
              <td class="red">R ${parseFloat(c.amount).toFixed(2)}</td>
            </tr>
          `).join("")}
          <tr>
            <td>Opening Float</td>
            <td>${new Date(registerInfo?.closedAt).toLocaleString()}</td>
            <td>-</td>
            <td>-</td>
            <td>R ${carryForwardBalance.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>`;
};


const createRegister = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
    }

    const { outletId, openingBalance = 0, date } = req.body;
    const userId = req.userData.Id;

    // Validate and parse date
    let inputDate = date ? new Date(date) : new Date();
    if (isNaN(inputDate.getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid date format');
    }

    // Set start and end of day for uniqueness check
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(inputDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingOpenRegister = await SalesRegister.findOne({
      outletId,
      createdBy: userId,
      isOpened: true,
      isClosed: false,
      isDeleted: false,
    });

    if (existingOpenRegister) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'You already have an open register. Close it before opening a new one.'
      );
    }

    // Create new SalesRegister document
    const register = await SalesRegister.create({
      outletId,
      createdBy: userId,
      openingBalance,
      isOpened: true,
      isClosed: false,
      // openedAt: inputDate,
      createdAt: new Date(),
    });

    return res.status(httpStatus.CREATED).send({
      message: 'Register created successfully!',
      data: register,
      status: true,
      code: 'OK',
      issue: null,
    });
  }
);

// const createCloseRegister = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
//   if (!req.userData) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
//   }

//   const userId = req.userData.Id;
//   const { outletId, closeRegister, bankDeposit = 0, openingBalance = 0 } = req.body;

//   if (!Array.isArray(closeRegister) || closeRegister.length === 0) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid closeRegister format');
//   }

//   // Flatten all payments and validate
//   const flattenedAllPayments = closeRegister.flatMap((entry: any) => {
//     const date = entry.date;
//     if (!date || !Array.isArray(entry.payments)) return [];

//     return entry.payments.map((p: any) => ({
//       ...p,
//       date,
//       manual: p.manual || '',
//       reason: p.reason || '',
//     }));
//   });

//   if (flattenedAllPayments.length === 0) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'No valid payment entries found.');
//   }

//   const lastDate = closeRegister[closeRegister.length - 1].date;
//   const inputDate = new Date(lastDate);
//   if (isNaN(inputDate.getTime())) {
//     throw new ApiError(httpStatus.BAD_REQUEST, `Invalid date format for ${lastDate}`);
//   }

//   const startOfDay = new Date(inputDate);
//   startOfDay.setHours(0, 0, 0, 0);
//   const endOfDay = new Date(inputDate);
//   endOfDay.setHours(23, 59, 59, 999);

//   const existingRegister = await registerService.findCloseRegister({
//     createdBy: userId,
//     outletId,
//     startOfDay,
//     endOfDay,
//   });

//   if (existingRegister) {
//     throw new ApiError(httpStatus.CONFLICT, 'Close register already exists for the final date.');
//   }

//   const openingRegister = await Register.findOne({
//     outletId,
//     createdBy: userId,
//     isOpened: true,
//   }).sort({ createdAt: -1 });

//   if (!openingRegister) {
//     throw new ApiError(httpStatus.CONFLICT, 'Please create the opening register first.');
//   }

//   // Total cash from all entries
//   const totalCash = flattenedAllPayments
//     .filter((p: any) => p.paymentModeName?.toLowerCase() === 'cash')
//     .reduce((sum: number, p: any) => sum + (parseFloat(p.manual) || 0), 0);

//   const deposit = parseFloat(bankDeposit) || 0;
//   const carryForwardBalance = Math.max(totalCash - deposit, 0);

//   const register = await registerService.createCloseRegister({
//     outletId,
//     closeRegister, // store as-is: array of { date, payments[] }
//     bankDeposit: deposit,
//     openingBalance,
//     createdBy: userId,
//     carryForwardBalance,
//     isActive: false,
//     openRegisterId: openingRegister?._id,
//     createdAt: new Date(),
//     date: inputDate,
//   });

//   const outletData = await outletService.getOutletById(outletId);

//   const htmlContent = generateCloseRegisterHTML(
//     flattenedAllPayments,
//     deposit,
//     carryForwardBalance,
//     outletData,
//     openingBalance
//   );

//   const pdfBuffer = await generatePDFBuffer(htmlContent);

//   const emailData = {
//     emailSubject: `Close Register Report - ${outletData?.name} - ${new Date().toLocaleDateString('en-ZA')}`,
//     emailBody: '<p>Attached is your daily close register report.</p>',
//     sendTo: 'np.221196.np@gmail.com',
//     sendFrom: 'noreply@yourdomain.com',
//     attachments: [
//       {
//         filename: 'CloseRegister.pdf',
//         content: pdfBuffer,
//       },
//     ],
//   };

//   await sendEmail(emailData, outletData);

//   return res.status(httpStatus.CREATED).send({
//     message: 'Close register created successfully!',
//     data: register,
//     status: true,
//     code: 'OK',
//     issue: null,
//   });
// });

const createCloseRegister = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userData) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }

  const userId = req.userData.Id;
  const { outletId, closeRegister, bankDeposit = 0, cashUsageProofUrl, cashUsageReason, cashUsageAmount } = req.body;

  if (!Array.isArray(closeRegister) || closeRegister.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid closeRegister format');
  }

  // Get latest open SalesRegister for the outlet & user
  const existingRegister = await SalesRegister.findOne({
    outletId,
    createdBy: userId,
    isOpened: true,
    isClosed: false,
    isDeleted: false,
  }).sort({ createdAt: -1 });

  if (!existingRegister) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No open register found to close.');
  }

  const openingBalance = existingRegister.openingBalance || 0;

  // Flatten and validate all payment entries
  const flattenedPayments = closeRegister.flatMap((entry: any) => {
    const { date, payments,payout } = entry;
    if (!date || !Array.isArray(payments)) return [];

    return payments.map((p: any) => ({
      ...p,
      payout,
      date: new Date(date),
      manual: p.manual || '',
      reason: p.reason || '',
    }));
  });

  if (flattenedPayments.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No valid payments provided');
  }

  // Calculate total cash across all entries
  const totalCash = flattenedPayments
    .filter((p) => p.paymentModeName?.toLowerCase() === 'cash')
    .reduce((sum, p) => sum + (parseFloat(p.manual) || 0), 0);

  const deposit = parseFloat(bankDeposit) || 0;
  const carryForwardBalance = Math.max(totalCash - deposit, 0);

  // Update existing register
  existingRegister.closeRegister = closeRegister;
  existingRegister.bankDeposit = deposit;
  existingRegister.carryForwardBalance = carryForwardBalance;
  existingRegister.closedAt = new Date();
  existingRegister.isClosed = true;
  existingRegister.isOpened = false;
  if (cashUsageReason && cashUsageProofUrl && cashUsageAmount) {
    existingRegister.cashUsage.push({
      reason: cashUsageReason,
      amount: cashUsageAmount,
      proofUrl: cashUsageProofUrl,
      createdAt: new Date(),
    });
  }



  existingRegister.cashAmount = totalCash;

  await existingRegister.save();

  const outletData = await outletService.getOutletById(outletId);

  const htmlContent = generateCloseRegisterHTML(
    flattenedPayments,
    deposit,
    carryForwardBalance,
    outletData,
    openingBalance,
    existingRegister?.cashUsage,
    existingRegister
  );

  const pdfBuffer = await generatePDFBuffer(htmlContent);

  const emailData = {
    emailSubject: `Close Register Report - ${outletData?.name} - ${new Date().toLocaleDateString('en-ZA')}`,
    emailBody: '<p>Attached is your daily close register report.</p>',
    sendTo: 'np.221196.np@gmail.com',
    sendFrom: 'noreply@yourdomain.com',
    attachments: [
      {
        filename: 'CloseRegister.pdf',
        content: pdfBuffer,
      },
    ],
  };

  await sendEmail(emailData, outletData);

  return res.status(httpStatus.OK).json({
    message: 'Register closed successfully!',
    data: existingRegister,
    status: true,
    code: 'OK',
    issue: null,
  });
});





const getRegisters = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const filter = pick(req.query, []);
    const options = pick(req.query, [
      "sortBy",
      "limit",
      "page",
      "searchValue",
      "searchIn",
      "dateFilter",
      "rangeFilterBy",
    ]);
    const searchValue = req.query.searchValue as string | undefined;
    const searchIn = req.query.searchIn as string[] | null;
    const dateFilter = req.query.dateFilter as any;
    const rangeFilterBy = req.query.rangeFilterBy as any;

    if (searchValue) {
      let searchQueryCheck = checkInvalidParams(searchIn || [], searchKeys);
      if (searchQueryCheck && !searchQueryCheck.status) {
        return res.status(httpStatus.OK).send({ ...searchQueryCheck });
      }
      const searchQuery = getSearchQuery(
        searchIn || [],
        searchKeys,
        searchValue
      );
      if (searchQuery !== null) {
        options["search"] = { $or: searchQuery } as any;
      }
    }

    if (dateFilter) {
      const dateFilterQuery = await getDateFilterQuery(
        dateFilter,
        allowedDateFilterKeys
      );
      if (dateFilterQuery && dateFilterQuery.length) {
        options["dateFilter"] = { $and: dateFilterQuery } as any;
      }
    }

    if (rangeFilterBy !== undefined) {
      const rangeQuery = getRangeQuery(rangeFilterBy);
      if (rangeQuery && rangeQuery.length) {
        options["rangeFilterBy"] = { $and: rangeQuery } as any;
      }
    }

    const result = await registerService.queryRegisters(filter, options);
    return res.status(httpStatus.OK).send(result);
  }
);

// const updateRegister = catchAsync(
//   async (req: AuthenticatedRequest, res: Response) => {
//     if (!req.userData) {
//       throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
//     }
//     const register = await registerService.updateRegisterById(
//       req.params.registerId,
//       req.body
//     );
//     return res.status(httpStatus.OK).send({
//       message: "Updated successfully!",
//       data: register,
//       status: true,
//       code: "OK",
//       issue: null,
//     });
//   }
// );


const updateRegister = catchAsync(async (req: Request, res: Response) => {
  const { registerId } = req.params;
  let { cashUsages, ...otherFields } = req.body;

  const existingRegister = await SalesRegister.findById(registerId);
  if (!existingRegister) {
    return res.status(404).json({ success: false, message: 'Register not found' });
  }

  // Normalize single object to array
  if (cashUsages && !Array.isArray(cashUsages)) {
    cashUsages = [cashUsages]; // wrap in array
  }

  if (Array.isArray(cashUsages) && cashUsages.length > 0) {
    existingRegister.cashUsage.push(...cashUsages); // append to existing
  }

  Object.assign(existingRegister, otherFields);
  await existingRegister.save();

  return res.status(200).json({
    success: true,
    message: 'Register updated successfully',
    data: existingRegister,
  });
});


const deleteRegister = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await registerService.deleteRegisterById(req.params.registerId);
    return res.status(httpStatus.OK).send({
      message: "Deleted successfully!",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const toggleRegisterStatus = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const register = await registerService.getRegisterById(
      req.params.registerId
    );
    if (!register) {
      throw new ApiError(httpStatus.NOT_FOUND, "Register not found");
    }
    register.isActive = !register.isActive;
    await register.save();
    return res.status(httpStatus.OK).send({
      message: "Status updated successfully.",
      data: register,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getRegisterById = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const register = await registerService.getRegisterById(
      req.params.registerId
    );
    if (!register || register.isDeleted) {
      throw new ApiError(httpStatus.NOT_FOUND, "Register not found");
    }
    return res.status(httpStatus.OK).send({
      message: "Successful.",
      data: register,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

// const getRegisterCurentDate = catchAsync(
//   async (req: AuthenticatedRequest, res: Response) => {
//     if (!req.userData) {
//       throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
//     }
//     const outletId = req.params.outletId;
//     const userId = req.userData.Id;
//     let inputDate = new Date();
//     if (isNaN(inputDate.getTime())) {
//       throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
//     }
//     const startOfDay = new Date(inputDate);
//     startOfDay.setHours(0, 0, 0, 0);
//     let endOfDay = new Date(inputDate);
//     endOfDay.setHours(23, 59, 59, 999);

//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Aaj ke din ka start time
//     const tomorrow = new Date(today);
//     tomorrow.setDate(today.getDate() + 1); // Next day ka start time

//     let startDate: Date;
//     const endDate = new Date(); // today till now or end of day
//     endDate.setHours(23, 59, 59, 999);

//     // Get last close register
//     const latestCloseRegister = await SalesRegister.findOne({
//       outletId: new mongoose.Types.ObjectId(outletId)
//     })
//       .sort({ createdAt: -1 })
//       .lean();

//     console.log('------latestCloseRegister', latestCloseRegister);

//     if (latestCloseRegister && latestCloseRegister.createdAt) {
//       // Start from just after the last closed register
//       startDate = new Date(latestCloseRegister.createdAt);
//       startDate.setMilliseconds(startDate.getMilliseconds() + 1);
//     } else {
//       // If no previous close, start from today beginning
//       startDate = new Date();
//       startDate.setHours(0, 0, 0, 0);
//     }

//     // const pipeline = [
//     //   {
//     //     $addFields: {
//     //       createdAtDate: {
//     //         $toDate: "$invoiceDate"
//     //       }
//     //     },
//     //   },
//     //   {
//     //     $match: {
//     //       outletId: new mongoose.Types.ObjectId(outletId),
//     //       status: "",
//     //       createdAtDate: {
//     //         $gte: startDate,
//     //         $lt: endDate,
//     //       },
//     //     },
//     //   },
//     //   { $unwind: "$amountReceived" },
//     //   {
//     //     $group: {
//     //       _id: "$amountReceived.paymentModeId",
//     //       totalAmount: { $sum: "$amountReceived.amount" },
//     //     },
//     //   },
//     //   {
//     //     $lookup: {
//     //       from: "paymentmodes",
//     //       localField: "_id",
//     //       foreignField: "_id",
//     //       as: "paymentModeData",
//     //     },
//     //   },
//     //   { $unwind: "$paymentModeData" },
//     //   {
//     //     $project: {
//     //       _id: 1,
//     //       totalAmount: 1,
//     //       paymentModeName: "$paymentModeData.modeName",
//     //     },
//     //   },
//     // ];

//     const pipeline: PipelineStage[] = [
//       {
//         $addFields: {
//           createdAtDate: { $toDate: "$invoiceDate" },
//         },
//       },
//       {
//         $match: {
//           outletId: new mongoose.Types.ObjectId(outletId),
//           status: "",
//           createdAtDate: {
//             $gte: startDate,
//             $lte: endDate,
//           },
//         },
//       },
//       {
//         $unwind: "$amountReceived",
//       },
//       {
//         $group: {
//           _id: {
//             date: {
//               $dateToString: { format: "%Y-%m-%d", date: "$createdAtDate" }
//             },
//             paymentModeId: "$amountReceived.paymentModeId"
//           },
//           totalAmount: { $sum: "$amountReceived.amount" },
//         },
//       },
//       {
//         $lookup: {
//           from: "paymentmodes",
//           localField: "_id.paymentModeId",
//           foreignField: "_id",
//           as: "paymentModeData",
//         },
//       },
//       { $unwind: "$paymentModeData" },
//       {
//         $project: {
//           date: "$_id.date",
//           paymentModeId: "$_id.paymentModeId",
//           totalAmount: 1,
//           paymentModeName: "$paymentModeData.modeName",
//         },
//       },
//       {
//         $group: {
//           _id: "$date",
//           payments: {
//             $push: {
//               _id: "$paymentModeId",
//               totalAmount: "$totalAmount",
//               paymentModeName: "$paymentModeName",
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           date: "$_id",
//           payments: 1,
//         },
//       },
//       { $sort: { date: 1 } }
//     ];

//     const result = await Invoice.aggregate(pipeline);

//     // const existingRegister = await registerService.findRegister({
//     //   createdBy: userId,
//     //   outletId
//     // });

//      const existingRegister = await SalesRegister.findOne({
//     outletId,
//     createdBy: userId
//      }).sort({ createdAt: -1 });


//     const closeRegister = await SalesRegister.findOne({
//     outletId,
//     createdBy: userId,
//     isClosed:true
//      }).sort({ createdAt: -1 });


//     return res.status(httpStatus.OK).send({
//       message: "Successful.",
//       data: { existingRegister, closeRegister, result },
//       status: true,
//       code: "OK",
//       issue: null,
//     });
//   }
// );


const getRegisterCurentDate = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    const outletId = req.params.outletId;
    const userId = req.userData.Id;

    // Step 1: Get last closed register
    // const lastClosedRegister = await SalesRegister.findOne({
    //   outletId,
    //   createdBy: userId,
    //   isOpened: true,
    //   // isDeleted: false,
    // })
    //   .sort({ openedAt: -1 })
    //   .lean();

    const lastClosedRegister = await SalesRegister.findOne({
      outletId,
      createdBy: userId,
      // isClosed: true,      // ✅ last closed chahiye
      // isDeleted: false,  // agar deleted skip karna ho
    })
      .sort({ createdAt: -1 }) // ✅ latest closed date ke hisaab se sort
      .lean();

    const dddd = lastClosedRegister?.closedAt ? lastClosedRegister?.closedAt : lastClosedRegister?.openedAt

    const startDate = dddd
      ? new Date(dddd.getTime() + 1)
      : new Date(new Date().setHours(0, 0, 0, 0));

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    // Step 2: Aggregate today's invoice data by date and payment mode
    const pipeline: PipelineStage[] = [
      {
        $addFields: {
          createdAtDate: { $toDate: "$invoiceDate" },
        },
      },
      {
        $match: {
          outletId: new mongoose.Types.ObjectId(outletId),
          status: "",
          invoiceDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      { $unwind: "$amountReceived" },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$invoiceDate" },
            },
            paymentModeId: "$amountReceived.paymentModeId",
          },
          totalAmount: { $sum: "$amountReceived.amount" },
        },
      },
      {
        $lookup: {
          from: "paymentmodes",
          localField: "_id.paymentModeId",
          foreignField: "_id",
          as: "paymentModeData",
        },
      },
      { $unwind: "$paymentModeData" },
      {
        $project: {
          date: "$_id.date",
          paymentModeId: "$_id.paymentModeId",
          totalAmount: 1,
          paymentModeName: "$paymentModeData.modeName",
        },
      },
      {
        $group: {
          _id: "$date",
          payments: {
            $push: {
              _id: "$paymentModeId",
              totalAmount: "$totalAmount",
              paymentModeName: "$paymentModeName",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          payments: 1,
        },
      },
      { $sort: { invoiceDate: 1 } },
    ];



    const result = await Invoice.aggregate(pipeline);

    // Step 3: Get current register (open or closed today)
    const latestRegister = await SalesRegister.findOne({
      outletId,
      createdBy: userId,
      isDeleted: false,
      isOpened: true,
    }).sort({ createdAt: -1 });

    return res.status(httpStatus.OK).send({
      message: "Successful.",
      data: {
        register: latestRegister || null,
        result,
      },
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getRegisterPreviousDate = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }
    const outletId = req.params.outletId;
    const userId = req.userData.Id;

    // ✅ Find the most recent closed register before now
    const lastClosedRegister = await SalesRegister.findOne({
      outletId,
      createdBy: userId,
      isClosed: true,
      isDeleted: false,
    })
      .sort({ closedAt: -1 }); // sort by closing date descending to get the latest

    return res.status(httpStatus.OK).send({
      message: "Successful.",
      data: lastClosedRegister,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);


const getGivenChangeSum = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    const outletId = req.params.outletId || req.body.outletId;
    if (!outletId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Outlet ID is required");
    }

    // Use current date or allow date override
    let inputDate = req.body.date ? new Date(req.body.date) : new Date();
    if (isNaN(inputDate.getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
    }

    // Create start and end of the day
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(inputDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Aggregate pipeline to sum givenChange
    const pipeline = [
      {
        $match: {
          outletId: outletId,
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalGivenChange: { $sum: "$givenChange" },
        },
      },
      {
        $project: {
          _id: 0,
          totalGivenChange: 1,
        },
      },
    ];

    const result = await Invoice.aggregate(pipeline);
    const totalGivenChange = result[0]?.totalGivenChange || 0;

    return res.status(httpStatus.OK).send({
      message: "Given change summed successfully.",
      data: { outletId, date: inputDate.toISOString(), totalGivenChange },
      status: true,
      code: "OK",
      issue: null,
    });
  }
);


export {
  createRegister,
  getRegisters,
  updateRegister,
  deleteRegister,
  toggleRegisterStatus,
  getRegisterById,
  getRegisterCurentDate,
  createCloseRegister,
  getGivenChangeSum,
  getRegisterPreviousDate
};

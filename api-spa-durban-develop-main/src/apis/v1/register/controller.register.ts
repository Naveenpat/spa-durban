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
import { searchKeys, allowedDateFilterKeys } from "./schema.register";
import { UserEnum } from "../../../utils/enumUtils";
import { AuthenticatedRequest } from "../../../utils/interface";
import Invoice from "../invoice/schema.invoice";
import mongoose from "mongoose";
import { Mongoose } from "mongoose";
import puppeteer from 'puppeteer';
import { sendEmail } from '../../../helper/sendEmail';

export const generatePDFBuffer = async (html: string): Promise<Buffer> => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  return Buffer.from(pdf); // ✅ This is now compatible with nodemailer
};

const generateCloseRegisterHTML = (closeRegister: any,bankDeposit:any,carryForwardBalance:any, outletData: any,openingBalance:any) => {
  const rows = closeRegister
    .map(
      (item: any) => `
      <tr>
        <td>${item.paymentModeName}</td>
        <td>${item.totalAmount}</td>
        <td>${item.manual}</td>
      </tr>
    `
    )
    .join('');

  return `
    <html>
    <head>
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
        }
        td, th {
          border: 1px solid #333;
          padding: 8px;
          text-align: left;
        }
      </style>
    </head>
    <body>
      <h2>Close Register Summary</h2>
      <h2>Outlet Name - ${outletData?.name}</h2>
      <table>
        <thead>
          <tr><th>Payment Mode</th><th>Total Amount</th></tr><th>Manual Amount</th></tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
       <p><strong>Opening Balance:</strong> ₹${openingBalance}</p>
      <p><strong>Bank Deposit:</strong> ₹${bankDeposit}</p>
      <p><strong>Carry Forward Balance:</strong> ₹${carryForwardBalance}</p>
    </body>
    </html>
  `;
};


const createRegister = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    const { outletId, date } = req.body;
    const userId = req.userData.Id;

    // Agar date na ho, to aaj ki date lo
    let inputDate = date ? new Date(date) : new Date();

    // Date validation (invalid format handle karo)
    if (isNaN(inputDate.getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
    }

    // Start & End of Day set karo (00:00 - 23:59)
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(inputDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check karo agar aaj ka register pehle se exist karta hai
    const existingRegister = await registerService.findRegister({
      createdBy: userId,
      outletId,
      startOfDay,
      endOfDay,
    });

    if (existingRegister) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Register entry already exists for this user and outlet today"
      );
    }

    // Naya register create karo
    const register = await registerService.createRegister({
      ...req.body,
      createdBy: userId,
      createdAt: new Date(), // Ensure current timestamp is stored
    });

    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: register,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);
const createCloseRegister = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    const { outletId, date, closeRegister, bankDeposit = 0 } = req.body;

    const userId = req.userData.Id;

    // Agar date na ho, to aaj ki date lo
    let inputDate = date ? new Date(date) : new Date();

    // Date validation (invalid format handle karo)
    if (isNaN(inputDate.getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
    }

    // Start & End of Day set karo (00:00 - 23:59)
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(inputDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check karo agar aaj ka register pehle se exist karta hai
    const existingRegister = await registerService.findCloseRegister({
      createdBy: userId,
      outletId,
      startOfDay,
      endOfDay,
    });

    if (existingRegister) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Register entry already exists for this user and outlet today"
      );
    }

    // Find the "cash" payment mode from closeRegister
    const cashEntry = closeRegister.find(
      (entry: any) => entry.paymentModeName.toLowerCase() === "cash"
    );

    const totalCash = cashEntry ? parseFloat(cashEntry.totalAmount) || 0 : 0;
    const deposit = parseFloat(bankDeposit) || 0;

    // Calculate carry forward
    const carryForwardBalance = Math.max(totalCash - deposit, 0);

    // Naya register create karo
    const register = await registerService.createCloseRegister({
      ...req.body,
      createdBy: userId,
      carryForwardBalance,
      isActive: false,
      createdAt: new Date(), // Ensure current timestamp is stored
    });

    const outletData = await outletService.getOutletById(req.body.
      outletId
    )


    const htmlContent = generateCloseRegisterHTML(closeRegister,bankDeposit,carryForwardBalance, outletData,req.body.openingBalance);
    const pdfBuffer = await generatePDFBuffer(htmlContent);

    const emailData = {
      emailSubject: 'Close Register Report',
      emailBody: '<p>Attached is your daily close register report.</p>',
      sendTo: outletData?.email, // or dynamic
      sendFrom: 'noreply@yourdomain.com',
      attachments: [
        {
          filename: 'CloseRegister.pdf',
          content: pdfBuffer,
        },
      ],
    }
    await sendEmail(emailData,outletData);



    // return true;
    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: register,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

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

const updateRegister = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }
    const register = await registerService.updateRegisterById(
      req.params.registerId,
      req.body
    );
    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: register,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

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

const getRegisterCurentDate = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }
    const outletId = req.params.outletId;
    const userId = req.userData.Id;
    let inputDate = new Date();
    if (isNaN(inputDate.getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
    }
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(inputDate);
    endOfDay.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Aaj ke din ka start time
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Next day ka start time

    const pipeline = [
      {
        $addFields: {
          createdAtDate: {
            $dateFromString: {
              dateString: "$createdAt",
              format: "%Y-%m-%d %H:%M:%S",
            },
          },
        },
      },
      {
        $match: {
          outletId: new mongoose.Types.ObjectId(outletId),
          createdAtDate: {
            $gte: startOfDay,
            $lt: endOfDay,
          },
        },
      },
      { $unwind: "$amountReceived" },
      {
        $group: {
          _id: "$amountReceived.paymentModeId",
          totalAmount: { $sum: "$amountReceived.amount" },
        },
      },
      {
        $lookup: {
          from: "paymentmodes",
          localField: "_id",
          foreignField: "_id",
          as: "paymentModeData",
        },
      },
      { $unwind: "$paymentModeData" },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          paymentModeName: "$paymentModeData.modeName",
        },
      },
    ];


    const result = await Invoice.aggregate(pipeline);

    const existingRegister = await registerService.findRegister({
      createdBy: userId,
      outletId,
      startOfDay,
      endOfDay,
    });

    const closeRegister = await registerService.findCloseRegister({
      createdBy: userId,
      outletId,
      startOfDay,
      endOfDay,
    });

    return res.status(httpStatus.OK).send({
      message: "Successful.",
      data: { existingRegister, closeRegister, result },
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


    // ✅ Automatically calculate yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const startOfDay = new Date(yesterday);
    const endOfDay = new Date(yesterday);
    endOfDay.setHours(23, 59, 59, 999);

    // ✅ Query CloseRegister for yesterday
    const existingRegister = await registerService.findCloseRegister({
      createdBy: userId,
      outletId,
      startOfDay,
      endOfDay,
    });
    return res.status(httpStatus.OK).send({
      message: "Successful.",
      data: existingRegister,
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

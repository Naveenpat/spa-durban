import { Request, Response } from "express";
import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  isBefore,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import httpStatus from "http-status";
import ApiError from "../../../../utilities/apiError";
import catchAsync from "../../../../utilities/catchAsync";
import { analyticsService } from "../service.index";
import { DateFilter, AuthenticatedRequest } from "../../../utils/interface";
import mongoose, { PipelineStage } from "mongoose";
import Invoice, { searchKeys, allowedDateFilterKeys } from "../invoice/schema.invoice";
import {
  getFilterQuery,
  getRangeQuery,
  getSearchQuery,
  checkInvalidParams,
} from "../../../utils/utils";
import { pick } from "../../../../utilities/pick";
import CloseRegister from "../register/schema.closereegister";
import SalesRegister from "../register/schema.salesreegister";
import { pipeline } from "stream";
import Outlet from "../outlet/schema.outlet";
import Customer from "../customer/schema.customer";

//-----------------------------------------------

const getTopItems = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const limit = (req.query.limit ? req.query.limit : 10) as number;
    const page = (req.query.page ? req.query.page : 1) as number;
    const sortByValue = (
      req.query.sortByValue ? req.query.sortByValue : -1
    ) as number;

    let startDate = req.query.startDate as string;
    let endDate = req.query.endDate as string;
    let dateFilterKey = req.query.dateFilterKey as string;
    let outletId = req.query.outletId as string;
    let itemType = req.query.itemType as string[];
    let matchArray = [];

    if (outletId && outletId !== "") {
      matchArray.push({
        outletId: new mongoose.Types.ObjectId(outletId),
      });
    }

    if (!startDate || startDate === "") {
      startDate = format(new Date(), "yyyy-MM-dd");
    }

    if (!endDate || endDate === "") {
      endDate = format(new Date(), "yyyy-MM-dd");
    }

    if (!dateFilterKey || dateFilterKey === "") {
      dateFilterKey = "createdAt";
    }

    //date filter
    const datefilterQuery = await analyticsService.getDateFilterQuery(
      {
        startDate,
        endDate,
        dateFilterKey,
      },
      allowedDateFilterKeys
    );

    if (!datefilterQuery || !datefilterQuery.length) {
      throw new ApiError(httpStatus.NOT_FOUND, "something went wrong");
    }

    matchArray.push(...datefilterQuery);

    let matchQuery = { $and: matchArray };

    let result = await analyticsService.getTopProducts(
      matchQuery,
      itemType,
      limit,
      page,
      sortByValue
    );
    return res.status(httpStatus.OK).send({
      message: "All OK",
      status: true,
      ...result,
    });
  }
);
//-----------------------------------------------

const getTopCustomer = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const limit = (req.query.limit ? req.query.limit : 10) as number;
    const page = (req.query.page ? req.query.page : 1) as number;
    const sortByValue = (
      req.query.sortByValue ? req.query.sortByValue : -1
    ) as number;

    let startDate = req.query.startDate as string;
    let endDate = req.query.endDate as string;
    let dateFilterKey = req.query.dateFilterKey as string;
    let outletId = req.query.outletId as string;
    let matchArray = [];
    matchArray.push({
      isDeleted: false,
    });

    if (outletId && outletId !== "") {
      matchArray.push({
        outletId: new mongoose.Types.ObjectId(outletId),
      });
    }

    if (!startDate || startDate === "") {
      startDate = format(new Date(), "yyyy-MM-dd");
    }

    if (!endDate || endDate === "") {
      endDate = format(new Date(), "yyyy-MM-dd");
    }

    if (!dateFilterKey || dateFilterKey === "") {
      dateFilterKey = "createdAt";
    }

    //date filter
    const datefilterQuery = await analyticsService.getDateFilterQuery(
      {
        startDate,
        endDate,
        dateFilterKey,
      },
      allowedDateFilterKeys
    );

    if (!datefilterQuery || !datefilterQuery.length) {
      throw new ApiError(httpStatus.NOT_FOUND, "something went wrong");
    }

    matchArray.push(...datefilterQuery);
    let matchQuery = { $and: matchArray };
    let result = await analyticsService.getTopCustomer(
      matchQuery,
      limit,
      page,
      sortByValue
    );
    return res.status(httpStatus.OK).send({
      message: "All OK",
      status: true,
      ...result,
    });
  }
);
//-----------------------------------------------

const getTopOutlet = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const limit = (req.query.limit ? req.query.limit : 10) as number;
    const page = (req.query.page ? req.query.page : 1) as number;
    const sortByValue = (
      req.query.sortByValue ? req.query.sortByValue : -1
    ) as number;

    let startDate = req.query.startDate as string;
    let endDate = req.query.endDate as string;
    let dateFilterKey = req.query.dateFilterKey as string;
    let matchArray = [];
    matchArray.push({
      isDeleted: false,
    });

    if (!startDate || startDate === "") {
      startDate = format(new Date(), "yyyy-MM-dd");
    }

    if (!endDate || endDate === "") {
      endDate = format(new Date(), "yyyy-MM-dd");
    }

    if (!dateFilterKey || dateFilterKey === "") {
      dateFilterKey = "createdAt";
    }

    //date filter
    const datefilterQuery = await analyticsService.getDateFilterQuery(
      {
        startDate,
        endDate,
        dateFilterKey,
      },
      allowedDateFilterKeys
    );

    if (!datefilterQuery || !datefilterQuery.length) {
      throw new ApiError(httpStatus.NOT_FOUND, "something went wrong");
    }

    matchArray.push(...datefilterQuery);
    let matchQuery = { $and: matchArray };
    let result = await analyticsService.getTopOutlet(
      matchQuery,
      limit,
      page,
      sortByValue
    );
    return res.status(httpStatus.OK).send({
      message: "All OK",
      status: true,
      ...result,
    });
  }
);
//-----------------------------------------------

const getOutletReport = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const reportDuration = req.query.reportDuration as string;
    const startDate = req.query.startDate as string
    const endDate = req.query.endDate as string

    let result = await analyticsService.getOutletReportData(reportDuration, startDate, endDate);
    //

    res.status(httpStatus.OK).send({
      message: "Successfull!",
      data: result,
      status: true,
    });
  }
);

const getOutletDailyReport = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const reportDuration = req.query.reportDuration as string;
    const { outletId } = req.query;
    let result = await analyticsService.getDailyOutletReportSingleDay(outletId);
    //

    res.status(httpStatus.OK).send({
      message: "Successfull!",
      data: result,
      status: true,
    });
  }
);

const getSalesReportByOutlet = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { outletId, page = 1, limit = 10, startDate, endDate } = req.query;
  // console.log('-----req.query',req.query)
  if (!mongoose.Types.ObjectId.isValid(outletId as string)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid outletId');
  }

  const skip = (Number(page) - 1) * Number(limit);

  // Construct createdAt filter from startDate and endDate
  const invoiceDateFilter: Record<string, any> = {};
  if (startDate) {
    invoiceDateFilter.$gte = new Date(startDate as string);
  }
  if (endDate) {
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999); // end of the day
    invoiceDateFilter.$lte = end;
  }

  const sortKey = (req.query.sortBy as string) || 'createdAt';
  const sortOrderParam = req.query.sortOrder as string | number;

  // Convert to number: -1 or 1
  let sortOrder: 1 | -1 = -1;
  if (sortOrderParam === 'asc' || sortOrderParam === 1 || sortOrderParam === '1') {
    sortOrder = 1;
  }

  // console.log('-----',invoiceDateFilter)
  const pipeline: PipelineStage[] = [
    {
      $match: {
        outletId: new mongoose.Types.ObjectId(outletId as string),
        isDeleted: false,
        ...(Object.keys(invoiceDateFilter).length > 0 ? { invoiceDate: invoiceDateFilter } : {}),
      },
    },
    {
      $lookup: {
        from: "outlets",
        localField: "outletId",
        foreignField: "_id",
        as: "outlet",
        pipeline: [
          { $match: { isDeleted: false, isActive: true } },
          { $project: { phone: 1, name: 1, logo: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customerDetails",
        pipeline: [
          { $match: { isDeleted: false, isActive: true } },
          {
            $project: {
              phone: 1,
              email: 1,
              address: 1,
              customerName: 1,
              loyaltyPoints: 1,
              cashBackAmount: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "paymentmodes",
        localField: "amountReceived.paymentModeId",
        foreignField: "_id",
        as: "paymentModeDetails",
      },
    },
    {
      $addFields: {
        amountReceived: {
          $map: {
            input: "$amountReceived",
            as: "received",
            in: {
              $mergeObjects: [
                "$$received",
                {
                  modeName: {
                    $let: {
                      vars: {
                        paymentMode: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$paymentModeDetails",
                                as: "paymentModeDetail",
                                cond: {
                                  $and: [
                                    { $eq: ["$$paymentModeDetail._id", "$$received.paymentModeId"] },
                                    { $eq: ["$$paymentModeDetail.isDeleted", false] },
                                    { $eq: ["$$paymentModeDetail.isActive", true] },
                                  ],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: "$$paymentMode.modeName",
                    },
                  },
                },
              ],
            },
          },
        },
        customerName: { $arrayElemAt: ["$customerDetails.customerName", 0] },
        customerPhone: { $arrayElemAt: ["$customerDetails.phone", 0] },
        customerEmail: { $arrayElemAt: ["$customerDetails.email", 0] },
        customerAddress: { $arrayElemAt: ["$customerDetails.address", 0] },
        outletName: { $arrayElemAt: ["$outlet.name", 0] },
        outletPhone: { $arrayElemAt: ["$outlet.phone", 0] },
        outletLogo: { $arrayElemAt: ["$outlet.logo", 0] },
      },
    },
    { $unset: ["paymentModeDetails", "customerDetails", "outlet"] },
    {
      $project: {
        invoiceNumber: 1,
        customerName: 1,
        invoiceDate: 1,
        status: 1,
        createdAt: 1,
        totalAmount: 1,
        balanceDue: 1,
        paymentModes: {
          $map: {
            input: "$amountReceived",
            as: "item",
            in: "$$item.modeName",
          },
        },
      },
    },
    { $skip: skip },
    { $limit: Number(limit) },
  ];

  pipeline.push({ $sort: { [sortKey]: sortOrder } });

  const data = await Invoice.aggregate(pipeline);

  const totalCount = await Invoice.countDocuments({
    outletId: new mongoose.Types.ObjectId(outletId as string),
    isDeleted: false,
    ...(Object.keys(invoiceDateFilter).length > 0 ? { invoiceDate: invoiceDateFilter } : {}),
  });

  const totalSalesData = await Invoice.aggregate([
    {
      $match: {
        outletId: new mongoose.Types.ObjectId(outletId as string),
        isDeleted: false,
        ...(Object.keys(invoiceDateFilter).length > 0 ? { invoiceDate: invoiceDateFilter } : {}),
      },
    },
    {
      $group: {
        _id: null,
        totalSalesAmount: { $sum: "$totalAmount" },
      },
    },
  ]);


  return res.status(httpStatus.OK).send({
    message: 'Outlet Sales fetched successfully.',
    data: {
      invoices: data,
      totalSalesData,
      page: Number(page),
      limit: Number(limit),
      totalCount,
    },
    status: true,
    code: 'OK',
    issue: null,
  });
});

const getSalesReportByCustomer = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { customerId, page = 1, limit = 10, startDate, endDate } = req.query;

  if (!mongoose.Types.ObjectId.isValid(customerId as string)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid customerId');
  }

  const skip = (Number(page) - 1) * Number(limit);

  const invoiceDateFilter: Record<string, any> = {};
  if (startDate) invoiceDateFilter.$gte = new Date(startDate as string);
  if (endDate) {
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999);
    invoiceDateFilter.$lte = end;
  }

  const sortKey = (req.query.sortBy as string) || 'createdAt';
  const sortOrderParam = req.query.sortOrder as string | number;

  // Convert to number: -1 or 1
  let sortOrder: 1 | -1 = -1;
  if (sortOrderParam === 'asc' || sortOrderParam === 1 || sortOrderParam === '1') {
    sortOrder = 1;
  }

  const pipeline: PipelineStage[] = [
    {
      $match: {
        customerId: new mongoose.Types.ObjectId(customerId as string),
        isDeleted: false,
        ...(Object.keys(invoiceDateFilter).length > 0 ? { invoiceDate: invoiceDateFilter } : {}),
      },
    },
    {
      $lookup: {
        from: "outlets",
        localField: "outletId",
        foreignField: "_id",
        as: "outlet",
        pipeline: [
          { $match: { isDeleted: false, isActive: true } },
          { $project: { phone: 1, name: 1, logo: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customerDetails",
        pipeline: [
          { $match: { isDeleted: false, isActive: true } },
          { $project: { phone: 1, email: 1, address: 1, customerName: 1, loyaltyPoints: 1, cashBackAmount: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: "paymentmodes",
        localField: "amountReceived.paymentModeId",
        foreignField: "_id",
        as: "paymentModeDetails",
      },
    },
    {
      $addFields: {
        amountReceived: {
          $map: {
            input: "$amountReceived",
            as: "received",
            in: {
              $mergeObjects: [
                "$$received",
                {
                  modeName: {
                    $let: {
                      vars: {
                        paymentMode: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$paymentModeDetails",
                                as: "paymentModeDetail",
                                cond: {
                                  $and: [
                                    { $eq: ["$$paymentModeDetail._id", "$$received.paymentModeId"] },
                                    { $eq: ["$$paymentModeDetail.isDeleted", false] },
                                    { $eq: ["$$paymentModeDetail.isActive", true] },
                                  ],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: "$$paymentMode.modeName",
                    },
                  },
                },
              ],
            },
          },
        },
        customerName: { $arrayElemAt: ["$customerDetails.customerName", 0] },
        customerPhone: { $arrayElemAt: ["$customerDetails.phone", 0] },
        customerEmail: { $arrayElemAt: ["$customerDetails.email", 0] },
        customerAddress: { $arrayElemAt: ["$customerDetails.address", 0] },
        outletName: { $arrayElemAt: ["$outlet.name", 0] },
        outletPhone: { $arrayElemAt: ["$outlet.phone", 0] },
        outletLogo: { $arrayElemAt: ["$outlet.logo", 0] },
      },
    },
    { $unset: ["paymentModeDetails", "customerDetails", "outlet"] },
    {
      $project: {
        invoiceNumber: 1,
        customerName: 1,
        invoiceDate: 1,
        createdAt: 1,
        status: 1,
        totalAmount: 1,
        balanceDue: 1,
        paymentModes: {
          $map: {
            input: "$amountReceived",
            as: "item",
            in: "$$item.modeName",
          },
        },
      },
    },
    { $skip: skip },
    { $limit: Number(limit) },
  ];


  pipeline.push({ $sort: { [sortKey]: sortOrder } });

  const data = await Invoice.aggregate(pipeline);

  const totalCount = await Invoice.countDocuments({
    customerId: new mongoose.Types.ObjectId(customerId as string),
    isDeleted: false,
    ...(Object.keys(invoiceDateFilter).length > 0 ? { invoiceDate: invoiceDateFilter } : {}),
  });

  const totalSalesData = await Invoice.aggregate([
    {
      $match: {
        customerId: new mongoose.Types.ObjectId(customerId as string),
        isDeleted: false,
        ...(Object.keys(invoiceDateFilter).length > 0 ? { invoiceDate: invoiceDateFilter } : {}),
      },
    },
    {
      $group: {
        _id: null,
        totalSalesAmount: { $sum: "$totalAmount" },
      },
    },
  ]);

  return res.status(httpStatus.OK).send({
    message: 'Customer Sales fetched successfully.',
    data: {
      invoices: data,
      totalSalesData,
      page: Number(page),
      limit: Number(limit),
      totalCount,
    },
    status: true,
    code: 'OK',
    issue: null,
  });
});
//-------
const getSalesChartDataReportByOutlet = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { outletId, startDate, endDate, reportDuration } = req.query;

    if (!mongoose.Types.ObjectId.isValid(outletId as string)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid outletId");
    }
    if (!startDate || !endDate || !reportDuration) {
      throw new ApiError(httpStatus.BAD_REQUEST, "startDate, endDate, reportDuration are required");
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999);

    const matchFilter = {
      outletId: new mongoose.Types.ObjectId(outletId as string),
      isDeleted: false,
      invoiceDate: { $gte: start, $lte: end },
    };

    // --------------------------
    // 📌 Label Builder
    // --------------------------
    let labels: string[] = [];

    if (reportDuration === "DAILY") {
      // 24 hours
      labels = Array.from({ length: 24 }, (_, i) =>
        i.toString().padStart(2, "0") + ":00"
      );
    } else if (reportDuration === "WEEKLY") {
  // 7 din ending at endDate
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  labels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(end);
    d.setDate(end.getDate() - (6 - i));
    return days[d.getDay()];
  });
} else if (reportDuration === "MONTHLY") {
      // Dates of month (01–31)
      const backOneMonth = new Date(end);
      backOneMonth.setMonth(end.getMonth() - 1);
      const daysInRange =
        Math.ceil((end.getTime() - backOneMonth.getTime()) / (1000 * 60 * 60 * 24));
      labels = Array.from({ length: daysInRange }, (_, i) =>
        (i + 1).toString().padStart(2, "0")
      );
    }

    // --------------------------
    // 📌 Pipeline Builder
    // --------------------------
    const pipeline = (s: Date, e: Date): PipelineStage[] => [
      {
        $match: {
          ...matchFilter,
          invoiceDate: { $gte: s, $lte: e },
        },
      },
      {
        $group: {
          _id:
            reportDuration === "DAILY"
              ? { $hour: "$invoiceDate" }
              : reportDuration === "WEEKLY"
              ? { $dayOfWeek: "$invoiceDate" }
              : { $dayOfMonth: "$invoiceDate" },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ];

    // --------------------------
    // 📌 Current & Last Period Ranges
    // --------------------------
    let lastStart: Date, lastEnd: Date;

    if (reportDuration === "DAILY") {
      // ek din pehle
      lastStart = new Date(start);
      lastStart.setDate(start.getDate() - 1);
      lastEnd = new Date(end);
      lastEnd.setDate(end.getDate() - 1);
    } else if (reportDuration === "WEEKLY") {
      // 7 din pehle
      lastStart = new Date(start);
      lastStart.setDate(start.getDate() - 7);
      lastEnd = new Date(end);
      lastEnd.setDate(end.getDate() - 7);
    } else {
      // monthly
      lastStart = new Date(start);
      lastStart.setMonth(start.getMonth() - 1);
      lastEnd = new Date(end);
      lastEnd.setMonth(end.getMonth() - 1);
    }

    // --------------------------
    // 📌 Fetch Sales Data
    // --------------------------
    const [lastPeriod, currentPeriod] = await Promise.all([
      Invoice.aggregate(pipeline(lastStart, lastEnd)),
      Invoice.aggregate(pipeline(start, end)),
    ]);

    // --------------------------
    // 📌 Format Data to Labels
    // --------------------------
   const formatData = (data: any[]) =>
  labels.map((label) => {
    let keyVal:any;
    if (reportDuration === "DAILY") {
      keyVal = parseInt(label.split(":")[0]); // hour
    } else if (reportDuration === "WEEKLY") {
      // convert day name → Mongo dayOfWeek number
      const mapDay: Record<string, number> = {
        Sunday: 1,
        Monday: 2,
        Tuesday: 3,
        Wednesday: 4,
        Thursday: 5,
        Friday: 6,
        Saturday: 7,
      };
      keyVal = mapDay[label];
    } else if (reportDuration === "MONTHLY") {
      keyVal = parseInt(label); // day of month
    }
    const found = data.find((d) => d._id === keyVal);
    return found ? found.total : 0;
  });


    const lastData = formatData(lastPeriod);
    const currentData = formatData(currentPeriod);

    // --------------------------
    // 📌 Sales by Payment Mode
    // --------------------------
    const salesByPaymentMode = await Invoice.aggregate([
      { $match: matchFilter },
      { $unwind: "$amountReceived" },
      {
        $lookup: {
          from: "paymentmodes",
          localField: "amountReceived.paymentModeId",
          foreignField: "_id",
          as: "paymentMode",
        },
      },
      { $addFields: { modeName: { $arrayElemAt: ["$paymentMode.modeName", 0] } } },
      { $group: { _id: "$modeName", total: { $sum: "$amountReceived.amount" } } },
      { $sort: { total: -1 } },
    ]);

    // --------------------------
    // 📌 Top Customers
    // --------------------------
    const topCustomers = await Invoice.aggregate([
      { $match: matchFilter },
      { $group: { _id: "$customerId", total: { $sum: "$totalAmount" } } },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $project: { customerName: { $arrayElemAt: ["$customer.customerName", 0] }, total: 1 } },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);

    // --------------------------
    // 📌 Final Dataset
    // --------------------------
    const periodLabel =
      reportDuration === "DAILY" ? "Day" : reportDuration === "WEEKLY" ? "Week" : "Month";

    const datasets = [
      {
        label: `Last ${periodLabel} Sales`,
        data: lastData,
        borderColor: "#6b645f",
        backgroundColor: "#6b645f",
        fill: false,
        tension: 0.4,
      },
      {
        label: `Current ${periodLabel} Sales`,
        data: currentData,
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        fill: false,
        tension: 0.4,
      },
    ];

    return res.status(httpStatus.OK).send({
      message: "Sales chart data fetched successfully.",
      data: { salesByPaymentMode, topCustomers, datasets, labels },
      status: true,
      code: "OK",
      issue: null,
    });
  }
);


//-------

// const getSalesChartDataReportByOutlet = catchAsync(
//   async (req: AuthenticatedRequest, res: Response) => {
//     const { outletId, startDate, endDate, reportDuration } = req.query;

//     if (!mongoose.Types.ObjectId.isValid(outletId as string)) {
//       throw new ApiError(httpStatus.BAD_REQUEST, "Invalid outletId");
//     }

//     // 📌 Build invoiceDate filter
//     const invoiceDateFilter: Record<string, any> = {};
//     if (startDate) {
//       invoiceDateFilter.$gte = new Date(startDate as string);
//     }
//     if (endDate) {
//       const end = new Date(endDate as string);
//       end.setHours(23, 59, 59, 999);
//       invoiceDateFilter.$lte = end;
//     }

//     const matchFilter = {
//       outletId: new mongoose.Types.ObjectId(outletId as string),
//       isDeleted: false,
//       ...(Object.keys(invoiceDateFilter).length
//         ? { invoiceDate: invoiceDateFilter }
//         : {}),
//     };

//     // 📌 Report Duration Formatting
//     let groupId: any = {
//       $dateToString: { format: "%Y-%m-%d", date: "$invoiceDate" },
//     }; // default daily

//     if (reportDuration === "DAILY") {
//       groupId = { $hour: "$invoiceDate" }; // ⏰ hourly
//     } else if (reportDuration === "WEEKLY") {
//       groupId = { $dayOfWeek: "$invoiceDate" }; // 1=Sunday, 7=Saturday
//     } else if (reportDuration === "MONTHLY") {
//       groupId = { $dayOfMonth: "$invoiceDate" }; // 1–31
//     }

//     // 1. 🟢 Sales Over Time (generic, for filtering)
//     const salesByDate = await Invoice.aggregate([
//       { $match: matchFilter },
//       {
//         $group: {
//           _id: groupId,
//           total: { $sum: "$totalAmount" },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     // 2. 🔵 Sales by Payment Mode
//     const salesByPaymentMode = await Invoice.aggregate([
//       { $match: matchFilter },
//       { $unwind: "$amountReceived" },
//       {
//         $lookup: {
//           from: "paymentmodes",
//           localField: "amountReceived.paymentModeId",
//           foreignField: "_id",
//           as: "paymentMode",
//         },
//       },
//       {
//         $addFields: {
//           modeName: { $arrayElemAt: ["$paymentMode.modeName", 0] },
//         },
//       },
//       {
//         $group: {
//           _id: "$modeName",
//           total: { $sum: "$amountReceived.amount" },
//         },
//       },
//       { $sort: { total: -1 } },
//     ]);

//     // 3. 🟣 Top Customers
//     const topCustomers = await Invoice.aggregate([
//       { $match: matchFilter },
//       {
//         $group: {
//           _id: "$customerId",
//           total: { $sum: "$totalAmount" },
//         },
//       },
//       {
//         $lookup: {
//           from: "customers",
//           localField: "_id",
//           foreignField: "_id",
//           as: "customer",
//         },
//       },
//       {
//         $project: {
//           customerName: { $arrayElemAt: ["$customer.customerName", 0] },
//           total: 1,
//         },
//       },
//       { $sort: { total: -1 } },
//       { $limit: 5 },
//     ]);

//     // 4. 📊 Labels Banane Ka Logic
//     let labels: string[] = [];

//     if (reportDuration === "DAILY") {
//       labels = Array.from({ length: 24 }, (_, i) =>
//         i.toString().padStart(2, "0") + ":00"
//       );
//     } else if (reportDuration === "WEEKLY") {
//       labels = [
//         "Sunday",
//         "Monday",
//         "Tuesday",
//         "Wednesday",
//         "Thursday",
//         "Friday",
//         "Saturday",
//       ];
//     } else if (reportDuration === "MONTHLY") {
//       const now = new Date();
//       const daysInMonth = new Date(
//         now.getFullYear(),
//         now.getMonth() + 1,
//         0
//       ).getDate();
//       labels = Array.from({ length: daysInMonth }, (_, i) =>
//         (i + 1).toString().padStart(2, "0")
//       );
//     }

//     // 🟡 Last Month & Current Month Date Range
//     const now = new Date();
//     const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
//     const currentMonthEnd = new Date(
//       now.getFullYear(),
//       now.getMonth() + 1,
//       0,
//       23,
//       59,
//       59
//     );

//     const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//     const lastMonthEnd = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       0,
//       23,
//       59,
//       59
//     );

//     // 🟢 Pipeline Builder for Month Data
//     const monthPipeline = (start: Date, end: Date): PipelineStage[] => [
//       {
//         $match: {
//           ...matchFilter,
//           invoiceDate: { $gte: start, $lte: end },
//         },
//       },
//       {
//         $group: {
//           _id:
//             reportDuration === "DAILY"
//               ? { $hour: "$invoiceDate" }
//               : reportDuration === "WEEKLY"
//                 ? { $dayOfWeek: "$invoiceDate" }
//                 : { $dayOfMonth: "$invoiceDate" },
//           total: { $sum: "$totalAmount" },
//         },
//       },
//       {
//         $sort: { _id: 1 as 1 }, // ✅ explicitly cast as `1`
//       },
//     ];
//     // 🟢 Fetch Last & Current Month Sales
//     const [lastMonthSales, currentMonthSales] = await Promise.all([
//       Invoice.aggregate(monthPipeline(lastMonthStart, lastMonthEnd)),
//       Invoice.aggregate(monthPipeline(currentMonthStart, currentMonthEnd)),
//     ]);

//     // 🟢 Convert to arrays aligned with labels
//     const formatData = (data: any[]) =>
//       labels.map((label, idx) => {
//         let keyVal;
//         if (reportDuration === "DAILY") keyVal = idx; // 0–23
//         else if (reportDuration === "WEEKLY") keyVal = idx + 1; // 1–7
//         else if (reportDuration === "MONTHLY") keyVal = idx + 1; // 1–31
//         else keyVal = label;

//         const found = data.find((d) => d._id === keyVal || d._id === label);
//         return found ? found.total : 0;
//       });

//     const lastMonthData = formatData(lastMonthSales);
//     const currentMonthData = formatData(currentMonthSales);


//     const periodLabel =
//   reportDuration === "MONTHLY"
//     ? "Month"
//     : reportDuration === "WEEKLY"
//     ? "Week"
//     : reportDuration === "DAILY"
//     ? "Day"
//     : "";

//     // 🟢 Final Datasets
//     const datasets = [
//       {
//         label: `Last ${periodLabel} Sales`,
//         data: lastMonthData,
//         borderColor: "#6b645fff",
//         backgroundColor: "#6b645fff",
//         fill: false,
//         tension: 0.4,
//         pointRadius: 3,
//         pointHoverRadius: 6,
//       },
//       {
//         label: `Current ${periodLabel} Sales`,
//         data: currentMonthData,
//         borderColor: "#3b82f6",
//         backgroundColor: "#3b82f6",
//         fill: false,
//         tension: 0.4,
//         pointRadius: 3,
//         pointHoverRadius: 6,
//       },
//     ];

//     // 🟢 Send Response
//     return res.status(httpStatus.OK).send({
//       message: "Sales chart data fetched successfully.",
//       data: {
//         salesByDate,
//         salesByPaymentMode,
//         topCustomers,
//         datasets,
//         labels,
//       },
//       status: true,
//       code: "OK",
//       issue: null,
//     });
//   }
// );


// const getSalesChartDataReportByOutlet = catchAsync(
//   async (req: AuthenticatedRequest, res: Response) => {
//     const { outletId, startDate, endDate, reportDuration } = req.query;

//     if (!mongoose.Types.ObjectId.isValid(outletId as string)) {
//       throw new ApiError(httpStatus.BAD_REQUEST, "Invalid outletId");
//     }

//     // 📌 Build invoiceDate filter
//     const invoiceDateFilter: Record<string, any> = {};
//     if (startDate) {
//       invoiceDateFilter.$gte = new Date(startDate as string);
//     }
//     if (endDate) {
//       const end = new Date(endDate as string);
//       end.setHours(23, 59, 59, 999);
//       invoiceDateFilter.$lte = end;
//     }

//     const matchFilter = {
//       outletId: new mongoose.Types.ObjectId(outletId as string),
//       isDeleted: false,
//       ...(Object.keys(invoiceDateFilter).length ? { invoiceDate: invoiceDateFilter } : {}),
//     };

//     // 📌 Report Duration Formatting
//     let groupFormat = "%Y-%m-%d"; // default daily
//     if (reportDuration === "WEEKLY") {
//       groupFormat = "%Y-%U"; // year-week
//     } else if (reportDuration === "MONTHLY") {
//       groupFormat = "%Y-%m"; // year-month
//     }

//     // 1. 🟢 Sales Over Time
//     const salesByDate = await Invoice.aggregate([
//       { $match: matchFilter },
//       {
//         $group: {
//           _id: { $dateToString: { format: groupFormat, date: "$invoiceDate" } },
//           total: { $sum: "$totalAmount" },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     // 2. 🔵 Sales by Payment Mode
//     const salesByPaymentMode = await Invoice.aggregate([
//       { $match: matchFilter },
//       { $unwind: "$amountReceived" },
//       {
//         $lookup: {
//           from: "paymentmodes",
//           localField: "amountReceived.paymentModeId",
//           foreignField: "_id",
//           as: "paymentMode",
//         },
//       },
//       {
//         $addFields: {
//           modeName: { $arrayElemAt: ["$paymentMode.modeName", 0] },
//         },
//       },
//       {
//         $group: {
//           _id: "$modeName",
//           total: { $sum: "$amountReceived.amount" },
//         },
//       },
//       { $sort: { total: -1 } },
//     ]);

//     // 3. 🟣 Top Customers
//     const topCustomers = await Invoice.aggregate([
//       { $match: matchFilter },
//       {
//         $group: {
//           _id: "$customerId",
//           total: { $sum: "$totalAmount" },
//         },
//       },
//       {
//         $lookup: {
//           from: "customers",
//           localField: "_id",
//           foreignField: "_id",
//           as: "customer",
//         },
//       },
//       {
//         $project: {
//           customerName: { $arrayElemAt: ["$customer.customerName", 0] },
//           total: 1,
//         },
//       },
//       { $sort: { total: -1 } },
//       { $limit: 5 },
//     ]);

//     // 4. 📊 Last Month vs Current Month Sales
//     const now = new Date();

//     // Current Month Range
//     const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
//     const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

//     // Last Month Range
//     const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//     const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

//     const [lastMonthSales, currentMonthSales] = await Promise.all([
//       Invoice.aggregate([
//         {
//           $match: {
//             ...matchFilter,
//             invoiceDate: { $gte: lastMonthStart, $lte: lastMonthEnd },
//           },
//         },
//         {
//           $group: {
//             _id: { $dayOfMonth: "$invoiceDate" },
//             total: { $sum: "$totalAmount" },
//           },
//         },
//         { $sort: { _id: 1 } },
//       ]),
//       Invoice.aggregate([
//         {
//           $match: {
//             ...matchFilter,
//             invoiceDate: { $gte: currentMonthStart, $lte: currentMonthEnd },
//           },
//         },
//         {
//           $group: {
//             _id: { $dayOfMonth: "$invoiceDate" },
//             total: { $sum: "$totalAmount" },
//           },
//         },
//         { $sort: { _id: 1 } },
//       ]),
//     ]);

//     // Convert to datasets for chart.js
//     const lastMonthDays = new Date(lastMonthEnd).getDate();
//     const currentMonthDays = new Date(currentMonthEnd).getDate();
//     const maxDays = Math.max(lastMonthDays, currentMonthDays);
//   const labels = Array.from({ length: maxDays }, (_, i) =>
//   (i + 1).toString().padStart(2, "0")
// );

// // Fill data (missing days = 0)
// const lastMonthData = labels.map((label, idx) => {
//   const day = idx + 1;
//   const found = lastMonthSales.find((d) => d._id === day);
//   return found ? found.total : 0;
// });

// const currentMonthData = labels.map((label, idx) => {
//   const day = idx + 1;
//   const found = currentMonthSales.find((d) => d._id === day);
//   return found ? found.total : 0;
// });

//     const datasets = [
//       {
//         label: "Last Month Sales",
//         data: lastMonthData,
//         borderColor: "#6b645fff",
//         backgroundColor: "#6b645fff",
//         fill: false,
//         tension: 0.4,
//         pointRadius: 3,
//         pointHoverRadius: 6,
//       },
//       {
//         label: "Current Month Sales",
//         data: currentMonthData,
//         borderColor: "#3b82f6",
//         backgroundColor: "#3b82f6",
//         fill: false,
//         tension: 0.4,
//         pointRadius: 3,
//         pointHoverRadius: 6,
//       },
//     ];

//     return res.status(httpStatus.OK).send({
//       message: "Sales chart data fetched successfully.",
//       data: {
//         salesByDate,
//         salesByPaymentMode,
//         topCustomers,
//         datasets,
//         labels // ⬅️ extra field added
//       },
//       status: true,
//       code: "OK",
//       issue: null,
//     });
//   }
// );


// const getSalesChartDataReportByOutlet = catchAsync(
//   async (req: AuthenticatedRequest, res: Response) => {
//     const { outletId, startDate, endDate, reportDuration } = req.query;

//     if (!mongoose.Types.ObjectId.isValid(outletId as string)) {
//       throw new ApiError(httpStatus.BAD_REQUEST, "Invalid outletId");
//     }

//     // 📌 Build invoiceDate filter
//     const invoiceDateFilter: Record<string, any> = {};
//     if (startDate) {
//       invoiceDateFilter.$gte = new Date(startDate as string);
//     }
//     if (endDate) {
//       const end = new Date(endDate as string);
//       end.setHours(23, 59, 59, 999);
//       invoiceDateFilter.$lte = end;
//     }

//     const matchFilter = {
//       outletId: new mongoose.Types.ObjectId(outletId as string),
//       isDeleted: false,
//       ...(Object.keys(invoiceDateFilter).length ? { invoiceDate: invoiceDateFilter } : {}),
//     };

//     // 📌 Report Duration Formatting
//     let groupFormat = "%Y-%m-%d"; // default daily
//     if (reportDuration === "WEEKLY") {
//       groupFormat = "%Y-%U"; // year-week (week number)
//     } else if (reportDuration === "MONTHLY") {
//       groupFormat = "%Y-%m"; // year-month
//     }

//     // 1. 🟢 Sales Over Time (Date / Week / Month)
//     const salesByDate = await Invoice.aggregate([
//       { $match: matchFilter },
//       {
//         $group: {
//           _id: { $dateToString: { format: groupFormat, date: "$invoiceDate" } },
//           total: { $sum: "$totalAmount" },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     // 2. 🔵 Sales by Payment Mode
//     const salesByPaymentMode = await Invoice.aggregate([
//       { $match: matchFilter },
//       { $unwind: "$amountReceived" },
//       {
//         $lookup: {
//           from: "paymentmodes",
//           localField: "amountReceived.paymentModeId",
//           foreignField: "_id",
//           as: "paymentMode",
//         },
//       },
//       {
//         $addFields: {
//           modeName: { $arrayElemAt: ["$paymentMode.modeName", 0] },
//         },
//       },
//       {
//         $group: {
//           _id: "$modeName",
//           total: { $sum: "$amountReceived.amount" },
//         },
//       },
//       { $sort: { total: -1 } },
//     ]);

//     // 3. 🟣 Top Customers by Sales
//     const topCustomers = await Invoice.aggregate([
//       { $match: matchFilter },
//       {
//         $group: {
//           _id: "$customerId",
//           total: { $sum: "$totalAmount" },
//         },
//       },
//       {
//         $lookup: {
//           from: "customers",
//           localField: "_id",
//           foreignField: "_id",
//           as: "customer",
//         },
//       },
//       {
//         $project: {
//           customerName: { $arrayElemAt: ["$customer.customerName", 0] },
//           total: 1,
//         },
//       },
//       { $sort: { total: -1 } },
//       { $limit: 5 },
//     ]);

//     return res.status(httpStatus.OK).send({
//       message: "Sales chart data fetched successfully.",
//       data: {
//         salesByDate,
//         salesByPaymentMode,
//         topCustomers,
//       },
//       status: true,
//       code: "OK",
//       issue: null,
//     });
//   }
// );


const getSalesChartDataReportByCustomer = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { customerId, startDate, endDate } = req.query;

  if (!mongoose.Types.ObjectId.isValid(customerId as string)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid customerId');
  }

  const invoiceDateFilter: Record<string, any> = {};
  if (startDate) invoiceDateFilter.$gte = new Date(startDate as string);
  if (endDate) {
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999);
    invoiceDateFilter.$lte = end;
  }

  const matchStage = {
    customerId: new mongoose.Types.ObjectId(customerId as string),
    isDeleted: false,
    ...(Object.keys(invoiceDateFilter).length > 0 ? { invoiceDate: invoiceDateFilter } : {}),
  };

  // 1. Sales by Date (for bar chart)
  const salesByDate = await Invoice.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$invoiceDate" } },
        total: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 2. Sales by Payment Mode (for pie chart)
  const salesByPaymentMode = await Invoice.aggregate([
    { $match: matchStage },
    { $unwind: "$amountReceived" },
    {
      $lookup: {
        from: "paymentmodes",
        localField: "amountReceived.paymentModeId",
        foreignField: "_id",
        as: "paymentModeDetail",
      },
    },
    { $unwind: "$paymentModeDetail" },
    {
      $group: {
        _id: "$paymentModeDetail.modeName",
        total: { $sum: "$amountReceived.amount" },
      },
    },
  ]);

  // 3. Sales by Outlet (for doughnut chart)
  const salesByOutlet = await Invoice.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "outlets",
        localField: "outletId",
        foreignField: "_id",
        as: "outlet",
      },
    },
    { $unwind: "$outlet" },
    {
      $group: {
        _id: "$outlet.name",
        total: { $sum: "$totalAmount" },
      },
    },
  ]);

  return res.status(httpStatus.OK).send({
    message: 'Customer sales chart data fetched successfully.',
    data: {
      salesByDate,
      salesByPaymentMode,
      salesByOutlet,
    },
    status: true,
    code: 'OK',
    issue: null,
  });
});


const getRegisterChartDataByOutlet = catchAsync(async (req: Request, res: Response) => {
  const { outletId, startDate, endDate } = req.query;

  if (!outletId || !startDate || !endDate) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Missing required query parameters: outletId, startDate, and endDate',
      status: false,
    });
  }

  const match: any = {
    isDeleted: false,
  };

  if (outletId) match.outletId = new mongoose.Types.ObjectId(outletId as string);

  if (startDate && endDate) {
    const start = new Date(startDate as string);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999);

    match.openedAt = {
      $gte: start,
      $lte: end,
    };
  }

  const pipeline: PipelineStage[] = [
    { $match: match },

    // {
    //   $lookup: {
    //     from: 'registers', // open register reference
    //     localField: 'openRegisterId',
    //     foreignField: '_id',
    //     as: 'openRegister',
    //   },
    // },
    // {
    //   $unwind: {
    //     path: '$openRegister',
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },
    // {
    //   $addFields: {
    //     openingBalance: '$openRegister.openingBalance',

    //     cashAmount: {
    //       $sum: {
    //         $map: {
    //           input: {
    //             $filter: {
    //               input: '$closeRegister',
    //               as: 'entry',
    //               cond: {
    //                 $eq: [{ $toLower: '$$entry.paymentModeName' }, 'cash'],
    //               },
    //             },
    //           },
    //           as: 'entry',
    //           in: { $ifNull: ['$$entry.totalAmount', 0] },
    //         },
    //       },
    //     },
    //     upiAmount: {
    //       $sum: {
    //         $map: {
    //           input: {
    //             $filter: {
    //               input: '$closeRegister',
    //               as: 'entry',
    //               cond: {
    //                 $eq: [{ $toLower: '$$entry.paymentModeName' }, 'upi'],
    //               },
    //             },
    //           },
    //           as: 'entry',
    //           in: { $ifNull: ['$$entry.totalAmount', 0] },
    //         },
    //       },
    //     },
    //     cardAmount: {
    //       $sum: {
    //         $map: {
    //           input: {
    //             $filter: {
    //               input: '$closeRegister',
    //               as: 'entry',
    //               cond: {
    //                 $eq: [{ $toLower: '$$entry.paymentModeName' }, 'credit card'],
    //               },
    //             },
    //           },
    //           as: 'entry',
    //           in: { $ifNull: ['$$entry.totalAmount', 0] },
    //         },
    //       },
    //     },
    //     totalCash: {
    //       $sum: {
    //         $map: {
    //           input: {
    //             $filter: {
    //               input: '$closeRegister',
    //               as: 'entry',
    //               cond: {
    //                 $eq: [{ $toLower: '$$entry.paymentModeName' }, 'cash'],
    //               },
    //             },
    //           },
    //           as: 'entry',
    //           in: { $ifNull: ['$$entry.totalAmount', 0] },
    //         },
    //       },
    //     },
    //     finalCash: {
    //       $add: [
    //         { $ifNull: ['$openRegister.openingBalance', 0] },
    //         {
    //           $sum: {
    //             $map: {
    //               input: {
    //                 $filter: {
    //                   input: '$closeRegister',
    //                   as: 'entry',
    //                   cond: {
    //                     $eq: [{ $toLower: '$$entry.paymentModeName' }, 'cash'],
    //                   },
    //                 },
    //               },
    //               as: 'entry',
    //               in: { $ifNull: ['$$entry.totalAmount', 0] },
    //             },
    //           },
    //         },
    //       ],
    //     },
    //   },
    // },
    // {
    //   $project: {
    //     _id: 1,
    //     date: 1,
    //     openedAt: 1,
    //     closedAt: 1,
    //     openingBalance: 1,
    //     totalCash: 1,
    //     finalCash: 1,
    //     bankDeposit: 1,
    //     carryForwardBalance: 1,
    //     cashAmount: 1,
    //     upiAmount: 1,
    //     cardAmount: 1,
    //     cashUsageReason: 1,
    //     cashUsageProofUrl: 1,
    //   },
    // },
    { $sort: { openedAt: 1 } },
  ];

  const rawData = await SalesRegister.aggregate(pipeline);

  // --- Format 1: Daily Summary ---
  const dailySummary = rawData.map((item) => ({
    date: item.openedAt?.toISOString().split("T")[0],
    totalCash: item.totalCash || 0,
    bankDeposit: item.bankDeposit || 0,
    carryForwardBalance: item.carryForwardBalance || 0,
  }));

  // --- Format 2: Final Cash vs Opening ---
  const finalCashVsOpening = rawData.map((item) => {
    const payoutCash = Array.isArray(item.cashUsage)
      ? item.cashUsage.reduce((sum: any, entry: any) => sum + (parseFloat(entry.amount) || 0), 0)
      : 0;

    return {
      date: item.openedAt?.toISOString().split("T")[0],
      openingBalance: item.openingBalance || 0,
      finalCash: item.cashAmount || 0,
      payoutCash, // ✅ new field
    };
  });


  // --- Format 3: Payment Mode Breakdown ---
  const paymentModeBreakdown = rawData.map((item) => ({
    date: item.date,
    cash: item.cashAmount || 0,
    upi: item.upiAmount || 0,
    card: item.cardAmount || 0,
  }));

  // --- Format 4: Manual vs System Cash ---
  const manualVsSystemCash = rawData.map((item) => ({
    date: item.date,
    systemCash: item.totalCash || 0,
    manualCash: item.cashAmount || 0,
    difference: (item.totalCash || 0) - (item.cashAmount || 0),
  }));

  // --- Format 5: Register Timeline ---
  const registerTimeline = rawData.map((item) => ({
    date: item.date,
    openedAt: item.openedAt,
    closedAt: item.closedAt,
    durationInMinutes: item.openedAt && item.closedAt
      ? Math.round((new Date(item.closedAt).getTime() - new Date(item.openedAt).getTime()) / 60000)
      : null,
  }));

  // --- Format 6: Cash Usage Summary ---
  const cashUsageSummary = rawData.map((item) => ({
    date: item.date,
    reason: item.cashUsageReason || '',
    proofUrl: item.cashUsageProofUrl || '',
  }));

  return res.status(httpStatus.OK).json({
    message: 'Chart data fetched successfully',
    status: true,
    data: {
      dailySummary,
      finalCashVsOpening,
      paymentModeBreakdown,
      manualVsSystemCash,
      registerTimeline,
      cashUsageSummary,
      allInOneTable: rawData,
    },
  });
});




const getRegisterDataByOutlet = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { outletId, startDate, endDate } = req.query;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const match: any = { isDeleted: false };
  if (outletId) match.outletId = new mongoose.Types.ObjectId(outletId as string);

  if (startDate && endDate) {
    const start = new Date(startDate as string);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999);
    match.openedAt = { $gte: start, $lte: end };
  }

  const existingOpenRegister = await SalesRegister.findOne({
    outletId,
    isOpened: true,
    isClosed: false,
    isDeleted: false,
  });

  const pipeline: PipelineStage[] = [
    { $match: match },

    // 1) Flatten payments (allPayments) and compute quick sums: totalPayouts, cashUsageSum
    {
      $addFields: {
        allPayments: {
          $reduce: {
            input: { $ifNull: ["$closeRegister", []] },
            initialValue: [],
            in: { $concatArrays: ["$$value", { $ifNull: ["$$this.payments", []] }] }
          }
        },
        totalPayouts: {
          $sum: {
            $map: {
              input: { $ifNull: ["$closeRegister", []] },
              as: "cr",
              in: { $ifNull: ["$$cr.payout", 0] }
            }
          }
        },
        cashUsageSum: {
          $sum: {
            $map: {
              input: { $ifNull: ["$cashUsage", []] },
              as: "cu",
              in: { $ifNull: ["$$cu.amount", 0] }
            }
          }
        }
      }
    },

    // 2) Compute totals from allPayments (total, manual, by-mode)
    {
      $addFields: {
        totalPaymentAmount: {
          $sum: {
            $map: { input: { $ifNull: ["$allPayments", []] }, as: "p", in: { $ifNull: ["$$p.totalAmount", 0] } }
          }
        },
        totalManualAmount: {
          $sum: {
            $map: { input: { $ifNull: ["$allPayments", []] }, as: "p", in: { $toDouble: { $ifNull: ["$$p.manual", "0"] } } }
          }
        },
        totalCashPayments: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: { $ifNull: ["$allPayments", []] },
                  as: "p",
                  cond: { $eq: [{ $toLower: "$$p.paymentModeName" }, "cash"] }
                }
              },
              as: "p",
              in: { $ifNull: ["$$p.totalAmount", 0] }
            }
          }
        },
        totalCardPayments: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: { $ifNull: ["$allPayments", []] },
                  as: "p",
                  cond: {
                    $in: [
                      { $toLower: "$$p.paymentModeName" },
                      ["card", "credit", "debit", "debit card", "credit card", "card swipe"]
                    ]
                  }
                }
              },
              as: "p",
              in: { $ifNull: ["$$p.totalAmount", 0] }
            }
          }
        }
      }
    },

    // 3) Compute expected cash and variance
    {
      $addFields: {
        openingBalanceSafe: { $ifNull: ["$openingBalance", 0] },
        bankDepositSafe: { $ifNull: ["$bankDeposit", 0] },
        totalPayoutsSafe: { $ifNull: ["$totalPayouts", 0] },
        cashUsageSumSafe: { $ifNull: ["$cashUsageSum", 0] },
        totalCashPaymentsSafe: { $ifNull: ["$totalCashPayments", 0] },
      }
    },
    {
      $addFields: {
        expectedPhysicalCash: {
          $subtract: [
            { $add: ["$openingBalanceSafe", "$totalCashPaymentsSafe"] },
            { $add: ["$totalPayoutsSafe", "$bankDepositSafe", "$cashUsageSumSafe"] }
          ]
        },
        variance: { $subtract: [{ $ifNull: ["$cashAmount", 0] }, { $ifNull: ["$expectedPhysicalCash", 0] }] }
      }
    },
    {
      $lookup: {
        from: "salesregisters", // collection ka naam
        let: { outlet: "$outletId", openedAt: "$openedAt" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$outletId", "$$outlet"] },
                  { $lt: ["$closedAt", "$$openedAt"] }, // only before current
                  { $eq: ["$isClosed", true] },
                  { $eq: ["$isDeleted", false] }
                ]
              }
            }
          },
          { $sort: { closedAt: -1 } }, // latest closed before current
          { $limit: 1 },
          { $project: { carryForwardBalance: 1, closedAt: 1 } }
        ],
        as: "previousRegister"
      }
    },
    {
      $addFields: {
        previousCarryForwardBalance: {
          $ifNull: [{ $arrayElemAt: ["$previousRegister.carryForwardBalance", 0] }, 0]
        },
        previousClosedAt: {
          $ifNull: [{ $arrayElemAt: ["$previousRegister.closedAt", 0] }, null]
        }
      }
    },
    {
      $project: {
        previousRegister: 0 // cleanup
      }
    }
    ,
    // 4) Pick projection (keep everything useful)
    {
      $project: {
        outletId: 1,
        createdBy: 1,
        isOpened: 1,
        isClosed: 1,
        openedAt: 1,
        closedAt: 1,
        createdAt: 1,
        updatedAt: 1,
        openingBalance: 1,
        cashAmount: 1,
        totalCashAmount: 1,
        bankDeposit: 1,
        carryForwardBalance: 1,

        // computed
        totalPayouts: 1,
        totalPaymentAmount: 1,
        totalManualAmount: 1,
        totalCashPayments: 1,
        totalCardPayments: 1,
        cashUsageSum: 1,
        expectedPhysicalCash: 1,
        variance: 1,

        // details for drilldown
        allPayments: 1,
        closeRegister: 1,
        cashUsage: 1
      }
    },

    // 5) Sort / paginate
    { $sort: { openedAt: -1 } },
    { $skip: skip },
    { $limit: limit }
  ];

  const registerData = await SalesRegister.aggregate(pipeline);
  const totalCount = await SalesRegister.countDocuments(match);

  res.status(200).json({
    success: true,
    data: registerData,
    pagination: {
      total: totalCount,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(totalCount / Number(limit)),
    }
  });
});



// const getRegisterDataByOutlet = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
//   const { outletId, startDate, endDate } = req.query;

//   const page = parseInt(req.query.page as string) || 1;
//   const limit = parseInt(req.query.limit as string) || 10;
//   const skip = (page - 1) * limit;


//   const match: any = {
//     isDeleted: false,
//   };
//   if (outletId) match.outletId = new mongoose.Types.ObjectId(outletId as string);

//   if (startDate && endDate) {
//     const start = new Date(startDate as string);
//     start.setHours(0, 0, 0, 0);

//     const end = new Date(endDate as string);
//     end.setHours(23, 59, 59, 999);

//     match.openedAt = {
//       $gte: start,
//       $lte: end,
//     };
//   }

//   const pipeline: PipelineStage[] = [
//     {
//       $match: match
//     }
//   ];

//   pipeline.push(
//     { $sort: { openedAt: -1 } },
//     { $skip: skip },
//     { $limit: limit }
//   );

//   const registerData = await SalesRegister.aggregate(pipeline)

//   const totalCount = await SalesRegister.countDocuments(match);

//   res.status(200).json({
//     success: true,
//     data: registerData,
//     pagination: {
//       total: totalCount,
//       page: Number(page),
//       limit: Number(limit),
//       pages: Math.ceil(totalCount / Number(limit)),
//     }
//   });
// });

// const getSalesChartDataReportByOutlets = catchAsync(
//   async (req: AuthenticatedRequest, res: Response) => {
//     const { outletIds, startDate, endDate, reportDuration } = req.query;

//     if (!outletIds) {
//       throw new ApiError(httpStatus.BAD_REQUEST, "outletIds are required");
//     }

//     const outletArray = (Array.isArray(outletIds)
//       ? outletIds
//       : (outletIds as string).split(",")
//     ).map((id: any) => new mongoose.Types.ObjectId(id));

//     // 📌 Build invoiceDate filter
//     const invoiceDateFilter: Record<string, any> = {};
//     if (startDate) {
//       invoiceDateFilter.$gte = new Date(startDate as string);
//     }
//     if (endDate) {
//       const end = new Date(endDate as string);
//       end.setHours(23, 59, 59, 999);
//       invoiceDateFilter.$lte = end;
//     }

//     const matchFilter = {
//       outletId: { $in: outletArray },
//       isDeleted: false,
//       ...(Object.keys(invoiceDateFilter).length
//         ? { invoiceDate: invoiceDateFilter }
//         : {}),
//     };

//     // 📌 Grouping key based on reportDuration
//     let groupId: any = {
//       $dateToString: { format: "%Y-%m-%d", date: "$invoiceDate" },
//     }; // default daily

//     if (reportDuration === "DAILY") {
//       groupId = { $hour: "$invoiceDate" };
//     } else if (reportDuration === "WEEKLY") {
//       groupId = { $dayOfWeek: "$invoiceDate" };
//     } else if (reportDuration === "MONTHLY") {
//       groupId = { $dayOfMonth: "$invoiceDate" };
//     }

//     // 📌 Aggregation: Sales by Outlet + Time
//     const salesByOutlets = await Invoice.aggregate([
//       { $match: matchFilter },
//       {
//         $group: {
//           _id: {
//             outletId: "$outletId",
//             timeKey: groupId,
//           },
//           total: { $sum: "$totalAmount" },
//         },
//       },
//       { $sort: { "_id.timeKey": 1 } },
//       {
//         $lookup: {
//           from: "outlets",
//           localField: "_id.outletId",
//           foreignField: "_id",
//           as: "outlet",
//         },
//       },
//       { $unwind: "$outlet" },
//       {
//         $project: {
//           outletName: "$outlet.name",
//           timeKey: "$_id.timeKey",
//           total: 1,
//         },
//       },
//     ]);

//     // 📌 Generate Labels
//     let labels: string[] = [];

//     if (reportDuration === "DAILY") {
//       labels = Array.from({ length: 24 }, (_, i) =>
//         i.toString().padStart(2, "0") + ":00"
//       );
//     } else if (reportDuration === "WEEKLY") {
//       labels = [
//         "Sunday",
//         "Monday",
//         "Tuesday",
//         "Wednesday",
//         "Thursday",
//         "Friday",
//         "Saturday",
//       ];
//     } else if (reportDuration === "MONTHLY") {
//       const now = new Date();
//       const daysInMonth = new Date(
//         now.getFullYear(),
//         now.getMonth() + 1,
//         0
//       ).getDate();
//       labels = Array.from({ length: daysInMonth }, (_, i) =>
//         (i + 1).toString().padStart(2, "0")
//       );
//     }

//     const chartColors = [
//       "#FF6384", // red-pink
//       "#36A2EB", // blue
//       "#FFCE56", // yellow
//       "#4BC0C0", // teal
//       "#9966FF", // purple
//       "#FF9F40", // orange
//       "#8BC34A", // green
//       "#E91E63", // pink
//       "#00BCD4", // cyan
//     ];

//     // 📌 Format datasets (one dataset per outlet)
//     const outlets = [...new Set(salesByOutlets.map((s) => s.outletName))];
//     const datasets = outlets.map((outlet, index) => {
//       const outletData = salesByOutlets.filter(
//         (s) => s.outletName === outlet
//       );

//       const data = labels.map((_, idx) => {
//         let keyVal;
//         if (reportDuration === "DAILY") keyVal = idx;
//         else if (reportDuration === "WEEKLY") keyVal = idx + 1;
//         else if (reportDuration === "MONTHLY") keyVal = idx + 1;
//         else keyVal = labels[idx];

//         const found = outletData.find(
//           (d) => d.timeKey === keyVal || d.timeKey === labels[idx]
//         );
//         return found ? found.total : 0;
//       });

//       return {
//         label: outlet,
//         data,
//         borderColor: chartColors[index % chartColors.length], // 🔹 Assign color
//         backgroundColor: chartColors[index % chartColors.length] + "55", // 55 -> transparent shade
//         borderWidth: 2,
//         fill: false,
//         tension: 0.4,
//       };
//     });



//     return res.status(httpStatus.OK).send({
//       message: "Outlets sales chart data fetched successfully.",
//       data: {
//         labels,
//         datasets,
//       },
//       status: true,
//       code: "OK",
//       issue: null,
//     });
//   }
// );

const getSalesChartDataReportByOutlets = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { outletIds, startDate, endDate, reportDuration } = req.query;

    if (!outletIds) {
      throw new ApiError(httpStatus.BAD_REQUEST, "outletIds are required");
    }

    const outletArray = (Array.isArray(outletIds)
      ? outletIds
      : (outletIds as string).split(",")
    ).map((id: any) => new mongoose.Types.ObjectId(id));

    // 📌 Dates
    const start = startDate ? new Date(startDate as string) : new Date();
    const end = endDate ? new Date(endDate as string) : new Date();
    end.setHours(23, 59, 59, 999);

    // 📌 Build invoiceDate filter
    const invoiceDateFilter: Record<string, any> = {
      $gte: start,
      $lte: end,
    };

    const matchFilter = {
      outletId: { $in: outletArray },
      isDeleted: false,
      invoiceDate: invoiceDateFilter,
    };

    // 📌 Grouping key based on reportDuration
    let groupId: any;
    if (reportDuration === "DAILY") {
      groupId = { $hour: "$invoiceDate" };
    } else if (reportDuration === "WEEKLY") {
      groupId = { $dayOfWeek: "$invoiceDate" }; // 1 = Sunday, 7 = Saturday
    } else if (reportDuration === "MONTHLY") {
      groupId = { $dayOfMonth: "$invoiceDate" };
    } else {
      groupId = { $dateToString: { format: "%Y-%m-%d", date: "$invoiceDate" } };
    }

    // 📌 Aggregation
    const salesByOutlets = await Invoice.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            outletId: "$outletId",
            timeKey: groupId,
          },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.timeKey": 1 } },
      {
        $lookup: {
          from: "outlets",
          localField: "_id.outletId",
          foreignField: "_id",
          as: "outlet",
        },
      },
      { $unwind: "$outlet" },
      {
        $project: {
          outletName: "$outlet.name",
          timeKey: "$_id.timeKey",
          total: 1,
        },
      },
    ]);

    // 📌 Generate Labels
    let labels: string[] = [];

    if (reportDuration === "DAILY") {
      // ⏰ 24 ghante
      labels = Array.from({ length: 24 }, (_, i) =>
        i.toString().padStart(2, "0") + ":00"
      );
    } else if (reportDuration === "WEEKLY") {
      // 📅 last 7 days ending today -> weekday names
      labels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(end);
        d.setDate(end.getDate() - (6 - i));
        return d.toLocaleDateString("en-US", { weekday: "long" });
      });
    } else if (reportDuration === "MONTHLY") {
      // 📅 last 1 month
      const backOneMonth = new Date(end);
      backOneMonth.setMonth(end.getMonth() - 1);
      backOneMonth.setDate(backOneMonth.getDate() + 1);

      const daysInRange = Math.ceil(
        (end.getTime() - backOneMonth.getTime()) / (1000 * 60 * 60 * 24)
      );

      labels = Array.from({ length: daysInRange }, (_, i) => {
        const d = new Date(backOneMonth);
        d.setDate(backOneMonth.getDate() + i);
        return d.getDate().toString().padStart(2, "0");
      });
    }

    // 🎨 Chart colors
    const chartColors = [
      "#FF6384", "#36A2EB", "#FFCE56",
      "#4BC0C0", "#9966FF", "#FF9F40",
      "#8BC34A", "#E91E63", "#00BCD4",
    ];

    // 📌 Format datasets
    const outlets = [...new Set(salesByOutlets.map((s) => s.outletName))];
    const datasets = outlets.map((outlet, index) => {
      const outletData = salesByOutlets.filter((s) => s.outletName === outlet);

      const data = labels.map((label, idx) => {
        let keyVal;
        if (reportDuration === "DAILY") {
          keyVal = idx; // 0-23 hours
        } else if (reportDuration === "WEEKLY") {
          // Mongo $dayOfWeek => Sunday=1 ... Saturday=7
          const d = new Date(end);
          d.setDate(end.getDate() - (6 - idx));
          keyVal = d.getDay() === 0 ? 1 : d.getDay() + 1; 
        } else if (reportDuration === "MONTHLY") {
          keyVal = parseInt(label, 10);
        } else {
          keyVal = label;
        }

        const found = outletData.find((d) => d.timeKey === keyVal);
        return found ? found.total : 0;
      });

      return {
        label: outlet,
        data,
        borderColor: chartColors[index % chartColors.length],
        backgroundColor: chartColors[index % chartColors.length] + "55",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      };
    });

    return res.status(httpStatus.OK).send({
      message: "Outlets sales chart data fetched successfully.",
      data: { labels, datasets },
      status: true,
      code: "OK",
      issue: null,
    });
  }
);


const getGiftCardChartDataReportByOutlets = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { outletIds, startDate, endDate, reportDuration } = req.query;

    if (!outletIds) {
      throw new ApiError(httpStatus.BAD_REQUEST, "outletIds are required");
    }

    const outletArray = (Array.isArray(outletIds)
      ? outletIds
      : (outletIds as string).split(",")
    ).map((id: any) => new mongoose.Types.ObjectId(id));

    // 📌 Dates
    const start = startDate ? new Date(startDate as string) : new Date();
    const end = endDate ? new Date(endDate as string) : new Date();
    end.setHours(23, 59, 59, 999);

    // 📌 Build invoiceDate filter
    const invoiceDateFilter: Record<string, any> = {
      $gte: start,
      $lte: end,
    };

    // 📌 Match invoices that have gift cards
    const matchFilter = {
      outletId: { $in: outletArray },
      isDeleted: false,
      giftCardCode: { $exists: true, $ne: null },
      invoiceDate: invoiceDateFilter,
    };

    // 📌 Grouping key based on reportDuration
    let groupId: any;
    if (reportDuration === "DAILY") {
      groupId = { $hour: "$invoiceDate" };
    } else if (reportDuration === "WEEKLY") {
      groupId = { $dayOfWeek: "$invoiceDate" }; // 1=Sunday ... 7=Saturday
    } else if (reportDuration === "MONTHLY") {
      groupId = { $dayOfMonth: "$invoiceDate" };
    } else {
      groupId = { $dateToString: { format: "%Y-%m-%d", date: "$invoiceDate" } };
    }

    // 📌 Aggregation
    const giftCardSalesByOutlets = await Invoice.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            outletId: "$outletId",
            timeKey: groupId,
          },
          totalGiftCard: { $sum: "$giftCardDiscount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.timeKey": 1 } },
      {
        $lookup: {
          from: "outlets",
          localField: "_id.outletId",
          foreignField: "_id",
          as: "outlet",
        },
      },
      { $unwind: "$outlet" },
      {
        $project: {
          outletName: "$outlet.name",
          timeKey: "$_id.timeKey",
          totalGiftCard: 1,
          count: 1,
        },
      },
    ]);

    // 📌 Generate Labels
    let labels: string[] = [];

    if (reportDuration === "DAILY") {
      // ⏰ 24 hours
      labels = Array.from({ length: 24 }, (_, i) =>
        i.toString().padStart(2, "0") + ":00"
      );
    } else if (reportDuration === "WEEKLY") {
      // 📅 Last 7 days till end → weekday names
      labels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(end);
        d.setDate(end.getDate() - (6 - i));
        return d.toLocaleDateString("en-US", { weekday: "long" });
      });
    } else if (reportDuration === "MONTHLY") {
      // 📅 Last 1 month
      const backOneMonth = new Date(end);
      backOneMonth.setMonth(end.getMonth() - 1);
      backOneMonth.setDate(backOneMonth.getDate() + 1);

      const daysInRange = Math.ceil(
        (end.getTime() - backOneMonth.getTime()) / (1000 * 60 * 60 * 24)
      );

      labels = Array.from({ length: daysInRange }, (_, i) => {
        const d = new Date(backOneMonth);
        d.setDate(backOneMonth.getDate() + i);
        return d.getDate().toString().padStart(2, "0");
      });
    }

    // 🎨 Chart colors
    const chartColors = [
      "#FF6384", "#36A2EB", "#FFCE56",
      "#4BC0C0", "#9966FF", "#FF9F40",
      "#8BC34A", "#E91E63", "#00BCD4",
    ];

    // 📌 Format datasets
    const outlets = [...new Set(giftCardSalesByOutlets.map((s) => s.outletName))];
    const datasets = outlets.map((outlet, index) => {
      const outletData = giftCardSalesByOutlets.filter((s) => s.outletName === outlet);

      const data = labels.map((label, idx) => {
        let keyVal;
        if (reportDuration === "DAILY") {
          keyVal = idx; // 0-23 hours
        } else if (reportDuration === "WEEKLY") {
          const d = new Date(end);
          d.setDate(end.getDate() - (6 - idx));
          keyVal = d.getDay() === 0 ? 1 : d.getDay() + 1; // Mongo Sunday=1
        } else if (reportDuration === "MONTHLY") {
          keyVal = parseInt(label, 10);
        } else {
          keyVal = label;
        }

        const found = outletData.find((d) => d.timeKey === keyVal);
        return found ? found.totalGiftCard : 0;
      });

      return {
        label: outlet,
        data,
        borderColor: chartColors[index % chartColors.length],
        backgroundColor: chartColors[index % chartColors.length] + "55",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      };
    });

    return res.status(httpStatus.OK).send({
      message: "Gift card sales chart data fetched successfully.",
      data: { labels, datasets },
      status: true,
      code: "OK",
      issue: null,
    });
  }
);


// const getGiftCardChartDataReportByOutlets = catchAsync(
//   async (req: AuthenticatedRequest, res: Response) => {
//     const { outletIds, startDate, endDate, reportDuration } = req.query;

//     if (!outletIds) {
//       throw new ApiError(httpStatus.BAD_REQUEST, "outletIds are required");
//     }

//     const outletArray = (Array.isArray(outletIds)
//       ? outletIds
//       : (outletIds as string).split(",")
//     ).map((id: any) => new mongoose.Types.ObjectId(id));

//     // 📌 Date filter
//     const invoiceDateFilter: Record<string, any> = {};
//     if (startDate) invoiceDateFilter.$gte = new Date(startDate as string);
//     if (endDate) {
//       const end = new Date(endDate as string);
//       end.setHours(23, 59, 59, 999);
//       invoiceDateFilter.$lte = end;
//     }

//     // 📌 Match invoices that have gift cards
//     const matchFilter = {
//       outletId: { $in: outletArray },
//       isDeleted: false,
//       giftCardCode: { $exists: true, $ne: null }, // ✅ only gift card invoices
//       ...(Object.keys(invoiceDateFilter).length
//         ? { invoiceDate: invoiceDateFilter }
//         : {}),
//     };

//     // 📌 Grouping key
//     let groupId: any = {
//       $dateToString: { format: "%Y-%m-%d", date: "$invoiceDate" },
//     };
//     if (reportDuration === "DAILY") groupId = { $hour: "$invoiceDate" };
//     else if (reportDuration === "WEEKLY") groupId = { $dayOfWeek: "$invoiceDate" };
//     else if (reportDuration === "MONTHLY") groupId = { $dayOfMonth: "$invoiceDate" };

//     // 📌 Aggregation: Gift Card Sales by Outlet + Time
//     const giftCardSalesByOutlets = await Invoice.aggregate([
//       { $match: matchFilter },
//       {
//         $group: {
//           _id: {
//             outletId: "$outletId",
//             timeKey: groupId,
//           },
//           totalGiftCard: { $sum: "$giftCardDiscount" }, // 🔹 using giftCardDiscount field
//           count: { $sum: 1 }, // 🔹 number of gift card invoices
//         },
//       },
//       { $sort: { "_id.timeKey": 1 } },
//       {
//         $lookup: {
//           from: "outlets",
//           localField: "_id.outletId",
//           foreignField: "_id",
//           as: "outlet",
//         },
//       },
//       { $unwind: "$outlet" },
//       {
//         $project: {
//           outletName: "$outlet.name",
//           timeKey: "$_id.timeKey",
//           totalGiftCard: 1,
//           count: 1,
//         },
//       },
//     ]);

//     // 📌 Labels (same logic)
//     let labels: string[] = [];
//     if (reportDuration === "DAILY") {
//       labels = Array.from({ length: 24 }, (_, i) =>
//         i.toString().padStart(2, "0") + ":00"
//       );
//     } else if (reportDuration === "WEEKLY") {
//       labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//     } else if (reportDuration === "MONTHLY") {
//       const now = new Date();
//       const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
//       labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, "0"));
//     }

//     // 🎨 Colors
//     const chartColors = [
//       "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
//       "#9966FF", "#FF9F40", "#8BC34A", "#E91E63", "#00BCD4",
//     ];

//     // 📌 Format datasets (one dataset per outlet)
//     const outlets = [...new Set(giftCardSalesByOutlets.map((s) => s.outletName))];
//     const datasets = outlets.map((outlet, index) => {
//       const outletData = giftCardSalesByOutlets.filter((s) => s.outletName === outlet);

//       const data = labels.map((_, idx) => {
//         let keyVal;
//         if (reportDuration === "DAILY") keyVal = idx;
//         else if (reportDuration === "WEEKLY") keyVal = idx + 1;
//         else if (reportDuration === "MONTHLY") keyVal = idx + 1;
//         else keyVal = labels[idx];

//         const found = outletData.find(
//           (d) => d.timeKey === keyVal || d.timeKey === labels[idx]
//         );
//         return found ? found.totalGiftCard : 0;
//       });

//       return {
//         label: outlet,
//         data,
//         borderColor: chartColors[index % chartColors.length],
//         backgroundColor: chartColors[index % chartColors.length] + "55",
//         borderWidth: 2,
//         fill: false,
//         tension: 0.4,
//       };
//     });

//     return res.status(httpStatus.OK).send({
//       message: "Gift card sales chart data fetched successfully.",
//       data: {
//         labels,
//         datasets,
//       },
//       status: true,
//       code: "OK",
//       issue: null,
//     });
//   }
// );

const getGiftCardDataReportByOutlets = catchAsync(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    // 📌 Date filter
    const matchFilter: any = {
      isDeleted: false,
      giftCardDiscount: { $gt: 0 }, // ✅ सिर्फ़ giftcard वाले invoices
    };

    if (startDate && endDate) {
      matchFilter.invoiceDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    // 1️⃣ Customer Insights - कितने customers ने कितने giftcards purchase किए
    const customerInsights = await Invoice.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$customerId",
          totalPurchased: { $sum: 1 },
          totalAmount: { $sum: "$giftCardDiscount" },
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $project: {
          _id: 0,
          name: { $arrayElemAt: ["$customer.customerName", 0] },
          totalPurchased: 1,
          totalAmount: 1,
        },
      },
    ]);

    // 2️⃣ Outlet Performance - किस outlet से कितनी giftcard sales हुई
    const outletPerformance = await Invoice.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$outletId",
          totalSales: { $sum: "$giftCardDiscount" }, // 💰 value
          totalCount: { $sum: 1 }, // 🧾 no. of invoices
        },
      },
      {
        $lookup: {
          from: "outlets",
          localField: "_id",
          foreignField: "_id",
          as: "outlet",
        },
      },
      {
        $project: {
          _id: 0,
          name: { $arrayElemAt: ["$outlet.name", 0] },
          totalSales: 1,
          totalCount: 1,
        },
      },
    ]);

    // 3️⃣ GiftCard Distribution - कितने discount वाले giftcards use हुए
    const giftCardDistribution = await Invoice.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$giftCardDiscount",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          discount: "$_id",
          count: 1,
        },
      },
      { $sort: { discount: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        customerInsights, // pie chart 1
        outletPerformance, // pie chart 2
        giftCardDistribution, // pie chart 3
      },
    });
  }
);

// const getRetailDashboardData = catchAsync(async (req: Request, res: Response) => {
//   const { outletIds, startDate, endDate, reportDuration } = req.query;

//   if (!startDate || !endDate || !outletIds || !reportDuration) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "outletIds, startDate, endDate and reportDuration are required"
//     );
//   }

//   const start = new Date(startDate as string);
//   const end = new Date(endDate as string);

//   // convert ids array
//   const outletObjectIds = (outletIds as string).split(",").map((id) => new mongoose.Types.ObjectId(id));

//   // 🔹 Previous period calculation
//   let prevStart: Date;
//   let prevEnd: Date;

//   if (reportDuration === "DAILY") {
//     prevStart = new Date(start);
//     prevStart.setDate(prevStart.getDate() - 1);
//     prevEnd = new Date(start);
//   } else if (reportDuration === "WEEKLY") {
//     prevStart = new Date(start);
//     prevStart.setDate(prevStart.getDate() - 7);
//     prevEnd = new Date(start);
//   } else if (reportDuration === "MONTHLY") {
//     prevStart = new Date(start);
//     prevStart.setMonth(prevStart.getMonth() - 1);
//     prevEnd = new Date(start);
//   } else {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Invalid reportDuration (DAILY/WEEKLY/MONTHLY)");
//   }

//   // 🔹 Current revenues per outlet
//   const currentRevenues = await Invoice.aggregate([
//     {
//       $match: {
//         outletId: { $in: outletObjectIds },
//         invoiceDate: { $gte: start, $lte: end },
//       },
//     },
//     {
//       $group: {
//         _id: "$outletId",
//         revenue: { $sum: "$totalAmount" },
//       },
//     },
//     {
//       $lookup: {
//         from: "outlets", // 👈 collection ka naam check kar le
//         localField: "_id",
//         foreignField: "_id",
//         as: "outlet",
//       },
//     },
//     { $unwind: "$outlet" },
//     {
//       $project: {
//         _id: 0,
//         outletId: "$_id",
//         outletName: "$outlet.name",
//         revenue: 1,
//       },
//     },
//   ]);

//   // 🔹 Previous revenues (for comparison)
//   const prevRevenues = await Invoice.aggregate([
//     {
//       $match: {
//         outletId: { $in: outletObjectIds },
//         invoiceDate: { $gte: prevStart, $lte: prevEnd },
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         revenue: { $sum: "$totalAmount" },
//       },
//     },
//   ]);

//   // Helper to calculate diff
//   const calc = (current: number, previous: number) => {
//   const diff = current - previous;
//   let percent: number;
//   if (previous === 0) {
//     percent = current === 0 ? 0 : 100;
//   } else {
//     percent = parseFloat(((diff / previous) * 100).toFixed(2));
//   }
//   return { value: current, diff, percent };
// };


// // 🔹 Total revenues
// const totalCurrentRevenue = currentRevenues.reduce((sum, o) => sum + o.revenue, 0);
// const totalPrevRevenue = prevRevenues.length > 0 ? prevRevenues[0].revenue : 0;
// const totalRevenueStats = calc(totalCurrentRevenue, totalPrevRevenue);
// console.log('--------dddd',totalCurrentRevenue,totalPrevRevenue,totalRevenueStats)

//   res.status(200).json({
//     success: true,
//     data: {
//       outlets: currentRevenues, // har outlet ka name + revenue
//       totalRevenue: totalRevenueStats, // total + diff + percent
//     },
//   });
// });

// const getRetailDashboardData = catchAsync(async (req: Request, res: Response) => {
//   const { outletIds, startDate, endDate, reportDuration } = req.query;

//   if (!startDate || !endDate || !outletIds || !reportDuration) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "outletIds, startDate, endDate and reportDuration are required"
//     );
//   }

//   const start = new Date(startDate as string);
//   const end = new Date(endDate as string);

//   // convert ids array
//   const outletObjectIds = (outletIds as string)
//     .split(",")
//     .map((id) => new mongoose.Types.ObjectId(id));

//   // Previous period calculation
//   let prevStart: Date;
//   let prevEnd: Date;

//   if (reportDuration === "DAILY") {
//     prevStart = new Date(start);
//     prevStart.setDate(prevStart.getDate() - 1);
//     prevEnd = new Date(start);
//   } else if (reportDuration === "WEEKLY") {
//     prevStart = new Date(start);
//     prevStart.setDate(prevStart.getDate() - 7);
//     prevEnd = new Date(start);
//   } else if (reportDuration === "MONTHLY") {
//     prevStart = new Date(start);
//     prevStart.setMonth(prevStart.getMonth() - 1);
//     prevEnd = new Date(start);
//   } else {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Invalid reportDuration (DAILY/WEEKLY/MONTHLY)");
//   }

//   // 🔹 Current revenues per outlet
//   const currentRevenues = await Invoice.aggregate([
//     {
//       $match: {
//         outletId: { $in: outletObjectIds },
//         invoiceDate: { $gte: start, $lte: end },
//       },
//     },
//     {
//       $group: {
//         _id: "$outletId",
//         revenue: { $sum: "$totalAmount" },
//         saleCount: { $sum: 1 }, // <-- number of invoices = sales
//       },
//     },
//     {
//       $lookup: {
//         from: "outlets",
//         localField: "_id",
//         foreignField: "_id",
//         as: "outlet",
//       },
//     },
//     { $unwind: "$outlet" },
//     {
//       $project: {
//         _id: 0,
//         outletId: "$_id",
//         outletName: "$outlet.name",
//         revenue: 1,
//         saleCount: 1, // <-- include sale count
//       },
//     },
//   ]);

//   // 🔹 Previous revenues for comparison
//   const prevRevenues = await Invoice.aggregate([
//     {
//       $match: {
//         outletId: { $in: outletObjectIds },
//         invoiceDate: { $gte: prevStart, $lte: prevEnd },
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         revenue: { $sum: "$totalAmount" },
//         saleCount: { $sum: 1 }, // <-- previous sale count
//       },
//     },
//   ]);

//   const calc = (current: number, previous: number) => {
//     const diff = current - previous;
//     let percent: number;
//     if (previous === 0) {
//       percent = current === 0 ? 0 : 100;
//     } else {
//       percent = parseFloat(((diff / previous) * 100).toFixed(2));
//     }
//     return { value: current, diff, percent };
//   };

//   // 🔹 Total revenues
//   const totalCurrentRevenue = currentRevenues.reduce((sum, o) => sum + o.revenue, 0);
//   const totalPrevRevenue = prevRevenues.length > 0 ? prevRevenues[0].revenue : 0;
//   const totalRevenueStats = calc(totalCurrentRevenue, totalPrevRevenue);

//   // 🔹 Total sale counts
//   const totalCurrentSaleCount = currentRevenues.reduce((sum, o) => sum + o.saleCount, 0);
//   const totalPrevSaleCount = prevRevenues.length > 0 ? prevRevenues[0].saleCount : 0;
//   const totalSaleCountStats = calc(totalCurrentSaleCount, totalPrevSaleCount);

//   res.status(200).json({
//     success: true,
//     data: {
//       outlets: currentRevenues, // each outlet: name, revenue, saleCount
//       totalRevenue: totalRevenueStats, // total revenue + diff + percent
//       totalSaleCount: totalSaleCountStats, // total sales + diff + percent
//     },
//   });
// });

// const getRetailDashboardData = catchAsync(async (req: Request, res: Response) => {
//   const { outletIds, startDate, endDate } = req.query;

//   if (!startDate || !endDate || !outletIds) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "outletIds, startDate and endDate are required"
//     );
//   }

//   // 🔹 Set start & end to cover full days
//   const start = new Date(startDate as string);
//   start.setHours(0, 0, 0, 0);

//   const end = new Date(endDate as string);
//   end.setHours(23, 59, 59, 999);

//   // 🔹 Convert ids array
//   const outletObjectIds = (outletIds as string)
//     .split(",")
//     .map((id) => new mongoose.Types.ObjectId(id));

//   // 🔹 Fetch all requested outlets
//   const allOutlets = await Outlet.find({ _id: { $in: outletObjectIds } });

//   // 🔹 Aggregate invoices for revenue, sales, gross profit
//   const invoiceAgg = await Invoice.aggregate([
//     {
//       $match: {
//         outletId: { $in: outletObjectIds },
//         invoiceDate: { $gte: start, $lte: end },
//       },
//     },
//     {
//       $group: {
//         _id: "$outletId",
//         revenue: { $sum: "$totalAmount" },
//         saleCount: { $sum: 1 },
//         grossProfit: { $sum: "$grossProfit" },
//       },
//     },
//   ]);

//   // 🔹 Aggregate customers
//   const customerAgg = await Customer.aggregate([
//     {
//       $match: {
//         outletId: { $in: outletObjectIds },
//         createdAt: { $gte: start, $lte: end },
//       },
//     },
//     {
//       $group: {
//         _id: "$outletId",
//         customerCount: { $sum: 1 },
//       },
//     },
//   ]);

//   // 🔹 Previous day totals for percentage
//   const prevStart = new Date(start);
//   prevStart.setDate(prevStart.getDate() - 1);
//   prevStart.setHours(0, 0, 0, 0);

//   const prevEnd = new Date(start);
//   prevEnd.setDate(prevEnd.getDate() - 1);
//   prevEnd.setHours(23, 59, 59, 999);

//   const prevInvoiceAgg = await Invoice.aggregate([
//     {
//       $match: {
//         outletId: { $in: outletObjectIds },
//         invoiceDate: { $gte: prevStart, $lte: prevEnd },
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         revenue: { $sum: "$totalAmount" },
//         saleCount: { $sum: 1 },
//         grossProfit: { $sum: "$grossProfit" },
//       },
//     },
//   ]);

//   const prevCustomerAgg = await Customer.aggregate([
//     {
//       $match: {
//         outletId: { $in: outletObjectIds },
//         createdAt: { $gte: prevStart, $lte: prevEnd },
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         customerCount: { $sum: 1 },
//       },
//     },
//   ]);

//   // 🔹 Helper to calculate percentage change
//   const calc = (current: number, previous: number) => {
//     const diff = current - previous;
//     let percent = 0;
//     if (previous === 0) {
//       percent = current === 0 ? 0 : 100;
//     } else {
//       percent = parseFloat(((diff / previous) * 100).toFixed(2));
//     }
//     return { value: current, diff, percent };
//   };

//   // 🔹 Merge data per outlet (default 0 if missing)
//   const outletsData = allOutlets.map((o:any) => {
//     const inv = invoiceAgg.find((i) => i._id.toString() === o._id.toString()) || {
//       revenue: 0,
//       saleCount: 0,
//       grossProfit: 0,
//     };
//     const cust = customerAgg.find((c) => c._id.toString() === o._id.toString()) || {
//       customerCount: 0,
//     };

//     return {
//       outletId: o._id,
//       outletName: o.name,
//       revenue: inv.revenue,
//       saleCount: inv.saleCount,
//       grossProfit: inv.grossProfit,
//       customerCount: cust.customerCount,
//     };
//   });

//   // 🔹 Calculate totals with percentage
//   const totalRevenueStats = calc(
//     outletsData.reduce((sum:any, o:any) => sum + o.revenue, 0),
//     prevInvoiceAgg.length > 0 ? prevInvoiceAgg[0].revenue : 0
//   );

//   const totalSaleCountStats = calc(
//     outletsData.reduce((sum:any, o:any) => sum + o.saleCount, 0),
//     prevInvoiceAgg.length > 0 ? prevInvoiceAgg[0].saleCount : 0
//   );

//   const totalCustomerCountStats = calc(
//     outletsData.reduce((sum:any, o:any) => sum + o.customerCount, 0),
//     prevCustomerAgg.length > 0 ? prevCustomerAgg[0].customerCount : 0
//   );

//   const totalGrossProfitStats = calc(
//     outletsData.reduce((sum:any, o:any) => sum + o.grossProfit, 0),
//     prevInvoiceAgg.length > 0 ? prevInvoiceAgg[0].grossProfit : 0
//   );

//   res.status(200).json({
//     success: true,
//     data: {
//       outlets: outletsData,
//       totalRevenue: totalRevenueStats,
//       totalSaleCount: totalSaleCountStats,
//       totalCustomerCount: totalCustomerCountStats,
//       totalGrossProfit: totalGrossProfitStats,
//     },
//   });
// });


const getRetailDashboardData = catchAsync(async (req: Request, res: Response) => {
  const { outletIds, startDate, endDate } = req.query;

  if (!startDate || !endDate || !outletIds) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "outletIds, startDate and endDate are required"
    );
  }

  // 🔹 Set full day range
  const start = new Date(startDate as string);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate as string);
  end.setHours(23, 59, 59, 999);

  // 🔹 Convert outlet IDs
  const outletObjectIds = (outletIds as string).split(",").map(id => new mongoose.Types.ObjectId(id));

  // 🔹 Fetch outlets
  const allOutlets = await Outlet.find({ _id: { $in: outletObjectIds } });

  // 🔹 Aggregate invoice revenue per outlet
  const invoiceAgg = await Invoice.aggregate([
    { $match: { outletId: { $in: outletObjectIds }, invoiceDate: { $gte: start, $lte: end } } },
    { $group: { _id: "$outletId", revenue: { $sum: "$totalAmount" }, saleCount: { $sum: 1 } } },
  ]);

  // 🔹 Aggregate total payouts per outlet from salesRegisters
 const payoutAgg = await SalesRegister.aggregate([
  { $match: { outletId: { $in: outletObjectIds }, openedAt: { $gte: start, $lte: end } } },
  { $unwind: { path: "$cashUsage", preserveNullAndEmptyArrays: true } },
  {
    $group: {
      _id: "$outletId",
      totalPayout: { $sum: { $ifNull: ["$cashUsage.amount", 0] } },
    },
  },
]);




  // 🔹 Aggregate customers per outlet
  const customerAgg = await Customer.aggregate([
    { $match: { outletId: { $in: outletObjectIds }, createdAt: { $gte: start, $lte: end } } },
    { $group: { _id: "$outletId", customerCount: { $sum: 1 } } },
  ]);

  // 🔹 Previous day stats
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - 1);
  prevStart.setHours(0, 0, 0, 0);

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  prevEnd.setHours(23, 59, 59, 999);

  // 🔹 Previous invoices
  const prevInvoiceAgg = await Invoice.aggregate([
    { $match: { outletId: { $in: outletObjectIds }, invoiceDate: { $gte: prevStart, $lte: prevEnd } } },
    { $group: { _id: "$outletId", revenue: { $sum: "$totalAmount" }, saleCount: { $sum: 1 } } },
  ]);

  // 🔹 Previous payouts
  const prevPayoutAgg = await SalesRegister.aggregate([
    { $match: { outletId: { $in: outletObjectIds }, openedAt: { $gte: prevStart, $lte: prevEnd } } },
    { $unwind: { path: "$cashUsage", preserveNullAndEmptyArrays: true } },
    { $group: { _id: "$outletId", totalPayout: { $sum: "$cashUsage.amount" } } },
  ]);

  // 🔹 Previous customers
  const prevCustomerAgg = await Customer.aggregate([
    { $match: { outletId: { $in: outletObjectIds }, createdAt: { $gte: prevStart, $lte: prevEnd } } },
    { $group: { _id: "$outletId", customerCount: { $sum: 1 } } },
  ]);

  // 🔹 Helper for percentage
  const calc = (current: number, previous: number) => {
    const diff = current - previous;
    const percent = previous === 0 ? (current === 0 ? 0 : 100) : parseFloat(((diff / previous) * 100).toFixed(2));
    return { value: current, diff, percent };
  };

  // 🔹 Merge data per outlet
  const outletsData = allOutlets.map((o: any) => {
    const inv = invoiceAgg.find(i => i._id.toString() === o._id.toString()) || { revenue: 0, saleCount: 0 };
    const payout = payoutAgg.find(p => p._id.toString() === o._id.toString());
    const grossProfit = inv.revenue - (payout ? payout.totalPayout : 0);

    const cust = customerAgg.find(c => c._id.toString() === o._id.toString()) || { customerCount: 0 };
    const prevInv = prevInvoiceAgg.find(i => i._id.toString() === o._id.toString()) || { revenue: 0, saleCount: 0 };
    const prevPayout = prevPayoutAgg.find(p => p._id.toString() === o._id.toString());
    const prevGrossProfit = prevInv.revenue - (prevPayout ? prevPayout.totalPayout : 0);
    const prevCust = prevCustomerAgg.find(c => c._id.toString() === o._id.toString()) || { customerCount: 0 };

    return {
      outletId: o._id,
      outletName: o.name,
      revenue: inv.revenue,
      saleCount: inv.saleCount,
      grossProfit,
      customerCount: cust.customerCount,
      revenuePercent: calc(inv.revenue, prevInv.revenue).percent,
      saleCountPercent: calc(inv.saleCount, prevInv.saleCount).percent,
      grossProfitPercent: calc(grossProfit, prevGrossProfit).percent,
      customerCountPercent: calc(cust.customerCount, prevCust.customerCount).percent,
    };
  });

  // 🔹 Total stats
  const totalRevenueStats = calc(
    outletsData.reduce((sum, o) => sum + o.revenue, 0),
    prevInvoiceAgg.reduce((sum, o) => sum + o.revenue, 0)
  );
  const totalSaleCountStats = calc(
    outletsData.reduce((sum, o) => sum + o.saleCount, 0),
    prevInvoiceAgg.reduce((sum, o) => sum + o.saleCount, 0)
  );
  const totalCustomerCountStats = calc(
    outletsData.reduce((sum, o) => sum + o.customerCount, 0),
    prevCustomerAgg.reduce((sum, o) => sum + o.customerCount, 0)
  );
  const totalGrossProfitStats = calc(
    outletsData.reduce((sum, o) => sum + o.grossProfit, 0),
    prevInvoiceAgg.reduce((sum, o) => sum + (prevPayoutAgg.find(p => p._id.toString() === o._id.toString())?.totalPayout || 0), 0)
  );

  res.status(200).json({
    success: true,
    data: {
      outlets: outletsData,
      totalRevenue: totalRevenueStats,
      totalSaleCount: totalSaleCountStats,
      totalCustomerCount: totalCustomerCountStats,
      totalGrossProfit: totalGrossProfitStats,
    },
  });
});






//-----------------------------------------------
export {
  getTopItems,
  getTopCustomer,
  getTopOutlet,
  getOutletReport,
  getOutletDailyReport,
  getSalesReportByOutlet,
  getSalesReportByCustomer,
  getSalesChartDataReportByOutlet,
  getSalesChartDataReportByCustomer,
  getRegisterChartDataByOutlet,
  getRegisterDataByOutlet,
  getSalesChartDataReportByOutlets,
  getGiftCardChartDataReportByOutlets,
  getGiftCardDataReportByOutlets,
  getRetailDashboardData
};

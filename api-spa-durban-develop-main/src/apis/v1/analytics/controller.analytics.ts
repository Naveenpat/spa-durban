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

    let result = await analyticsService.getOutletReportData(reportDuration,startDate,endDate);
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



const getSalesChartDataReportByOutlet = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { outletId, startDate, endDate, reportDuration } = req.query;

    if (!mongoose.Types.ObjectId.isValid(outletId as string)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid outletId");
    }

    // 📌 Build invoiceDate filter
    const invoiceDateFilter: Record<string, any> = {};
    if (startDate) {
      invoiceDateFilter.$gte = new Date(startDate as string);
    }
    if (endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      invoiceDateFilter.$lte = end;
    }

    const matchFilter = {
      outletId: new mongoose.Types.ObjectId(outletId as string),
      isDeleted: false,
      ...(Object.keys(invoiceDateFilter).length ? { invoiceDate: invoiceDateFilter } : {}),
    };

    // 📌 Report Duration Formatting
    let groupFormat = "%Y-%m-%d"; // default daily
    if (reportDuration === "WEEKLY") {
      groupFormat = "%Y-%U"; // year-week (week number)
    } else if (reportDuration === "MONTHLY") {
      groupFormat = "%Y-%m"; // year-month
    }

    // 1. 🟢 Sales Over Time (Date / Week / Month)
    const salesByDate = await Invoice.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$invoiceDate" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 2. 🔵 Sales by Payment Mode
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
      {
        $addFields: {
          modeName: { $arrayElemAt: ["$paymentMode.modeName", 0] },
        },
      },
      {
        $group: {
          _id: "$modeName",
          total: { $sum: "$amountReceived.amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // 3. 🟣 Top Customers by Sales
    const topCustomers = await Invoice.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$customerId",
          total: { $sum: "$totalAmount" },
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
          customerName: { $arrayElemAt: ["$customer.customerName", 0] },
          total: 1,
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);

    return res.status(httpStatus.OK).send({
      message: "Sales chart data fetched successfully.",
      data: {
        salesByDate,
        salesByPaymentMode,
        topCustomers,
      },
      status: true,
      code: "OK",
      issue: null,
    });
  }
);


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
    ? item.cashUsage.reduce((sum:any, entry:any) => sum + (parseFloat(entry.amount) || 0), 0)
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
  getRegisterDataByOutlet
};

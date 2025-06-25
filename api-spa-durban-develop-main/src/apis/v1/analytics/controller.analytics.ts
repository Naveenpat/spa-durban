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

    let result = await analyticsService.getOutletReportData(reportDuration);
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

const getSalesReport = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { outletId, page = 1, limit = 10, startDate, endDate } = req.query;
  console.log('-----req.query',req.query)
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

  console.log('-----',invoiceDateFilter)
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
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: Number(limit) },
  ];

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
    message: 'Invoices fetched successfully.',
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




//-----------------------------------------------
export {
  getTopItems,
  getTopCustomer,
  getTopOutlet,
  getOutletReport,
  getOutletDailyReport,
  getSalesReport
};

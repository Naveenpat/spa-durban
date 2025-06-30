// company.controller.ts
import httpStatus from "http-status";
import catchAsync from "../../../../utilities/catchAsync";
import ApiError from "../../../../utilities/apiError";
import { Request, Response } from "express";
import {
  createCompany,
  getCompanyById,
  updateCompanyById,
  deleteCompanyById,
  toggleCompanyStatusById,
} from "./service.company";
import { AuthenticatedRequest, DateFilter, RangeFilter } from "../../../utils/interface";
import { pick } from "../../../../utilities/pick"
import {
  getFilterQuery,
  getRangeQuery,
  getSearchQuery,
  checkInvalidParams,
  getDateFilterQuery,
} from "../../../utils/utils"
import { companyService, invoiceService } from "../service.index";
import { allowedDateFilterKeys, searchKeys } from "./schema.company";
import mongoose, { PipelineStage } from "mongoose";
import Invoice from "../invoice/schema.invoice";
import Outlet from "../outlet/schema.outlet";
const createCompanys = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const companyId = req.userData
  if (!companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company ID is required");
  }
  req.body.companyId = companyId;
  const company = await createCompany(req.body);
  res.status(httpStatus.CREATED).send({
    message: "Company created successfully",
    data: company,
    status: true,
  });
});


const getComponies = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const filter = pick(req.query, [])
    const options = pick(req.query, [
      "sortBy",
      "limit",
      "page",
      "searchValue",
      "searchIn",
      "dateFilter",
      "rangeFilterBy",
    ])
    // Extract searchValue from req.query
    const searchValue = req.query.searchValue as string | undefined
    const searchIn = req.query.searchIn as string[] | null
    const dateFilter = req.query.dateFilter as DateFilter | null
    const filterBy = req.query.filterBy as any[]
    const rangeFilterBy = req.query.rangeFilterBy as RangeFilter | undefined
    const isPaginationRequiredParam = req.query.isPaginationRequired

    if (isPaginationRequiredParam !== undefined) {
      const isPaginationRequired = isPaginationRequiredParam === "true"

      options.isPaginationRequired = isPaginationRequired as any
    }
    // Add searchValue to options if it exists
    if (searchValue) {
      let searchQueryCheck = checkInvalidParams(
        searchIn ? searchIn : [],
        searchKeys
      )

      if (searchQueryCheck && !searchQueryCheck.status) {
        return res.status(httpStatus.OK).send({
          ...searchQueryCheck,
        })
      }
      // Extract search query from options
      const searchQuery = getSearchQuery(
        searchIn ? searchIn : [],
        searchKeys,
        searchValue
      )
      if (searchQuery !== null) {
        options["search"] = { $or: searchQuery } as any
      }
    }

    //date filter
    //date filter
    if (dateFilter) {
      const datefilterQuery = await getDateFilterQuery(
        dateFilter,
        allowedDateFilterKeys
      )

      if (datefilterQuery && datefilterQuery.length) {
        options["dateFilter"] = { $and: datefilterQuery } as any
      }
    }

    //range filter
    if (rangeFilterBy !== undefined) {
      const rangeQuery = getRangeQuery(rangeFilterBy)

      if (rangeQuery && rangeQuery.length) {
        options["rangeFilterBy"] = { $and: rangeQuery } as any
      }
    }

    //check filter by
    if (filterBy?.length) {
      const booleanFields: string[] = ["isActive"]
      const numberFileds: string[] = []
      const objectIdFileds: string[] = []

      const withoutRegexFields: string[] = []

      const filterQuery = getFilterQuery(
        filterBy,
        booleanFields,
        numberFileds,
        objectIdFileds,
        withoutRegexFields
      )
      if (filterQuery) {
        options["filterBy"] = { $and: filterQuery } as any
      }
    }
    const result = await companyService.queryRoles(filter, options)
    return res.status(httpStatus.OK).send(result)
  }
)

const getByIdCompanys = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const company = await getCompanyById(req.params.id);
  if (!company || company.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }
  res.status(httpStatus.OK).send({
    message: "Company fetched successfully",
    data: company,
    status: true,
  });
});

const updateByIdCompanys = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const company = await updateCompanyById(req.params.id, req.body);
  res.status(httpStatus.OK).send({
    message: "Company updated successfully",
    data: company,
    status: true,
  });
});

const removeCompanys = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const company = await deleteCompanyById(req.params.id);
  res.status(httpStatus.OK).send({
    message: "Company deleted successfully",
    data: company,
    status: true,
  });
});

const toggleStatusCompanys = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const company = await toggleCompanyStatusById(req.params.id);
  res.status(httpStatus.OK).send({
    message: `Company ${company.isActive ? "activated" : "deactivated"} successfully`,
    data: company,
    status: true,
  });
});


const getCompanySalesSummary = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Invalid company ID",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayData, monthData, discountData] = await Promise.all([
      // 🔹 Today
      Invoice.aggregate([
        { $match: { companyId: new mongoose.Types.ObjectId(companyId), invoiceDate: { $gte: today } } },
        {
          $group: {
            _id: null,
            invoiceCount: { $sum: 1 },
            totalSales: { $sum: "$totalAmount" },
          },
        },
      ]),

      // 🔹 This Month
      Invoice.aggregate([
        { $match: { companyId: new mongoose.Types.ObjectId(companyId), invoiceDate: { $gte: startOfMonth } } },
        {
          $group: {
            _id: null,
            invoiceCount: { $sum: 1 },
            totalSales: { $sum: "$totalAmount" },
          },
        },
      ]),

      // 🔹 Discounts (full time range)
      Invoice.aggregate([
        { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
        {
          $group: {
            _id: null,
            totalDiscount: { $sum: "$totalDiscount" },
          },
        },
      ]),
    ]);

    return res.status(httpStatus.OK).send({
      todayInvoices: todayData[0]?.invoiceCount || 0,
      thisMonthInvoices: monthData[0]?.invoiceCount || 0,
      todaySales: todayData[0]?.totalSales || 0,
      thisMonthSales: monthData[0]?.totalSales || 0,
      totalDiscount: discountData[0]?.totalDiscount || 0,
    });
  } catch (error) {
    res.status(httpStatus.OK).send({
      message: "Failed to fetch company sales summary"
    });
  }
});


const getCompanySalesReportPaginated = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const {
    companyId,
    outletId,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const filter: Record<string, any> = { isDeleted: false };

  // Outlet / Company filter
  if (outletId && mongoose.Types.ObjectId.isValid(outletId as string)) {
    filter.outletId = new mongoose.Types.ObjectId(outletId as string);
  } else if (companyId) {
    const outlets = await Outlet.find({ companyId, isDeleted: false }, { _id: 1 });
    const outletIds = outlets.map((o) => o._id);
    if (!outletIds.length) {
      return res.status(httpStatus.OK).send({
        data: {
          invoices: [],
          totalSalesData: 0,
          totalCount: 0,
          page: Number(page),
          limit: Number(limit),
        },
        status: true,
        code: 'OK',
        issue: null,
      });
    }
    filter.outletId = { $in: outletIds };
  }

  // Date filter
  const invoiceDateFilter: Record<string, any> = {};
  if (startDate) invoiceDateFilter.$gte = new Date(startDate as string);
  if (endDate) {
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999);
    invoiceDateFilter.$lte = end;
  }
  if (Object.keys(invoiceDateFilter).length > 0) {
    filter.invoiceDate = invoiceDateFilter;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sortDirection: 1 | -1 = sortOrder === 'asc' || sortOrder === '1' ? 1 : -1;

  // Pipeline
  const pipeline: PipelineStage[] = [
    { $match: filter },
    {
      $lookup: {
        from: "outlets",
        localField: "outletId",
        foreignField: "_id",
        as: "outlet",
        pipeline: [
          { $match: { isDeleted: false, isActive: true } },
          { $project: { name: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customer",
        pipeline: [
          { $match: { isDeleted: false, isActive: true } },
          { $project: { customerName: 1 } },
        ],
      },
    },
    {
      $addFields: {
        outletName: { $arrayElemAt: ["$outlet.name", 0] },
        customerName: { $arrayElemAt: ["$customer.customerName", 0] },
        // status: {
        //   $switch: {
        //     branches: [
        //       { case: { $eq: ["$paidAmount", 0] }, then: "UNPAID" },
        //       {
        //         case: {
        //           $and: [
        //             { $gt: ["$paidAmount", 0] },
        //             { $lt: ["$paidAmount", "$totalAmount"] },
        //           ],
        //         },
        //         then: "PARTIAL",
        //       },
        //     ],
        //     default: "PAID",
        //   },
        // },
      },
    },
    { $unset: ["outlet", "customer"] },
    { $sort: { [sortBy as string]: sortDirection } },
    { $skip: skip },
    { $limit: Number(limit) },
  ];

  const invoices = await Invoice.aggregate(pipeline);

  const totalCount = await Invoice.countDocuments(filter);
  const totalSales = await Invoice.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalSalesAmount: { $sum: "$totalAmount" },
      },
    },
  ]);

  return res.status(httpStatus.OK).send({
    message: 'Company Sales fetched successfully.',
    data: {
      invoices,
      totalSalesData: totalSales?.[0]?.totalSalesAmount || 0,
      totalCount,
      page: Number(page),
      limit: Number(limit),
    },
    status: true,
    code: 'OK',
    issue: null,
  });
});


const getCompanySalesChartData = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const companyId = req.params.id;
  const { outletId, startDate, endDate, reportDuration } = req.query;

  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "Invalid company ID",
    });
  }

  // Fetch outlet IDs under this company
  let outlets = await Outlet.find({ companyId, isDeleted: false }, { _id: 1 });

  if (outletId && mongoose.Types.ObjectId.isValid(outletId as string)) {
    outlets = outlets.filter((o:any) => o._id.toString() === outletId);
  }

  const outletIds = outlets.map((o:any) => o._id);

  if (!outletIds.length) {
    return res.status(httpStatus.OK).send({
      message: "No outlets found",
      data: {
        salesByDate: [],
        salesByPaymentMode: [],
        salesByOutlet: [],
        salesByStatus: [],
        topCustomers: [],
        topItems: [],
      },
    });
  }

  const filter: any = {
    outletId: { $in: outletIds },
    isDeleted: false,
  };

  if (startDate && endDate) {
    filter.invoiceDate = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string),
    };
  }

  // Determine grouping by date unit
  let groupFormat = "%Y-%m-%d";
  if (reportDuration === "MONTHLY") {
    groupFormat = "%Y-%m";
  } else if (reportDuration === "YEARLY") {
    groupFormat = "%Y";
  }

  const [
    salesByDate,
    salesByPaymentMode,
    salesByOutlet,
    salesByStatus,
    topCustomers,
    topItems,
  ] = await Promise.all([
    Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$invoiceDate" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    Invoice.aggregate([
      { $match: filter },
      { $unwind: "$amountReceived" },
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
          modeName: {
            $arrayElemAt: ["$paymentModeDetails.modeName", 0],
          },
        },
      },
      {
        $group: {
          _id: "$modeName",
          total: { $sum: "$amountReceived.amount" },
        },
      },
    ]),

    Invoice.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "outlets",
          localField: "outletId",
          foreignField: "_id",
          as: "outlet",
        },
      },
      {
        $group: {
          _id: { $arrayElemAt: ["$outlet.name", 0] },
          total: { $sum: "$totalAmount" },
        },
      },
    ]),

    Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          total: { $sum: "$totalAmount" },
        },
      },
    ]),

    Invoice.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $group: {
          _id: { $arrayElemAt: ["$customer.customerName", 0] },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]),

    Invoice.aggregate([
      { $match: filter },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.itemName",
        total: { $sum: "$items.quantity" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]),
  ]);

  return res.status(httpStatus.OK).send({
    message: "Company sales summary fetched successfully",
    data: {
      salesByDate,
      salesByPaymentMode,
      salesByOutlet,
      salesByStatus,
      topCustomers,
      topItems,
    },
  });
});






export {
  createCompanys,
  getComponies,
  getByIdCompanys,
  updateByIdCompanys,
  removeCompanys,
  toggleStatusCompanys,
  getCompanySalesSummary,
  getCompanySalesReportPaginated,
  getCompanySalesChartData
};
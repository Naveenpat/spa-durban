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
import { pick } from "../../../../utilities/pick";
import ApiError from "../../../../utilities/apiError";
import catchAsync from "../../../../utilities/catchAsync";
import {
  invoiceService,
  outletService,
  productService,
  purchaseOrderService,
  customerService,
  paymentModeService,
  invoiceLogService,
} from "../service.index";

import {
  DateFilter,
  RangeFilter,
  AuthenticatedRequest,
} from "../../../utils/interface";

import {
  getFilterQuery,
  getRangeQuery,
  getSearchQuery,
  checkInvalidParams,
  getDateFilterQuery,
} from "../../../utils/utils";

const getCounts = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    //TODAY INVOICES
    //THIS MONTH INVOICES
    //TODAY SALES
    //THIS MONTHE SALES

    let today = new Date();
    const getTodayInvoices = await invoiceService.getInvoicesCounts({
      invoiceDate: { $gte: startOfDay(today), $lte: endOfDay(today) },
      isDeleted: false,
    });

    const getThisMonthInvoices = await invoiceService.getInvoicesCounts({
      invoiceDate: { $gte: startOfMonth(today), $lte: endOfMonth(today) },
      isDeleted: false,
    });

    const todaySales = await invoiceService.getInvoiceAggrigate([
      {
        $match: {
          invoiceDate: { $gte: startOfDay(today), $lte: endOfDay(today) },
        },
      },
      { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
    ]);

    let todaySalesTotal =
      todaySales && todaySales?.length > 0 ? todaySales[0].totalAmount : 0;

    const thisMonthSales = await invoiceService.getInvoiceAggrigate([
      {
        $match: {
          invoiceDate: { $gte: startOfMonth(today), $lte: endOfMonth(today) },
        },
      },
      { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
    ]);

    let thisMonthSalesTotal =
      thisMonthSales && thisMonthSales?.length > 0
        ? thisMonthSales[0].totalAmount
        : 0;

    return res.status(httpStatus.OK).send({
      message: "All Ok",
      data: {
        todayInvoices: getTodayInvoices,
        thisMonthInvoices: getThisMonthInvoices,
        todaySales: todaySalesTotal,
        thisMonthSales: thisMonthSalesTotal,
      },
      status: true,
      code: httpStatus.OK,
      issue: null,
    });
  }
);

const getRecentBuyers = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const recentBuyers = await invoiceService.getInvoiceAggrigate([
      { $sort: { _id: -1 } },
      { $limit: 10 },

      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                customerName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          customerName: {
            $arrayElemAt: ["$customer.customerName", 0],
          },
        },
      },
      {
        $unset: ["customer"],
      },
      {
        $project: {
          customerName: 1,
          amountPaid: 1,
          balanceDue: 1,
          totalAmount: 1,
        },
      },
    ]);
    if (!recentBuyers) {
      throw new ApiError(httpStatus.NOT_FOUND, "recentBuyers not found");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: recentBuyers,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getRecentInvoice = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const recentInvoice = await invoiceService.getInvoiceAggrigate([
      { $sort: { _id: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "outlets",
          localField: "outletId",
          foreignField: "_id",
          as: "outletData",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                name: 1,
              },
            },
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
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                customerName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "employeeId",
          foreignField: "_id",
          as: "employee",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          outletName: {
            $arrayElemAt: ["$outletData.name", 0],
          },
          customerName: {
            $arrayElemAt: ["$customer.customerName", 0],
          },
          employeeName: {
            $arrayElemAt: ["$employee.name", 0],
          },
        },
      },
      {
        $unset: ["outletData", "customer", "employee"],
      },
    ]);
    if (!recentInvoice) {
      throw new ApiError(httpStatus.NOT_FOUND, "recentInvoice not found");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: recentInvoice,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getMonthlyReport = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { year, month } = req.query; // Assuming you'll pass year and month as query parameters

    // Validate and parse year and month
    if (!year || !month) {
      return res
        .status(400)
        .json({ message: "Year and month are required parameters." });
    }

    const startDate = new Date(
      parseInt(year as any),
      parseInt(month as any) - 1,
      1
    ); // Month is zero-indexed in JavaScript Date
    const endDate = new Date(parseInt(year as any), parseInt(month as any), 0); // Last day of the specified month

    // Query invoices within the specified month
    const invoices: any = await invoiceService.getInvoiceAggrigate([
      {
        $match: {
          isDeleted: false,
          invoiceDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
    ]);

    if (!invoices?.length || invoices === null) {
      throw new ApiError(httpStatus.NOT_FOUND, "No data found");
    }
    // Calculate total sales for each day
    const salesByDay = invoices?.reduce((acc: any, invoice: any) => {
      const dateKey = format(invoice.invoiceDate, "yyyy-MM-dd");
      acc[dateKey] = (acc[dateKey] || 0) + invoice.totalAmount; // Accumulate totalAmount or initialize with 0
      return acc;
    }, {} as { [key: string]: number });

    // Create array of dates with totalAmount, including days with no invoices
    const salesByDayArray = [];

    // Generate sales for each day in the month
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = format(currentDate, "yyyy-MM-dd");
      const totalAmount = salesByDay[dateKey] || 0; // Use 0 if no sales found for the day
      salesByDayArray.push({ date: dateKey, totalAmount });
      currentDate.setDate(currentDate.getDate() + 1); // Move to next day
    }

    return res.status(httpStatus.OK).send({
      message: "All Ok",
      data: salesByDayArray,
      status: true,
      code: httpStatus.OK,
      issue: null,
    });
  }
);

export { getCounts, getRecentBuyers, getRecentInvoice, getMonthlyReport };

import httpStatus from "http-status";
import ApiError from "../../../../utilities/apiError";
import mongoose, { Document, Model } from "mongoose";
import { DateFilter, RangeFilter } from "../../../utils/interface";
import { ItemTypeEnum } from "../../../utils/enumUtils";
import { invoiceService } from "../service.index";
import {
  format,
  parseISO,
  startOfYear,
  startOfMonth,
  endOfMonth,
  endOfDay,
  addMonths,
  isBefore,
  isAfter,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  eachDayOfInterval,
  startOfDay,
} from "date-fns";

export const getDateFilterQuery = (
  dateFilter: DateFilter | null,
  allowedDateFilterKeys: string[]
): Record<string, any>[] | null => {
  if (!dateFilter) {
    return null;
  }
  // const jsonObject = JSON.parse(dateFilter as any)
  const { dateFilterKey, startDate, endDate } = dateFilter;

  if (dateFilterKey && !allowedDateFilterKeys.includes(dateFilterKey)) {
    throw new ApiError(
      httpStatus.NOT_IMPLEMENTED,
      `Date filter key is invalid.`
    );
  }

  const filterKey = dateFilterKey || "createdAt";
  const start = startDate || endDate;
  const end = endDate || startDate;

  if (!start || !end) {
    return null;
  }

  const startOfMonthISO = format(
    startOfMonth(parseISO(start)),
    "yyyy-MM-dd HH:mm:ss"
  );
  const endOfDayISO = format(endOfDay(parseISO(end)), "yyyy-MM-dd HH:mm:ss");

  return [
    {
      [filterKey]: {
        $gte: startOfMonthISO,
        $lte: endOfDayISO,
      },
    },
  ];
};

export const limitAndTotalCount = (
  limit: number,
  page: number,
  totalData: number
) => {
  if (limit < 1 || Math.sign(limit) === -1) {
    limit = 10;
  }

  if (page < 1 || Math.sign(page) === -1) {
    page = 1;
  }
  let skip = page * limit - limit;

  let totalpages = 1;
  totalpages = Math.ceil(totalData / limit);

  return {
    limit,
    page,
    totalData,
    skip,
    totalpages,
  };
};

// Function to generate an array of year-month strings in the desired range
const generateYearMonths = (start: Date, end: Date) => {
  let startDate = startOfYear(start); // Use startOfYear for better accuracy
  let endDate = endOfMonth(end);
  let months = [];

  while (startDate <= endDate) {
    months.push(format(startDate, "yyyy-MM"));
    startDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
  }

  return months;
};

// Generate the start and end dates for each week in the current month
const generateWeeklyIntervals = (startDate: Date, endDate: Date) => {
  return eachWeekOfInterval({ start: startDate, end: endDate }).map(
    (weekStart) => {
      const weekEnd = endOfWeek(weekStart);
      return {
        start: weekStart,
        end: weekEnd,
        formatted: `${format(weekStart, "yyyy-MM-dd")} to ${format(
          weekEnd,
          "yyyy-MM-dd"
        )}`,
      };
    }
  );
};

//
const getTopProducts = async (
  filterQuery: object,
  itemType: string[],
  limit: number,
  page: number,
  sortByValue: number
) => {
  let aggregateQuery: any[] = [
    {
      $match: filterQuery,
    },
    {
      $unwind: "$items",
    },
    {
      $match: { "items.itemType": { $in: itemType } },
    },
    {
      $group: {
        _id: {
          itemId: "$items.itemId",
          itemName: "$items.itemName",
          itemType: "$items.itemType",
        },
        totalQuantity: { $sum: "$items.quantity" },
        totalSellingPrice: { $sum: "$items.sellingPrice" },
        totalSellIncldTex: { $sum: "$items.priceIncTax" },
      },
    },
    {
      $sort: { totalSellingPrice: -1 },
    },
    {
      $project: {
        itemId: "$_id.itemId",
        itemName: "$_id.itemName",
        itemType: "$_id.itemType",
        totalQuantity: "$totalQuantity",
        totalSellingPrice: "$totalSellingPrice",
        totalSellIncldTex: "$totalSellIncldTex",
        _id: 0,
      },
    },
    {
      $sort: { totalSellingPrice: sortByValue },
    },
  ];

  let countResult = await invoiceService.getInvoiceAggrigate(aggregateQuery);
  let totalData = countResult && countResult.length ? countResult.length : 0;
  let {
    limit: newLimit,
    page: newPage,
    totalData: newTotalDocuments,
    skip,
    totalpages,
  } = limitAndTotalCount(limit, page, totalData);

  // aggregateQuery.push({ $sort: { orderBy: sortByValue } })
  aggregateQuery.push({ $skip: skip });
  aggregateQuery.push({ $limit: newLimit });

  let result = await invoiceService.getInvoiceAggrigate(aggregateQuery);

  return {
    data: result,
    totalData: newTotalDocuments,
    page: newPage,
    totalpages,
  };
};

//
const getTopCustomer = async (
  filterQuery: object,
  limit: number,
  page: number,
  sortByValue: number
) => {
  let aggregateQuery: any[] = [
    {
      $match: filterQuery,
    },

    {
      $group: {
        _id: "$customerId",
        totalSellingPrice: { $sum: "$totalAmount" },
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "_id",
        foreignField: "_id",
        as: "customerDetails",
        pipeline: [
          {
            $match: {
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $project: {
              phone: 1,
              email: 1,
              address: 1,
              customerName: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        customerName: {
          $arrayElemAt: ["$customerDetails.customerName", 0],
        },
        customerPhone: {
          $arrayElemAt: ["$customerDetails.phone", 0],
        },
        customerEmail: {
          $arrayElemAt: ["$customerDetails.email", 0],
        },
        customerId: {
          $arrayElemAt: ["$customerDetails._id", 0],
        },
      },
    },
    {
      $unset: ["customerDetails", "_id"],
    },
    {
      $sort: { totalSellingPrice: sortByValue },
    },
  ];

  let countResult = await invoiceService.getInvoiceAggrigate(aggregateQuery);
  let totalData = countResult && countResult.length ? countResult.length : 0;
  let {
    limit: newLimit,
    page: newPage,
    totalData: newTotalDocuments,
    skip,
    totalpages,
  } = limitAndTotalCount(limit, page, totalData);

  // aggregateQuery.push({ $sort: { orderBy: sortByValue } })
  aggregateQuery.push({ $skip: skip });
  aggregateQuery.push({ $limit: newLimit });

  let result = await invoiceService.getInvoiceAggrigate(aggregateQuery);

  return {
    data: result,
    totalData: newTotalDocuments,
    page: newPage,
    totalpages,
  };
};

//
const getTopOutlet = async (
  filterQuery: object,
  limit: number,
  page: number,
  sortByValue: number
) => {
  let aggregateQuery: any[] = [
    {
      $match: filterQuery,
    },
    {
      $group: {
        _id: "$outletId",
        totalSellingPrice: { $sum: "$totalAmount" },
      },
    },
    {
      $sort: { totalSellingPrice: -1 },
    },
    {
      $lookup: {
        from: "outlets",
        localField: "_id",
        foreignField: "_id",
        as: "outlet",
        pipeline: [
          {
            $match: {
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $project: {
              phone: 1,
              name: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        outletName: {
          $arrayElemAt: ["$outlet.name", 0],
        },
        outletPhone: {
          $arrayElemAt: ["$outlet.phone", 0],
        },
        outletId: {
          $arrayElemAt: ["$outlet._id", 0],
        },
      },
    },
    {
      $unset: ["outlet", "_id"],
    },
    {
      $sort: { totalSellingPrice: sortByValue },
    },
  ];

  let countResult = await invoiceService.getInvoiceAggrigate(aggregateQuery);
  let totalData = countResult && countResult.length ? countResult.length : 0;
  let {
    limit: newLimit,
    page: newPage,
    totalData: newTotalDocuments,
    skip,
    totalpages,
  } = limitAndTotalCount(limit, page, totalData);

  // aggregateQuery.push({ $sort: { orderBy: sortByValue } })
  aggregateQuery.push({ $skip: skip });
  aggregateQuery.push({ $limit: newLimit });

  let result = await invoiceService.getInvoiceAggrigate(aggregateQuery);

  return {
    data: result,
    totalData: newTotalDocuments,
    page: newPage,
    totalpages,
  };
};

//
const getDailyOutletReport = async () => {
  const startMonth = startOfMonth(new Date());
  const endMonth = endOfMonth(new Date());

  // Generate an array of all days in the current month
  const daysInMonth = eachDayOfInterval({
    start: startMonth,
    end: endMonth,
  }).map((date) => ({
    date,
    formatted: format(date, "yyyy-MM-dd"), // YYYY-MM-DD format
  }));

  // Aggregation pipeline
  let aggregateQuery = [
    {
      $match: {
        isDeleted: false,
        invoiceDate: {
          $gte: startMonth,
          $lte: endMonth,
        },
      },
    },
    {
      $lookup: {
        from: "outlets",
        localField: "outletId",
        foreignField: "_id",
        as: "outlet",
        pipeline: [
          {
            $match: {
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $project: {
              phone: 1,
              name: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$outlet",
    },
    {
      $group: {
        _id: "$outletId",
        outletName: { $first: "$outlet.name" },
        outletPhone: { $first: "$outlet.phone" },
        outletId: { $first: "$outlet._id" },
        sales: {
          $push: {
            date: "$invoiceDate",
            sales: "$totalAmount",
          },
        },
      },
    },
    {
      $unwind: "$sales",
    },
    {
      $project: {
        outletId: 1,
        outletName: 1,
        outletPhone: 1,
        date: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$sales.date",
          },
        },
        sales: "$sales.sales",
      },
    },
    {
      $group: {
        _id: {
          outletId: "$outletId",
          outletName: "$outletName",
          outletPhone: "$outletPhone",
          date: "$date",
        },
        totalSales: { $sum: "$sales" },
      },
    },
    {
      $group: {
        _id: "$_id.outletId",
        outletName: { $first: "$_id.outletName" },
        outletPhone: { $first: "$_id.outletPhone" },
        sales: {
          $push: {
            date: "$_id.date",
            totalSales: "$totalSales",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        outletId: "$_id",
        outletName: 1,
        outletPhone: 1,
        sales: {
          $reduce: {
            input: daysInMonth,
            initialValue: [],
            in: {
              $concatArrays: [
                "$$value",
                [
                  {
                    date: "$$this.formatted",
                    totalSales: {
                      $let: {
                        vars: {
                          matchedDay: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$sales",
                                  as: "sale",
                                  cond: {
                                    $eq: ["$$sale.date", "$$this.formatted"],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: { $ifNull: ["$$matchedDay.totalSales", 0] },
                      },
                    },
                  },
                ],
              ],
            },
          },
        },
      },
    },
  ];

  // Execute the aggregation
  let result = await invoiceService.getInvoiceAggrigate(aggregateQuery);

  return result;
};
const getDailyOutletReportSingleDay = async (outletId: any) => {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const todayFormatted = format(new Date(), "yyyy-MM-dd");
  const daysInMonth = eachDayOfInterval({
    start: todayStart,
    end: todayEnd,
  }).map((date) => ({
    date,
    formatted: format(date, "yyyy-MM-dd"), // YYYY-MM-DD format
  }));

  const aggregateQuery = [
    {
      $match: {
        isDeleted: false,
        invoiceDate: { $gte: todayStart, $lte: todayEnd },
        // Conditionally adds outletId to match if it's a valid ObjectId
        ...(mongoose.Types.ObjectId.isValid(outletId)
          ? { outletId: new mongoose.Types.ObjectId(outletId) }
          : {}),
      },
    },
    {
      $lookup: {
        from: "outlets", // The collection to join with
        localField: "outletId", // Field from the input documents
        foreignField: "_id", // Field from the "outlets" collection
        as: "outlet", // Output array field for the joined documents
        pipeline: [
          { $match: { isDeleted: false, isActive: true } }, // Filters for active and non-deleted outlets
          { $project: { name: 1, phone: 1 } }, // Selects only 'name' and 'phone' fields
        ],
      },
    },
    { $unwind: "$outlet" }, // Deconstructs the 'outlet' array field to output a document for each element

    {
      $lookup: {
        from: "users", // The collection to join with (customers are users)
        localField: "customerId", // Field from the input documents
        foreignField: "_id", // Field from the "users" collection
        as: "customer", // Output array field for the joined documents
        pipeline: [{ $project: { name: 1, phone: 1 } }], // Selects only 'name' and 'phone' fields
      },
    },
    { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } }, // Deconstructs 'customer', keeping documents even if no customer is found

    // --- Handling Payment Modes ---
    // Unwind amountReceived to process each payment entry individually
    { $unwind: { path: "$amountReceived", preserveNullAndEmptyArrays: true } },

    // Lookup paymentMode details from 'paymentmodes' collection using amountReceived.paymentModeId
    {
      $lookup: {
        from: "paymentmodes", // The collection to join with
        localField: "amountReceived.paymentModeId", // Field from the 'amountReceived' sub-document
        foreignField: "_id", // Field from the "paymentmodes" collection
        as: "paymentMode", // Output array field for the joined documents
        pipeline: [{ $project: { modeName: 1 } }], // Selects only the 'name' of the payment mode
      },
    },
    { $unwind: { path: "$paymentMode", preserveNullAndEmptyArrays: true } }, // Deconstructs 'paymentMode', keeping documents even if no mode is found

    // --- Projecting Desired Fields ---
    {
      $project: {
        _id: 1, // Exclude the default _id field
        invoiceNumber: 1,
        status: 1, 
        invoiceDate: {
          $dateToString: { format: "%Y-%m-%d", date: "$invoiceDate" }, // Formats date to YYYY-MM-DD string
        },
        rawInvoiceDate: "$invoiceDate",
        totalAmount: 1,
        outletId: "$outlet._id",
        outletName: "$outlet.name",
        outletPhone: "$outlet.phone",
        customerName: "$customer.name",
        paymentStatus: {
          $cond: [{ $eq: ["$paymentStatus", "paid"] }, "Paid", "Unpaid"], // Transforms status to human-readable form
        },
        amount: "$amountReceived.amount", // The specific amount for this payment entry
        paymentMode: "$paymentMode.modeName", // The name of the payment mode
      },
    },
{
    $sort: { rawInvoiceDate: 1 },
  },
    // --- Grouping by Outlet ---
    // This stage re-groups the documents by outlet, consolidating all sales for an outlet
    {
      $group: {
        _id: "$outletId", // Group by the outlet's _id
        outletName: { $first: "$outletName" }, // Take the first outlet name encountered for the group
        outletPhone: { $first: "$outletPhone" }, // Take the first outlet phone encountered for the group
        sales: {
          $push: { // Push individual sale details into a 'sales' array
            _id: "$_id",
            date: "$invoiceDate",
            status:"$status",
            invoiceNumber: "$invoiceNumber",
            customerName: "$customerName",
            totalAmount: "$totalAmount",
            paymentStatus: "$paymentStatus",
            paymentMode: "$paymentMode", // This is the payment mode name for this specific payment
            amount: "$amount", // The amount received for this specific payment
          },
        },
       totalSales: {
  $sum: {
    $cond: [
      { $ne: ["$status", "refund"] },
      "$amount",
      0
    ]
  }
},
totalRefunds: {
  $sum: {
    $cond: [
      { $eq: ["$status", "refund"] },
      "$amount",
      0
    ]
  }
}

// Calculate total sales amount for the outlet
      },
    },
    {
      $project: {
        _id: 1, // Exclude the _id field from the final output
        outletId: "$_id", // Rename _id to outletId for clarity
        outletName: 1,
        outletPhone: 1,
        sales: 1, // Include the array of sales details
        totalSales: 1,
        totalRefunds:1
      },
    },
  ];

  // Execute the aggregation
  let result = await invoiceService.getInvoiceAggrigate(aggregateQuery);
  const outletSalesReport = result?.[0] || null;
  return outletSalesReport;
};
//
const getWeeklyOutletReport = async () => {
  const startMonth = startOfMonth(new Date());
  const endMonth = endOfMonth(new Date());

  // Generate weekly intervals for the current month
  const allWeeks = generateWeeklyIntervals(startMonth, endMonth);

  // Aggregation pipeline
  let aggregateQuery = [
    {
      $match: {
        isDeleted: false,
        invoiceDate: {
          $gte: startMonth,
          $lte: endMonth,
        },
      },
    },
    {
      $lookup: {
        from: "outlets",
        localField: "outletId",
        foreignField: "_id",
        as: "outlet",
        pipeline: [
          {
            $match: {
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $project: {
              phone: 1,
              name: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$outlet",
    },
    {
      $group: {
        _id: "$outletId",
        outletName: { $first: "$outlet.name" },
        outletPhone: { $first: "$outlet.phone" },
        outletId: { $first: "$outlet._id" },
        sales: {
          $push: {
            date: "$invoiceDate",
            sales: "$totalAmount",
          },
        },
      },
    },
    {
      $unwind: "$sales",
    },
    {
      $project: {
        outletId: 1,
        outletName: "$outletName",
        outletPhone: "$outletPhone",
        sales: 1,
        week: {
          $arrayElemAt: [
            {
              $filter: {
                input: allWeeks,
                as: "week",
                cond: {
                  $and: [
                    { $gte: ["$sales.date", "$$week.start"] },
                    { $lte: ["$sales.date", "$$week.end"] },
                  ],
                },
              },
            },
            0,
          ],
        },
      },
    },
    {
      $group: {
        _id: {
          outletName: "$outletName",
          outletPhone: "$outletPhone",
          outletId: "$outletId",
          week: "$week.formatted",
        },
        totalSales: { $sum: "$sales.sales" },
      },
    },
    {
      $group: {
        _id: {
          outletName: "$_id.outletName",
          outletPhone: "$_id.outletPhone",
          outletId: "$_id.outletId",
        },
        weeks: {
          $push: {
            week: "$_id.week",
            totalSales: "$totalSales",
          },
        },
      },
    },
    {
      $project: {
        outletName: "$_id.outletName",
        outletPhone: "$_id.outletPhone",
        outletId: "$_id.outletId",
        sales: {
          $reduce: {
            input: allWeeks,
            initialValue: [],
            in: {
              $concatArrays: [
                "$$value",
                [
                  {
                    week: "$$this.formatted",
                    totalSales: {
                      $let: {
                        vars: {
                          matchedWeek: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$weeks",
                                  as: "week",
                                  cond: {
                                    $eq: ["$$week.week", "$$this.formatted"],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: { $ifNull: ["$$matchedWeek.totalSales", 0] },
                      },
                    },
                  },
                ],
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        outletName: 1,
        outletPhone: 1,
        outletId: 1,
        sales: 1,
      },
    },
  ];

  // Execute the aggregation
  let result = await invoiceService.getInvoiceAggrigate(aggregateQuery);

  return result;
};

//
const getMonthlyOutletReport = async () => {
  const startYearMonth = new Date(new Date().getFullYear(), 0, 1);
  const endYearMonth = endOfMonth(new Date());

  // Generate year-month strings for the aggregation pipeline
  const allMonths = generateYearMonths(startYearMonth, endYearMonth);

  // Aggregation pipeline

  let aggregateQuery = [
    {
      $match: {
        isDeleted: false,
        invoiceDate: {
          $gte: startYearMonth,
          $lte: endYearMonth,
        },
      },
    },
    {
      $group: {
        _id: {
          outletId: "$outletId",
          yearMonth: {
            $dateToString: {
              format: "%Y-%m",
              date: "$invoiceDate",
            },
          },
        },
        totalSales: { $sum: "$totalAmount" },
      },
    },
    {
      $lookup: {
        from: "outlets",
        localField: "_id.outletId",
        foreignField: "_id",
        as: "outlet",
        pipeline: [
          {
            $match: {
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $project: {
              phone: 1,
              name: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$outlet",
    },
    {
      $group: {
        _id: "$_id.outletId",
        outletName: { $first: "$outlet.name" },
        outletPhone: { $first: "$outlet.phone" },
        outletId: { $first: "$_id.outletId" },
        sales: {
          $push: {
            yearMonth: "$_id.yearMonth",
            totalSales: "$totalSales",
          },
        },
      },
    },
    {
      $addFields: {
        sales: {
          $map: {
            input: allMonths,
            as: "month",
            in: {
              yearMonth: "$$month",
              totalSales: {
                $ifNull: [
                  {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: "$sales",
                          as: "sale",
                          in: {
                            $cond: {
                              if: { $eq: ["$$sale.yearMonth", "$$month"] },
                              then: "$$sale.totalSales",
                              else: 0,
                            },
                          },
                          // cond: { $eq: ["$$sale.yearMonth", "$$month"] },
                        },
                      },
                      0,
                    ],
                  },
                  { totalSales: 0 },
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        outletName: 1,
        outletPhone: 1,
        outletId: 1,
        sales: 1,
      },
    },
  ];

  // Execute the aggregation

  let result = await invoiceService.getInvoiceAggrigate(aggregateQuery);

  return result;
};

//
const getOutletReportData = async (reportDuration: string) => {
  //
  if (reportDuration === "MONTHLY") {
    return await getMonthlyOutletReport();
  }

  //
  if (reportDuration === "WEEKLY") {
    return await getWeeklyOutletReport();
  }

  //
  if (reportDuration === "DAILY") {
    return await getDailyOutletReport();
  }
};
//

export {
  getTopProducts,
  getTopCustomer,
  getTopOutlet,
  getDailyOutletReport,
  getWeeklyOutletReport,
  getMonthlyOutletReport,
  getOutletReportData,
  getDailyOutletReportSingleDay,
};

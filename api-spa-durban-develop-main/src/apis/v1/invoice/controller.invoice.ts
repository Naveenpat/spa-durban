import { Request, Response } from "express";
import { format, parseISO, startOfDay, endOfDay, isBefore } from "date-fns";
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
  couponService,
  rewardsCouponService,
  promotionCouponService,
  giftCardService,
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
import { searchKeys, allowedDateFilterKeys } from "./schema.invoice";
import * as invoiceHelper from "./helper.invoice";
import * as inventoryHelper from "../inventory/helper.inventory";
import {
  getLoyaltyWalletCreditData,
  getLoyaltyWalletDebitData,
  updateWalletAndUpdateLog,
  updateCashBack,
} from "../loyaltyWallet/helper.loyaltyWallet";
import { getPreview } from "./helper.preinvoice";
import mongoose from "mongoose";
import Cashback from "../cashback/schema.cashback";
import { sendEmail } from "../../../../src/helper/sendEmail";

const previewInvoice = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    /**
     * employeeId = req.userData.Id
     */
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    //get pre invoicing phase
    const previewResult = await getPreview(req);
    if (!previewResult) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Something Went Wrong"
      );
    }
    let { dataToResponse, dataToUpdate } = previewResult;
    if (!previewResult.status) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Something Went Wrong"
      );
    }
    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: dataToResponse,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const createInvoice = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    /**
     * employeeId = req.userData.Id
     */
    // console.log("1111111111111111111111111111")
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }
    let {
      customerId,
      items,
      couponCode,
      shippingCharges,
      amountReceived,
      giftCardCode,
      useLoyaltyPoints,
      referralCode,
      outletId,
      useCashBackAmount,
      usedCashBackAmount,
      bookingId,
      rewardCoupan,
      promotionCoupanCode
    } = req.body;
    // console.log(req.body, 12313);
    //get pre invoicing phase
    // console.log('-----calll------1', customerId)
    const previewResult = await getPreview(req);
    // console.log('-----calll-----2', previewResult)
    if (!previewResult) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Something Went Wrong"
      );
    }
    // console.log("22222222222")

    let { dataToResponse, dataToUpdate, otherData } = previewResult;
    if (!previewResult.status) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Something Went Wrong"
      );
    }
    let { invoiceData } = dataToResponse;

    let {
      pointsToAdd,
      pointsToDebit,
      walletDebitLog,
      walletCreditLog,
      inventoryData,
    } = dataToUpdate;
    let { outlet } = otherData;

    // console.log('-----pointsToAdd', pointsToAdd)


    const now = new Date();
    const itemIds = invoiceData?.items.map((item: any) => item.itemId);

    const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

    // const potentialRules = await Cashback.find({
    //   isActive: true,
    //   serviceId: { $in: itemIds },
    //   $or: [
    //     {
    //       $and: [
    //         {
    //           cashBackDate: { $exists: true }
    //         },
    //         {
    //           cashBackDate: { $lte: now }
    //         },
    //         { cashBackEndDate: { $exists: true } },
    //         { cashBackEndDate: { $gte: now } }
    //       ]
    //     },
    //     {
    //       activeDays: { $in: [currentDay] }
    //     }
    //   ]
    // });

    const potentialRules = await Cashback.find({
      isActive: true,
      serviceId: { $in: itemIds },
      $or: [
        {
          // Date-based cashback rule
          cashBackDate: { $lte: now },
          cashBackEndDate: { $gte: now }
        },
        {
          // Day-based cashback rule
          activeDays: { $in: [currentDay] }
        }
      ]
    });




    // console.log('-----potentialRules', potentialRules)
    // Step 2: Filter valid rules
    const validRules = potentialRules.filter((rule: any) => {
      const isDayRule =
        Array.isArray(rule.activeDays) &&
        rule.activeDays.includes(currentDay) &&
        rule.startTime &&
        rule.endTime;

      if (isDayRule) {
        const [sh, sm] = rule.startTime.split(':').map(Number); // 17, 52
        const [eh, em] = rule.endTime.split(':').map(Number);   // 18, 29
        const startMins = sh * 60 + sm;
        const endMins = eh * 60 + em;

        return currentTimeMinutes >= startMins && currentTimeMinutes <= endMins;
      }

      return (
        (!rule.cashBackDate || now >= new Date(rule.cashBackDate)) &&
        (!rule.cashBackEndDate || now <= new Date(rule.cashBackEndDate))
      );
    });




    // console.log('-----validBonusRules', validRules)

    // Step 3: Calculate cashback
    let cashbackMultiplier = 1;
    if (validRules.length) {
      cashbackMultiplier = Math.max(...validRules.map((r: any) => r.howMuchCashback || 1));
    }

    const finalCashback = (invoiceData?.cashBackEarned || 0) * cashbackMultiplier;
    // console.log('Final Cashback:', finalCashback);


    //check payment methods
    const paymentMethods = await invoiceHelper.checkPaymentMethods(
      amountReceived
    );
    // console.log("22222222222 -- invoiceData", invoiceData)

    if (!paymentMethods) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invalid payment mode.");
    }

    // get due amount
    let { balanceDue, amountPaid } = await invoiceHelper.getBalanceDue(
      invoiceData.totalAmount,
      amountReceived,
      0 //previouslyPaid
    );
    // console.log("333333333333")
    invoiceData.balanceDue = balanceDue;
    invoiceData.amountPaid = amountPaid;

    // get invoice number
    const { invoiceNumber, newInvoiceNumber } =
      await invoiceHelper.generateInvoiceNumber(outlet);
    // console.log("44444444444", invoiceNumber)

    invoiceData.invoiceNumber = invoiceNumber;
    invoiceData.invoiceDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    // console.log(invoiceData, 12123);

    //update outlet invoice number
    const getOutletData = await outletService.getOutletById(outletId);

    //create invoice
    const invoice = await invoiceService.createInvoice({
      ...invoiceData,
      cashBackEarned: isNaN(Number(finalCashback)) ? 0 : Number(finalCashback),
      bookingId,
      // loyaltyPointsEarned: pointsToAdd,
      loyaltyPoints: pointsToAdd,
      companyId: getOutletData?.companyId
    });

    // console.log("55555555555")
    if (!invoice) {
      throw new ApiError(httpStatus.NOT_FOUND, "Something went wrong.");
    }

    // update inventory quantities
    if (inventoryData && inventoryData.length) {
      const inventoryUpdate = await inventoryHelper.updateInventoriesAfterSell(
        inventoryData
      );
      // console.log("6666666666666")
      if (!inventoryUpdate) {
        throw new ApiError(httpStatus.NOT_FOUND, "Something went wrong.");
      }
    }

    //update outlet invoice number
    const updatedOutlet = await outletService.updateOutletById(outletId, {
      invoiceNumber: newInvoiceNumber,
    });

    if (!updatedOutlet) {
      throw new ApiError(httpStatus.NOT_FOUND, "Something went wrong.");
    }
    // console.log("777777777777777")
    //update logs
    let addedInvoiceLogs = await invoiceLogService.createOrUpdateInvoiceLog(
      invoice,
      true
    );

    // console.log("888888888888")

    if (!addedInvoiceLogs) {
      throw new ApiError(httpStatus.NOT_FOUND, "Something went wrong.");
    }

    //debit  to loyalty wallet
    if (walletDebitLog && pointsToDebit) {
      let debitedPoints = await updateWalletAndUpdateLog(
        walletDebitLog,
        pointsToDebit
      );
      // console.log("9999999999999")
      if (!debitedPoints) {
        throw new ApiError(httpStatus.NOT_FOUND, "Something went wrong.");
      }
    }

    //credit to loyalty wallet
    if (walletCreditLog && pointsToAdd) {
      let creditedPoints = await updateWalletAndUpdateLog(
        walletCreditLog,
        pointsToAdd
      );
      // console.log("100000000000")
      if (!creditedPoints) {
        throw new ApiError(httpStatus.NOT_FOUND, "Something went wrong.");
      }
    }





    await updateCashBack(
      invoiceData?.customerId,
      isNaN(Number(finalCashback)) ? 0 : Number(finalCashback),
      "add"
    );
    if (useCashBackAmount && usedCashBackAmount) {
      await updateCashBack(
        invoiceData?.customerId,
        usedCashBackAmount,
        "remove"
      );
    }

    if (couponCode) {
      await couponService.markCouponAsUsed(couponCode, invoiceData?.customerId)
    }
    if (rewardCoupan) {
      await rewardsCouponService.markRewardCouponAsUsed(rewardCoupan, invoiceData?.customerId)
    }

    if (promotionCoupanCode) {
      await promotionCouponService.markPromotionCouponAsUsed(promotionCoupanCode, invoiceData?.customerId)
    }
    if (giftCardCode) {
      await giftCardService.markGiftCardCouponAsUsed(giftCardCode, invoiceData?.customerId)
    }


    if (validRules.length) {
      const customerData = await customerService.getCustomerById(invoiceData?.customerId)
      const emailData = {
        sendTo: customerData?.email,
        emailSubject: `💰 You've Earned Bonus Cashback!`,
        emailBody: `
    <p>Dear ${customerData?.customerName || 'Customer'},</p>
    <p>Great news! You’ve earned <strong>${cashbackMultiplier}X</strong> cashback on your recent purchase 🎉</p>
    <p>🪙 <strong>Cashback Earned:</strong> R${invoiceData.cashBackEarned * cashbackMultiplier}</p>
    <p>This bonus was applied automatically based on our special cashback rules.</p>
    <br/>
    <p>Keep an eye out for more offers and save big on every visit!</p>
    <br/>
    <p>Cheers,</p>
    <p><em>The Spa Durban Team</em></p>
  `,
      };

      await sendEmail(emailData, outlet);
    }

    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: invoice,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

export const updateGivenChange = catchAsync(async (req: Request, res: Response) => {
  const { invoiceId, value } = req.body;
  const updatedInvoice = await invoiceService.modifyGivenChange(invoiceId, value);

  return res.status(httpStatus.OK).send({
    message: 'givenChange updated successfully',
    data: updatedInvoice,
    status: true,
  });
});


const getInvoices = catchAsync(
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

    // Extract searchValue from req.query
    const searchValue = req.query.searchValue as string | undefined;
    const searchIn = req.query.searchIn as string[] | null;
    const dateFilter = req.query.dateFilter as DateFilter | null;
    const filterBy = req.query.filterBy as any[];
    const rangeFilterBy = req.query.rangeFilterBy as RangeFilter | undefined;

    // Add searchValue to options if it exists
    if (searchValue) {
      let searchQueryCheck = checkInvalidParams(
        searchIn ? searchIn : [],
        searchKeys
      );

      if (searchQueryCheck && !searchQueryCheck.status) {
        return res.status(httpStatus.OK).send({
          ...searchQueryCheck,
        });
      }
      // Extract search query from options
      const searchQuery = getSearchQuery(
        searchIn ? searchIn : [],
        searchKeys,
        searchValue
      );
      if (searchQuery !== null) {
        options["search"] = { $or: searchQuery } as any;
      }
    }

    //date filter
    if (dateFilter) {
      const datefilterQuery = await getDateFilterQuery(
        dateFilter,
        allowedDateFilterKeys
      );

      if (datefilterQuery && datefilterQuery.length) {
        // options["dateFilter"] = { $and: datefilterQuery } as any;
        options["dateFilter"] = datefilterQuery[0];
      } else {
        options["dateFilter"] = {} as any;
      }
    }

    //range filter
    if (rangeFilterBy !== undefined) {
      const rangeQuery = getRangeQuery(rangeFilterBy);

      if (rangeQuery && rangeQuery.length) {
        options["rangeFilterBy"] = { $and: rangeQuery } as any;
      }
    }

    //check filter by
    if (filterBy?.length) {
      const booleanFields: string[] = ["isActive"];
      const numberFileds: string[] = [];
      const objectIdFileds: string[] = ["createdById", "POId", "outletId"];

      const withoutRegexFields: string[] = [];

      const filterQuery = getFilterQuery(
        filterBy,
        booleanFields,
        numberFileds,
        objectIdFileds,
        withoutRegexFields
      );
      if (filterQuery) {
        options["filterBy"] = { $and: filterQuery } as any;
      }
    }

    //additional query
    let additionalQuery = [
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
          from: "users",
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
                name: 1,
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
            $arrayElemAt: ["$customer.name", 0],
          },
          employeeName: {
            $arrayElemAt: ["$employee.name", 0],
          },
        },
      },
      {
        $unset: ["outletData", "customer", "employee"],
      },
    ];
    options["sortBy"] = options["sortBy"]
      ? `${options["sortBy"]},invoiceDate:desc`
      : "invoiceDate:desc";

    options["additionalQuery"] = additionalQuery as any;
    const result = await invoiceService.queryInvoices(filter, options);
    return res.status(httpStatus.OK).send(result);
  }
);

const getInvoice = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let additionalQuery = [
      { $match: { _id: new mongoose.Types.ObjectId(req.params.invoiceId) } },
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
                logo: 1
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
                loyaltyPoints: 1,
                cashBackAmount: 1,
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
          as: "employeeDetails",
          pipeline: [
            {
              $match: {
                isDeleted: false,
                isActive: true,
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
                                      {
                                        $eq: [
                                          "$$paymentModeDetail._id",
                                          "$$received.paymentModeId",
                                        ],
                                      },
                                      {
                                        $eq: [
                                          "$$paymentModeDetail.isDeleted",
                                          false,
                                        ],
                                      },
                                      {
                                        $eq: [
                                          "$$paymentModeDetail.isActive",
                                          true,
                                        ],
                                      },
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
          customerName: {
            $arrayElemAt: ["$customerDetails.customerName", 0],
          },
          customerPhone: {
            $arrayElemAt: ["$customerDetails.phone", 0],
          },
          customerEmail: {
            $arrayElemAt: ["$customerDetails.email", 0],
          },
          customerAddress: {
            $arrayElemAt: ["$customerDetails.address", 0],
          },
          customerLoyaltyPoints: {
            $arrayElemAt: ["$customerDetails.loyaltyPoints", 0],
          },
          customerCashBackAmount: {
            $arrayElemAt: ["$customerDetails.cashBackAmount", 0],
          },
          outletName: {
            $arrayElemAt: ["$outlet.name", 0],
          },
          outletPhone: {
            $arrayElemAt: ["$outlet.phone", 0],
          },
          Outletlogo: {
            $arrayElemAt: ["$outlet.logo", 0],
          },
          employeeName: {
            $arrayElemAt: ["$employeeDetails.name", 0],
          },
        },
      },
      {
        $unset: [
          "paymentModeDetails",
          "customerDetails",
          "outlet",
          "employeeDetails",
        ],
      },
    ];
    const invoice = await invoiceService.getInvoiceAggrigate(additionalQuery);
    if (!invoice?.length) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: invoice[0],
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const paymentInInvoice = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { amountReceived, remark } = req.body;

    const invoice = await invoiceService.getInvoiceById(req.params.invoiceId);
    if (!invoice) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found");
    }

    //check payment methods
    const paymentMethods = await invoiceHelper.checkPaymentMethods(
      amountReceived
    );

    if (!paymentMethods) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invalid payment mode.");
    }

    // get due amount
    let { balanceDue, amountPaid } = await invoiceHelper.getBalanceDue(
      invoice.totalAmount,
      amountReceived,
      invoice.amountPaid
    );

    req.body.balanceDue = balanceDue;
    req.body.amountPaid = amountPaid;

    const invoicePaymentIn = await invoiceService.updateInvoiceById(
      req.params.invoiceId,
      req.body
    );

    if (!invoicePaymentIn) {
      throw new ApiError(httpStatus.NOT_FOUND, "Something went wrong.");
    }

    //update logs
    await invoiceLogService.createOrUpdateInvoiceLog(invoicePaymentIn, true);
    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: invoicePaymentIn,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);
const updateInvoice = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // console.log(req.body, "req.body");
    // console.log(req.params, "req.params");

    const { satus } = req.body;

    const invoice = await invoiceService.getInvoiceById(req.params.invoiceId);
    if (!invoice) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found");
    }

    const invoicePaymentIn = await invoiceService.updateInvoiceById(
      req.params.invoiceId,
      req.body
    );

    if (!invoicePaymentIn) {
      throw new ApiError(httpStatus.NOT_FOUND, "Something went wrong.");
    }

    await invoiceLogService.createOrUpdateInvoiceLog(invoicePaymentIn, true);
    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: invoicePaymentIn,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getInvoiceByBookingId = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { bookingId } = req.params;
    // console.log(bookingId);

    let additionalQuery = [
      { $match: { bookingId: bookingId } },
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
        $lookup: {
          from: "customers",
          localField: "customerId",
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
                loyaltyPoints: 1,
                cashBackAmount: 1,
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
          as: "employeeDetails",
          pipeline: [
            {
              $match: {
                isDeleted: false,
                isActive: true,
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
                                      {
                                        $eq: [
                                          "$$paymentModeDetail._id",
                                          "$$received.paymentModeId",
                                        ],
                                      },
                                      {
                                        $eq: [
                                          "$$paymentModeDetail.isDeleted",
                                          false,
                                        ],
                                      },
                                      {
                                        $eq: [
                                          "$$paymentModeDetail.isActive",
                                          true,
                                        ],
                                      },
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
          customerName: {
            $arrayElemAt: ["$customerDetails.customerName", 0],
          },
          customerPhone: {
            $arrayElemAt: ["$customerDetails.phone", 0],
          },
          customerEmail: {
            $arrayElemAt: ["$customerDetails.email", 0],
          },
          customerAddress: {
            $arrayElemAt: ["$customerDetails.address", 0],
          },
          customerLoyaltyPoints: {
            $arrayElemAt: ["$customerDetails.loyaltyPoints", 0],
          },
          customerCashBackAmount: {
            $arrayElemAt: ["$customerDetails.cashBackAmount", 0],
          },
          outletName: {
            $arrayElemAt: ["$outlet.name", 0],
          },
          outletPhone: {
            $arrayElemAt: ["$outlet.phone", 0],
          },
          employeeName: {
            $arrayElemAt: ["$employeeDetails.name", 0],
          },
        },
      },
      {
        $unset: [
          "paymentModeDetails",
          "customerDetails",
          "outlet",
          "employeeDetails",
        ],
      },
    ];

    const invoice = await invoiceService.getInvoiceAggrigate(additionalQuery);
    if (!invoice?.length) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found for booking");
    }

    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: invoice[0],
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

export {
  previewInvoice,
  createInvoice,
  getInvoices,
  getInvoice,
  paymentInInvoice,
  updateInvoice,
  getInvoiceByBookingId
};

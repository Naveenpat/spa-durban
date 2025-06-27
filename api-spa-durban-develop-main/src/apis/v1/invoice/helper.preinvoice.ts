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
} from "../service.index";
import {
  DateFilter,
  RangeFilter,
  AuthenticatedRequest,
} from "../../../utils/interface";
import { CustomerTypeEnum } from "../../../utils/enumUtils";
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
} from "../loyaltyWallet/helper.loyaltyWallet";

const getPreview = async (req: AuthenticatedRequest) => {
  let {
    customerId,
    items,
    couponCode,
    shippingCharges,
    amountReceived,
    giftCardCode,
    promotionCoupanCode,
    rewardCoupan,
    useLoyaltyPoints,
    referralCode,
    outletId,
    useCashBackAmount,
    usedCashBackAmount,
    bookingId
  } = req.body;


  // console.log('--------req.body', req.body)
  /**
   * employeeId = req.userData.Id
   */
  if (!req.userData) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
  }

  const { Id } = req.userData;
  req.body.employeeId = Id;

  // check outlets exists
  const outlet = await outletService.getOutletById(outletId);
  if (!outlet) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid Outlet!");
  }

  // check cutomer
  const customer = await customerService.getCustomerById(customerId);
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid customer!");
  }

  let isWalkinCustomer =
    customer.customerType === CustomerTypeEnum.walkin ? true : false;

  // check items valid
  const allItemDetails = await invoiceHelper.checkValidItems(items);

  if (!allItemDetails) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid items.");
  }

  // get tax items
  items = await invoiceHelper.getTaxItems(
    allItemDetails,
    items,
    usedCashBackAmount
  );

  //check inventory exist
  const inventoryExists = await invoiceHelper.checkInventoryExist(
    items,
    outletId
  );
  if (!inventoryExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Inventory is missing.");
  }

  //check product quantity exist in inventory

  const inventoryQuantity = await invoiceHelper.checkQuantityInInventroy(
    inventoryExists,
    items
  );
  if (!inventoryQuantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Inventory is missing.");
  }

  // get inventory data to be outward
  const inventoryData = await invoiceHelper.getInventoryOutwardData(
    inventoryQuantity
  );
  if (!inventoryData) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Not enough quantity in inventory."
    );
  }

  // calculate tax on tax items
  req.body.items = invoiceHelper.calculateItemsTaxes(items);

  // get taxes
  const taxes = invoiceHelper.getTaxes(items);
  req.body.taxes = taxes;

  // calculate shipping charges
  const totalWithoutDiscount = invoiceHelper.getTotalWithoutDiscounts(items);
  const totalCashBack = invoiceHelper.getTotalCashBack(items);
  req.body.cashBackEarned = totalCashBack;
  const amountWithShipping = totalWithoutDiscount + shippingCharges;

  //if loyalty points used then get amount to be paid
  //useLoyaltyPoints

  const loyaltyPointsDiscount = await invoiceHelper.getLoyaltyPointsDiscount(
    totalWithoutDiscount,
    useLoyaltyPoints,
    customer.loyaltyPoints,
    isWalkinCustomer
  );
  const usedCashBackAmountData = await invoiceHelper.getCashBackDiscount(
    totalWithoutDiscount,
    useCashBackAmount,
    usedCashBackAmount,
    customer.cashBackAmount,
    isWalkinCustomer
  );

  // calculate discounts
  const allDiscounts = await invoiceHelper.getDiscounts(
    amountWithShipping,
    couponCode,
    giftCardCode,
    promotionCoupanCode,
    rewardCoupan,
    referralCode,
    loyaltyPointsDiscount,
    customerId,
    usedCashBackAmountData,
    req.body.items
  );

  let { couponDiscount, giftCardDiscount, promotionCoupanCodeDiscount, rewardCoupanCodeDiscount, referralDiscount, totalDiscount } =
    allDiscounts;
  req.body.totalDiscount = totalDiscount;
  req.body.couponDiscount = couponDiscount;
  req.body.giftCardDiscount = giftCardDiscount;
  req.body.promotionCoupanCodeDiscount = promotionCoupanCodeDiscount;
  req.body.loyaltyPointsDiscount = loyaltyPointsDiscount;
  req.body.referralDiscount = referralDiscount;
  req.body.cashBackDiscount = usedCashBackAmountData;
  req.body.rewardCoupanCodeDiscount = rewardCoupanCodeDiscount;
  let totalAmount = amountWithShipping - totalDiscount;
  req.body.totalAmount = parseFloat(totalAmount.toFixed(2));

  /**
   * get data to debit from loyalty wallet
   */
  const { walletDebitLog, pointsToDebit } = await getLoyaltyWalletDebitData(
    customerId,
    req.body.employeeId,
    outletId,
    req.body.totalAmount,
    loyaltyPointsDiscount
  );
  /**
   * get data to credit loyalty wallet
   */
  const { walletCreditLog, pointsToAdd } = await getLoyaltyWalletCreditData(
    customerId,
    req.body.employeeId,
    outletId,
    req.body.totalAmount,
    isWalkinCustomer
  );

  return {
    message: "Successfully!",
    dataToResponse: {
      invoiceData: { ...req.body },
      pointsToAdd,
      totalCashBack,
    },
    dataToUpdate: {
      pointsToAdd,
      pointsToDebit,
      walletDebitLog,
      walletCreditLog,
      inventoryData,
    },
    otherData: {
      outlet,
    },
    status: true,
    code: "OK",
    issue: null,
  };
};

export { getPreview };

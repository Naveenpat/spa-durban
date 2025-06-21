import mongoose from "mongoose";
import httpStatus from "http-status";
import ApiError from "../../../../utilities/apiError";
import {
  ItemTypeEnum,
  CouponTypeEnum,
  GiftCardTypeEnum,
} from "../../../utils/enumUtils";
import { calculatePercentage, dateHasPassed } from "../../../utils/utils";
import {
  productService,
  serviceService,
  taxService,
  paymentModeService,
  couponService,
  giftCardService,
  inventoryService,
  invoiceService,
} from "../service.index";
import { getLatestInvoiceByOutletId } from "./service.invoice";
import { isAfter, isBefore } from "date-fns";
import PromotionCoupon from "../promotioncoupon/schema.promotioncoupon";
import Service from "../service/schema.service";
import RewardsCoupon from "../rewardscoupon/schema.rewardscoupon";
import Customer from "../customer/schema.customer";

//
const getLoyaltyPointsDiscount = async (
  totalWithoutDiscount: number,
  useLoyaltyPoints: boolean,
  loyaltyPoints: number,
  isWalkinCustomer: boolean
) => {
  if (!useLoyaltyPoints || isWalkinCustomer) {
    return 0;
  }
  let pointsToDeduct =
    totalWithoutDiscount > loyaltyPoints ||
      totalWithoutDiscount === loyaltyPoints
      ? loyaltyPoints
      : loyaltyPoints - totalWithoutDiscount;

  return pointsToDeduct;

  //get customer's loyalty points
};
const getCashBackDiscount = async (
  totalWithoutDiscount: number,
  useCashBackAmount: boolean,
  usedCashBackAmount: number,
  cashBackAmount: number,
  isWalkinCustomer: boolean
) => {
  // If cashback is not used or customer is walk-in, return 0
  if (!useCashBackAmount || isWalkinCustomer) {
    return 0;
  }

  // Validate that usedCashBackAmount is not greater than cashBackAmount
  if (usedCashBackAmount > cashBackAmount) {
    throw new Error(
      "Used cash back amount cannot be greater than available cash back amount."
    );
  }

  // Calculate points to deduct
  let pointsToDeduct =
    totalWithoutDiscount >= usedCashBackAmount ? usedCashBackAmount : 0;

  return pointsToDeduct;
};

//
const getCouponDiscount = async (
  amountToCalculate: number,
  couponCode: string
) => {
  const coupon = await couponService.getCouponByMultipleFields({
    referralCode: couponCode,
    type: CouponTypeEnum.couponCode,
  });

  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid coupon.");
  }

  let { discountAmount, valid } = coupon;
  if (dateHasPassed(valid)) {
    throw new ApiError(httpStatus.NOT_FOUND, "Coupon expired.");
  }

  let couponDiscount = calculatePercentage(amountToCalculate, discountAmount);

  return couponDiscount;
};

//
const getGiftCardDiscount = async (
  amountToCalculate: number,
  giftCardCode: string,
  customerId: string
) => {
  const giftCard = await giftCardService.getGiftCardByMultipleFields({
    giftCardName: giftCardCode,
  });

  if (!giftCard) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid gift card.");
  }
  if (
    giftCard.type === GiftCardTypeEnum.specificCustomer &&
    giftCard.customerId.toString() !== customerId.toString()
  ) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Invalid gift card. It is customer specific."
    );
  }

  let { giftCardAmount, giftCardExpiryDate } = giftCard;
  if (dateHasPassed(giftCardExpiryDate)) {
    throw new ApiError(httpStatus.NOT_FOUND, "Gift card expired.");
  }

  let giftCardDiscount =
    amountToCalculate > giftCardAmount ? giftCardAmount : amountToCalculate;

  return giftCardDiscount;
};

export const getPromotionalCouponDiscount = async (
  items: { itemId: string; quantity: number; itemType: string }[],
  couponCode: string,
  customerId: string
) => {
  const today = new Date();

  const coupon = await PromotionCoupon.findOne({
    couponCode,
    isActive: true,
    startDate: { $lte: today },
    endDate: { $gte: today },
    customerId: { $in: [customerId] }
    // $or: [
    //   { groupTarget: { $size: 0 } }, // if no group targeting
    //   { groupTarget: 'new-user' },   // optionally check if user is eligible
    // ],
  });

  if (!coupon) {
    throw new ApiError(404, 'Invalid or expired promotional coupon.');
  }

  // 💡 Calculate discount only for applicable serviceIds
  const eligibleServiceIds = coupon.serviceId.map((id) => id.toString());

  let totalDiscount = 0;

  for (const item of items) {
    if (
      item.itemType === 'SERVICE' &&
      eligibleServiceIds.includes(item.itemId.toString())
    ) {
      // Get price (replace with actual fetch if needed)
      const service = await Service.findById(item.itemId);
      const itemPrice = service?.sellingPrice || 0;

      const discountPerUnit = (itemPrice * coupon.discountByPercentage) / 100;
      totalDiscount += discountPerUnit * item.quantity;
    }
  }

  return totalDiscount;
};

export const getRewardCouponDiscount = async (
  items: { itemId: string; quantity: number; itemType: string }[],
  couponCode: string,
  customerId: string
): Promise<number> => {
  const today = new Date();

  // Try reward coupon first
  const rewardCoupon = await RewardsCoupon.findOne({
    couponCode,
    isDeleted: false,
    isActive: true,
  });

  if (rewardCoupon) {
    const customer = await Customer.findById(customerId);
    if (!customer) throw new ApiError(404, 'Customer not found');

    const customerCashback = customer.cashBackAmount || 0;

    if (customerCashback < rewardCoupon.rewardsPoint) {
      throw new ApiError(400, 'Insufficient cashback balance to use this reward coupon.');
    }

    // Optional cashback deduction logic
    // customer.cashBackAmount -= rewardCoupon.rewardsPoint;
    // await customer.save();

    return rewardCoupon.rewardsPoint;
  }

  // Try promotional coupon
  const promoCoupon = await PromotionCoupon.findOne({
    couponCode,
    isActive: true,
    isDeleted: false,
    startDate: { $lte: today },
    endDate: { $gte: today },
    customerId: { $in: [customerId] },
  });

  if (!promoCoupon) {
    throw new ApiError(404, 'Invalid or expired coupon.');
  }

  const eligibleServiceIds = promoCoupon.serviceId.map((id) => id.toString());
  let totalDiscount = 0;

  for (const item of items) {
    if (
      item.itemType === 'SERVICE' &&
      eligibleServiceIds.includes(item.itemId.toString())
    ) {
      const service = await Service.findById(item.itemId);
      const itemPrice = service?.sellingPrice || 0;

      const discountPerUnit = (itemPrice * promoCoupon.discountByPercentage) / 100;
      totalDiscount += discountPerUnit * item.quantity;
    }
  }

  return Math.round(totalDiscount);
};

//
const getReferralDiscount = async (
  amountToCalculate: number,
  referralCode: string
) => {
  const referral = await couponService.getCouponByMultipleFields({
    referralCode: referralCode,
    type: CouponTypeEnum.referralCode,
  });

  if (!referral) {
    throw new ApiError(httpStatus.NOT_FOUND, "Referral code Not Valid.");
  }

  let { discountAmount, valid } = referral;

  if (dateHasPassed(valid)) {
    throw new ApiError(httpStatus.NOT_FOUND, "Referral code expired.");
  }

  let referralDiscount = calculatePercentage(amountToCalculate, discountAmount);
  return referralDiscount;
};

//
const getTaxItems = async (
  allItemDetails: any[],
  items: any[],
  usedCashBackAmount?: number
) => {
  let remainingCashbackAmount = usedCashBackAmount; // Cashback amount track karne ke liye

  const taxItems = await Promise.all(
    allItemDetails.map(async (item) => {
      const matchedItem = items.find(
        (i) =>
          JSON.parse(JSON.stringify(i.itemId)) ===
          JSON.parse(JSON.stringify(item._id))
      );
      if (!matchedItem) {
        return null;
      }

      let totalSellingPrice = item.sellingPrice * matchedItem.quantity; // Total price considering quantity
      let adjustedTotalSellingPrice = totalSellingPrice;

      // Sirf ek product par cashback apply karein
      if (
        item.cashback > 0 &&
        remainingCashbackAmount &&
        remainingCashbackAmount > 0
      ) {
        const amountToDeduct = Math.min(
          remainingCashbackAmount,
          totalSellingPrice
        );
        adjustedTotalSellingPrice -= amountToDeduct; // Total selling price adjust karein
        remainingCashbackAmount -= amountToDeduct; // Bacha hua cashback amount update karein
      }

      // Naya `earnCashback` calculate karein
      const earnCashback = (item.cashback / 100) * adjustedTotalSellingPrice;

      if (item.taxId !== null) {
        const tax = await taxService.getTaxById(item.taxId);
        if (!tax) {
          return null;
        }
        return {
          ...matchedItem,
          mrp: matchedItem.itemType === ItemTypeEnum.product ? item?.mrp : null,
          sellingPrice: item.sellingPrice,
          taxId: tax._id,
          taxPercent: tax.taxPercent,
          taxType: tax.taxType,
          itemName:
            matchedItem.itemType === ItemTypeEnum.product
              ? item.productName
              : item.serviceName,
          cashback: item.cashback,
          earnCashback,
        };
      } else {
        return {
          ...matchedItem,
          mrp: matchedItem.itemType === ItemTypeEnum.product ? item?.mrp : null,
          sellingPrice: item.sellingPrice,
          taxId: null,
          taxPercent: 0,
          taxType: "FLAT",
          itemName:
            matchedItem.itemType === ItemTypeEnum.product
              ? item.productName
              : item.serviceName,
          cashback: item.cashback,
          earnCashback,
        };
      }
    })
  );

  // Check if any outlet is not found
  const notTaxItems = taxItems.filter((ele) => !ele);

  if (notTaxItems.length > 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid Tax.");
  }
  return taxItems;
};

//
const calculateItemsTaxes = (taxItems: any[]) => {
  const taxesItems = taxItems.map((ele) => {
    ele.taxAmount = calculatePercentage(ele.sellingPrice, ele.taxPercent);
    ele.priceIncTax = (ele.sellingPrice + ele.taxAmount) * ele.quantity;
    return ele;
  });
  return taxesItems;
};

//
const getTaxes = (items: any[]) => {
  const taxes = items.reduce((acc, ele) => {
    if (ele?.taxId && ele?.taxType && ele?.taxAmount) {
      const existingTax = acc.find(
        (tax: any) => JSON.stringify(tax.taxId) === JSON.stringify(ele.taxId)
      );
      if (existingTax) {
        existingTax.taxAmount += ele.taxAmount;
      } else {
        acc.push({
          taxId: ele.taxId,
          taxType: ele.taxType,
          taxAmount: ele.taxAmount,
        });
      }
    }
    return acc;
  }, []);
  return taxes;
};

//
const getTotalWithoutDiscounts = (items: any[]) => {
  return items.reduce((acc, ele) => {
    acc += ele.priceIncTax;
    return acc;
  }, 0);
};
const getTotalCashBack = (items: any[]) => {
  return items.reduce((acc, ele) => {
    acc += ele.earnCashback;
    return acc;
  }, 0);
};
//
const getDiscounts = async (
  totalWithoutDiscount: number,
  couponCode: string,
  giftCardCode: string,
  promotionCoupanCode: string,
  rewardCoupan: string,
  referralCode: string,
  loyaltyPointsDiscount: number,
  customerId: string,
  usedCashBackAmountData: number,
  items: any
) => {
  let amountToCalculate =
    totalWithoutDiscount - loyaltyPointsDiscount - usedCashBackAmountData;
  //couponDiscount

  let couponDiscount = 0;
  if (couponCode) {
    couponDiscount = await getCouponDiscount(amountToCalculate, couponCode);
  }
  amountToCalculate = amountToCalculate - couponDiscount;

  //referralDiscount
  let referralDiscount = 0;
  if (referralCode) {
    referralDiscount = await getReferralDiscount(
      amountToCalculate,
      referralCode
    );
  }

  amountToCalculate = amountToCalculate - referralDiscount;
  //giftCardDiscount
  let giftCardDiscount = 0;
  let promotionCoupanCodeDiscount = 0;
  let rewardCoupanCodeDiscount = 0
  if (giftCardCode) {
    giftCardDiscount = await getGiftCardDiscount(
      amountToCalculate,
      giftCardCode,
      customerId
    );
  }

  if (promotionCoupanCode) {
    promotionCoupanCodeDiscount = await getPromotionalCouponDiscount(
      items,
      promotionCoupanCode,
      customerId
    );
  }

  if (rewardCoupan) {
    rewardCoupanCodeDiscount = await getRewardCouponDiscount(
      items,
      rewardCoupan,
      customerId
    );
  }


  // console.log('-----promotionCoupanCodeDiscount', promotionCoupanCodeDiscount)

  let totalDiscount =
    couponDiscount +
    giftCardDiscount +
    promotionCoupanCodeDiscount +
    referralDiscount +
    loyaltyPointsDiscount +
    usedCashBackAmountData;

  return {
    couponDiscount,
    giftCardDiscount,
    promotionCoupanCodeDiscount,
    rewardCoupanCodeDiscount,
    referralDiscount,
    totalDiscount,
  };
};

//
const getBalanceDue = async (
  totalAmount: number,
  amountReceived: any[],
  previouslyPaid: number
) => {
  const amountPaid = amountReceived.reduce((acc, ele) => {
    acc += ele.amount;
    return acc;
  }, 0);

  // if (totalAmount < previouslyPaid + amountPaid) {
  //   throw new ApiError(
  //     httpStatus.NOT_FOUND,
  //     "Amount being received is not valid."
  //   );
  // }

  let newAmountPaid = previouslyPaid + amountPaid;
  let newBalanceDue = totalAmount - newAmountPaid;
  return { balanceDue: newBalanceDue, amountPaid: newAmountPaid };
};

//
// const generateInvoiceNumber = async (outlet: any) => {
//   let { invoiceNumber, invoicePrefix } = outlet;
//   let invoiceNo = `${invoicePrefix}${invoiceNumber + 1}`;
//   return { invoiceNumber: invoiceNo, newInvoiceNumber: invoiceNumber + 1 };
// };


const generateInvoiceNumber = async (outlet: any) => {
  // console.log('-------outlet',outlet)
  const { invoicePrefix, invoiceNumber, _id: outletId } = outlet;

  const latestInvoice = await getLatestInvoiceByOutletId(outletId, invoicePrefix);
  // console.log('---latestInvoice',latestInvoice)
  let currentNumber = invoiceNumber;

  if (latestInvoice) {
    const numberPart = parseInt(
      latestInvoice.invoiceNumber.replace(invoicePrefix, ''),
      10
    );
    if (!isNaN(numberPart)) {
      currentNumber = numberPart;
    }
  }

  const newInvoiceNumber = currentNumber + 1;
  const fullInvoiceNumber = `${invoicePrefix}${newInvoiceNumber}`;
  //  console.log('---------test',newInvoiceNumber,fullInvoiceNumber)
  // // Update outlet invoiceNumber to keep track
  // await OutletModel.updateOne(
  //   { _id: outletId },
  //   { $set: { invoiceNumber: newInvoiceNumber } }
  // );

  return {
    invoiceNumber: fullInvoiceNumber,
    newInvoiceNumber
  };
};



//
const checkValidItems = async (items: any[]) => {
  // Fetch all outlets by their Ids
  const allItems = await Promise.all(
    items.map(
      async (item: { itemId: string; quantity: number; itemType: string }) => {
        if (item.itemType === ItemTypeEnum.product) {
          return await productService.getProductById(item.itemId);
        } else {
          return await serviceService.getServiceById(item.itemId);
        }
      }
    )
  );

  const allItemDetails = JSON.parse(JSON.stringify(allItems));
  // Check if any outlet is not found
  const notFounditem = allItemDetails.filter((item: any) => !item);
  if (notFounditem.length > 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid items's");
  }
  return allItemDetails;
};

//
const checkPaymentMethods = async (amountReceived: any[]) => {
  //check payment methods
  const paymentMethods = await Promise.all(
    amountReceived.map(
      async (item: { paymentModeId: string; amount: number }) => {
        return await paymentModeService.getPaymentModeById(item.paymentModeId);
      }
    )
  );

  // Check if any outlet is not found
  const paymentModeNotFound = paymentMethods.filter((item: any) => !item);
  if (paymentModeNotFound.length > 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid payment mode.");
  }
  return paymentMethods;
};

//
const fulfillQuantity = (orderQuantity: number, inventory: any[]) => {
  let remainingQuantity = orderQuantity;

  let fulfilledItems: { inventoryId: string; quantityUsed: number }[] = [];

  // Sort items by date to ensure FIFO order
  inventory.sort((a, b) => a.createdAt - b.createdAt);

  while (remainingQuantity > 0 && inventory.length > 0) {
    const { quantity, saleQuantity, _id } = inventory[0];

    let currentQuantity = quantity - saleQuantity;

    if (currentQuantity <= remainingQuantity) {
      // Use up the entire quantity of the current item
      fulfilledItems.push({
        inventoryId: _id,
        quantityUsed: currentQuantity,
      });
      remainingQuantity -= currentQuantity;
      inventory.shift(); // Remove the item from inventory
    } else {
      // Use part of the current item's quantity
      fulfilledItems.push({
        inventoryId: _id,
        quantityUsed: remainingQuantity,
      });
      currentQuantity -= remainingQuantity;
      remainingQuantity = 0;
    }
  }

  if (remainingQuantity > 0) {
    throw new Error("Not enough inventory to fulfill the order");
  }

  return fulfilledItems;
};

//
const checkInventoryExist = async (items: any[], outletId: string) => {
  //Fetch all product from all the items
  const products = items.filter((ele) => ele.itemType === ItemTypeEnum.product);
  if (!products || !products.length) {
    return [];
  }

  const allProdQuntAvailable = await Promise.all(
    products.map(async (item: { itemId: string }) => {
      const inventoryExist = await inventoryService.getInventoriesByQuery({
        productId: item.itemId,
        outletId: outletId,
        isSoldOut: false,
      });
      return inventoryExist.length > 0 ? inventoryExist : null;
    })
  );
  const allInventoryDetails = JSON.parse(JSON.stringify(allProdQuntAvailable));

  // Check if any outlet is not found
  const notFounditem = allInventoryDetails.filter((item: any) => !item);
  if (notFounditem.length > 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No inventory found....");
  }

  return allInventoryDetails.length
    ? allInventoryDetails.flat()
    : allInventoryDetails;
};

//
const checkQuantityInInventroy = async (inventories: any[], items: any[]) => {
  if (!inventories.length) {
    return [];
  }

  let itemsWithInventory = items
    .map((ele) => {
      ele["inventory"] = [];
      if (ele.itemType === ItemTypeEnum.product) {
        let inventoryAvailable = inventories.reduce((acc, e) => {
          if (ele.itemId.toString() === e.productId.toString()) {
            ele.inventory.push({ ...e });

            acc += e.quantity - e.saleQuantity;
          }
          return acc;
        }, 0);

        if (ele.quantity > inventoryAvailable) {
          throw new ApiError(httpStatus.NOT_FOUND, "Not enough quantity.");
        }
        return ele;
      }
    })
    ?.filter((e) => e);

  return itemsWithInventory;
};

//
const getInventoryOutwardData = async (itemsWithInventory: any[]) => {
  if (!itemsWithInventory || !itemsWithInventory.length) {
    return [];
  }

  let inventoryTobeUpdated = itemsWithInventory.map((ele) => {
    let { quantity, inventory } = ele;

    if (ele.itemType === ItemTypeEnum.product) {
      //fulfillQuantity
      let fulfilledInventory = fulfillQuantity(quantity, inventory);

      return fulfilledInventory;
    }
  });

  return inventoryTobeUpdated.flat();
};

export {
  getTaxItems,
  calculateItemsTaxes,
  getTotalWithoutDiscounts,
  getDiscounts,
  getBalanceDue,
  getTaxes,
  generateInvoiceNumber,
  checkValidItems,
  checkPaymentMethods,
  checkInventoryExist,
  checkQuantityInInventroy,
  getInventoryOutwardData,
  getLoyaltyPointsDiscount,
  getTotalCashBack,
  getCashBackDiscount
};

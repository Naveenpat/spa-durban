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
} from "../service.index";

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
const getTaxItems = async (allItemDetails: any[], items: any[]) => {
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
      if (item.taxId !== null) {
        const tax = await taxService.getTaxById(item.taxId);
        if (!tax) {
          return null;
        }
        return {
          ...matchedItem,
          mrp: matchedItem.itemType === ItemTypeEnum.product ? item?.mrp : null,
          sellingPrice: item?.sellingPrice,
          taxId: tax._id,
          taxPercent: tax.taxPercent,
          taxType: tax.taxType,
          itemName:
            matchedItem.itemType === ItemTypeEnum.product
              ? item.productName
              : item.serviceName,
        };
      } else {
        return {
          ...matchedItem,
          mrp: matchedItem.itemType === ItemTypeEnum.product ? item?.mrp : null,
          sellingPrice: item?.sellingPrice,
          taxId: null,
          taxPercent: 0,
          taxType: "FLAT",
          itemName:
            matchedItem.itemType === ItemTypeEnum.product
              ? item.productName
              : item.serviceName,
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

//
const getDiscounts = async (
  totalWithoutDiscount: number,
  couponCode: string,
  giftCardCode: string,
  referralCode: string,
  loyaltyPointsDiscount: number,
  customerId: string
) => {
  let amountToCalculate = totalWithoutDiscount - loyaltyPointsDiscount;
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
  if (giftCardCode) {
    giftCardDiscount = await getGiftCardDiscount(
      amountToCalculate,
      giftCardCode,
      customerId
    );
  }

  let totalDiscount =
    couponDiscount +
    giftCardDiscount +
    referralDiscount +
    loyaltyPointsDiscount;

  return {
    couponDiscount,
    giftCardDiscount,
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

  if (totalAmount < previouslyPaid + amountPaid) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Amount being received is not valid."
    );
  }

  let balanceDue = totalAmount - (previouslyPaid + amountPaid);
  return { balanceDue, amountPaid: previouslyPaid + amountPaid };
};

//
const generateInvoiceNumber = async (outlet: any) => {
  let { invoiceNumber, invoicePrefix } = outlet;
  let invoiceNo = `${invoicePrefix}${invoiceNumber + 1}`;
  return { invoiceNumber: invoiceNo, newInvoiceNumber: invoiceNumber + 1 };
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
    throw new ApiError(httpStatus.NOT_FOUND, "No inventory found.");
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
};

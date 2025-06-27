import httpStatus from "http-status";
import PromotionCoupon, {
  PromotionCouponDocument,
} from "./schema.promotioncoupon"; // Adjust PromotionCouponDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";
import GiftCard from "../giftCard/schema.giftCard";
import Coupon from "../coupon/schema.coupon";
import RewardsCoupon from "../rewardscoupon/schema.rewardscoupon";
import { customerService } from "../service.index";

const createPromotionCoupon = async (
  promotionCouponBody: any
): Promise<PromotionCouponDocument> => {
  return PromotionCoupon.create(promotionCouponBody);
};

const queryPromotionCoupons = async (
  filter: any,
  options: any
): Promise<{
  data: PromotionCouponDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  search: any;
  dateFilter: any;
  filterBy: any;
  rangeFilterBy: RangeFilter | undefined;
}> => {
  const promotionCoupons = await PromotionCoupon.paginate(filter, options);
  return promotionCoupons;
};

const updatePromotionCouponById = async (
  promotionCouponId: string | number,
  updateBody: any
): Promise<PromotionCouponDocument> => {
  const promotionCoupon = await getPromotionCouponById(promotionCouponId);
  if (!promotionCoupon) {
    throw new ApiError(httpStatus.NOT_FOUND, "PromotionCoupon not found");
  }

  Object.assign(promotionCoupon, updateBody);
  await promotionCoupon.save();
  return promotionCoupon;
};

const markPromotionCouponAsUsed = async (
  referralCode: string,
  customerId: string
): Promise<PromotionCouponDocument> => {
  // console.log('-----referralCode',referralCode)
  const coupon = await PromotionCoupon.findOne({
    couponCode: referralCode
  });
    // console.log('-----coupon',coupon)

  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Promotion coupon not found');
  }

  const alreadyUsed = Array.isArray(coupon.usedBy)
    ? coupon.usedBy.map(id => id?.toString()).includes(customerId.toString())
    : false;

  if (alreadyUsed) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Promotion coupon already used by this customer');
  }

  coupon.usedBy.push(new mongoose.Types.ObjectId(customerId));
  await coupon.save();

  return coupon;
};

const deletePromotionCouponById = async (
  promotionCouponId: string | number
): Promise<PromotionCouponDocument> => {
  const promotionCoupon = await getPromotionCouponById(promotionCouponId);
  if (!promotionCoupon) {
    throw new ApiError(httpStatus.NOT_FOUND, "PromotionCoupon not found");
  }

  // Instead of deleting, update isDeleted field to true
  await PromotionCoupon.updateOne(
    { _id: promotionCoupon._id },
    { $set: { isDeleted: true } }
  );

  // Return updated promotionCoupon object with isDeleted: true
  return promotionCoupon;
};

const togglePromotionCouponStatusById = async (
  promotionCouponId: string | number
): Promise<PromotionCouponDocument> => {
  const promotionCoupon = await getPromotionCouponById(promotionCouponId);
  if (!promotionCoupon) {
    throw new ApiError(httpStatus.NOT_FOUND, "PromotionCoupon not found");
  }
  promotionCoupon.isActive = !promotionCoupon.isActive;
  await promotionCoupon.save();
  return promotionCoupon;
};

interface FilterObject {
  [key: string]: any;
}

interface ExistsResult {
  exists: boolean;
  existsSummary: string;
}

const isExists = async (
  filterArray: FilterObject[],
  exceptIds: string[] = [],
  combined: boolean = false
): Promise<ExistsResult> => {
  if (combined) {
    let combinedObj = await combineObjects(filterArray);
    if (exceptIds.length > 0) {
      combinedObj["_id"] = { $nin: exceptIds };
    }
    if (await getOneByMultiField({ ...combinedObj })) {
      return {
        exists: true,
        existsSummary: `${Object.keys(combinedObj)} already exist.`,
      };
    }
    return { exists: false, existsSummary: "" };
  }

  let mappedArray = await Promise.all(
    filterArray.map(async (element) => {
      if (exceptIds.length > 0) {
        element["_id"] = { $nin: exceptIds };
      }
      if (await getOneByMultiField({ ...element })) {
        return { exists: true, fieldName: Object.keys(element)[0] };
      }
      return { exists: false, fieldName: Object.keys(element)[0] };
    })
  );

  return mappedArray.reduce(
    (acc, ele) => {
      if (ele.exists) {
        acc.exists = true;
        acc.existsSummary += `${ele.fieldName.toLowerCase()} already exist. `;
      }
      return acc;
    },
    { exists: false, existsSummary: "" } as ExistsResult
  );
};

async function combineObjects(
  filterArray: FilterObject[]
): Promise<FilterObject> {
  return {} as FilterObject;
}

const getOneByMultiField = async (
  filter: FilterObject
): Promise<PromotionCouponDocument | null> => {
  return PromotionCoupon.findOne({ ...filter, isDeleted: false });
};

const getPromotionCouponById = async (
  id: string | number
): Promise<PromotionCouponDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return PromotionCoupon.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

const aggregateAllCoupons = async (customerId: string, items: string[]) => {
  const today = new Date();

  const customerData = await customerService.getCustomerById(customerId)
  // 🎯 1. Promotional Coupons
  const promotionalCouponsDocs = await PromotionCoupon.find({
    isActive: true,
    startDate: { $lte: today },
    endDate: { $gte: today },
    customerId: { $in: [customerId] },
    usedBy: { $nin: [customerId] }
  }).lean();

  const promotionalCoupons = promotionalCouponsDocs.map((doc) => ({
    _id: doc._id,
    code: doc.couponCode,
    discountPercent: doc.discountByPercentage,
    validTill: doc.endDate,
    type: 'Promotional',
  }));

  // // 🎯 2. Gift Cards
  // const giftCardDocs = await GiftCard.find({
  //   giftCardExpiryDate: { $gte: today },
  //   customerId: customerId,
  //   isDeleted: false,
  //   // usedBy: { $nin: [customerId] }
  // }).lean();

  // const giftCards = giftCardDocs.map((doc) => ({
  //   _id: doc._id,
  //   code: doc.giftCardName,
  //   discount: doc.giftCardAmount,
  //   validTill: doc.giftCardExpiryDate,
  //   type: 'GiftCard',
  // }));

  const giftCardDocs = await GiftCard.find({
  giftCardExpiryDate: { $gte: today },
  isDeleted: false,
  isActive: true,
  $or: [
    { customerId: customerId },              // personalized
    { customerId: null, type: 'WHOEVER_BOUGHT' } // public gift cards
  ],
  usedBy: { $nin: [customerId] }
}).lean();

// console.log('------giftCardDocs',giftCardDocs)

const giftCards = giftCardDocs.map((doc) => ({
  _id: doc._id,
  code: doc.giftCardName,
  discount: doc.giftCardAmount,
  validTill: doc.giftCardExpiryDate,
  type: 'GiftCard',
}));


  // 🎯 3. Birthday Coupons
  const birthdayCouponDocs = await Coupon.find({
    valid: { $gte: today },
    user: customerId,
    type: 'COUPON_CODE',
    referralCode: { $regex: /^BDAY-/i }, // matches codes starting with 'BDAY-'
    isDeleted: false,
    isActive: true,
    usedBy: { $nin: [customerId] }
  }).lean();

  const birthdayCoupons = birthdayCouponDocs.map((doc) => ({
    _id: doc._id,
    code: doc.referralCode,
    discount: doc.discountAmount,
    validTill: doc.valid,
    type: 'Birthday',
  }));

  const rewardsCoupons = await RewardsCoupon.find({
    isDeleted: false,
    isActive: true,
    rewardsPoint: { $lte: customerData?.cashBackAmount },
    serviceId: { $in: items },
    usedBy: { $nin: [customerId] }
  }).lean();

  const rewardCouponDocs = rewardsCoupons.map((doc) => {
    const fallbackDate = new Date(doc.createdAt || Date.now());
    fallbackDate.setFullYear(fallbackDate.getFullYear() + 1); // valid for 1 year

    return {
      _id: doc._id,
      code: doc.couponCode,
      discount: doc.rewardsPoint, // assuming this is the actual discount
      validTill: fallbackDate,
      type: 'Reward',
    };
  });


  // 🔄 Combine and Sort All Coupons
  const allCoupons = [...promotionalCoupons, ...giftCards, ...birthdayCoupons, ...rewardCouponDocs];

  return allCoupons.sort(
    (a, b) => new Date(a.validTill).getTime() - new Date(b.validTill).getTime()
  );
};

export {
  createPromotionCoupon,
  queryPromotionCoupons,
  updatePromotionCouponById,
  deletePromotionCouponById,
  isExists,
  getPromotionCouponById,
  getOneByMultiField,
  togglePromotionCouponStatusById,
  aggregateAllCoupons,
  markPromotionCouponAsUsed
};

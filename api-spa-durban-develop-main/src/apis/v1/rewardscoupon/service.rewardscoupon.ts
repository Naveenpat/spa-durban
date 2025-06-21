import httpStatus from "http-status";
import RewardsCoupon, { RewardsCouponDocument } from "./schema.rewardscoupon"; // Adjust RewardsCouponDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";

const createRewardsCoupon = async (
  rewardsCouponBody: any
): Promise<RewardsCouponDocument> => {
  return RewardsCoupon.create(rewardsCouponBody);
};

const queryRewardsCoupons = async (
  filter: any,
  options: any
): Promise<{
  data: RewardsCouponDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  search: any;
  dateFilter: any;
  filterBy: any;
  rangeFilterBy: RangeFilter | undefined;
}> => {
  const rewardsCoupons = await RewardsCoupon.paginate(filter, options);
  return rewardsCoupons;
};

const updateRewardsCouponById = async (
  rewardsCouponId: string | number,
  updateBody: any
): Promise<RewardsCouponDocument> => {
  const rewardsCoupon = await getRewardsCouponById(rewardsCouponId);
  if (!rewardsCoupon) {
    throw new ApiError(httpStatus.NOT_FOUND, "RewardsCoupon not found");
  }

  Object.assign(rewardsCoupon, updateBody);
  await rewardsCoupon.save();
  return rewardsCoupon;
};

const markRewardCouponAsUsed = async (
  referralCode: string,
  customerId: string
): Promise<RewardsCouponDocument> => {
  const coupon = await RewardsCoupon.findOne({
    couponCode: referralCode,
    isDeleted: false,
    isActive: true,
  });

  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Reward coupon not found');
  }

  const alreadyUsed = Array.isArray(coupon.usedBy)
    ? coupon.usedBy.map(id => id?.toString()).includes(customerId.toString())
    : false;

  if (alreadyUsed) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Reward coupon already used by this customer');
  }

  coupon.usedBy.push(new mongoose.Types.ObjectId(customerId));
  await coupon.save();

  return coupon;
};


const deleteRewardsCouponById = async (
  rewardsCouponId: string | number
): Promise<RewardsCouponDocument> => {
  const rewardsCoupon = await getRewardsCouponById(rewardsCouponId);
  if (!rewardsCoupon) {
    throw new ApiError(httpStatus.NOT_FOUND, "RewardsCoupon not found");
  }

  // Instead of deleting, update isDeleted field to true
  await RewardsCoupon.updateOne(
    { _id: rewardsCoupon._id },
    { $set: { isDeleted: true } }
  );

  // Return updated rewardsCoupon object with isDeleted: true
  return rewardsCoupon;
};

const toggleRewardsCouponStatusById = async (
  rewardsCouponId: string | number
): Promise<RewardsCouponDocument> => {
  const rewardsCoupon = await getRewardsCouponById(rewardsCouponId);
  if (!rewardsCoupon) {
    throw new ApiError(httpStatus.NOT_FOUND, "RewardsCoupon not found");
  }
  rewardsCoupon.isActive = !rewardsCoupon.isActive;
  await rewardsCoupon.save();
  return rewardsCoupon;
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
): Promise<RewardsCouponDocument | null> => {
  return RewardsCoupon.findOne({ ...filter, isDeleted: false });
};

const getRewardsCouponById = async (
  id: string | number
): Promise<RewardsCouponDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return RewardsCoupon.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

export {
  createRewardsCoupon,
  queryRewardsCoupons,
  updateRewardsCouponById,
  deleteRewardsCouponById,
  isExists,
  getRewardsCouponById,
  getOneByMultiField,
  toggleRewardsCouponStatusById,
  markRewardCouponAsUsed
};

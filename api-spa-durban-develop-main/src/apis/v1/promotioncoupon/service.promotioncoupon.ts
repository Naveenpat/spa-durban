import httpStatus from "http-status";
import PromotionCoupon, {
  PromotionCouponDocument,
} from "./schema.promotioncoupon"; // Adjust PromotionCouponDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";

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

export {
  createPromotionCoupon,
  queryPromotionCoupons,
  updatePromotionCouponById,
  deletePromotionCouponById,
  isExists,
  getPromotionCouponById,
  getOneByMultiField,
  togglePromotionCouponStatusById,
};

import httpStatus from "http-status";
import Coupon, { CouponDocument } from "./schema.coupon"; // Adjust CouponDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose, { Document, Model } from "mongoose";
import { DateFilter, RangeFilter } from "../../../utils/interface";

/**
 * Create a coupon
 * @param {Object} couponBody
 * @returns {Promise <CouponDocument>}
 */
const createCoupon = async (couponBody: any): Promise<CouponDocument> => {
  return Coupon.create(couponBody);
};

/**
 * Query for coupons
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @returns {Promise<{ data: CouponDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }> }
 */
const queryCoupons = async (
  filter: any,
  options: any
): Promise<{
  data: CouponDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  search: any;
  dateFilter: any;
  filterBy: any;
  rangeFilterBy: RangeFilter | undefined;
}> => {
  const coupons = await Coupon.paginate(filter, options);
  return coupons;
};

/**
 * Update coupon by id
 * @param {string | number} couponId
 * @param {Object} updateBody
 * @returns {Promise <CouponDocument>}
 */
const updateCouponById = async (
  couponId: string | number,
  updateBody: any
): Promise<CouponDocument> => {
  const coupon = await getCouponById(couponId);
  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found");
  }

  Object.assign(coupon, updateBody);
  await coupon.save();
  return coupon;
};

/**
 * Toggle coupon status by id
 * @param {string | number} couponId
 * @returns {Promise<CouponDocument>}
 */
const toggleCouponStatusById = async (
  couponId: string | number
): Promise<CouponDocument> => {
  const coupon = await getCouponById(couponId);
  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found");
  }
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  return coupon;
};

/**
 * Delete coupon by id
 * @param {string | number} couponId
 * @returns {Promise <CouponDocument> }
 */
const deleteCouponById = async (
  couponId: string | number
): Promise<CouponDocument> => {
  const coupon = await getCouponById(couponId);
  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found");
  }
  await Coupon.deleteOne({ _id: coupon._id });
  return coupon;
};

interface FilterObject {
  [key: string]: any; // Adjust any as per your field types
}

interface ExistsResult {
  exists: boolean;
  existsSummary: string;
}

/**
 * Check if certain conditions exist in the database
 * @param {Array<FilterObject> } filterArray - Array of filters to check
 * @param {Array<string>} exceptIds - Array of IDs to exclude from checks
 * @param {Boolean} combined - Whether to combine filters with AND logic
 * @returns {Promise<ExistsResult>}
 */
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
    { exists: false, existsSummary: "" } as ExistsResult // Ensure initial type assignment
  );
};

// Example functions used in the code, add typings accordingly
async function combineObjects(
  filterArray: FilterObject[]
): Promise<FilterObject> {
  // Implementation
  return {} as FilterObject;
}

async function getOneByMultiField(filter: FilterObject): Promise<boolean> {
  // Implementation
  return false;
}

/**
 * Get Coupon by id
 * @param {string | number} id
 * @returns {Promise<CouponDocument | null> }
 */
const getCouponById = async (
  id: string | number
): Promise<CouponDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return Coupon.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

// coupon.service.ts
export const getCouponByFilter = async (filter: any): Promise<CouponDocument | null> => {
  return await Coupon.findOne({
    ...filter,
    isDeleted: false,
    valid: { $gte: new Date() }, // ✅ Still valid (future)
  });
};



/**
 * Get Coupon by id
 * @param {object} matchObject
 * @returns {Promise<CouponDocument | null> }
 */
const getCouponByMultipleFields = async (matchObject: {
  [key: string]: any;
}): Promise<CouponDocument | null> => {
  return Coupon.findOne({
    ...matchObject,
    isDeleted: false,
  });
};

/**
 * Get Coupons by an array of IDs
 * @param {Array <string | number>} ids
 * @returns {Promise<Array<CouponDocument | null> >}
 */
const getCouponsByIds = async (
  ids: Array<string | number>
): Promise<Array<CouponDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  return Coupon.find({ _id: { $in: objectIds }, isDeleted: false }).exec();
};

export {
  createCoupon,
  queryCoupons,
  updateCouponById,
  deleteCouponById,
  isExists,
  getCouponById,
  getCouponsByIds,
  getCouponByMultipleFields,
  toggleCouponStatusById,
};

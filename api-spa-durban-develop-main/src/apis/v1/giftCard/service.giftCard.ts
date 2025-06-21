import httpStatus from "http-status";
import GiftCard, { GiftCardDocument } from "./schema.giftCard"; // Adjust GiftCardDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";

/**
 * Create a giftCard
 * @param {Object} giftCardBody
 * @returns {Promise <GiftCardDocument> }
 */
const createGiftCard = async (giftCardBody: any): Promise<GiftCardDocument> => {
  return GiftCard.create(giftCardBody);
};

/**
 * Query for giftCards
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @returns {Promise<{ data: GiftCardDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryGiftCards = async (
  filter: any,
  options: any
): Promise<{
  data: GiftCardDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  search: any;
  dateFilter: any;
  filterBy: any;
  rangeFilterBy: RangeFilter | undefined;
}> => {
  const giftCards = await GiftCard.paginate(filter, options);
  return giftCards;
};

/**
 * Update giftCard by id
 * @param {string | number} giftCardId
 * @param {Object} updateBody
 * @returns {Promise<GiftCardDocument>}
 */
const updateGiftCardById = async (
  giftCardId: string | number,
  updateBody: any
): Promise<GiftCardDocument> => {
  const giftCard = await getGiftCardById(giftCardId);
  if (!giftCard) {
    throw new ApiError(httpStatus.NOT_FOUND, "GiftCard not found");
  }

  Object.assign(giftCard, updateBody);
  await giftCard.save();
  return giftCard;
};

const markGiftCardCouponAsUsed = async (
  referralCode: string,
  customerId: string
): Promise<GiftCardDocument> => {
  const coupon = await GiftCard.findOne({
    giftCardName: referralCode
  });
  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Gift Card coupon not found');
  }

  const alreadyUsed = Array.isArray(coupon.usedBy)
    ? coupon.usedBy.map(id => id?.toString()).includes(customerId.toString())
    : false;

  if (alreadyUsed) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Gift Card coupon already used by this customer');
  }

  coupon.usedBy.push(new mongoose.Types.ObjectId(customerId));
  await coupon.save();

  return coupon;
};


/**
 * Toggle gift card status by id
 * @param {string | number} giftCardId
 * @returns {Promise<GiftCardDocument>}
 */
const toggleGiftCardStatusById = async (
  giftCardId: string | number
): Promise<GiftCardDocument> => {
  const giftCard = await getGiftCardById(giftCardId);
  if (!giftCard) {
    throw new ApiError(httpStatus.NOT_FOUND, "Gift card not found");
  }
  giftCard.isActive = !giftCard.isActive;
  await giftCard.save();
  return giftCard;
};
/**
 * Delete giftCard by id
 * @param {string | number} giftCardId
 * @returns {Promise <GiftCardDocument>}
 */
const deleteGiftCardById = async (
  giftCardId: string | number
): Promise<GiftCardDocument> => {
  const giftCard = await getGiftCardById(giftCardId);
  if (!giftCard) {
    throw new ApiError(httpStatus.NOT_FOUND, "GiftCard not found");
  }
  await GiftCard.deleteOne({ _id: giftCard._id });
  return giftCard;
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
 * @returns {Promise<ExistsResult> }
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
 * Get GiftCard by id
 * @param {string | number} id
 * @returns {Promise<GiftCardDocument | null> }
 */
const getGiftCardById = async (
  id: string | number
): Promise<GiftCardDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return GiftCard.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

/**
 * Get GiftCards by an array of IDs
 * @param {Array<string | number> } ids
 * @returns {Promise <Array<GiftCardDocument | null>>}
 */
const getGiftCardsByIds = async (
  ids: Array<string | number>
): Promise<Array<GiftCardDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  return GiftCard.find({ _id: { $in: objectIds }, isDeleted: false }).exec();
};

/**
 * Get Coupon by id
 * @param {object} matchObject
 * @returns {Promise<CouponDocument | null> }
 */
const getGiftCardByMultipleFields = async (matchObject: {
  [key: string]: any;
}): Promise<GiftCardDocument | null> => {
  return GiftCard.findOne({
    ...matchObject,
    isDeleted: false,
  });
};

export {
  createGiftCard,
  queryGiftCards,
  updateGiftCardById,
  deleteGiftCardById,
  isExists,
  getGiftCardById,
  getGiftCardsByIds,
  getGiftCardByMultipleFields,
  toggleGiftCardStatusById,
  markGiftCardCouponAsUsed
};

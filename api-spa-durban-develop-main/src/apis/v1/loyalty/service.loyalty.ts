import httpStatus from "http-status";
import Loyalty, { LoyaltyDocument } from "./schema.loyalty"; // Adjust LoyaltyDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";

/**
 * Create a loyalty
 * @param {Object} loyaltyBody
 * @returns {Promise<LoyaltyDocument>}
 */
const createLoyalty = async (loyaltyBody: any): Promise<LoyaltyDocument> => {
  return Loyalty.create(loyaltyBody);
};

/**
 * Query for loyaltys
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @returns {Promise <{ data: LoyaltyDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }> }
 */
const queryLoyaltys = async (
  filter: any,
  options: any
): Promise<{
  data: LoyaltyDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  search: any;
  dateFilter: any;
  filterBy: any;
  rangeFilterBy: RangeFilter | undefined;
}> => {
  const loyaltys = await Loyalty.paginate(filter, options);
  return loyaltys;
};

/**
 * Update loyalty by id
 * @param {string | number} loyaltyId
 * @param {Object} updateBody
 * @returns {Promise<LoyaltyDocument>}
 */
const updateLoyaltyById = async (
  loyaltyId: string | number,
  updateBody: any
): Promise<LoyaltyDocument> => {
  const loyalty = await getLoyaltyById(loyaltyId);
  if (!loyalty) {
    throw new ApiError(httpStatus.NOT_FOUND, "Loyalty not found");
  }

  Object.assign(loyalty, updateBody);
  await loyalty.save();
  return loyalty;
};

/**
 * Delete loyalty by id
 * @param {string | number} loyaltyId
 * @returns {Promise<LoyaltyDocument> }
 */
const deleteLoyaltyById = async (
  loyaltyId: string | number
): Promise<LoyaltyDocument> => {
  const loyalty = await getLoyaltyById(loyaltyId);
  if (!loyalty) {
    throw new ApiError(httpStatus.NOT_FOUND, "Loyalty not found");
  }
  await Loyalty.deleteOne({ _id: loyalty._id });
  return loyalty;
};

/**
 * Toggle loyalty status by id
 * @param {string | number} loyaltyId
 * @returns {Promise<LoyaltyDocument>}
 */
const toggleLoyaltyStatusById = async (
  loyaltyId: string | number
): Promise<LoyaltyDocument> => {
  const loyalty = await getLoyaltyById(loyaltyId);
  if (!loyalty) {
    throw new ApiError(httpStatus.NOT_FOUND, "Loyalty not found");
  }
  loyalty.isActive = !loyalty.isActive;
  await loyalty.save();
  return loyalty;
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
 * @param {Array<FilterObject>} filterArray - Array of filters to check
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

/**
 * Get Loyalty by filter
 * @param {FilterObject} filter
 * @returns {Promise<LoyaltyDocument | null>}
 */

const getOneByMultiField = async (
  filter: FilterObject
): Promise<LoyaltyDocument | null> => {
  return Loyalty.findOne({ ...filter, isDeleted: false });
};

/**
 * Get Loyalty by id
 * @param {string | number} id
 * @returns {Promise<LoyaltyDocument | null>}
 */
const getLoyaltyById = async (
  id: string | number
): Promise<LoyaltyDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return Loyalty.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};
/**
 * Get Loyalty by id with aggrigation
 * @param {PipelineStage[]} aggregateQuery - An array of aggregation pipeline stages
 * @returns {Promise<LoyaltyDocument | null>}
 */
const getLoyaltyAggrigate = async (
  aggregateQuery: any[]
): Promise<LoyaltyDocument | null> => {
  const result = await Loyalty.aggregate(aggregateQuery).exec();
  return result.length > 0 ? result[0] : null;
};

/**
 * Get Loyaltys by an array of IDs
 * @param {Array<string | number>} ids
 * @returns {Promise<Array<LoyaltyDocument | null> >}
 */
const getLoyaltysByIds = async (
  ids: Array<string | number>
): Promise<Array<LoyaltyDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  return Loyalty.find({ _id: { $in: objectIds }, isDeleted: false }).exec();
};

export {
  createLoyalty,
  queryLoyaltys,
  updateLoyaltyById,
  deleteLoyaltyById,
  isExists,
  getLoyaltyById,
  getLoyaltysByIds,
  getOneByMultiField,
  toggleLoyaltyStatusById,
  getLoyaltyAggrigate,
};

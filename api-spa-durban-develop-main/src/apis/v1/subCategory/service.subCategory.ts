import httpStatus from "http-status";
import SubCategory, { SubCategoryDocument } from "./schema.subCategory"; // Adjust SubCategoryDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";

/**
 * Create a subCategory
 * @param {Object} subCategoryBody
 * @returns {Promise<SubCategoryDocument>}
 */
const createSubCategory = async (
  subCategoryBody: any
): Promise<SubCategoryDocument> => {
  return SubCategory.create(subCategoryBody);
};

/**
 * Query for subCategorys
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @param {any} [options.isPaginationRequired] - isPaginationRequired
 * @returns {Promise <{ data: SubCategoryDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const querySubCategorys = async (
  filter: any,
  options: any
): Promise<{
  data: SubCategoryDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  search: any;
  dateFilter: any;
  filterBy: any;
  rangeFilterBy: RangeFilter | undefined;
  additionalQuery?: any;
  isPaginationRequired: boolean | undefined;
}> => {
  const subCategorys = await SubCategory.paginate(filter, options);
  return subCategorys;
};

/**
 * Get subCategory by id
 * @param {string | number} id
 * @returns {Promise<SubCategoryDocument | null>}
 */
const getSubCategoryById = async (
  id: string | number
): Promise<SubCategoryDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return SubCategory.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

/**
 * Update subCategory by id
 * @param {string | number} subCategoryId
 * @param {Object} updateBody
 * @returns {Promise <SubCategoryDocument>}
 */
const updateSubCategoryById = async (
  subCategoryId: string | number,
  updateBody: any
): Promise<SubCategoryDocument> => {
  const subCategory = await getSubCategoryById(subCategoryId);
  if (!subCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "SubCategory not found");
  }

  Object.assign(subCategory, updateBody);
  await subCategory.save();
  return subCategory;
};

/**
 * Delete subCategory by id
 * @param {string | number} subCategoryId
 * @returns {Promise<SubCategoryDocument>}
 */
const deleteSubCategoryById = async (
  subCategoryId: string | number
): Promise<SubCategoryDocument> => {
  const subCategory = await getSubCategoryById(subCategoryId);
  if (!subCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "SubCategory not found");
  }
  await SubCategory.updateOne(
    { _id: subCategory._id, isDeleted: false },
    { $set: { isDeleted: true } }
  );

  return subCategory;
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

export {
  createSubCategory,
  querySubCategorys,
  getSubCategoryById,
  updateSubCategoryById,
  deleteSubCategoryById,
  isExists,
};

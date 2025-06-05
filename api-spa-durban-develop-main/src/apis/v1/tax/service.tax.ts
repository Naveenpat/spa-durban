import httpStatus from "http-status";
import Tax, { TaxDocument } from "./schema.tax"; // Adjust TaxDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";

/**
 * Create a tax
 * @param {Object} taxBody
 * @returns {Promise<TaxDocument>}
 */
const createTax = async (taxBody: any): Promise<TaxDocument> => {
  return Tax.create(taxBody);
};

/**
 * Query for taxs
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @param {any} [options.isPaginationRequired] - isPaginationRequired
 * @returns {Promise<{ data: TaxDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryTaxs = async (
  filter: any,
  options: any
): Promise<{
  data: TaxDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  search: any;
  dateFilter: any;
  filterBy: any;
  rangeFilterBy: RangeFilter | undefined;
  isPaginationRequired: boolean | undefined;
}> => {
  const taxs = await Tax.paginate(filter, options);
  return taxs;
};

/**
 * Update tax by id
 * @param {string | number} taxId
 * @param {Object} updateBody
 * @returns {Promise<TaxDocument>}
 */
const updateTaxById = async (
  taxId: string | number,
  updateBody: any
): Promise<TaxDocument> => {
  const tax = await getTaxById(taxId);
  if (!tax) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tax not found");
  }

  Object.assign(tax, updateBody);
  await tax.save();
  return tax;
};

/**
 * Delete tax by id
 * @param {string | number} taxId
 * @returns {Promise <TaxDocument> }
 */
const deleteTaxById = async (taxId: string | number): Promise<TaxDocument> => {
  const tax = await getTaxById(taxId);
  if (!tax) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tax not found");
  }
  await Tax.deleteOne({ _id: tax._id });
  return tax;
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
 * @param {Array<string> } exceptIds - Array of IDs to exclude from checks
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
 * Get Tax by id
 * @param {string | number} id
 * @returns {Promise<TaxDocument | null> }
 */
const getTaxById = async (id: string | number): Promise<TaxDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return Tax.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

/**
 * Get Taxs by an array of IDs
 * @param {Array<string | number>} ids
 * @returns {Promise<Array<TaxDocument | null>>}
 */
const getTaxsByIds = async (
  ids: Array<string | number>
): Promise<Array<TaxDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  return Tax.find({ _id: { $in: objectIds }, isDeleted: false }).exec();
};

export {
  createTax,
  queryTaxs,
  updateTaxById,
  deleteTaxById,
  isExists,
  getTaxById,
  getTaxsByIds,
};

export function getProductById(itemId: any): any {
  throw new Error("Function not implemented.");
}

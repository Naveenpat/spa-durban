import httpStatus from "http-status";
import Brand, { BrandDocument } from "./schema.brand"; // Adjust BrandDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";

/**
 * Create a brand
 * @param {Object} brandBody
 * @returns {Promise<BrandDocument>}
 */
const createBrand = async (brandBody: any): Promise<BrandDocument> => {
  if (await Brand.isbrandTaken(brandBody.brandName)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Brand name already taken");
  }
  return Brand.create(brandBody);
};

/**
 * Query for brands
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @param {any} [options.isPaginationRequired] - isPaginationRequired
 * @returns {Promise<{ data: BrandDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryBrands = async (
  filter: any,
  options: any
): Promise<{
  data: BrandDocument[];
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
  const brands = await Brand.paginate(filter, options);
  return brands;
};

/**
 * Update brand by id
 * @param {string | number} brandId
 * @param {Object} updateBody
 * @returns {Promise<BrandDocument>}
 */
const updateBrandById = async (
  brandId: string | number,
  updateBody: any
): Promise<BrandDocument> => {
  const brand = await getBrandById(brandId);
  if (!brand) {
    throw new ApiError(httpStatus.NOT_FOUND, "Brand not found");
  }

  Object.assign(brand, updateBody);
  await brand.save();
  return brand;
};

/**
 * Delete brand by id
 * @param {string | number} brandId
 * @returns {Promise<BrandDocument>}
 */
const deleteBrandById = async (
  brandId: string | number
): Promise<BrandDocument> => {
  const brand = await getBrandById(brandId);
  if (!brand) {
    throw new ApiError(httpStatus.NOT_FOUND, "Brand not found");
  }
  await Brand.deleteOne({ _id: brand._id });
  return brand;
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

async function getOneByMultiField(filter: FilterObject): Promise<boolean> {
  // Implementation
  return false;
}

/**
 * Get Brand by id
 * @param {string | number} id
 * @returns {Promise<BrandDocument | null>}
 */
const getBrandById = async (
  id: string | number
): Promise<BrandDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return Brand.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

/**
 * Get Brands by an array of IDs
 * @param {Array<string | number>} ids
 * @returns {Promise<Array<BrandDocument | null>>}
 */
const getBrandsByIds = async (
  ids: Array<string | number>
): Promise<Array<BrandDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  return Brand.find({ _id: { $in: objectIds }, isDeleted: false }).exec();
};

export {
  createBrand,
  queryBrands,
  updateBrandById,
  deleteBrandById,
  isExists,
  getBrandById,
  getBrandsByIds,
};

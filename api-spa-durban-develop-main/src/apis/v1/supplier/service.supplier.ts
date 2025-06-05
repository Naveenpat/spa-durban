import httpStatus from "http-status";
import Supplier, { SupplierDocument } from "./schema.supplier"; // Adjust SupplierDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";

/**
 * Create a supplier
 * @param {Object} supplierBody
 * @returns {Promise <SupplierDocument>  }
 */
const createSupplier = async (supplierBody: any): Promise<SupplierDocument> => {
  return Supplier.create(supplierBody);
};

/**
 * Query for suppliers
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @param {any} [options.isPaginationRequired] - isPaginationRequired
 * @returns {Promise <{ data: SupplierDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }> }
 */
const querySuppliers = async (
  filter: any,
  options: any
): Promise<{
  data: SupplierDocument[];
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
  const suppliers = await Supplier.paginate(filter, options);
  return suppliers;
};

/**
 * Update supplier by id
 * @param {string | number} supplierId
 * @param {Object} updateBody
 * @returns {Promise <SupplierDocument> }
 */
const updateSupplierById = async (
  supplierId: string | number,
  updateBody: any
): Promise<SupplierDocument> => {
  const supplier = await getSupplierById(supplierId);
  if (!supplier) {
    throw new ApiError(httpStatus.NOT_FOUND, "Supplier not found");
  }

  Object.assign(supplier, updateBody);
  await supplier.save();
  return supplier;
};

/**
 * Toggle Supplier status by id
 * @param {string | number} supplierId
 * @returns {Promise<SupplierDocument>}
 */
const toggleSupplierStatusById = async (
  supplierId: string | number
): Promise<SupplierDocument> => {
  const supplier = await getSupplierById(supplierId);
  if (!supplier) {
    throw new ApiError(httpStatus.NOT_FOUND, "Supplier not found");
  }
  supplier.isActive = !supplier.isActive;
  await supplier.save();
  return supplier;
};

/**
 * Delete supplier by id
 * @param {string | number} supplierId
 * @returns {Promise <SupplierDocument> }
 */
const deleteSupplierById = async (
  supplierId: string | number
): Promise<SupplierDocument> => {
  const supplier = await getSupplierById(supplierId);
  if (!supplier) {
    throw new ApiError(httpStatus.NOT_FOUND, "Supplier not found");
  }
  await Supplier.deleteOne({ _id: supplier._id });
  return supplier;
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
 * @param {Array <string> } exceptIds - Array of IDs to exclude from checks
 * @param {Boolean} combined - Whether to combine filters with AND logic
 * @returns {Promise <ExistsResult>}
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
 * Get Supplier by id
 * @param {string | number} id
 * @returns {Promise <SupplierDocument | null> }
 */
const getSupplierById = async (
  id: string | number
): Promise<SupplierDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return Supplier.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

/**
 * Get Suppliers by an array of IDs
 * @param {Array<string | number>  } ids
 * @returns {Promise <Array<SupplierDocument | null> >}
 */
const getSuppliersByIds = async (
  ids: Array<string | number>
): Promise<Array<SupplierDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  return Supplier.find({ _id: { $in: objectIds }, isDeleted: false }).exec();
};

export {
  createSupplier,
  querySuppliers,
  updateSupplierById,
  deleteSupplierById,
  isExists,
  getSupplierById,
  getSuppliersByIds,
  toggleSupplierStatusById,
};

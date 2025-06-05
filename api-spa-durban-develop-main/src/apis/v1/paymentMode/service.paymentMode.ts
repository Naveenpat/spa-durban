import httpStatus from "http-status";
import PaymentMode, { PaymentModeDocument } from "./schema.paymentMode"; // Adjust PaymentModeDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";

/**
 * Create a paymentMode
 * @param {Object} paymentModeBody
 * @returns {Promise<PaymentModeDocument>}
 */
const createPaymentMode = async (
  paymentModeBody: any
): Promise<PaymentModeDocument> => {
  return PaymentMode.create(paymentModeBody);
};

/**
 * Query for paymentModes
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @param {any} [options.isPaginationRequired] - isPaginationRequired
 * @returns {Promise<{ data: PaymentModeDocument[]; page: number; limit: number; totalPages: number; totalResults: number;}>}
 */
const queryPaymentModes = async (
  filter: any,
  options: any
): Promise<{
  data: PaymentModeDocument[];
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
  const paymentModes = await PaymentMode.paginate(filter, options);
  return paymentModes;
};

/**
 * Get paymentMode by id
 * @param {string | number} id
 * @returns {Promise  <PaymentModeDocument | null>    }
 */
const getPaymentModeById = async (
  id: string | number
): Promise<PaymentModeDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return PaymentMode.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

/**
 * Toggle payment mode status by id
 * @param {string | number} paymentModeId
 * @returns {Promise<PaymentModeDocument>}
 */
const togglePaymentModeStatusById = async (
  paymentModeId: string | number
): Promise<PaymentModeDocument> => {
  const paymentMode = await getPaymentModeById(paymentModeId);
  if (!paymentMode) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment mode not found");
  }
  paymentMode.isActive = !paymentMode.isActive;
  await paymentMode.save();
  return paymentMode;
};
/**
 * Update paymentMode by id
 * @param {string | number} paymentModeId
 * @param {Object} updateBody
 * @returns {Promise      <PaymentModeDocument>        }
 */
const updatePaymentModeById = async (
  paymentModeId: string | number,
  updateBody: any
): Promise<PaymentModeDocument> => {
  const paymentMode = await getPaymentModeById(paymentModeId);
  if (!paymentMode) {
    throw new ApiError(httpStatus.NOT_FOUND, "PaymentMode not found");
  }

  Object.assign(paymentMode, updateBody);
  await paymentMode.save();
  return paymentMode;
};

/**
 * Delete paymentMode by id
 * @param {string | number} paymentModeId
 * @returns {Promise          <PaymentModeDocument>            }
 */
const deletePaymentModeById = async (
  paymentModeId: string | number
): Promise<PaymentModeDocument> => {
  const paymentMode = await getPaymentModeById(paymentModeId);
  if (!paymentMode) {
    throw new ApiError(httpStatus.NOT_FOUND, "PaymentMode not found");
  }
  await PaymentMode.updateOne(
    { _id: paymentMode._id, isDeleted: false },
    { $set: { isDeleted: true } }
  );

  return paymentMode;
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

export {
  createPaymentMode,
  queryPaymentModes,
  getPaymentModeById,
  updatePaymentModeById,
  deletePaymentModeById,
  isExists,
  togglePaymentModeStatusById,
};

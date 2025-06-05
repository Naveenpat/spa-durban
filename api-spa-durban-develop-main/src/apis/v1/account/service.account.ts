import httpStatus from "http-status";
import Account, { AccountDocument } from "./schema.account"; // Adjust AccountDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose, { Document, Model } from "mongoose";
import { DateFilter, RangeFilter } from "../../../utils/interface";

/**
 * Create a account
 * @param {Object} accountBody
 * @returns {Promise<AccountDocument>}
 */
const createAccount = async (accountBody: any): Promise<AccountDocument> => {
  if (await Account.isAccountExists(accountBody.accountName)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Account already exists!");
  }
  return Account.create(accountBody);
};

/**
 * Query for accounts
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @param {any} [options.isPaginationRequired] - isPaginationRequired
 * @returns {Promise<{ data: AccountDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryAccounts = async (
  filter: any,
  options: any
): Promise<{
  data: AccountDocument[];
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
  const accounts = await Account.paginate(filter, options);
  return accounts;
};

/**
 * Get account by id
 * @param {string | number} id
 * @returns {Promise<AccountDocument | null>}
 */
const getAccountById = async (
  id: string | number
): Promise<AccountDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return Account.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

/**
 * Update account by id
 * @param {string | number} accountId
 * @param {Object} updateBody
 * @returns {Promise<AccountDocument>}
 */
const updateAccountById = async (
  accountId: string | number,
  updateBody: any
): Promise<AccountDocument> => {
  const account = await getAccountById(accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
  }

  Object.assign(account, updateBody);
  await account.save();
  return account;
};

/**
 * Toggle account status by id
 * @param {string | number} accountId
 * @returns {Promise<AccountDocument>}
 */
const toggleAccountStatusById = async (
  accountId: string | number
): Promise<AccountDocument> => {
  const account = await getAccountById(accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
  }
  account.isActive = !account.isActive;
  await account.save();
  return account;
};

/**
 * Delete account by id
 * @param {string | number} accountId
 * @returns {Promise<AccountDocument>}
 */
const deleteAccountById = async (
  accountId: string | number
): Promise<AccountDocument> => {
  const account = await getAccountById(accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
  }
  await Account.updateOne(
    { _id: account._id, isDeleted: false },
    { $set: { isDeleted: true } }
  );
  return account;
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
 * @param {Array <string>} exceptIds - Array of IDs to exclude from checks
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
  createAccount,
  queryAccounts,
  getAccountById,
  updateAccountById,
  deleteAccountById,
  isExists,
  toggleAccountStatusById,
};

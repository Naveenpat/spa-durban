import httpStatus from "http-status"
import LoyaltyWallet, { LoyaltyWalletDocument } from "./schema.loyaltyWallet" // Adjust LoyaltyWalletDocument based on your schema setup
import ApiError from "../../../../utilities/apiError"
import mongoose from "mongoose"
import { RangeFilter } from "../../../utils/interface"

/**
 * Create a loyaltyWallet
 * @param {Object} loyaltyWalletBody
 * @returns {Promise<LoyaltyWalletDocument>}
 */
const createLoyaltyWallet = async (
  loyaltyWalletBody: any
): Promise<LoyaltyWalletDocument> => {
  return LoyaltyWallet.create(loyaltyWalletBody)
}

/**
 * Query for loyaltyWallets
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @returns {Promise<{ data: LoyaltyWalletDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryLoyaltyWallets = async (
  filter: any,
  options: any
): Promise<{
  data: LoyaltyWalletDocument[]
  page: number
  limit: number
  totalPages: number
  totalResults: number
  search: any
  dateFilter: any
  filterBy: any
  rangeFilterBy: RangeFilter | undefined
}> => {
  const loyaltyWallets = await LoyaltyWallet.paginate(filter, options)
  return loyaltyWallets
}

/**
 * Update loyaltyWallet by id
 * @param {string | number} loyaltyWalletId
 * @param {Object} updateBody
 * @returns {Promise<LoyaltyWalletDocument>}
 */
const updateLoyaltyWalletById = async (
  loyaltyWalletId: string | number,
  updateBody: any
): Promise<LoyaltyWalletDocument> => {
  const loyaltyWallet = await getLoyaltyWalletById(loyaltyWalletId)
  if (!loyaltyWallet) {
    throw new ApiError(httpStatus.NOT_FOUND, "LoyaltyWallet not found")
  }

  Object.assign(loyaltyWallet, updateBody)
  await loyaltyWallet.save()
  return loyaltyWallet
}

/**
 * Delete loyaltyWallet by id
 * @param {string | number} loyaltyWalletId
 * @returns {Promise<LoyaltyWalletDocument> }
 */
const deleteLoyaltyWalletById = async (
  loyaltyWalletId: string | number
): Promise<LoyaltyWalletDocument> => {
  const loyaltyWallet = await getLoyaltyWalletById(loyaltyWalletId)
  if (!loyaltyWallet) {
    throw new ApiError(httpStatus.NOT_FOUND, "LoyaltyWallet not found")
  }
  await LoyaltyWallet.deleteOne({ _id: loyaltyWallet._id })
  return loyaltyWallet
}

interface FilterObject {
  [key: string]: any // Adjust any as per your field types
}

interface ExistsResult {
  exists: boolean
  existsSummary: string
}

/**
 * Check if certain conditions exist in the database
 * @param {Array<FilterObject> } filterArray - Array of filters to check
 * @param {Array <string> } exceptIds - Array of IDs to exclude from checks
 * @param {Boolean} combined - Whether to combine filters with AND logic
 * @returns {Promise<ExistsResult> }
 */
const isExists = async (
  filterArray: FilterObject[],
  exceptIds: string[] = [],
  combined: boolean = false
): Promise<ExistsResult> => {
  if (combined) {
    let combinedObj = await combineObjects(filterArray)
    if (exceptIds.length > 0) {
      combinedObj["_id"] = { $nin: exceptIds }
    }
    if (await getOneByMultiField({ ...combinedObj })) {
      return {
        exists: true,
        existsSummary: `${Object.keys(combinedObj)} already exist.`,
      }
    }
    return { exists: false, existsSummary: "" }
  }

  let mappedArray = await Promise.all(
    filterArray.map(async (element) => {
      if (exceptIds.length > 0) {
        element["_id"] = { $nin: exceptIds }
      }
      if (await getOneByMultiField({ ...element })) {
        return { exists: true, fieldName: Object.keys(element)[0] }
      }
      return { exists: false, fieldName: Object.keys(element)[0] }
    })
  )

  return mappedArray.reduce(
    (acc, ele) => {
      if (ele.exists) {
        acc.exists = true
        acc.existsSummary += `${ele.fieldName.toLowerCase()} already exist. `
      }
      return acc
    },
    { exists: false, existsSummary: "" } as ExistsResult // Ensure initial type assignment
  )
}

// Example functions used in the code, add typings accordingly
async function combineObjects(
  filterArray: FilterObject[]
): Promise<FilterObject> {
  // Implementation
  return {} as FilterObject
}

async function getOneByMultiField(filter: FilterObject): Promise<boolean> {
  // Implementation
  return false
}

/**
 * Get LoyaltyWallet by id
 * @param {string | number} id
 * @returns {Promise <LoyaltyWalletDocument | null> }
 */
const getLoyaltyWalletById = async (
  id: string | number
): Promise<LoyaltyWalletDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return LoyaltyWallet.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    })
  }
  return null
}

/**
 * Get LoyaltyWallets by an array of IDs
 * @param {Array <string | number>} ids
 * @returns {Promise<Array<LoyaltyWalletDocument | null> >}
 */
const getLoyaltyWalletsByIds = async (
  ids: Array<string | number>
): Promise<Array<LoyaltyWalletDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id))
  return LoyaltyWallet.find({
    _id: { $in: objectIds },
    isDeleted: false,
  }).exec()
}

export {
  createLoyaltyWallet,
  queryLoyaltyWallets,
  updateLoyaltyWalletById,
  deleteLoyaltyWalletById,
  isExists,
  getLoyaltyWalletById,
  getLoyaltyWalletsByIds,
}

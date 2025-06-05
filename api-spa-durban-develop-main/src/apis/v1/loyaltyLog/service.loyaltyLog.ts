import httpStatus from "http-status"
import LoyaltyLog, { LoyaltyLogDocument } from "./schema.loyaltyLog" // Adjust LoyaltyLogDocument based on your schema setup
import ApiError from "../../../../utilities/apiError"
import mongoose from "mongoose"
import { RangeFilter } from "../../../utils/interface"

/**
 * Create a loyaltyLog
 * @param {Object} loyaltyLogBody
 * @returns {Promise<LoyaltyLogDocument>}
 */
const createLoyaltyLog = async (
  loyaltyLogBody: any
): Promise<LoyaltyLogDocument> => {
  return LoyaltyLog.create(loyaltyLogBody)
}

/**
 * Query for loyaltyLogs
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @returns {Promise<{ data: LoyaltyLogDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryLoyaltyLogs = async (
  filter: any,
  options: any
): Promise<{
  data: LoyaltyLogDocument[]
  page: number
  limit: number
  totalPages: number
  totalResults: number
  search: any
  dateFilter: any
  filterBy: any
  rangeFilterBy: RangeFilter | undefined
}> => {
  const loyaltyLogs = await LoyaltyLog.paginate(filter, options)
  return loyaltyLogs
}

/**
 * Update loyaltyLog by id
 * @param {string | number} loyaltyLogId
 * @param {Object} updateBody
 * @returns {Promise<LoyaltyLogDocument>}
 */
const updateLoyaltyLogById = async (
  loyaltyLogId: string | number,
  updateBody: any
): Promise<LoyaltyLogDocument> => {
  const loyaltyLog = await getLoyaltyLogById(loyaltyLogId)
  if (!loyaltyLog) {
    throw new ApiError(httpStatus.NOT_FOUND, "LoyaltyLog not found")
  }

  Object.assign(loyaltyLog, updateBody)
  await loyaltyLog.save()
  return loyaltyLog
}

/**
 * Delete loyaltyLog by id
 * @param {string | number} loyaltyLogId
 * @returns {Promise<LoyaltyLogDocument> }
 */
const deleteLoyaltyLogById = async (
  loyaltyLogId: string | number
): Promise<LoyaltyLogDocument> => {
  const loyaltyLog = await getLoyaltyLogById(loyaltyLogId)
  if (!loyaltyLog) {
    throw new ApiError(httpStatus.NOT_FOUND, "LoyaltyLog not found")
  }
  await LoyaltyLog.deleteOne({ _id: loyaltyLog._id })
  return loyaltyLog
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
 * Get LoyaltyLog by id
 * @param {string | number} id
 * @returns {Promise <LoyaltyLogDocument | null> }
 */
const getLoyaltyLogById = async (
  id: string | number
): Promise<LoyaltyLogDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return LoyaltyLog.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    })
  }
  return null
}

/**
 * Get LoyaltyLogs by an array of IDs
 * @param {Array <string | number>} ids
 * @returns {Promise<Array<LoyaltyLogDocument | null> >}
 */
const getLoyaltyLogsByIds = async (
  ids: Array<string | number>
): Promise<Array<LoyaltyLogDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id))
  return LoyaltyLog.find({ _id: { $in: objectIds }, isDeleted: false }).exec()
}

export {
  createLoyaltyLog,
  queryLoyaltyLogs,
  updateLoyaltyLogById,
  deleteLoyaltyLogById,
  isExists,
  getLoyaltyLogById,
  getLoyaltyLogsByIds,
}

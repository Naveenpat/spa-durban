import httpStatus from "http-status"
import CustomerGroup, { CustomerGroupDocument } from "./schema.customerGroup" // Adjust CustomerGroupDocument based on your schema setup
import ApiError from "../../../../utilities/apiError"
import mongoose from "mongoose"
import { RangeFilter } from "../../../utils/interface"

/**
 * Create a customerGroup
 * @param {Object} customerGroupBody
 * @returns {Promise<CustomerGroupDocument>}
 */
const createCustomerGroup = async (
  customerGroupBody: any
): Promise<CustomerGroupDocument> => {
  return CustomerGroup.create(customerGroupBody)
}

/**
 * Query for customerGroups
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @returns {Promise<{ data: CustomerGroupDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryCustomerGroups = async (
  filter: any,
  options: any
): Promise<{
  data: CustomerGroupDocument[]
  page: number
  limit: number
  totalPages: number
  totalResults: number
  search: any
  dateFilter: any
  filterBy: any
  rangeFilterBy: RangeFilter | undefined
}> => {
  const customerGroups = await CustomerGroup.paginate(filter, options)
  return customerGroups
}

/**
 * Update customerGroup by id
 * @param {string | number} customerGroupId
 * @param {Object} updateBody
 * @returns {Promise<CustomerGroupDocument>}
 */
const updateCustomerGroupById = async (
  customerGroupId: string | number,
  updateBody: any
): Promise<CustomerGroupDocument> => {
  const customerGroup = await getCustomerGroupById(customerGroupId)
  if (!customerGroup) {
    throw new ApiError(httpStatus.NOT_FOUND, "CustomerGroup not found")
  }

  Object.assign(customerGroup, updateBody)
  await customerGroup.save()
  return customerGroup
}

/**
 * Delete customerGroup by id
 * @param {string | number} customerGroupId
 * @returns {Promise<CustomerGroupDocument>}
 */
const deleteCustomerGroupById = async (
  customerGroupId: string | number
): Promise<CustomerGroupDocument> => {
  const customerGroup = await getCustomerGroupById(customerGroupId)
  if (!customerGroup) {
    throw new ApiError(httpStatus.NOT_FOUND, "CustomerGroup not found")
  }
  await CustomerGroup.deleteOne({ _id: customerGroup._id })
  return customerGroup
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
 * @param {Array<FilterObject>} filterArray - Array of filters to check
 * @param {Array <string> } exceptIds - Array of IDs to exclude from checks
 * @param {Boolean} combined - Whether to combine filters with AND logic
 * @returns {Promise<ExistsResult>}
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
 * Get CustomerGroup by id
 * @param {string | number} id
 * @returns {Promise <CustomerGroupDocument | null>}
 */
const getCustomerGroupById = async (
  id: string | number
): Promise<CustomerGroupDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return CustomerGroup.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    })
  }
  return null
}

/**
 * Get CustomerGroups by an array of IDs
 * @param {Array<string | number>} ids
 * @returns {Promise <Array<CustomerGroupDocument | null> >}
 */
const getCustomerGroupsByIds = async (
  ids: Array<string | number>
): Promise<Array<CustomerGroupDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id))
  return CustomerGroup.find({
    _id: { $in: objectIds },
    isDeleted: false,
  }).exec()
}

export {
  createCustomerGroup,
  queryCustomerGroups,
  updateCustomerGroupById,
  deleteCustomerGroupById,
  isExists,
  getCustomerGroupById,
  getCustomerGroupsByIds,
}

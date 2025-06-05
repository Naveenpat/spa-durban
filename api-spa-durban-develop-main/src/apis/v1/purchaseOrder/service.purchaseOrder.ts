import httpStatus from "http-status"
import PurchaseOrder, { PurchaseOrderDocument } from "./schema.purchaseOrder" // Adjust PurchaseOrderDocument based on your schema setup
import ApiError from "../../../../utilities/apiError"
import mongoose from "mongoose"
import { RangeFilter } from "../../../utils/interface"

/**
 * Create a purchaseOrder
 * @param {Object} purchaseOrderBody
 * @returns {Promise<PurchaseOrderDocument> }
 */
const createPurchaseOrder = async (
  purchaseOrderBody: any
): Promise<PurchaseOrderDocument> => {
  return PurchaseOrder.create(purchaseOrderBody)
}

/**
 * Query for purchaseOrders
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @returns {Promise <{ data: PurchaseOrderDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryPurchaseOrders = async (
  filter: any,
  options: any
): Promise<{
  data: PurchaseOrderDocument[]
  page: number
  limit: number
  totalPages: number
  totalResults: number
  search: any
  dateFilter: any
  filterBy: any
  rangeFilterBy: RangeFilter | undefined
}> => {
  const purchaseOrders = await PurchaseOrder.paginate(filter, options)
  return purchaseOrders
}

/**
 * Update purchaseOrder by id
 * @param {string | number} purchaseOrderId
 * @param {Object} updateBody
 * @returns {Promise<PurchaseOrderDocument>}
 */
const updatePurchaseOrderById = async (
  purchaseOrderId: string | number,
  updateBody: any
): Promise<PurchaseOrderDocument> => {
  const purchaseOrder = await getPurchaseOrderById(purchaseOrderId)
  if (!purchaseOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, "PurchaseOrder not found")
  }

  Object.assign(purchaseOrder, updateBody)
  await purchaseOrder.save()
  return purchaseOrder
}

/**
 * Update purchaseOrder by id
 * @param {string | number} purchaseOrderId
 * @param {Object} updateBody
 * @returns {Promise<PurchaseOrderDocument>}
 */
const updatePoByIdAndUpdate = async (
  purchaseOrderId: string | number,
  updateBody: any
): Promise<PurchaseOrderDocument> => {
  const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(purchaseOrderId) },
    { ...updateBody },
    { new: true } // This option returns the updated document
  )
  if (!purchaseOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, "PurchaseOrder not found")
  }
  return purchaseOrder
}

/**
 * Delete purchaseOrder by id
 * @param {string | number} purchaseOrderId
 * @returns {Promise<PurchaseOrderDocument> }
 */
const deletePurchaseOrderById = async (
  purchaseOrderId: string | number
): Promise<PurchaseOrderDocument> => {
  const purchaseOrder = await getPurchaseOrderById(purchaseOrderId)
  if (!purchaseOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, "PurchaseOrder not found")
  }
  await PurchaseOrder.deleteOne({ _id: purchaseOrder._id })
  return purchaseOrder
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
 * Get PurchaseOrder by id
 * @param {string | number} id
 * @returns {Promise <PurchaseOrderDocument | null>}
 */
const getPurchaseOrderById = async (
  id: string | number
): Promise<PurchaseOrderDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return PurchaseOrder.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    })
  }
  return null
}

/**
 * Get PurchaseOrder by id with aggrigation
 * @param {PipelineStage[]} aggregateQuery - An array of aggregation pipeline stages
 * @returns {Promise<PurchaseOrderDocument | null>}
 */
const getPurchaseOrderAggrigate = async (
  aggregateQuery: any[]
): Promise<PurchaseOrderDocument | null> => {
  const result = await PurchaseOrder.aggregate(aggregateQuery).exec()
  return result.length > 0 ? result[0] : null
}

/**
 * Get PurchaseOrders by an array of IDs
 * @param {Array<string | number>} ids
 * @returns {Promise >}
 */
const getPurchaseOrdersByIds = async (
  ids: Array<string | number>
): Promise<Array<PurchaseOrderDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id))
  return PurchaseOrder.find({
    _id: { $in: objectIds },
    isDeleted: false,
  }).exec()
}

export {
  createPurchaseOrder,
  queryPurchaseOrders,
  updatePurchaseOrderById,
  deletePurchaseOrderById,
  isExists,
  getPurchaseOrderById,
  getPurchaseOrdersByIds,
  getPurchaseOrderAggrigate,
  updatePoByIdAndUpdate,
}

import httpStatus from "http-status"
import Inventory, { InventoryDocument } from "./schema.inventory" // Adjust InventoryDocument based on your schema setup
import ApiError from "../../../../utilities/apiError"
import mongoose from "mongoose"
import { RangeFilter } from "../../../utils/interface"

/**
 * Create a inventory
 * @param {Object} inventoryBody
 * @returns {Promise<InventoryDocument> }
 */
const createInventory = async (
  inventoryBody: any
): Promise<InventoryDocument> => {
  return Inventory.create(inventoryBody)
}

/**
 * Query for inventorys
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @returns {Promise<{ data: InventoryDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */

const queryInventorys = async (
  filter: any,
  options: any
): Promise<{
  data: InventoryDocument[]
  page: number
  limit: number
  totalPages: number
  totalResults: number
  search: any
  dateFilter: any
  filterBy: any
  rangeFilterBy: RangeFilter | undefined
}> => {
  const inventorys = await Inventory.paginate(filter, options)
  return inventorys
}

/**
 * Update inventory by id
 * @param {string | number} inventoryId
 * @param {Object} updateBody
 * @returns {Promise <InventoryDocument>}
 */
const updateInventoryById = async (
  inventoryId: string | number,
  updateBody: any
): Promise<InventoryDocument> => {
  const inventory = await getInventoryById(inventoryId)
  if (!inventory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Inventory not found")
  }
  const updated = await Inventory.findByIdAndUpdate(
    { _id: inventoryId },
    {
      ...updateBody,
    },
    { new: true }
  )
  if (!updated) {
    throw new ApiError(httpStatus.NOT_FOUND, "Inventory not found")
  }
  if (updated.quantity === updated.saleQuantity) {
    const updated = await Inventory.findByIdAndUpdate(
      { _id: inventoryId },
      {
        isSoldOut: true,
      },
      { new: true }
    )
  }
  return updated
}

/**
 * Delete inventory by id
 * @param {string | number} inventoryId
 * @returns {Promise<InventoryDocument>}
 */
const deleteInventoryById = async (
  inventoryId: string | number
): Promise<InventoryDocument> => {
  const inventory = await getInventoryById(inventoryId)
  if (!inventory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Inventory not found")
  }
  await Inventory.deleteOne({ _id: inventory._id })
  return inventory
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
 * @param {Array <FilterObject>} filterArray - Array of filters to check
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
 * Get Inventory by id
 * @param {string | number} id
 * @returns {Promise <InventoryDocument | null> }
 */
const getInventoryById = async (
  id: string | number
): Promise<InventoryDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return Inventory.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    })
  }
  return null
}

/**
 * Get Inventorys by an array of IDs
 * @param {Array<string | number> } ids
 * @returns {<Promise>}
 */
const getInventorysByIds = async (
  ids: Array<string | number>
): Promise<Array<InventoryDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id))
  return Inventory.find({ _id: { $in: objectIds }, isDeleted: false }).exec()
}

const getInventoriesByQuery = async (
  query: Object
): Promise<Array<InventoryDocument | null>> => {
  return Inventory.find({ ...query, isDeleted: false })
    .sort({ createdAt: 1 })
    .exec()
}

export {
  createInventory,
  queryInventorys,
  updateInventoryById,
  deleteInventoryById,
  isExists,
  getInventoryById,
  getInventorysByIds,
  getInventoriesByQuery,
}

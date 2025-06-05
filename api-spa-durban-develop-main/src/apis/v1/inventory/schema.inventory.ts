import mongoose, { Document, ObjectId } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"

export interface InventoryDocument extends Document {
  productId: ObjectId
  quantity: number
  purchasePrice: number
  saleQuantity: number
  createdById: ObjectId
  POId: ObjectId
  outletId: ObjectId
  isSoldOut: boolean
  isDeleted: boolean
  isActive: boolean
}

export interface InventoryModel extends mongoose.Model<InventoryDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: InventoryDocument[]
    page: number
    limit: number
    totalPages: number
    totalResults: number
    search: string
    dateFilter: DateFilter | undefined
    filterBy: FilterByItem | undefined
    rangeFilterBy: RangeFilter | undefined
  }>
}

const InventorySchema = new mongoose.Schema<InventoryDocument>(
  {
    productId: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      trim: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
      trim: true,
    },
    saleQuantity: {
      type: Number,
      default: 0,
      trim: true,
    },
    createdById: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      trim: true,
    },
    POId: {
      type: mongoose.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
      trim: true,
    },
    outletId: {
      type: mongoose.Types.ObjectId,
      ref: "Outlet",
      required: true,
      trim: true,
    },
    isSoldOut: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Add plugin that converts mongoose to JSON
paginate(InventorySchema)

// // Apply the timestamp plugin to the Inventory schema
timestamp(InventorySchema)

export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = []
const Inventory = mongoose.model<InventoryDocument, InventoryModel>(
  "Inventory",
  InventorySchema
)

export default Inventory

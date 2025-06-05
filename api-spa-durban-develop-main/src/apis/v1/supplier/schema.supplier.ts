import mongoose, { Document, Model, ObjectId } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"

export interface SupplierDocument extends Document {
  supplierName: string
  phone: string
  email: string
  address: string
  city: string
  region: string
  country: string
  taxId: ObjectId
  isDeleted: boolean
  isActive: boolean
}

export interface SupplierModel extends mongoose.Model<SupplierDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: SupplierDocument[]
    page: number
    limit: number
    totalPages: number
    totalResults: number
    search: string
    dateFilter: DateFilter | undefined
    filterBy: FilterByItem | undefined
    rangeFilterBy: RangeFilter | undefined
    isPaginationRequired: boolean | undefined
  }>
}

const SupplierSchema = new mongoose.Schema<SupplierDocument>(
  {
    supplierName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    taxId: {
      type: String,
      required: true,
      trim: true,
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
paginate(SupplierSchema)

// // Apply the timestamp plugin to the Supplier schema
timestamp(SupplierSchema)

export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = ["supplierName", "phone", "email", "city"]
const Supplier = mongoose.model<SupplierDocument, SupplierModel>(
  "Supplier",
  SupplierSchema
)

export default Supplier

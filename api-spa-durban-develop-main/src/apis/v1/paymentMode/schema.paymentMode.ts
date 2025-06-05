import mongoose, { Document } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"

export interface PaymentModeDocument extends Document {
  type: string
  modeName: string
  isDeleted: boolean
  isActive: boolean
}

export interface PaymentModeModel extends mongoose.Model<PaymentModeDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: PaymentModeDocument[]
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

const PaymentModeSchema = new mongoose.Schema<PaymentModeDocument>(
  {
    type: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    modeName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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
paginate(PaymentModeSchema)

// // Apply the timestamp plugin to the PaymentMode schema
timestamp(PaymentModeSchema)

export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = ["type", "modeName"]
const PaymentMode = mongoose.model<PaymentModeDocument, PaymentModeModel>(
  "PaymentMode",
  PaymentModeSchema
)

export default PaymentMode

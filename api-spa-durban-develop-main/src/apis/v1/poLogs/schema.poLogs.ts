import mongoose, { Document, Model, ObjectId } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"

export interface PoLogsDocument extends Document {
  poId: ObjectId
  amountPaid: number
  dueAmount: number
  isDeleted: boolean
  isActive: boolean
}

export interface PoLogsModel extends mongoose.Model<PoLogsDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: PoLogsDocument[]
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

const PoLogsSchema = new mongoose.Schema<PoLogsDocument>(
  {
    poId: {
      type: mongoose.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
      trim: true,
    },
    amountPaid: { type: Number, required: true, trim: true },
    dueAmount: { type: Number, required: true, trim: true },
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
paginate(PoLogsSchema)

// // Apply the timestamp plugin to the PoLogs schema
timestamp(PoLogsSchema)

export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = []
const PoLogs = mongoose.model<PoLogsDocument, PoLogsModel>(
  "PoLogs",
  PoLogsSchema
)

export default PoLogs

import mongoose, { Document, ObjectId } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"

export interface CustomerGroupDocument extends Document {
  customerGroupName: string
  customers: ObjectId[]
  isDeleted: boolean
  isActive: boolean
}

export interface CustomerGroupModel
  extends mongoose.Model<CustomerGroupDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: CustomerGroupDocument[]
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

const CustomerGroupSchema = new mongoose.Schema<CustomerGroupDocument>(
  {
    customerGroupName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customers: {
      type: [mongoose.Types.ObjectId],
      ref: "User",
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
paginate(CustomerGroupSchema)

// // Apply the timestamp plugin to the CustomerGroup schema
timestamp(CustomerGroupSchema)

export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = ["customerGroupName", "customers"]
const CustomerGroup = mongoose.model<CustomerGroupDocument, CustomerGroupModel>(
  "CustomerGroup",
  CustomerGroupSchema
)

export default CustomerGroup

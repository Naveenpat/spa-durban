import mongoose, { Document } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"

export interface RoleDocument extends Document {
  roleName: string
  permissions: [string]
  isDeleted: boolean
  isActive: boolean
}

export interface RoleModel extends mongoose.Model<RoleDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: RoleDocument[]
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

const RoleSchema = new mongoose.Schema<RoleDocument>(
  {
    roleName: { type: String, required: true, trim: true, lowercase: true },
    permissions: {
      type: [String],
      required: true,
      trim: true,
      lowercase: false,
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
paginate(RoleSchema)

// // Apply the timestamp plugin to the Role schema
timestamp(RoleSchema)

export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = ["roleName", "permissions"]
const Role = mongoose.model<RoleDocument, RoleModel>("Role", RoleSchema)

export default Role

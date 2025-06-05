import mongoose, { Document, Model } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"

export interface MeasurementUnitDocument extends Document {
  unitName: String
  unitCode: String
  isDeleted: boolean
  isActive: boolean
}

export interface MeasurementUnitModel
  extends mongoose.Model<MeasurementUnitDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: MeasurementUnitDocument[]
    page: number
    limit: number
    totalPages: number
    totalResults: number
    search: String
    dateFilter: DateFilter | undefined
    filterBy: FilterByItem | undefined
    rangeFilterBy: RangeFilter | undefined
    isPaginationRequired: boolean | undefined
  }>
}

const MeasurementUnitSchema = new mongoose.Schema<MeasurementUnitDocument>(
  {
    unitName: { type: String, required: true, trim: true, lowercase: true },
    unitCode: { type: String, required: true, trim: true, lowercase: true },
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
paginate(MeasurementUnitSchema)

// // Apply the timestamp plugin to the MeasurementUnit schema
timestamp(MeasurementUnitSchema)

export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = ["unitName", "unitCode"]
const MeasurementUnit = mongoose.model<
  MeasurementUnitDocument,
  MeasurementUnitModel
>("MeasurementUnit", MeasurementUnitSchema)

export default MeasurementUnit

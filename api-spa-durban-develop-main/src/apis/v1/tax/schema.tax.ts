import mongoose, { Document } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"
import { TaxTypeEnum } from "../../../utils/enumUtils"

export interface TaxDocument extends Document {
  taxType: string
  taxPercent: number
  isDeleted: boolean
  isActive: boolean
}

export interface TaxModel extends mongoose.Model<TaxDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: TaxDocument[]
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

const TaxSchema = new mongoose.Schema<TaxDocument>(
  {
    taxType: {
      type: String,
      enum: [
        TaxTypeEnum.vat,
        TaxTypeEnum.sgst,
        TaxTypeEnum.igst,
        TaxTypeEnum.cgst,
      ],
      required: true,
      trim: true,
    },
    taxPercent: { type: Number, required: true },
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
paginate(TaxSchema)

// // Apply the timestamp plugin to the Tax schema
timestamp(TaxSchema)

export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = ["taxType", "taxPercent"]
const Tax = mongoose.model<TaxDocument, TaxModel>("Tax", TaxSchema)

export default Tax

import mongoose, { Document, ObjectId } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"

export interface BusinessLocation {
  outletId: ObjectId
  mondaySpendAmount: number
  mondayEarnPoint: number
  tuesdaySpendAmount: number
  tuesdayEarnPoint: number
  wednesdaySpendAmount: number
  wednesdayEarnPoint: number
  thursdaySpendAmount: number
  thursdayEarnPoint: number
  fridaySpendAmount: number
  fridayEarnPoint: number
  saturdaySpendAmount: number
  saturdayEarnPoint: number
  sundaySpendAmount: number
  sundayEarnPoint: number
}

export interface LoyaltyLogDocument extends Document {
  loyaltyProgramName: string
  loyaltyId: ObjectId
  updatedByUserId: ObjectId
  businessLocation: BusinessLocation[]
  isDeleted: boolean
  isActive: boolean
}

export interface LoyaltyLogModel extends mongoose.Model<LoyaltyLogDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: LoyaltyLogDocument[]
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

const LoyaltyLogSchema = new mongoose.Schema<LoyaltyLogDocument>(
  {
    loyaltyId: {
      type: mongoose.Types.ObjectId,
      ref: "Loyalty",
      required: true,
      trim: true,
    },
    loyaltyProgramName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    businessLocation: {
      type: [
        {
          outletId: {
            type: mongoose.Types.ObjectId,
            trim: true,
            required: true,
          },
          mondaySpendAmount: {
            type: Number,
            trim: true,
            required: true,
          },
          mondayEarnPoint: {
            type: Number,
            trim: true,
            required: true,
          },
          tuesdaySpendAmount: {
            type: Number,
            trim: true,
            required: true,
          },
          tuesdayEarnPoint: {
            type: Number,
            trim: true,
            required: true,
          },
          wednesdaySpendAmount: {
            type: Number,
            trim: true,
            required: true,
          },
          wednesdayEarnPoint: {
            type: Number,
            trim: true,
            required: true,
          },
          thursdaySpendAmount: {
            type: Number,
            trim: true,
            required: true,
          },
          thursdayEarnPoint: {
            type: Number,
            trim: true,
            required: true,
          },
          fridaySpendAmount: {
            type: Number,
            trim: true,
            required: true,
          },
          fridayEarnPoint: {
            type: Number,
            trim: true,
            required: true,
          },
          saturdaySpendAmount: {
            type: Number,
            trim: true,
            required: true,
          },
          saturdayEarnPoint: {
            type: Number,
            trim: true,
            required: true,
          },
          sundaySpendAmount: {
            type: Number,
            trim: true,
            required: true,
          },
          sundayEarnPoint: {
            type: Number,
            trim: true,
            required: true,
          },
        },
      ],
      required: true,
    },
    updatedByUserId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
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
paginate(LoyaltyLogSchema)

// // Apply the timestamp plugin to the Loyalty schema
timestamp(LoyaltyLogSchema)

export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = ["loyaltyProgramName"]
const Loyalty = mongoose.model<LoyaltyLogDocument, LoyaltyLogModel>(
  "LoyaltyLog",
  LoyaltyLogSchema
)

export default Loyalty

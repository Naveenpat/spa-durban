import mongoose, { Document, ObjectId, Types } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { format } from "date-fns"

import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"
import { CouponTypeEnum } from "../../../utils/enumUtils"

export interface CouponDocument extends Document {
  type: string
  user: ObjectId
  earnPoint: number
  referralCode: string
  discountAmount: number
  quantity: number
  valid: Date
  note: string
  isDeleted: boolean
  isActive: boolean
  usedBy: Types.ObjectId[];
}

export interface CouponModel extends mongoose.Model<CouponDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: CouponDocument[]
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

const CouponSchema = new mongoose.Schema<CouponDocument>(
  {
    type: {
      type: String,
      enum: [CouponTypeEnum.couponCode, CouponTypeEnum.referralCode],
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
      trim: true,
    },
    earnPoint: {
      type: Number,
      default: 0,
      trim: true,
    },
    referralCode: {
      type: String,
      required: true,
      trim: true,
    },
    discountAmount: {
      type: Number,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      trim: true,
    },
    valid: {
      type: Date,
      required: true,
      trim: true,
      validate(value: string) {
        const formattedDate = format(value, "yyyy-MM-dd HH:mm:ss")
        return formattedDate
      },
    },
    note: {
      type: String,
      default: "",
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
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer',default:[] }]
  },

  {
    timestamps: true,
  }
)

// Add plugin that converts mongoose to JSON
paginate(CouponSchema)

// // Apply the timestamp plugin to the Coupon schema
timestamp(CouponSchema)

export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = ["referralCode"]
const Coupon = mongoose.model<CouponDocument, CouponModel>(
  "Coupon",
  CouponSchema
)

export default Coupon

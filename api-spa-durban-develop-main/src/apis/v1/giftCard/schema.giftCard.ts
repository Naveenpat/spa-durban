import mongoose, { Document, ObjectId } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"
import { GiftCardTypeEnum } from "../../../utils/enumUtils"
import { format } from "date-fns"
import { Types } from "mongoose"

export interface GiftCardDocument extends Document {
  type: string
  customerId: ObjectId
  giftCardAmount: number
  giftCardName: string
  giftCardExpiryDate: Date
  usedBy: Types.ObjectId[];
  isDeleted: boolean
  isActive: boolean
}

export interface GiftCardModel extends mongoose.Model<GiftCardDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: GiftCardDocument[]
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

const GiftCardSchema = new mongoose.Schema<GiftCardDocument>(
  {
    type: {
      type: String,
      enum: [GiftCardTypeEnum.whoeverBought, GiftCardTypeEnum.specificCustomer],
      required: true,
      trim: true,
    },
    customerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
      trim: true,
    },
    giftCardAmount: {
      type: Number,
      required: true,
      trim: true,
    },
    giftCardName: {
      type: String,
      required: true,
      trim: true,
    },
    giftCardExpiryDate: {
      type: Date,
      required: true,
      trim: true,
      validate(value: string) {
        const formattedDate = format(value, "yyyy-MM-dd HH:mm:ss")
        return formattedDate
      },
    },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer',default:[] }],
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
paginate(GiftCardSchema)

// // Apply the timestamp plugin to the GiftCard schema
timestamp(GiftCardSchema)

export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = [
  "type",
  "giftCardAmount",
  "giftCardName",
  "giftCardExpiryDate",
]
const GiftCard = mongoose.model<GiftCardDocument, GiftCardModel>(
  "GiftCard",
  GiftCardSchema
)

export default GiftCard

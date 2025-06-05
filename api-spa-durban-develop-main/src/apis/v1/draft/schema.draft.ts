import mongoose, { Document, ObjectId } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"
import { format } from "date-fns"
import { invoiceLogService } from "../service.index"

export interface amountReceived {
  paymentModeId: ObjectId | null
  amount: number
}
export interface taxes {
  taxId: ObjectId | null
  taxType: string
  taxAmount: number
}

export interface items {
  itemId: ObjectId | null
  quantity: number
  itemType: string
  itemName: string
  taxId: ObjectId | null
  taxType: string
  taxAmount: number
  taxPercent: number
  mrp: number
  sellingPrice: number
  priceIncTax: number
}
export interface DraftDocument extends Document {
  invoiceDate: Date
  outletId: ObjectId | null
  customerId: ObjectId | null
  employeeId: ObjectId | null
  items: items[]
  couponCode: string
  shippingCharges: number
  amountReceived: amountReceived[]
  giftCardCode: string
  useLoyaltyPoints: boolean
  referralCode: string
  taxes: taxes[]
  balanceDue: number
  totalAmount: number
  totalDiscount: number
  amountPaid: number
  couponDiscount: number
  giftCardDiscount: number
  loyaltyPointsDiscount: number
  referralDiscount: number
  isDeleted: boolean
  isActive: boolean
}

export interface DraftModel extends mongoose.Model<DraftDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: DraftDocument[]
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

const DraftSchema = new mongoose.Schema<DraftDocument>(
  {
    invoiceDate: {
      type: Date,
      required: true,
      trim: true,
      validate(value: string) {
        const formattedDate = format(value, "yyyy-MM-dd HH:mm:ss")
        return formattedDate
      },
    },

    customerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      trim: true,
    },
    employeeId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: "",
      trim: true,
    },
    outletId: {
      type: mongoose.Types.ObjectId,
      ref: "Outlet",
      default: null,
      trim: true,
    },
    items: {
      type: [
        {
          itemId: {
            type: mongoose.Types.ObjectId,
            default: null,
            trim: true,
          },
          itemName: {
            type: String,
            default: "",
            trim: true,
          },
          quantity: {
            type: Number,
            default: 0,
            trim: true,
          },
          itemType: {
            type: String,
            default: "",
            trim: true,
          },
          taxId: {
            type: mongoose.Types.ObjectId,
            ref: "Tax",
            default: null,
            trim: true,
          },
          taxType: {
            type: String,
            default: "",
            trim: true,
          },

          taxPercent: {
            type: String,
            default: "",
            trim: true,
          },
          taxAmount: {
            type: Number,
            default: 0,
            trim: true,
          },
          mrp: {
            type: Number,
            default: null,
            trim: true,
          },
          sellingPrice: {
            type: Number,
            default: 0,
            trim: true,
          },
          priceIncTax: {
            type: Number,
            default: 0,
            trim: true,
          },
        },
      ],

      trim: true,
    },

    amountReceived: {
      type: [
        {
          paymentModeId: {
            type: mongoose.Types.ObjectId,
            ref: "PaymentMode",
            default: null,
            trim: true,
          },
          amount: {
            type: Number,
            default: 0,
            trim: true,
          },
        },
      ],

      trim: true,
    },
    couponCode: {
      type: String,
      default: "",
      trim: true,
    },
    couponDiscount: {
      type: Number,
      default: 0,
      trim: true,
    },
    shippingCharges: {
      type: Number,
      default: 0,
      trim: true,
    },
    giftCardDiscount: {
      type: Number,
      default: 0,
      trim: true,
    },
    giftCardCode: {
      type: String,
      default: "",
      trim: true,
    },
    useLoyaltyPoints: {
      type: Boolean,
      default: false,
      trim: true,
    },
    loyaltyPointsDiscount: {
      type: Number,
      default: 0,
      trim: true,
    },
    referralCode: {
      type: String,
      default: "",
      trim: true,
    },
    referralDiscount: {
      type: Number,
      default: 0,
      trim: true,
    },
    taxes: {
      type: [
        {
          taxId: {
            type: mongoose.Types.ObjectId,
            ref: "Tax",
            default: null,
            trim: true,
          },
          taxType: {
            type: String,
            default: "",
            trim: true,
          },
          taxAmount: {
            type: Number,
            default: 0,
            trim: true,
          },
        },
      ],

      trim: true,
    },
    totalAmount: {
      type: Number,
      default: 0,
      trim: true,
    },
    totalDiscount: {
      type: Number,
      default: 0,
      trim: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
      trim: true,
    },
    balanceDue: {
      type: Number,
      default: 0,
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
paginate(DraftSchema)
timestamp(DraftSchema)

export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = ["invoiceNumber", "customerName"]
const Draft = mongoose.model<DraftDocument, DraftModel>("Draft", DraftSchema)

export default Draft

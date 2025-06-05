import mongoose, { Document, ObjectId } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"
import { format } from "date-fns"

export interface amountReceived {
  paymentModeId: ObjectId
  amount: number
}
export interface taxes {
  taxId: ObjectId | null
  taxType: string
  taxAmount: number
}

export interface items {
  itemId: ObjectId
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
export interface InvoiceLogDocument extends Document {
  invoiceId: ObjectId
  invoiceDate: Date
  invoiceNumber: string
  outletId: ObjectId
  customerId: ObjectId
  employeeId: ObjectId
  items: items[]
  couponCode: string
  shippingCharges: number
  amountReceived: amountReceived[]
  giftCardCode: string
  useLoyaltyPoints: Boolean
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
  isPaymentChanged: boolean
  remark: string
}

export interface InvoiceLogModel extends mongoose.Model<InvoiceLogDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: InvoiceLogDocument[]
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

const InvoiceLogSchema = new mongoose.Schema<InvoiceLogDocument>(
  {
    invoiceId: {
      type: mongoose.Types.ObjectId,
      ref: "Invoice",
      required: true,
      trim: true,
    },
    invoiceDate: {
      type: Date,
      required: true,
      trim: true,
      validate(value: string) {
        const formattedDate = format(value, "yyyy-MM-dd HH:mm:ss")
        return formattedDate
      },
    },
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
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
      required: true,
      trim: true,
    },
    outletId: {
      type: mongoose.Types.ObjectId,
      ref: "Outlet",
      required: true,
      trim: true,
    },
    items: {
      type: [
        {
          itemId: {
            type: mongoose.Types.ObjectId,
            required: true,
            trim: true,
          },
          itemName: {
            type: String,
            required: true,
            trim: true,
          },
          quantity: {
            type: Number,
            required: true,
            trim: true,
          },
          itemType: {
            type: String,
            required: true,
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
            required: true,
            trim: true,
          },

          taxPercent: {
            type: String,
            required: true,
            trim: true,
          },
          taxAmount: {
            type: Number,
            required: true,
            trim: true,
          },
          mrp: {
            type: Number,
            default: null,
            trim: true,
          },
          sellingPrice: {
            type: Number,
            required: true,
            trim: true,
          },
          priceIncTax: {
            type: Number,
            required: true,
            trim: true,
          },
        },
      ],
      required: true,
      trim: true,
    },

    amountReceived: {
      type: [
        {
          paymentModeId: {
            type: mongoose.Types.ObjectId,
            ref: "PaymentMode",
            required: true,
            trim: true,
          },
          amount: {
            type: Number,
            required: true,
            trim: true,
          },
        },
      ],
      required: true,
      trim: true,
    },
    couponCode: {
      type: String,
      default: "",
      trim: true,
    },
    couponDiscount: {
      type: Number,
      required: true,
      trim: true,
    },
    shippingCharges: {
      type: Number,
      required: true,
      trim: true,
    },
    giftCardDiscount: {
      type: Number,
      required: true,
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
      required: true,
      trim: true,
    },
    referralCode: {
      type: String,
      default: "",
      trim: true,
    },
    referralDiscount: {
      type: Number,
      required: true,
      trim: true,
    },
    remark: {
      type: String,
      default: "",
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
            required: true,
            trim: true,
          },
          taxAmount: {
            type: Number,
            required: true,
            trim: true,
          },
        },
      ],
      required: true,
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      trim: true,
    },
    totalDiscount: {
      type: Number,
      required: true,
      trim: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      trim: true,
    },
    balanceDue: {
      type: Number,
      required: true,
      trim: true,
    },
    isPaymentChanged: {
      type: Boolean,
      default: false,
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
paginate(InvoiceLogSchema)

// // Apply the timestamp plugin to the InvoiceLog schema
timestamp(InvoiceLogSchema)

export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = []
const InvoiceLog = mongoose.model<InvoiceLogDocument, InvoiceLogModel>(
  "InvoiceLog",
  InvoiceLogSchema
)

export default InvoiceLog

import mongoose, { Document, ObjectId } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { format } from "date-fns"
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"
import {
  DiscountTypeEnum,
  PaymentStatusTypeEnum,
} from "../../../utils/enumUtils"

export interface Product {
  productId: ObjectId
  discountType: string
  quantity: number
  rate: number
  tax: ObjectId
  discount: number
  amount: number
}

export interface amountReceived {
  paymentModeId: ObjectId;
  amount: number;
  txnNumber:string;
}

export interface PurchaseOrderDocument extends Document {
  supplierId: ObjectId
  invoiceNumber: string
  orderDate: Date
  paymentStatus: string
  amountPaid: number
  payableAmount: number
  shippingCharges: number
  totalTax: number
  totalDiscount: number
  isInventoryIn: boolean
  products: Product[]
  amountReceived: amountReceived[];
  createdBy: ObjectId
  isDeleted: boolean
  isActive: boolean
}

export interface PurchaseOrderModel
  extends mongoose.Model<PurchaseOrderDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: PurchaseOrderDocument[]
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

const PurchaseOrderSchema = new mongoose.Schema<PurchaseOrderDocument>(
  {
    supplierId: {
      ref: "Supplier",
      type: mongoose.Types.ObjectId,
      required: true,
      trim: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },

    orderDate: {
      type: Date,
      required: true,
      trim: true,
      validate(value: string) {
        const formattedDate = format(value, "yyyy-MM-dd HH:mm:ss")
        return formattedDate
      },
    },

    paymentStatus: {
      type: String,
      enum: [PaymentStatusTypeEnum.completed, PaymentStatusTypeEnum.pending],
      required: true,
      trim: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      trim: true,
    },
    payableAmount: {
      type: Number,
      required: true,
      trim: true,
    },

    shippingCharges: {
      type: Number,
      required: true,
      trim: true,
    },
    totalTax: {
      type: Number,
      required: true,
      trim: true,
    },
    totalDiscount: {
      type: Number,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Types.ObjectId,
      required: true,
      trim: true,
    },
    isInventoryIn: {
      type: Boolean,
      default: false,
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
          txnNumber: {
            type: String,
            default: ''
          }
        },
      ],
      required: true,
      trim: true,
    },

    products: {
      type: [
        {
          productId: {
            type: mongoose.Types.ObjectId,
            trim: true,
            required: true,
          },
          discountType: {
            type: String,
            enum: [DiscountTypeEnum.percent, DiscountTypeEnum.flat],
            required: true,
            trim: true,
          },
          quantity: {
            type: Number,
            trim: true,
            required: true,
          },
          rate: {
            type: Number,
            trim: true,
            required: true,
          },
          tax: {
            type: mongoose.Types.ObjectId,
            trim: true,
            required: true,
          },
          discount: {
            type: Number,
            trim: true,
            required: true,
          },
          amount: {
            type: Number,
            trim: true,
            required: true,
          },
        },
      ],
      required: true,
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
paginate(PurchaseOrderSchema)

// // Apply the timestamp plugin to the PurchaseOrder schema
timestamp(PurchaseOrderSchema)

export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = ["invoiceNumber", "supplierName"]
const PurchaseOrder = mongoose.model<PurchaseOrderDocument, PurchaseOrderModel>(
  "PurchaseOrder",
  PurchaseOrderSchema
)

export default PurchaseOrder

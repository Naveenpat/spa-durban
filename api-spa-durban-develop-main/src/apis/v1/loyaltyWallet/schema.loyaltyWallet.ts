import mongoose, { Document, ObjectId } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"
import { TransactionTypeEnum } from "../../../utils/enumUtils"

export interface LoyaltyWalletDocument extends Document {
  customerId: ObjectId
  employeeId: ObjectId
  outletId: ObjectId
  pointsCreditedOrUsed: number
  amountCreditedOrUsed: number
  todaysPoints: number
  todaysAmount: number
  spentAmount: number
  transactionType: string
  isDeleted: boolean
  isActive: boolean
}

export interface LoyaltyWalletModel
  extends mongoose.Model<LoyaltyWalletDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: LoyaltyWalletDocument[]
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

const LoyaltyWalletSchema = new mongoose.Schema<LoyaltyWalletDocument>(
  {
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
    pointsCreditedOrUsed: {
      type: Number,
      required: true,
      trim: true,
    },
    amountCreditedOrUsed: {
      type: Number,
      default: 0,
      trim: true,
    },
    todaysPoints: {
      type: Number,
      default: 0,
      trim: true,
    },
    todaysAmount: {
      type: Number,
      default: 0,
      trim: true,
    },
    spentAmount: {
      type: Number,
      default: 0,
      trim: true,
    },
    transactionType: {
      type: String,
      enum: [TransactionTypeEnum.credit, TransactionTypeEnum.debit],
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
paginate(LoyaltyWalletSchema)

// // Apply the timestamp plugin to the LoyaltyWallet schema
timestamp(LoyaltyWalletSchema)

export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = ["customerName"]
const LoyaltyWallet = mongoose.model<LoyaltyWalletDocument, LoyaltyWalletModel>(
  "LoyaltyWallet",
  LoyaltyWalletSchema
)

export default LoyaltyWallet

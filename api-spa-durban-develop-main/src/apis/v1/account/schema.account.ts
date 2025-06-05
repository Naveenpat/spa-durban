import mongoose, { Document } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"

export interface AccountDocument extends Document {
  accountName: string
  accountNumber: string
  note: string
  isDeleted: boolean
  isActive: boolean
}

export interface AccountModel extends mongoose.Model<AccountDocument> {
  isAccountExists(
    accountName: string,
    excludeAccountId?: mongoose.Types.ObjectId
  ): Promise<boolean>
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: AccountDocument[]
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

const AccountSchema = new mongoose.Schema<AccountDocument>(
  {
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: false,
      trim: true,
    },
    note: {
      type: String,
      required: false,
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
  },
  {
    timestamps: true,
  }
)

// Add plugin that converts mongoose to JSON
paginate(AccountSchema)

// // Apply the timestamp plugin to the Account schema
timestamp(AccountSchema)

// Static method to check if email is taken
AccountSchema.statics.isAccountExists = async function (
  accountName: string,
  excludeAccountId?: mongoose.Types.ObjectId
) {
  const account = await this.findOne({
    accountName,
    _id: { $ne: excludeAccountId },
  })
  return !!account
}
export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = ["accountName", "accountNumber", "note"]
const Account = mongoose.model<AccountDocument, AccountModel>(
  "Account",
  AccountSchema
)

export default Account

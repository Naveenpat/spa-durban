import mongoose, { Document, ObjectId } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"
import { TicketTypeEnum } from "../../../utils/enumUtils"

export interface TicketDocument extends Document {
  _id: ObjectId
  ticketTitle: string
  description: string
  outletId: ObjectId
  customerId: ObjectId
  userId: ObjectId
  userName: string
  ticketType: string
  isDeleted: boolean
  isActive: boolean
}

export interface TicketModel extends mongoose.Model<TicketDocument> {
  isTicketTaken(
    ticket: string,
    excludeticketId?: mongoose.Types.ObjectId
  ): Promise<boolean>
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: TicketDocument[]
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

const TicketSchema = new mongoose.Schema<TicketDocument>(
  {
    ticketTitle: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    ticketType: {
      type: String,
      enum: [
        TicketTypeEnum.complain,
        TicketTypeEnum.general,
        TicketTypeEnum.refund,
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
paginate(TicketSchema)

// // Apply the timestamp plugin to the Ticket schema
timestamp(TicketSchema)

export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = ["ticketTitle", "description"]
const Ticket = mongoose.model<TicketDocument, TicketModel>(
  "Ticket",
  TicketSchema
)

export default Ticket

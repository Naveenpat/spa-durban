import mongoose, { Document, ObjectId } from 'mongoose';
import timestamp from '../../plugins/timeStamp.plugin';
import { paginate } from '../../plugins/pagination.plugin';
import {
  DateFilter,
  FilterByItem,
  RangeFilter,
} from '../../../utils/interface';

export interface PaymentEntry {
  paymentModeName: string;
  totalAmount: number;
  manual: string;
  reason: string;
}

export interface SalesRegisterDocument extends Document {
  outletId: ObjectId;
  createdBy: ObjectId;

  // Open
  isOpened: boolean;
  openingBalance: number;
  openedAt: Date;

  // Close
  isClosed: boolean;
  closedAt?: Date;
  closeRegister: {
    date: Date;
    payments: PaymentEntry[];
  }[];
  bankDeposit: number;
  totalCashAmount: number;
  cashAmount: number;
  carryForwardBalance: number;
  cashUsage: [
    {
      reason: String,
      amount: Number,
      proofUrl: String,
      date: Date,
    }
  ],
  isDeleted: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface SalesRegisterModel
  extends mongoose.Model<SalesRegisterDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: SalesRegisterDocument[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
    search: string;
    dateFilter: DateFilter | undefined;
    filterBy: FilterByItem | undefined;
    rangeFilterBy: RangeFilter | undefined;
  }>;
}

const PaymentSchema = new mongoose.Schema<PaymentEntry>(
  {
    paymentModeName: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    manual: { type: String, required: true },
    reason: { type: String, default: '' },
  },
  { _id: false }
);

const CloseDaySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    payments: { type: [PaymentSchema], required: true },
  },
  { _id: false }
);

const SalesRegisterSchema = new mongoose.Schema<SalesRegisterDocument>(
  {
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Open Register
    isOpened: {
      type: Boolean,
      default: true,
    },
    openingBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    openedAt: {
      type: Date,
      default: Date.now,
    },

    // Close Register
    isClosed: {
      type: Boolean,
      default: false,
    },
    closedAt: {
      type: Date,
    },
    closeRegister: {
      type: [CloseDaySchema],
      default: [],
    },
    bankDeposit: {
      type: Number,
      default: 0,
    },
    carryForwardBalance: {
      type: Number,
      default: 0,
    },
    cashUsage: [
      {
        reason: { type: String, required: true },
        amount: { type: Number, required: true },
        proofUrl: { type: String, default: '' },
        date: { type: Date, default: Date.now },
      }
    ],
    totalCashAmount: {
      type: Number,
      default: 0,
    },
    cashAmount: {
      type: Number,
      default: 0,
    },
    // Misc
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Plugins
paginate(SalesRegisterSchema);
timestamp(SalesRegisterSchema);

export const allowedDateFilterKeys = ['createdAt', 'updatedAt', 'openedAt'];
export const searchKeys = ['outletId'];

const SalesRegister = mongoose.model<SalesRegisterDocument, SalesRegisterModel>(
  'SalesRegister',
  SalesRegisterSchema
);

export default SalesRegister;

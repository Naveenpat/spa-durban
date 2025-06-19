import mongoose, { Document, ObjectId } from "mongoose";
import timestamp from "../../plugins/timeStamp.plugin";
import { paginate } from "../../plugins/pagination.plugin";
import {
  DateFilter,
  FilterByItem,
  RangeFilter,
} from "../../../utils/interface";
import { format } from "date-fns";
import { UserDocument } from "../user/schema.user";

export interface amountReceived {
  paymentModeId: ObjectId;
  amount: number;
}
export interface taxes {
  taxId: ObjectId | null;
  taxType: string;
  taxAmount: number;
}

export interface items {
  itemId: ObjectId;
  quantity: number;
  itemType: string;
  itemName: string;
  taxId: ObjectId | null;
  taxType: string;
  taxAmount: number;
  taxPercent: number;
  mrp: number;
  sellingPrice: number;
  priceIncTax: number;
}
export interface InvoiceDocument extends Document {
  invoiceDate: Date;
  invoiceNumber: string;
  outletId: ObjectId;
  companyId:ObjectId;
  customerId: ObjectId;
  employeeId: ObjectId;
  items: items[];
  couponCode: string;
  notes: string;
  shippingCharges: number;
  amountReceived: amountReceived[];
  giftCardCode: string;
  useLoyaltyPoints: boolean;
  loyaltyPointsEarned: number;
  referralCode: string;
  taxes: taxes[];
  balanceDue: number;
  totalAmount: number;
  totalDiscount: number;
  amountPaid: number;
  couponDiscount: number;
  giftCardDiscount: number;
  promotionCoupanCode:string;
  promotionCoupanCodeDiscount:number;
  loyaltyPointsDiscount: number;
  referralDiscount: number;
  isDeleted: boolean;
  isActive: boolean;
  status: string;
  voidNote: string;
  cashBackEarned: number;
  cashBackDiscount: number;
  useCashBackAmount: boolean;
  bookingId: string;
  givenChange: Number;
}

export interface AggregatedInvoiceDocument extends InvoiceDocument {
  customer: UserDocument;
  amount:any;
  date:Date;
  serviceName:any;
  spa_name:any;
  contact_info:any;
  website:any;
  paymentMethod:any;
  outlet:any;
  paymentMode:any;
  amountReceived:any;
  websiteUrl:string;
  company:any;
}

export interface InvoiceModel extends mongoose.Model<InvoiceDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: InvoiceDocument[];
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

const InvoiceSchema = new mongoose.Schema<InvoiceDocument>(
  {
    invoiceDate: {
      type: Date,
      required: true,
      trim: true,
      validate(value: string) {
        const formattedDate = format(value, "yyyy-MM-dd HH:mm:ss");
        return formattedDate;
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
    companyId:{
       type: mongoose.Types.ObjectId,
      ref: "Company",
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
    notes: {
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
    promotionCoupanCodeDiscount: {
      type: Number,
      required: true,
      trim: true,
    },
    promotionCoupanCode: {
      type: String,
      default: "",
      trim: true,
    },
    useLoyaltyPoints: {
      type: Boolean,
      default: false,
      trim: true,
    },
    loyaltyPointsEarned: {
      type: Number,
      required: true,
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
    taxes: {
      type: [
        {
          taxId: {
            type: mongoose.Types.ObjectId,
            ref: "Tax",
            required: true,
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      default: "",
    },
    voidNote: {
      type: String,
      default: "",
    },
    cashBackEarned: {
      type: Number,
      default: 0,
    },
    cashBackDiscount: {
      type: Number,
      default: 0,
    },
    useCashBackAmount: {
      type: Boolean,
      default: false,
    },
    bookingId: {
      type: String,
      default:""
    },
    givenChange: {
    type: Number,
    default: 0,  // Optional field, default is 0 if not provided
    },

  },
  {
    timestamps: true,
  }
);

// Add plugin that converts mongoose to JSON
paginate(InvoiceSchema);
timestamp(InvoiceSchema);

export const allowedDateFilterKeys = ["createdAt", "updatedAt"];
export const searchKeys = ["invoiceNumber"];
const Invoice = mongoose.model<InvoiceDocument, InvoiceModel>(
  "Invoice",
  InvoiceSchema
);

export default Invoice;

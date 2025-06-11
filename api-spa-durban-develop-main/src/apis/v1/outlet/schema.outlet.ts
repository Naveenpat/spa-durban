import mongoose, { Document, ObjectId } from "mongoose";
import timestamp from "../../plugins/timeStamp.plugin";
import validator from "validator";
import { paginate } from "../../plugins/pagination.plugin";
import {
  DateFilter,
  FilterByItem,
  RangeFilter,
} from "../../../utils/interface";

export interface OutletDocument extends Document {
  products: any;
  name: string;
  address: string;
  city: string;
  region: string;
  country: string;
  phone: string;
  email: string;
  taxID: string;
  invoicePrefix: string;
  invoiceNumber: number;
  onlinePaymentAccountId: ObjectId;
  isDeleted: boolean;
  isActive: boolean;
  bookingStoreId: string;
  logo:string;
  companyId:any;
  companyName:any;
}

export interface OutletModel extends mongoose.Model<OutletDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: OutletDocument[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
    search: string;
    dateFilter: DateFilter | undefined;
    filterBy: FilterByItem | undefined;
    rangeFilterBy: RangeFilter | undefined;
    isPaginationRequired: boolean | undefined;
  }>;
}

const OutletSchema = new mongoose.Schema<OutletDocument>(
  {
    name: {
      type: String,
      unique: true,
      required: false,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    city: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    region: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    country: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    taxID: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    invoicePrefix: {
      type: String,
      unique: true,
      required: false,
      trim: true,
    },
    invoiceNumber: {
      type: Number,
      required: false,
      trim: true,
    },

    onlinePaymentAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
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
    bookingStoreId: {
      type: String,
      default: "",
    },
    companyId:{
       type: mongoose.Schema.Types.ObjectId,
       default:null
    },
    logo: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Add plugin that converts mongoose to JSON
paginate(OutletSchema);

// // Apply the timestamp plugin to the Outlet schema
timestamp(OutletSchema);

export const allowedDateFilterKeys = ["createdAt", "updatedAt"];
export const searchKeys = [
  "name",
  "city",
  "phone",
  "email",
  "taxID",
  "invoicePrefix",
  "invoiceNumber",
];
const Outlet = mongoose.model<OutletDocument, OutletModel>(
  "Outlet",
  OutletSchema
);

export default Outlet;

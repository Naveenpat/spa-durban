import mongoose, { Document, ObjectId } from "mongoose";
import timestamp from "../../plugins/timeStamp.plugin";
import { paginate } from "../../plugins/pagination.plugin";
import {
  DateFilter,
  FilterByItem,
  RangeFilter,
} from "../../../utils/interface";

export interface Product {
  productId: ObjectId;
  quantity: number;
}

export interface ServiceDocument extends Document {
  _id: ObjectId;
  serviceName: string;
  categoryId: ObjectId;
  subCategoryId: ObjectId;
  serviceCode: string;
  sellingPrice: number;
  outletIds: ObjectId;
  description: string;
  termsAndConditions: string;
  serviceImageUrl: string;
  products: Product[];
  taxId: ObjectId | null;
  taxType: string;
  taxPercent: number;
  isDeleted: boolean;
  isActive: boolean;
  bookingTreatmentsId: string;
  duration: string;
  colorCode: string;
  priority: number;
  pinned: boolean;
  cashback: number;
}

export interface ServiceModel extends mongoose.Model<ServiceDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: ServiceDocument[];
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

const ServiceSchema = new mongoose.Schema<ServiceDocument>(
  {
    serviceName: {
      type: String,
      unique: true,
      required: false,
      trim: true,
      lowercase: true,
    },
    categoryId: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: false,
      trim: true,
    },
    subCategoryId: {
      type: mongoose.Types.ObjectId,
      ref: "SubCategory",
      default: null,
      trim: true,
    },
    serviceCode: {
      type: String,
      default: "",
      trim: true,
    },
    sellingPrice: {
      type: Number,
      required: false,
      trim: true,
    },
    outletIds: {
      type: [mongoose.Types.ObjectId],
      ref: "Outlet",
      required: false,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    termsAndConditions: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    serviceImageUrl: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    products: {
      type: [
        {
          productId: {
            type: mongoose.Types.ObjectId,
            trim: true,
            default: null,
          },
          quantity: {
            type: Number,
            trim: true,
          },
        },
      ],
      default: [],
    },
    taxId: {
      type: mongoose.Types.ObjectId,
      ref: "Tax",
      default: null,
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
    bookingTreatmentsId: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "",
    },
    priority: {
      type: Number,
      default: null,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    cashback: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
  }
);

// Add plugin that converts mongoose to JSON
paginate(ServiceSchema);

// Apply the timestamp plugin to the Service schema
timestamp(ServiceSchema);

export const allowedDateFilterKeys = ["createdAt", "updatedAt"];
export const searchKeys = ["serviceName", "description"];
const Service = mongoose.model<ServiceDocument, ServiceModel>(
  "Service",
  ServiceSchema
);

export default Service;

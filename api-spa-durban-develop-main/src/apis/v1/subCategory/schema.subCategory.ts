import mongoose, { Document, ObjectId } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"

export interface SubCategoryDocument extends Document {
  categoryId: ObjectId
  subCategoryName: string
  description: string
  isDeleted: boolean
  isActive: boolean
}

export interface SubCategoryModel extends mongoose.Model<SubCategoryDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: SubCategoryDocument[]
    page: number
    limit: number
    totalPages: number
    totalResults: number
    search: string
    dateFilter: DateFilter | undefined
    filterBy: FilterByItem | undefined
    rangeFilterBy: RangeFilter | undefined
    additionalQuery?: any
    isPaginationRequired: boolean | undefined
  }>
}

const SubCategorySchema = new mongoose.Schema<SubCategoryDocument>(
  {
    categoryId: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryName: {
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
paginate(SubCategorySchema)

// // Apply the timestamp plugin to the SubCategory schema
timestamp(SubCategorySchema)

export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = ["subCategoryName", "description"]
const SubCategory = mongoose.model<SubCategoryDocument, SubCategoryModel>(
  "SubCategory",
  SubCategorySchema
)

export default SubCategory

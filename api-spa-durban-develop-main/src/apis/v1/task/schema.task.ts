import mongoose, { Document, ObjectId } from "mongoose"
import timestamp from "../../plugins/timeStamp.plugin"
import { paginate } from "../../plugins/pagination.plugin"
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"

export interface TaskDocument extends Document {
  _id: ObjectId
  task: string
  description: string
  outletsId: [ObjectId]
  userId: ObjectId
  userName: string
  isDeleted: boolean
  isActive: boolean
}

export interface TaskModel extends mongoose.Model<TaskDocument> {
  isTaskTaken(
    task: string,
    excludetaskId?: mongoose.Types.ObjectId
  ): Promise<boolean>
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: TaskDocument[]
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

const TaskSchema = new mongoose.Schema<TaskDocument>(
  {
    task: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    outletsId: {
      type: [mongoose.Schema.Types.ObjectId],
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
paginate(TaskSchema)

// // Apply the timestamp plugin to the Task schema
timestamp(TaskSchema)

// Static method to check if email is taken
TaskSchema.statics.isTaskTaken = async function (
  task: string,
  excludetaskId?: mongoose.Types.ObjectId
) {
  const taskFound = await this.findOne({
    task,
    _id: { $ne: excludetaskId },
  })
  return !!taskFound
}

export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = ["task", "description"]
const Task = mongoose.model<TaskDocument, TaskModel>("Task", TaskSchema)

export default Task

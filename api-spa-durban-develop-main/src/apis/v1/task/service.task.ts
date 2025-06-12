import httpStatus from "http-status"
import Task, { TaskDocument } from "./schema.task" // Adjust TaskDocument based on your schema setup
import ApiError from "../../../../utilities/apiError"
import mongoose from "mongoose"
import { RangeFilter } from "../../../utils/interface"
import config from "../../../../config/config"
import { sendEmail } from "../../../helper/sendEmail"

/**
 * Create a task
 * @param {Object} taskBody
 * @returns {Promise<TaskDocument>}
 */
const createTask = async (taskBody: any): Promise<TaskDocument> => {
  if (await Task.isTaskTaken(taskBody.task)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Task name already taken")
  }
  return Task.create(taskBody)
}

/**
 * Query for tasks
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @param {any} [options.isPaginationRequired] - isPaginationRequired
 * @returns {Promise<{ data: TaskDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryTasks = async (
  filter: any,
  options: any
): Promise<{
  data: TaskDocument[]
  page: number
  limit: number
  totalPages: number
  totalResults: number
  search: any
  dateFilter: any
  filterBy: any
  rangeFilterBy: RangeFilter | undefined
  isPaginationRequired: boolean | undefined
}> => {
  const tasks = await Task.paginate(filter, options)
  return tasks
}

/**
 * Update task by id
 * @param {string | number} taskId
 * @param {Object} updateBody
 * @returns {Promise<TaskDocument>}
 */
const updateTaskById = async (
  taskId: string | number,
  updateBody: any
): Promise<TaskDocument> => {
  const task = await getTaskById(taskId)
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found")
  }

  Object.assign(task, updateBody)
  await task.save()
  return task
}

/**
 * Delete task by id
 * @param {string | number} taskId
 * @returns {Promise<TaskDocument>}
 */
const deleteTaskById = async (
  taskId: string | number
): Promise<TaskDocument> => {
  const task = await getTaskById(taskId)
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found")
  }
  await Task.updateOne({ _id: task._id }, { isDeleted: true }, { new: true })
  return task
}

interface FilterObject {
  [key: string]: any // Adjust any as per your field types
}

interface ExistsResult {
  exists: boolean
  existsSummary: string
}

/**
 * Check if certain conditions exist in the database
 * @param {Array<FilterObject>} filterArray - Array of filters to check
 * @param {Array<string>} exceptIds - Array of IDs to exclude from checks
 * @param {Boolean} combined - Whether to combine filters with AND logic
 * @returns {Promise<ExistsResult>}
 */
const isExists = async (
  filterArray: FilterObject[],
  exceptIds: string[] = [],
  combined: boolean = false
): Promise<ExistsResult> => {
  if (combined) {
    let combinedObj = await combineObjects(filterArray)
    if (exceptIds.length > 0) {
      combinedObj["_id"] = { $nin: exceptIds }
    }
    if (await getOneByMultiField({ ...combinedObj })) {
      return {
        exists: true,
        existsSummary: `${Object.keys(combinedObj)} already exist.`,
      }
    }
    return { exists: false, existsSummary: "" }
  }

  let mappedArray = await Promise.all(
    filterArray.map(async (element) => {
      if (exceptIds.length > 0) {
        element["_id"] = { $nin: exceptIds }
      }
      if (await getOneByMultiField({ ...element })) {
        return { exists: true, fieldName: Object.keys(element)[0] }
      }
      return { exists: false, fieldName: Object.keys(element)[0] }
    })
  )

  return mappedArray.reduce(
    (acc, ele) => {
      if (ele.exists) {
        acc.exists = true
        acc.existsSummary += `${ele.fieldName.toLowerCase()} already exist. `
      }
      return acc
    },
    { exists: false, existsSummary: "" } as ExistsResult // Ensure initial type assignment
  )
}

// Example functions used in the code, add typings accordingly
async function combineObjects(
  filterArray: FilterObject[]
): Promise<FilterObject> {
  // Implementation
  return {} as FilterObject
}

async function getOneByMultiField(filter: FilterObject): Promise<boolean> {
  // Implementation
  return false
}

/**
 * Get Task by id
 * @param {string | number} id
 * @returns {Promise<TaskDocument | null>}
 */
const getTaskById = async (
  id: string | number
): Promise<TaskDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return Task.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    })
  }
  return null
}

/**
 * Get Tasks by an array of IDs
 * @param {Array<string | number>} ids
 * @returns {Promise<Array<TaskDocument | null>>}
 */
const getTasksByIds = async (
  ids: Array<string | number>
): Promise<Array<TaskDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id))
  return Task.find({ _id: { $in: objectIds }, isDeleted: false }).exec()
}

/**
 * send email to all the employees
 */

const sendTaskEmailEmployee = async (taskId: string, userData: any) => {
  let taskDetail = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    {
      $unwind: "$outletsId",
    },
    {
      $lookup: {
        from: "employees",
        localField: "outletsId",
        foreignField: "outletsId",
        as: "employees",
        pipeline: [
          {
            $match: {
              isDeleted: false,
            },
          },
          {
            $project: {
              email: 1,
              name: 1,
              _id: 0,
            },
          },
        ],
      },
    },
    {
      $match: {
        "employees.email": { $ne: null },
      },
    },
    {
      $group: {
        _id: "$_id",
        task: { $first: "$task" },
        description: { $first: "$description" },
        employees: { $push: "$employees" },
      },
    },
    {
      $project: {
        task: 1,
        description: 1,
        employee: {
          $reduce: {
            input: "$employees",
            initialValue: [],
            in: {
              $concatArrays: ["$$value", "$$this"],
            },
          },
        },
      },
    },
    {
      $unwind: "$employee",
    },
    {
      $project: {
        email: "$employee.email",
        task: "$task",
        description: "$description",
        _id: 0,
      },
    },
  ])

  if (taskDetail && taskDetail.length) {
    let emailBody = `<p><strong>Dear Employee,<br /><br /></strong>A new task was added by ${userData.name} for your outlet.</p>
                     <p><strong>Task</strong>: ${taskDetail[0].task}</p>
                     <p><strong>Description</strong>: ${taskDetail[0].description}<br /><br /><br /></p>
                     <p>&nbsp;</p>`
    let sendTo = taskDetail.map((ele) => ele.email)
    let emailData = {
      emailSubject: "New task was added.",
      emailBody: emailBody,
      sendTo: sendTo,
      sendFrom: config.smtp_mail_email,
      attachments: [],
    }
    const sendEmailResult = await sendEmail(emailData)
    // console.log(sendEmailResult, "sendEmailResult")
  }
  return taskDetail
}

export {
  createTask,
  queryTasks,
  updateTaskById,
  deleteTaskById,
  isExists,
  getTaskById,
  getTasksByIds,
  sendTaskEmailEmployee,
}

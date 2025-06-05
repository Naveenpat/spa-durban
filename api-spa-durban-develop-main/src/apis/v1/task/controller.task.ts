import { Request, Response } from "express"
import httpStatus from "http-status"
import { pick } from "../../../../utilities/pick"
import ApiError from "../../../../utilities/apiError"
import catchAsync from "../../../../utilities/catchAsync"
import { taskService, outletService } from "../service.index"
import {
  DateFilter,
  RangeFilter,
  AuthenticatedRequest,
} from "../../../utils/interface"
import { UserEnum } from "../../../utils/enumUtils"
import {
  getFilterQuery,
  getRangeQuery,
  getSearchQuery,
  checkInvalidParams,
  getDateFilterQuery,
} from "../../../utils/utils"
import mongoose from "mongoose"
import { searchKeys, allowedDateFilterKeys, TaskDocument } from "./schema.task"

const createTask = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let { task, outletsId, description } = req.body

    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication Failed")
    }
    /*
     * check outlet exist
     */
    const outletIds = req.body.outletsId // Assuming this is an array of Object IDs

    // Fetch all outlets by their IDs
    const outlets = await Promise.all(
      outletIds.map((id: any) => outletService.getOutletById(id))
    )

    // Check if any outlet is not found
    const notFoundOutlets = outlets.filter((outlet) => !outlet)

    if (notFoundOutlets.length > 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "One or more outlets not found")
    }
    req.body["userId"] = req.userData.Id
    req.body["userName"] = req.userData.name

    const result: TaskDocument | null = await taskService.createTask(req.body)

    if (!result) {
      throw new ApiError(httpStatus.NOT_FOUND, "Couldn't create task.")
    }
    let { _id } = result
    let sentTaskEmailToEmployees = await taskService.sendTaskEmailEmployee(
      _id.toString(),
      req.userData
    )
    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: result,
      status: true,
      code: "CREATED",
      issue: null,
    })
  }
)

const getTasks = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const filter = pick(req.query, [])
    const options = pick(req.query, [
      "sortBy",
      "limit",
      "page",
      "searchValue",
      "searchIn",
      "dateFilter",
      "rangeFilterBy",
      "isPaginationRequired",
    ])
    // Extract searchValue from req.query
    const searchValue = req.query.searchValue as string | undefined
    const searchIn = req.query.searchIn as string[] | null
    const dateFilter = req.query.dateFilter as DateFilter | null
    const filterBy = req.query.filterBy as any[]
    const rangeFilterBy = req.query.rangeFilterBy as RangeFilter | undefined
    const isPaginationRequiredParam = req.query.isPaginationRequired
    const isAdmin = req?.userData?.userType === UserEnum.Admin
    let outletQuery = {}

    let allOutlets = req?.userData?.outletsData?.map((ele: any) => {
      return new mongoose.Types.ObjectId(ele?._id)
    })

    if (!isAdmin) {
      outletQuery = {
        outletsId: {
          $in: allOutlets,
        },
      }
    }

    if (isPaginationRequiredParam !== undefined) {
      const isPaginationRequired = isPaginationRequiredParam === "true"
      options.isPaginationRequired = isPaginationRequired as any
    }

    // Add searchValue to options if it exists
    if (searchValue) {
      let searchQueryCheck = checkInvalidParams(
        searchIn ? searchIn : [],
        searchKeys
      )

      if (searchQueryCheck && !searchQueryCheck.status) {
        return res.status(httpStatus.OK).send({
          ...searchQueryCheck,
        })
      }
      // Extract search query from options
      const searchQuery = getSearchQuery(
        searchIn ? searchIn : [],
        searchKeys,
        searchValue
      )
      if (searchQuery !== null) {
        options["search"] = { $or: searchQuery } as any
      }
    }

    //date filter
    if (dateFilter) {
      const datefilterQuery = await getDateFilterQuery(
        dateFilter,
        allowedDateFilterKeys
      )

      if (datefilterQuery && datefilterQuery.length) {
        options["dateFilter"] = { $and: datefilterQuery } as any
      }
    }

    //range filter
    if (rangeFilterBy !== undefined) {
      const rangeQuery = getRangeQuery(rangeFilterBy)

      if (rangeQuery && rangeQuery.length) {
        options["rangeFilterBy"] = { $and: rangeQuery } as any
      }
    }

    //check filter by
    if (filterBy?.length) {
      const booleanFields: string[] = ["isActive"]
      const numberFileds: string[] = []
      const objectIdFileds: string[] = []
      const withoutRegexFields: string[] = []

      const filterQuery = getFilterQuery(
        filterBy,
        booleanFields,
        numberFileds,
        objectIdFileds,
        withoutRegexFields
      )
      if (filterQuery) {
        options["filterBy"] = { $and: filterQuery } as any
      }
    }
    const result = await taskService.queryTasks(filter, options)
    return res.status(httpStatus.OK).send(result)
  }
)

const getTask = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.getTaskById(req.params.taskId)
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found")
  }
  return res.status(httpStatus.OK).send({
    message: "Successfull",
    data: task,
    status: true,
    code: "OK",
    issue: null,
  })
})

const updateTask = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let { task, outletsId, description } = req.body

    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication Failed")
    }
    /*
     * check outlet exist
     */
    const outletIds = req.body.outletsId // Assuming this is an array of Object IDs

    // Fetch all outlets by their IDs
    const outlets = await Promise.all(
      outletIds.map((id: any) => outletService.getOutletById(id))
    )

    // Check if any outlet is not found
    const notFoundOutlets = outlets.filter((outlet) => !outlet)

    if (notFoundOutlets.length > 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "One or more outlets not found")
    }

    req.body["userId"] = req.userData.Id
    req.body["userName"] = req.userData.name

    const result = await taskService.updateTaskById(req.params.taskId, req.body)
    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: result,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const deleteTask = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await taskService.deleteTaskById(req.params.taskId)
    return res.status(httpStatus.OK).send({
      message: "Successfull",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

export { createTask, getTasks, getTask, updateTask, deleteTask }

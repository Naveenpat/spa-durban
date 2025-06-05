import { Request, Response } from "express"
import httpStatus from "http-status"
import { pick } from "../../../../utilities/pick"
import ApiError from "../../../../utilities/apiError"
import catchAsync from "../../../../utilities/catchAsync"
import { roleService } from "../service.index" // Adjusted import
import {
  DateFilter,
  RangeFilter,
  AuthenticatedRequest,
} from "../../../utils/interface"
import {
  getFilterQuery,
  getRangeQuery,
  getSearchQuery,
  checkInvalidParams,
  getDateFilterQuery,
} from "../../../utils/utils"
import { searchKeys, allowedDateFilterKeys } from "./schema.role"

const createRole = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const role = await roleService.createRole(req.body)
    return res.status(httpStatus.CREATED).send({
      message: "Added Successfully!",
      data: role,
      status: true,
      code: "CREATED",
      issue: null,
    })
  }
)

const getRoles = catchAsync(
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
    ])
    // Extract searchValue from req.query
    const searchValue = req.query.searchValue as string | undefined
    const searchIn = req.query.searchIn as string[] | null
    const dateFilter = req.query.dateFilter as DateFilter | null
    const filterBy = req.query.filterBy as any[]
    const rangeFilterBy = req.query.rangeFilterBy as RangeFilter | undefined
    const isPaginationRequiredParam = req.query.isPaginationRequired

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
    const result = await roleService.queryRoles(filter, options)
    return res.status(httpStatus.OK).send(result)
  }
)

const getRole = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const role = await roleService.getRoleById(req.params.roleId)
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, "Role not found")
  }
  return res.status(httpStatus.OK).send({
    message: "Successfull.",
    data: role,
    status: true,
    code: "OK",
    issue: null,
  })
})

const updateRole = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const role = await roleService.updateRoleById(req.params.roleId, req.body)
    return res.status(httpStatus.OK).send({
      message: "Updated Successfully!",
      data: role,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const deleteRole = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await roleService.deleteRoleById(req.params.roleId)
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

export { createRole, getRoles, getRole, updateRole, deleteRole }

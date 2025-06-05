import { Request, Response } from "express"
import httpStatus from "http-status"
import { pick } from "../../../../utilities/pick"
import ApiError from "../../../../utilities/apiError"
import catchAsync from "../../../../utilities/catchAsync"
import { taxService } from "../service.index"
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
import { searchKeys, allowedDateFilterKeys } from "./schema.tax"

const createTax = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const tax = await taxService.createTax(req.body)
    return res.status(httpStatus.CREATED).send({
      message: "Added Successfully!",
      data: tax,
      status: true,
      code: "CREATED",
      issue: null,
    })
  }
)

const getTaxs = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
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

  const dateFilter = req.query.dateFilter as DateFilter | undefined
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
      searchIn?.length ? searchIn?.flat() : [],
      searchKeys
    )

    if (searchQueryCheck && !searchQueryCheck.status) {
      return res.status(httpStatus.OK).send({
        ...searchQueryCheck,
      })
    }
    // Extract search query from options
    const searchQuery = getSearchQuery(
      searchIn?.flat(),
      searchKeys,
      searchValue
    )
    if (searchQuery !== null) {
      options["search"] = { $or: searchQuery } as any
    }
  }

  //date filter
  if (dateFilter !== undefined) {
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
  const result = await taxService.queryTaxs(filter, options)
  return res.status(httpStatus.OK).send(result)
})

const getTax = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const tax = await taxService.getTaxById(req.params.taxId)
  if (!tax) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tax not found")
  }
  return res.status(httpStatus.OK).send({
    message: "Successfull.",
    data: tax,
    status: true,
    code: "Ok",
    issue: null,
  })
})

const updateTax = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const tax = await taxService.updateTaxById(req.params.taxId, req.body)
    return res.status(httpStatus.OK).send({
      message: "Updated Successfully!",
      data: tax,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const deleteTax = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await taxService.deleteTaxById(req.params.taxId)
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: null,
      status: true,
      code: "CREATED",
      issue: null,
    })
  }
)

export { createTax, getTaxs, getTax, updateTax, deleteTax }

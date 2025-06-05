import { Request, Response } from "express"
import httpStatus from "http-status"
import { pick } from "../../../../utilities/pick"
import ApiError from "../../../../utilities/apiError"
import catchAsync from "../../../../utilities/catchAsync"
import { measurementUnitService } from "../service.index"
import {
  DateFilter,
  FilterByItem,
  FilterQueryResult,
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
import { searchKeys, allowedDateFilterKeys } from "./schema.measurementUnit"

const createMeasurementUnit = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const measurementUnit = await measurementUnitService.createMeasurementUnit(
      req.body
    )
    return res.status(httpStatus.CREATED).send({
      message: "Addedd successfully!",
      data: measurementUnit,
      status: true,
      code: "CREATED",
      issue: null,
    })
  }
)

const getMeasurementUnits = catchAsync(
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
    const result = await measurementUnitService.queryMeasurementUnits(
      filter,
      options
    )
    return res.status(httpStatus.OK).send(result)
  }
)

const getMeasurementUnit = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const measurementUnit = await measurementUnitService.getMeasurementUnitById(
      req.params.measurementUnitId
    )
    if (!measurementUnit) {
      throw new ApiError(httpStatus.NOT_FOUND, "MeasurementUnit not found")
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: measurementUnit,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const updateMeasurementUnit = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const measurementUnit =
      await measurementUnitService.updateMeasurementUnitById(
        req.params.measurementUnitId,
        req.body
      )
    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: measurementUnit,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const deleteMeasurementUnit = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await measurementUnitService.deleteMeasurementUnitById(
      req.params.measurementUnitId
    )
    return res.status(httpStatus.OK).send({
      message: "Successfull",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

export {
  createMeasurementUnit,
  getMeasurementUnits,
  getMeasurementUnit,
  updateMeasurementUnit,
  deleteMeasurementUnit,
}

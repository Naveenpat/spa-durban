import { Request, Response } from "express"
import httpStatus from "http-status"
import { pick } from "../../../../utilities/pick"
import ApiError from "../../../../utilities/apiError"
import catchAsync from "../../../../utilities/catchAsync"
import { paymentModeService } from "../service.index"
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
import { searchKeys, allowedDateFilterKeys } from "./schema.paymentMode"

const createPaymentMode = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paymentMode = await paymentModeService.createPaymentMode(req.body)
    return res.status(httpStatus.CREATED).send({
      message: "Added Successfully!",
      data: paymentMode,
      status: true,
      code: "CREATED",
      issue: null,
    })
  }
)

const getPaymentModes = catchAsync(
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
    const result = await paymentModeService.queryPaymentModes(filter, options)
    return res.status(httpStatus.OK).send(result)
  }
)

const getPaymentMode = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paymentMode = await paymentModeService.getPaymentModeById(
      req.params.paymentModeId
    )
    if (!paymentMode) {
      throw new ApiError(httpStatus.NOT_FOUND, "PaymentMode not found")
    }
    return res.status(httpStatus.OK).send(paymentMode)
  }
)

const updatePaymentMode = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paymentMode = await paymentModeService.updatePaymentModeById(
      req.params.paymentModeId,
      req.body
    )
    return res.status(httpStatus.OK).send({
      message: "Successfull",
      data: paymentMode,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const deletePaymentMode = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await paymentModeService.deletePaymentModeById(req.params.paymentModeId)
    return res.status(httpStatus.OK).send({
      message: "Successfull",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const togglePaymentModeStatus = catchAsync(
  async (req: Request, res: Response) => {
    const updatedPaymentMode =
      await paymentModeService.togglePaymentModeStatusById(
        req.params.paymentModeId
      )
    return res.status(httpStatus.OK).send({
      message: "Status updated successfully.",
      data: updatedPaymentMode,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

export {
  createPaymentMode,
  getPaymentModes,
  getPaymentMode,
  updatePaymentMode,
  deletePaymentMode,
  togglePaymentModeStatus,
}

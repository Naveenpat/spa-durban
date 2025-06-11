import { Request, Response } from "express"
import httpStatus from "http-status"
import { pick } from "../../../../utilities/pick"
import ApiError from "../../../../utilities/apiError"
import catchAsync from "../../../../utilities/catchAsync"
import { outletService } from "../service.index"
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
import { searchKeys, allowedDateFilterKeys } from "./schema.outlet"
import mongoose from "mongoose"

const createOutlet = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const outlet = await outletService.createOutlet(req.body)
    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: outlet,
      status: true,
      code: "CREATED",
      issue: null,
    })
  }
)

const getOutlets = catchAsync(
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
      const objectIdFileds: string[] = ["onlinePaymentAccountId"]

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

    
    const result = await outletService.queryOutlets(filter, options)
    return res.status(httpStatus.OK).send(result)
  }
)

const getOutlet = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const outlet = await outletService.getOutletById(req.params.outletId)

    if (!outlet) {
      throw new ApiError(httpStatus.NOT_FOUND, "Outlet not found")
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: outlet,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const getOutletsBYCompany = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { companyId } = req.params;

    const outlets = await outletService.getOutletsByCompanyId(companyId);

    return res.status(httpStatus.OK).send({
      message: 'Fetched outlets successfully',
      data: outlets,
      status: true,
      code: 'OK',
      issue: null,
    });
  }
);


const updateOutlet = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const outlet = await outletService.updateOutletById(
      req.params.outletId,
      req.body
    )
    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: outlet,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const deleteOutlet = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await outletService.deleteOutletById(req.params.outletId)
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const toggleOutletStatus = catchAsync(async (req: Request, res: Response) => {
  const updatedOutlet = await outletService.toggleOutletStatusById(
    req.params.outletId
  )
  return res.status(httpStatus.OK).send({
    message: "Status updated successfully.",
    data: updatedOutlet,
    status: true,
    code: "OK",
    issue: null,
  })
})

export {
  createOutlet,
  getOutlets,
  getOutlet,
  updateOutlet,
  deleteOutlet,
  toggleOutletStatus,
  getOutletsBYCompany
}

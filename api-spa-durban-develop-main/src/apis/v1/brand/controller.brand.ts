import { Request, Response } from "express"
import httpStatus from "http-status"
import { pick } from "../../../../utilities/pick"
import ApiError from "../../../../utilities/apiError"
import catchAsync from "../../../../utilities/catchAsync"
import { brandService } from "../service.index"
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

import { searchKeys, allowedDateFilterKeys } from "./schema.brand"

const createBrand = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const brand = await brandService.createBrand(req.body)
    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: brand,
      status: true,
      code: "CREATED",
      issue: null,
    })
  }
)

const getBrands = catchAsync(
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
    const result = await brandService.queryBrands(filter, options)
    return res.status(httpStatus.OK).send(result)
  }
)

const getBrand = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const brand = await brandService.getBrandById(req.params.brandId)
    if (!brand) {
      throw new ApiError(httpStatus.NOT_FOUND, "Brand not found")
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull",
      data: brand,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const updateBrand = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const brand = await brandService.updateBrandById(
      req.params.brandId,
      req.body
    )
    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: brand,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const deleteBrand = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await brandService.deleteBrandById(req.params.brandId)
    return res.status(httpStatus.OK).send({
      message: "Successfull",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

export { createBrand, getBrands, getBrand, updateBrand, deleteBrand }

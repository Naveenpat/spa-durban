import { Request, Response } from "express"
import httpStatus from "http-status"
import { pick } from "../../../../utilities/pick"
import ApiError from "../../../../utilities/apiError"
import catchAsync from "../../../../utilities/catchAsync"
import { subCategoryService, categoryService } from "../service.index"

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
import { searchKeys, allowedDateFilterKeys } from "./schema.subCategory"

const createSubCategory = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let categoryExists = await categoryService.getCategoryById(
      req?.body?.categoryId
    )
    if (!categoryExists) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid category!")
    }
    const subCategory = await subCategoryService.createSubCategory(req.body)
    return res.status(httpStatus.CREATED).send({
      message: "Added Successfully!",
      data: subCategory,
      status: true,
      code: "CREATED",
      issue: null,
    })
  }
)

const getSubCategorys = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const filter = pick(req.query, ["categoryId"])
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
      const objectIdFileds: string[] = ["categoryId"]

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

    let additionalQuery = [
      {
        $lookup: {
          from: "categories", // The collection name in MongoDB
          localField: "categoryId", // The field in the Employee collection
          foreignField: "_id", // The field in the Category collection
          as: "categoryDetails", // The field name for the joined category data
          pipeline: [
            {
              $project: {
                categoryName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          categoryName: {
            $arrayElemAt: ["$categoryDetails.categoryName", 0],
          },
        },
      },
      {
        $unset: ["categoryDetails"],
      },
    ]
    options["additionalQuery"] = additionalQuery as any
    const result = await subCategoryService.querySubCategorys(filter, options)
    return res.status(httpStatus.OK).send(result)
  }
)

const getSubCategory = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const subCategory = await subCategoryService.getSubCategoryById(
      req.params.subCategoryId
    )
    if (!subCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, "SubCategory not found")
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: subCategory,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const updateSubCategory = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let categoryExists = await categoryService.getCategoryById(
      req?.body?.categoryId
    )
    if (!categoryExists) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid category!")
    }
    const subCategory = await subCategoryService.updateSubCategoryById(
      req.params.subCategoryId,
      req.body
    )
    return res.status(httpStatus.OK).send({
      message: "Updated Successfully!",
      data: subCategory,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const deleteSubCategory = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await subCategoryService.deleteSubCategoryById(req.params.subCategoryId)
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

export {
  createSubCategory,
  getSubCategorys,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
}

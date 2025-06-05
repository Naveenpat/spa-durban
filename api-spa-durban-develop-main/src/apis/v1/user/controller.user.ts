import { Request, Response } from "express"
import httpStatus from "http-status"
import { pick } from "../../../../utilities/pick"
import ApiError from "../../../../utilities/apiError"
import catchAsync from "../../../../utilities/catchAsync"
import { userService } from "../service.index"
import {
  getSearchQuery,
  checkInvalidParams,
  getDateFilterQuery,
  getFilterQuery,
  getRangeQuery,
} from "../../../utils/utils"
import { searchKeys, allowedDateFilterKeys } from "./schema.user"
import {
  DateFilter,
  RangeFilter,
  AuthenticatedRequest,
} from "../../../utils/interface"
import { UserEnum } from "../../../utils/enumUtils"
import mongoose from "mongoose"

const getUsers = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const filter = pick(req.query, ["name", "userType"])
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
      const objectIdFileds: string[] = ["_id"]

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
    const result = await userService.queryUsers(filter, options)
    return res.status(httpStatus.OK).send(result)
  }
)

const getUser = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  let aggregateQuery = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.params.userId),
        isDeleted: false,
      },
    },
    {
      $addFields: {
        employeeId: {
          $cond: {
            if: { $eq: ["$userType", UserEnum.Employee] },
            then: { $toObjectId: "$_id" },
            else: null,
          },
        },
        customerId: {
          $cond: {
            if: { $eq: ["$userType", UserEnum.Customer] },
            then: { $toObjectId: "$_id" },
            else: null,
          },
        },
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "employeeId",
        foreignField: "_id",
        as: "employee",
        pipeline: [
          {
            $lookup: {
              from: "outlets",
              localField: "outletsId",
              foreignField: "_id",
              as: "outlets",
              pipeline: [
                {
                  $project: {
                    name: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customer",
      },
    },
    {
      $addFields: {
        salesCommissionPercent: {
          $cond: {
            if: { $eq: ["$userType", UserEnum.Employee] },
            then: { $arrayElemAt: ["$employee.salesCommissionPercent", 0] },
            else: "$$REMOVE",
          },
        },
        address: {
          $cond: {
            if: { $eq: ["$userType", UserEnum.Employee] },
            then: { $arrayElemAt: ["$employee.address", 0] },
            else: { $arrayElemAt: ["$customer.address", 0] },
          },
        },
        region: {
          $cond: {
            if: { $eq: ["$userType", UserEnum.Employee] },
            then: { $arrayElemAt: ["$employee.region", 0] },
            else: { $arrayElemAt: ["$customer.region", 0] },
          },
        },
        city: {
          $cond: {
            if: { $eq: ["$userType", UserEnum.Employee] },
            then: { $arrayElemAt: ["$employee.city", 0] },
            else: { $arrayElemAt: ["$customer.city", 0] },
          },
        },
        country: {
          $cond: {
            if: { $eq: ["$userType", UserEnum.Employee] },
            then: { $arrayElemAt: ["$employee.country", 0] },
            else: { $arrayElemAt: ["$customer.country", 0] },
          },
        },
        outlets: {
          $cond: {
            if: { $eq: ["$userType", UserEnum.Employee] },
            then: { $arrayElemAt: ["$employee.outlets", 0] },
            else: "$$REMOVE",
          },
        },
        taxNo: {
          $cond: {
            if: { $eq: ["$userType", UserEnum.Customer] },
            then: { $arrayElemAt: ["$customer.taxNo", 0] },
            else: "$$REMOVE",
          },
        },
        dateOfBirth: {
          $cond: {
            if: { $eq: ["$userType", UserEnum.Customer] },
            then: { $arrayElemAt: ["$customer.dateOfBirth", 0] },
            else: "$$REMOVE",
          },
        },
        gender: {
          $cond: {
            if: { $eq: ["$userType", UserEnum.Customer] },
            then: { $arrayElemAt: ["$customer.gender", 0] },
            else: "$$REMOVE",
          },
        },
        totalLoyaltyPoints: {
          $cond: {
            if: { $eq: ["$userType", UserEnum.Customer] },
            then: { $arrayElemAt: ["$customer.totalLoyaltyPoints", 0] },
            else: "$$REMOVE",
          },
        },
      },
    },
    {
      $unset: ["employee", "customer"],
    },
  ]

  const user = await userService.getUserAggrigate(aggregateQuery)
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found")
  }

  return res.status(httpStatus.OK).send({
    message: "Successfull.",
    data: user,
    status: true,
    code: "OK",
    issue: null,
  })
})

export { getUsers, getUser }

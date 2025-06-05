import { Request, Response } from "express"
import httpStatus from "http-status"
import { pick } from "../../../../utilities/pick"
import ApiError from "../../../../utilities/apiError"
import catchAsync from "../../../../utilities/catchAsync"
import { couponService, userService } from "../service.index"
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
import { searchKeys, allowedDateFilterKeys } from "./schema.coupon"

const createCoupon = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req?.body?.user
    let { type, referralCode } = req.body

    if (userId) {
      // User exists check
      let userExists = await userService.getUserById(userId)
      if (!userExists) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user!")
      }
    }

    const { exists, existsSummary } = await couponService.isExists(
      [{ type }, { referralCode }],
      [],
      true
    )
    if (exists) {
      throw new ApiError(httpStatus.BAD_REQUEST, existsSummary)
    }

    const coupon = await couponService.createCoupon(req.body)
    return res.status(httpStatus.OK).status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: coupon,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const getCoupons = catchAsync(
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

    // Add searchValue to options if it exists
    if (searchValue) {
      let searchQueryCheck = checkInvalidParams(
        searchIn ? searchIn : [],
        searchKeys
      )

      if (searchQueryCheck && !searchQueryCheck.status) {
        return res
          .status(httpStatus.OK)
          .status(httpStatus.OK)
          .send({
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
      const objectIdFileds: string[] = ["user"]
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
          from: "users", // The collection name in MongoDB
          localField: "user", // The field in the Service collection
          foreignField: "_id", // The field in the Outlet collection
          as: "userData", // The field name for the joined outlet data
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          userName: {
            $arrayElemAt: ["$userData.name", 0],
          },
        },
      },
      {
        $unset: ["userData"],
      },
    ]
    options["additionalQuery"] = additionalQuery as any
    const result = await couponService.queryCoupons(filter, options)
    return res.status(httpStatus.OK).send(result)
  }
)

const getCoupon = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const coupon = await couponService.getCouponById(req.params.couponId)
    if (!coupon) {
      throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found")
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: coupon,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const updateCoupon = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req?.body?.user
    let { type, referralCode } = req.body
    if (userId) {
      // User exists check
      let userExists = await userService.getUserById(userId)
      if (!userExists) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user!")
      }
    }
    const { exists, existsSummary } = await couponService.isExists(
      [{ type }, { referralCode }],
      [req.params.couponId],
      true
    )
    if (exists) {
      throw new ApiError(httpStatus.BAD_REQUEST, existsSummary)
    }

    const coupon = await couponService.updateCouponById(
      req.params.couponId,
      req.body
    )
    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: coupon,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const deleteCoupon = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await couponService.deleteCouponById(req.params.couponId)
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const toggleCouponStatus = catchAsync(async (req: Request, res: Response) => {
  const updatedCoupon = await couponService.toggleCouponStatusById(
    req.params.couponId
  )
  return res.status(httpStatus.OK).send({
    message: "Status updated successfully.",
    data: updatedCoupon,
    status: true,
    code: "OK",
    issue: null,
  })
})

export {
  createCoupon,
  getCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
}

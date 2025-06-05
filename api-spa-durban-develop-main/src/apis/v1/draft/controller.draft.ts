import { Request, Response } from "express"
import { format } from "date-fns"
import httpStatus from "http-status"
import { pick } from "../../../../utilities/pick"
import ApiError from "../../../../utilities/apiError"
import catchAsync from "../../../../utilities/catchAsync"
import { draftService } from "../service.index"
import {
  AuthenticatedRequest,
  DateFilter,
  RangeFilter,
} from "../../../utils/interface"
import {
  getFilterQuery,
  getRangeQuery,
  getSearchQuery,
  checkInvalidParams,
  getDateFilterQuery,
} from "../../../utils/utils"
import { searchKeys, allowedDateFilterKeys } from "./schema.draft"
import * as draftHelper from "./helper.draft"
import { getPreview } from "./helper.preDraft"
import mongoose from "mongoose"

const createDraft = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    /**
     * employeeId = req.userData.Id
     */
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token")
    }
    let {
      amountReceived,

      outletId,
    } = req.body

    //get pre invoicing phase
    const previewResult = await getPreview(req)
    if (!previewResult) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Something Went Wrong"
      )
    }
    let { dataToResponse, dataToUpdate, otherData } = previewResult
    if (!previewResult.status) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Something Went Wrong"
      )
    }
    let { draftData } = dataToResponse

    let {
      pointsToAdd,
      pointsToDebit,
      walletDebitLog,
      walletCreditLog,
      inventoryData,
    } = dataToUpdate
    let { outlet } = otherData

    //check payment methods
    if (amountReceived.length) {
      const paymentMethods = await draftHelper.checkPaymentMethods(
        amountReceived
      )

      if (!paymentMethods) {
        throw new ApiError(httpStatus.NOT_FOUND, "Invalid payment mode.")
      }
    }

    // get due amount
    let { balanceDue, amountPaid } = await draftHelper.getBalanceDue(
      draftData.totalAmount,
      amountReceived,
      0 //previouslyPaid
    )
    draftData.balanceDue = balanceDue
    draftData.amountPaid = amountPaid

    draftData.invoiceDate = format(new Date(), "yyyy-MM-dd HH:mm:ss")

    //create invoice
    const draft = await draftService.createDraft({ ...draftData })
    if (!draft) {
      throw new ApiError(httpStatus.NOT_FOUND, "Something went wrong.")
    }

    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: draft,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const getDraft = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const draft = await draftService.getDraftAggrigate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
          isDeleted: false,
        },
      },
    ])
    if (!draft || !draft.length) {
      throw new ApiError(httpStatus.NOT_FOUND, "draft not found")
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: draft[0],
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const getDraftsList = catchAsync(
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
    const filterBy = req.query.filterBy as any[]

    const dateFilter = req.query.dateFilter as DateFilter | null
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
      } else {
        options["dateFilter"] = {} as any
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
      const objectIdFileds: string[] = ["createdById", "POId", "outletId"]
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

    //additional query
    let additionalQuery = [
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "outlets",
          localField: "outletId",
          foreignField: "_id",
          as: "outletData",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "employeeId",
          foreignField: "_id",
          as: "employee",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
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
          outletName: {
            $arrayElemAt: ["$outletData.name", 0],
          },
          customerName: {
            $arrayElemAt: ["$customer.name", 0],
          },
          employeeName: {
            $arrayElemAt: ["$employee.name", 0],
          },
        },
      },
      {
        $unset: ["outletData", "customer", "employee"],
      },
    ]

    options["additionalQuery"] = additionalQuery as any
    const result = await draftService.queryDrafts(filter, options)
    return res.status(httpStatus.OK).send(result)
  }
)

const deleteDraft = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await draftService.deleteDraftById(req.params.draftId)
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

export { createDraft, getDraft, getDraftsList, deleteDraft }

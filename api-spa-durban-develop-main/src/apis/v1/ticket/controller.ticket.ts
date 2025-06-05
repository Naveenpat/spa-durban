import { Request, Response } from "express"
import httpStatus from "http-status"
import { pick } from "../../../../utilities/pick"
import ApiError from "../../../../utilities/apiError"
import catchAsync from "../../../../utilities/catchAsync"
import { ticketService, outletService, customerService } from "../service.index"
import {
  DateFilter,
  RangeFilter,
  AuthenticatedRequest,
} from "../../../utils/interface"
import { UserEnum } from "../../../utils/enumUtils"
import {
  getFilterQuery,
  getRangeQuery,
  getSearchQuery,
  checkInvalidParams,
  getDateFilterQuery,
} from "../../../utils/utils"
import mongoose from "mongoose"
import {
  searchKeys,
  allowedDateFilterKeys,
  TicketDocument,
} from "./schema.ticket"

const createTicket = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let { ticketTitle, outletId, customerId, description } = req.body

    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication Failed")
    }

    // Check if any outlet is not found
    const outlet = await outletService.getOutletById(outletId)

    if (!outlet) {
      throw new ApiError(httpStatus.NOT_FOUND, "outlet not found")
    }
    // Check if any customer is not found
    const customer = await customerService.getCustomerById(customerId)

    if (!customer) {
      throw new ApiError(httpStatus.NOT_FOUND, "customer not found")
    }

    req.body["userId"] = req.userData.Id
    req.body["userName"] = req.userData.name

    const result: TicketDocument | null = await ticketService.createTicket(
      req.body
    )

    if (!result) {
      throw new ApiError(httpStatus.NOT_FOUND, "Couldn't create ticket.")
    }
    let { _id } = result
    let sentTicketEmailToEmployees =
      await ticketService.sendTicketEmailEmployee(_id.toString(), req.userData)
    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: result,
      status: true,
      code: "CREATED",
      issue: null,
    })
  }
)

const getTickets = catchAsync(
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
    const isAdmin = req?.userData?.userType === UserEnum.Admin
    let outletQuery = {}

    let allOutlets = req?.userData?.outletsData?.map((ele: any) => {
      return new mongoose.Types.ObjectId(ele?._id)
    })

    if (!isAdmin) {
      outletQuery = {
        outletId: {
          $in: allOutlets,
        },
      }
    }

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
    options["additionalQuery"] = [
      {
        $lookup: {
          from: "customers",
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
                email: 1,
                name: "$customerName",
                _id: 0,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          email: { $arrayElemAt: ["$customer.email", 0] },
          name: { $arrayElemAt: ["$customer.name", 0] },
        },
      },
      {
        $unset: ["customer"],
      },
    ] as any
    const result = await ticketService.queryTickets(filter, options)
    return res.status(httpStatus.OK).send(result)
  }
)

const getTicket = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const ticket = await ticketService.getTicketById(req.params.ticketId)
    if (!ticket) {
      throw new ApiError(httpStatus.NOT_FOUND, "Ticket not found")
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull",
      data: ticket,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const updateTicket = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let { ticketTitle, outletId, customerId, description } = req.body

    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication Failed")
    }
    // Check if any outlet is not found
    const outlet = await outletService.getOutletById(outletId)

    if (!outlet) {
      throw new ApiError(httpStatus.NOT_FOUND, "outlet not found")
    }
    // Check if any customer is not found
    const customer = await customerService.getCustomerById(customerId)

    if (!customer) {
      throw new ApiError(httpStatus.NOT_FOUND, "customer not found")
    }

    req.body["userId"] = req.userData.Id
    req.body["userName"] = req.userData.name

    const result = await ticketService.updateTicketById(
      req.params.ticketId,
      req.body
    )
    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: result,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const deleteTicket = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await ticketService.deleteTicketById(req.params.ticketId)
    return res.status(httpStatus.OK).send({
      message: "Successfull",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

export { createTicket, getTickets, getTicket, updateTicket, deleteTicket }

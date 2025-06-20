import { Request, Response } from "express"
import httpStatus from "http-status"
import { pick } from "../../../../utilities/pick"
import ApiError from "../../../../utilities/apiError"
import catchAsync from "../../../../utilities/catchAsync"
import { customerGroupService, customerService } from "../service.index"
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
import { searchKeys, allowedDateFilterKeys } from "./schema.customerGroup"

const createCustomerGroup = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // const { customers } = req.body
    // const allCustomers = await Promise.all(
    //   customers.map((ele: any) => customerService.getCustomerById(ele))
    // )

    // Check if any outlet is not found
    // const notFoundCustomer = allCustomers.filter((customer) => !customer)

    // if (notFoundCustomer.length > 0) {
    //   throw new ApiError(httpStatus.NOT_FOUND, "Invalid customer's")
    // }
    const customerGroup = await customerGroupService.createCustomerGroup(
      req.body
    )
    return res.status(httpStatus.OK).status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: customerGroup,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const getCustomerGroups = catchAsync(
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
      const objectIdFileds: string[] = ["customers"]

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
          localField: "customers", // The field in the Service collection
          foreignField: "_id", // The field in the Outlet collection
          as: "customerDetails", // The field name for the joined outlet data
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          customers: {
            $map: {
              input: "$customerDetails",
              as: "customer",
              in: {
                customerId: "$$customer._id",
                customerName: "$$customer.name",
              },
            },
          },
        },
      },
      {
        $unset: ["customerDetails"],
      },
    ]
    options["additionalQuery"] = additionalQuery as any
    const result = await customerGroupService.queryCustomerGroups(
      filter,
      options
    )
    return res.status(httpStatus.OK).send(result)
  }
)

const getCustomerGroup = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const customerGroup = await customerGroupService.getCustomerGroupById(
      req.params.customerGroupId
    )
    if (!customerGroup) {
      throw new ApiError(httpStatus.NOT_FOUND, "CustomerGroup not found")
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: customerGroup,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const updateCustomerGroup = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // const { customers } = req.body
    // const allCustomers = await Promise.all(
    //   customers.map((ele: any) => customerService.getCustomerById(ele))
    // )

    // Check if any outlet is not found
    // const notFoundCustomer = allCustomers.filter((customer) => !customer)

    // if (notFoundCustomer.length > 0) {
    //   throw new ApiError(httpStatus.NOT_FOUND, "Invalid customer's")
    // }
    const customerGroup = await customerGroupService.updateCustomerGroupById(
      req.params.customerGroupId,
      req.body
    )
    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: customerGroup,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const deleteCustomerGroup = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await customerGroupService.deleteCustomerGroupById(
      req.params.customerGroupId
    )
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const toggleCustomerGroupStatus = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const customerGroup = await customerGroupService.getCustomerGroupById(
      req.params.customerGroupId
    );
    if (!customerGroup) {
      throw new ApiError(httpStatus.NOT_FOUND, "Customer Group not found");
    }
    customerGroup.isActive = !customerGroup.isActive;
    await customerGroup.save();
    return res.status(httpStatus.OK).send({
      message: "Status updated successfully.",
      data: customerGroup,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

export {
  createCustomerGroup,
  getCustomerGroups,
  getCustomerGroup,
  updateCustomerGroup,
  deleteCustomerGroup,
  toggleCustomerGroupStatus
}

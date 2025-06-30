import { Request, Response } from "express"
import httpStatus from "http-status"
import { pick } from "../../../../utilities/pick"
import ApiError from "../../../../utilities/apiError"
import catchAsync from "../../../../utilities/catchAsync"
import {
  inventoryService,
  outletService,
  productService,
  purchaseOrderService,
} from "../service.index"
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
import { searchKeys, allowedDateFilterKeys } from "./schema.inventory"
import { ObjectId } from "mongoose"
import { checkQuantitiesMatch, groupAndSumQuantities } from "./helper.inventory"
import { UserEnum } from "../../../utils/enumUtils"

const createInventory = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { inventoryData } = req.body
    /*
     * check product exist
     */

    // Fetch all PurchaseOrder by their IDs
    const allProducts = await Promise.all(
      inventoryData.map((ele: any) =>
        productService.getProductById(ele?.productId)
      )
    )

    // Check if any Products is not found
    const notFoundProducts = allProducts.filter((product) => !product)

    if (notFoundProducts.length > 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invalid Products!")
    }

    // check PurchaseOrder exists

    // Fetch all PurchaseOrder by their IDs
    const allPurchaseOrder = await Promise.all(
      inventoryData.map((ele: any) =>
        purchaseOrderService.getPurchaseOrderById(ele?.POId)
      )
    )

    // Check if any PurchaseOrder is not found
    const notFoundPurchaseOrder = allPurchaseOrder.filter((po) => !po)

    if (notFoundPurchaseOrder.length > 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invalid purchase orders")
    }

    const totalProductQuantity = allPurchaseOrder[0]?.products

    const groupedData = groupAndSumQuantities(inventoryData)
    const isProductMatch = checkQuantitiesMatch(
      totalProductQuantity,
      groupedData
    )

    if (!isProductMatch) {
      throw new ApiError(httpStatus.NOT_FOUND, "Product quantity mismatch")
    }

    // check outlets exists

    // Fetch all outlets by their IDs
    const alloutlet = await Promise.all(
      inventoryData.map((ele: any) =>
        outletService.getOutletById(ele?.outletId)
      )
    )

    // Check if any outlet is not found
    const notFoundoutlet = alloutlet.filter((outlet) => !outlet)

    if (notFoundoutlet.length > 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invalid outlet's")
    }
    const newInventoryData = inventoryData?.map(async (ele: any) => {
      await inventoryService.createInventory({
        productId: ele?.productId,
        quantity: ele?.quantity,
        purchasePrice: ele?.purchasePrice,
        saleQuantity: 0,
        createdById: req?.userData?.Id,
        POId: ele?.POId,
        outletId: ele?.outletId,
      })
    })

    await Promise.all(newInventoryData)
      .then(async (res) => {
        await purchaseOrderService?.updatePoByIdAndUpdate(
          inventoryData[0]?.POId,
          {
            isInventoryIn: true,
          }
        )
      })
      .catch((err) => {})

    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: inventoryData,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const getInventorys = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const filter = pick(req.query, ["outletId", "productId"])
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
    const isAdmin = req?.userData?.userType === UserEnum.Admin
    let outletQuery = {}
    if (!isAdmin) {
      outletQuery = {
        outletsId: {
          $in: req?.userData?.outletsData,
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
      const objectIdFileds: string[] = [
        "createdById",
        "POId",
        "outletId",
        "productId",
      ]

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
      { $match: outletQuery },

      {
        $lookup: {
          from: "products", // The collection name in MongoDB
          localField: "productId", // The field in the Employee collection
          foreignField: "_id", // The field in the Category collection
          as: "productData", // The field name for the joined category data
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                productName: 1,
                productCode: 1,
              },
            },
          ],
        },
      },

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
          from: "purchaseorders",
          localField: "POId",
          foreignField: "_id",
          as: "POData",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                invoiceNumber: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdById",
          foreignField: "_id",
          as: "userData",
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
          productName: {
            $arrayElemAt: ["$productData.productName", 0],
          },
          productCode: {
            $arrayElemAt: ["$productData.productCode", 0],
          },
          outletName: {
            $arrayElemAt: ["$outletData.name", 0],
          },
          invoiceNumber: {
            $arrayElemAt: ["$POData.invoiceNumber", 0],
          },
          createdByName: {
            $arrayElemAt: ["$userData.name", 0],
          },
          availableQunatity: {
            $subtract: ["$quantity", "$saleQuantity"],
          },
          totalPrice: {
            $multiply: [
              {
                $subtract: ["$quantity", "$saleQuantity"],
              },
              "$purchasePrice",
            ],
          },
        },
      },
      {
        $unset: ["outletData", "productData", "POData"],
      },
      {
  $group: {
    _id: {
      productId: "$productId",
      outletId: "$outletId",
    },
    productId: { $first: "$productId" },
    outletId: { $first: "$outletId" },
    productName: { $first: "$productName" },
    outletName: { $first: "$outletName" },
    totalQuantity: { $sum: "$quantity" },
    saleQuantity: { $sum: "$saleQuantity" },
    availableQunatity: { $sum: "$availableQunatity" },
    totalPrice: { $sum: "$totalPrice" },
    invoiceNumber: { $first: "$invoiceNumber" },
    createdByName: { $first: "$createdByName" },
    isDeleted: { $first: "$isDeleted" },
    isActive: { $first: "$isActive" },
    createdAt: { $first: "$createdAt" }
  },
}

    ]

    options["additionalQuery"] = additionalQuery as any
    const result = await inventoryService.queryInventorys(filter, options)
    return res.status(httpStatus.OK).send(result)
  }
)

const getInventory = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const inventory = await inventoryService.getInventoryById(
      req.params.inventoryId
    )
    if (!inventory) {
      throw new ApiError(httpStatus.NOT_FOUND, "Inventory not found")
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: inventory,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const updateInventory = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { outletId, productId, POId } = req.body

    const product = await productService.getProductById(productId)
    if (!product) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invalid Product!")
    }

    /*
     * check PO exist
     */
    const purchaseOrder = await purchaseOrderService.getPurchaseOrderById(POId)
    if (!purchaseOrder) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invalid PO!")
    }

    /*
     * check outlets exist
     */
    const outlet = await outletService.getOutletById(outletId)
    if (!outlet) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invalid outlet!")
    }

    const inventory = await inventoryService.updateInventoryById(
      req.params.inventoryId,
      req.body
    )

    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: inventory,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const deleteInventory = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await inventoryService.deleteInventoryById(req.params.inventoryId)
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
  createInventory,
  getInventorys,
  getInventory,
  updateInventory,
  deleteInventory,
}

import { Request, Response } from "express"
import httpStatus from "http-status"
import { pick } from "../../../../utilities/pick"
import ApiError from "../../../../utilities/apiError"
import catchAsync from "../../../../utilities/catchAsync"
import PoLogs from "../poLogs/schema.poLogs"
import {
  purchaseOrderService,
  supplierService,
  productService,
  taxService,
  poLogsService,
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
import { searchKeys, allowedDateFilterKeys } from "./schema.purchaseOrder"
import {
  PaymentStatusTypeEnum,
  DiscountTypeEnum,
} from "../../../utils/enumUtils"
import { purchaseCalculation } from "./helper.purchaseOrder"
import mongoose from "mongoose"

const createPurchaseOrder = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { supplierId, products, amountPaid, payableAmount, shippingCharges } =
      req.body

    // category exists check
    let supplierExists = await supplierService.getSupplierById(supplierId)
    if (!supplierExists) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid supplier!")
    }

    // Fetch all product by their IDs
    const allProducts = await Promise.all(
      products.map((ele: any) => productService.getProductById(ele?.productId))
    )

    // Check if any product is not found
    const notFoundproducts = allProducts.filter((product) => !product)

    if (notFoundproducts.length > 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invalid products")
    }
    // check valid tax
    // Fetch all product by their IDs
    const taxes = await Promise.all(
      products.map((ele: any) => taxService.getTaxById(ele?.tax))
    )

    // Check if any product is not found
    const notFoundTax = taxes.filter((tax) => !tax)

    if (notFoundTax.length > 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invalid Taxes")
    }

    //calculations
    let paymentCalculation = await purchaseCalculation(
      products,
      shippingCharges
    )

    // payment status
    let paymentStatus = PaymentStatusTypeEnum.pending
    if (amountPaid === paymentCalculation.myPayableAmount) {
      paymentStatus = PaymentStatusTypeEnum.completed
    } else if (amountPaid > paymentCalculation.myPayableAmount) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        "Amount paid can't be greater than payable amount!"
      )
    }
    const purchaseOrder = await purchaseOrderService.createPurchaseOrder({
      ...req.body,
      products: paymentCalculation.products,
      paymentStatus,
      totalTax: paymentCalculation.totalTax,
      totalDiscount: paymentCalculation.totalDiscount,
      payableAmount: paymentCalculation?.orignalPayableAmount,
      createdBy: req.userData?.Id,
    })

    try {
      // Create the purchase order log
      await PoLogs.create({
        poId: purchaseOrder?._id,
        amountPaid: purchaseOrder?.amountPaid,
        dueAmount:
          purchaseOrder?.payableAmount +
          purchaseOrder?.shippingCharges +
          purchaseOrder?.totalTax -
          purchaseOrder?.totalDiscount -
          purchaseOrder?.amountPaid,
        isDeleted: false,
        isActive: true,
      })
    } catch (logError) {
      // Handle error in creating log by deleting the created purchase order
      await purchaseOrderService.deletePurchaseOrderById(
        purchaseOrder?._id as any
      )
      throw new ApiError(
        httpStatus.NOT_MODIFIED,
        "Something went wrong while creating purchase order log"
      )
    }

    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: purchaseOrder,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const getPurchaseOrders = catchAsync(
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

    const searchValue = req.query.searchValue as string | undefined
    const searchIn = req.query.searchIn as string[] | null
    const dateFilter = req.query.dateFilter as DateFilter | null
    const filterBy = req.query.filterBy as any[]
    const rangeFilterBy = req.query.rangeFilterBy as RangeFilter | undefined

    if (searchValue) {
      const searchQueryCheck = checkInvalidParams(
        searchIn ? searchIn : [],
        searchKeys
      )
      if (searchQueryCheck && !searchQueryCheck.status) {
        return res.status(httpStatus.OK).send({ ...searchQueryCheck })
      }
      const searchQuery = getSearchQuery(
        searchIn ? searchIn : [],
        searchKeys,
        searchValue
      )
      if (searchQuery !== null) {
        options.search = { $or: searchQuery } as any
      }
    }

    //date filter
    if (dateFilter) {
      const datefilterQuery = await getDateFilterQuery(
        dateFilter,
        allowedDateFilterKeys
      )
      if (datefilterQuery && datefilterQuery.length) {
        options.dateFilter = { $and: datefilterQuery } as any
      }
    }

    if (rangeFilterBy !== undefined) {
      const rangeQuery = getRangeQuery(rangeFilterBy)
      if (rangeQuery && rangeQuery.length) {
        options.rangeFilterBy = { $and: rangeQuery } as any
      }
    }

    if (filterBy?.length) {
      const booleanFields: string[] = ["isActive"]
      const numberFileds: string[] = []
      const objectIdFileds: string[] = ["supplierId"]

      const withoutRegexFields: string[] = []

      const filterQuery = getFilterQuery(
        filterBy,
        booleanFields,
        numberFileds,
        objectIdFileds,
        withoutRegexFields
      )
      if (filterQuery) {
        options.filterBy = { $and: filterQuery } as any
      }
    }

    // Additional query for lookup and adding fields
    const additionalQuery = [
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products", // The name of the products collection
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $lookup: {
          from: "taxes", // The name of the taxes collection
          localField: "products.tax",
          foreignField: "_id",
          as: "taxDetails",
        },
      },
      {
        $unwind: "$taxDetails",
      },
      {
        $addFields: {
          "products.productName": "$productDetails.productName", // Ensure field names match your collection
          "products.productCode": "$productDetails.productCode",
          "products.taxType": "$taxDetails.taxType",
          "products.taxPercent": "$taxDetails.taxPercent",
        },
      },
      {
        $lookup: {
          from: "suppliers", // The name of the suppliers collection
          localField: "supplierId",
          foreignField: "_id",
          as: "supplierDetails",
        },
      },
      {
        $unwind: "$supplierDetails",
      },
      {
        $addFields: {
          supplierName: "$supplierDetails.supplierName", // Ensure field names match your collection
        },
      },
      {
        $group: {
          _id: "$_id",
          supplierId: { $first: "$supplierId" },
          supplierName: { $first: "$supplierName" }, // Include supplierName in the grouped results
          invoiceNumber: { $first: "$invoiceNumber" },
          orderDate: { $first: "$orderDate" },
          paymentStatus: { $first: "$paymentStatus" },
          amountPaid: { $first: "$amountPaid" },
          payableAmount: { $first: "$payableAmount" },
          shippingCharges: { $first: "$shippingCharges" },
          totalTax: { $first: "$totalTax" },
          totalDiscount: { $first: "$totalDiscount" },
          products: { $push: "$products" },
          isDeleted: { $first: "$isDeleted" },
          isActive: { $first: "$isActive" },
          isInventoryIn: { $first: "$isInventoryIn" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
        },
      },
    ]

    options.additionalQuery = additionalQuery as any

    const result = await purchaseOrderService.queryPurchaseOrders(
      filter,
      options
    )
    return res.status(httpStatus.OK).send(result)
  }
)

const getPurchaseOrder = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const purchaseOrder = await purchaseOrderService.getPurchaseOrderAggrigate([
      {
        $lookup: {
          from: "suppliers", // The name of the products collection
          localField: "supplierId",
          foreignField: "_id",
          as: "supplierData",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                supplierName: 1,
                phone: 1,
                email: 1,
                address: 1,
              },
            },
          ],
        },
      },

      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.purchaseOrderId),
        },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products", // The name of the products collection
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $unwind: "$supplierData",
      },
      {
        $lookup: {
          from: "taxes", // The name of the products collection
          localField: "products.tax",
          foreignField: "_id",
          as: "taxDetails",
        },
      },
      {
        $unwind: "$taxDetails",
      },
      {
        $addFields: {
          "products.productName": "$productDetails.productName", // Ensure field names match your collection
          // "products.productCode": "$productDetails.productCode",
          "products.taxType": "$taxDetails.taxType",
          "products.taxPercent": "$taxDetails.taxPercent",
          supplierName: "$supplierData.supplierName",
          supplierphone: "$supplierData.phone",
          supplieremail: "$supplierData.email",
          supplieraddress: "$supplierData.address",
        },
      },
      {
        $group: {
          _id: "$_id",
          supplierId: { $first: "$supplierId" },
          supplierName: { $first: "$supplierName" },
          supplierphone: { $first: "$supplierphone" },
          supplieremail: { $first: "$supplieremail" },
          supplieraddress: { $first: "$supplieraddress" },
          invoiceNumber: { $first: "$invoiceNumber" },
          orderDate: { $first: "$orderDate" },
          paymentStatus: { $first: "$paymentStatus" },
          amountPaid: { $first: "$amountPaid" },
          payableAmount: { $first: "$payableAmount" },
          shippingCharges: { $first: "$shippingCharges" },
          totalTax: { $first: "$totalTax" },
          totalDiscount: { $first: "$totalDiscount" },
          products: { $push: "$products" },
          isDeleted: { $first: "$isDeleted" },
          isActive: { $first: "$isActive" },
          isInventoryIn: { $first: "$isInventoryIn" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
        },
      },
    ])
    if (!purchaseOrder) {
      throw new ApiError(httpStatus.NOT_FOUND, "PurchaseOrder not found")
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: purchaseOrder,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const updatePurchaseOrder = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { supplierId, products, amountPaid, shippingCharges } = req.body
    // category exists check
    let supplierExists = await supplierService.getSupplierById(supplierId)
    if (!supplierExists) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid supplier!")
    }

    // Fetch all product by their IDs
    const allProducts = await Promise.all(
      products.map((ele: any) => productService.getProductById(ele?.productId))
    )

    // Check if any product is not found
    const notFoundproducts = allProducts.filter((product) => !product)

    if (notFoundproducts.length > 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invalid products")
    }

    // check valid tax
    // Fetch all product by their IDs
    const taxes = await Promise.all(
      products.map((ele: any) => taxService.getTaxById(ele?.tax))
    )

    // Check if any product is not found
    const notFoundTax = taxes.filter((tax) => !tax)

    if (notFoundTax.length > 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invalid Taxes")
    }

    //calculations
    let paymentCalculation = await purchaseCalculation(
      products,
      shippingCharges
    )

    // payment status
    let paymentStatus = PaymentStatusTypeEnum.pending

    if (amountPaid === paymentCalculation.myPayableAmount) {
      paymentStatus = PaymentStatusTypeEnum.completed
    } else if (amountPaid > paymentCalculation.myPayableAmount) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        "Amount paid can't be greater than payable amount!"
      )
    }
    const purchaseOrder = await purchaseOrderService.updatePurchaseOrderById(
      req.params.purchaseOrderId,
      {
        ...req.body,
        paymentStatus,
        products: paymentCalculation.products,
        totalTax: paymentCalculation.totalTax,
        totalDiscount: paymentCalculation.totalDiscount,
        payableAmount: paymentCalculation?.orignalPayableAmount,
        createdBy: req.userData?.Id,
      }
    )
    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: purchaseOrder,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const updatePurchaseOrderPayment = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { amount } = req.body
    const { purchaseOrderId } = req.params

    const foundPo = await purchaseOrderService?.getPurchaseOrderById(
      purchaseOrderId
    )
    if (!foundPo) {
      throw new ApiError(httpStatus.NOT_FOUND, "PurchaseOrder not found")
    }

    let payableAmount = foundPo?.payableAmount
    let shippingCharges = foundPo?.shippingCharges
    let totalTax = foundPo?.totalTax
    let totalDiscount = foundPo?.totalDiscount
    let amountPaid = foundPo?.amountPaid

    let paymentStatus = foundPo?.paymentStatus
    if (
      amountPaid + amount >
      payableAmount + shippingCharges + totalTax - totalDiscount
    ) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Amount can't be greater than payable amount!"
      )
    } else if (
      amountPaid + amount ===
      payableAmount + shippingCharges + totalTax - totalDiscount
    ) {
      paymentStatus = PaymentStatusTypeEnum.completed
    }
    const purchaseOrder = await purchaseOrderService.updatePoByIdAndUpdate(
      req.params.purchaseOrderId,
      {
        $inc: {
          amountPaid: amount,
        },
        $set: {
          paymentStatus,
        },
      }
    )
    try {
      // Create the purchase order log
      await PoLogs.create({
        poId: purchaseOrder?._id,
        amountPaid: amount,
        dueAmount:
          purchaseOrder?.payableAmount +
          purchaseOrder?.shippingCharges +
          purchaseOrder?.totalTax -
          purchaseOrder?.totalDiscount -
          purchaseOrder?.amountPaid,
        isDeleted: false,
        isActive: true,
      })
    } catch (logError) {
      // Handle error in creating log by updating  purchase order
      await purchaseOrderService.updatePoByIdAndUpdate(
        req.params.purchaseOrderId,
        {
          $set: {
            amountPaid,
            paymentStatus,
          },
        }
      )
      throw new ApiError(
        httpStatus.NOT_MODIFIED,
        "Something went wrong while creating purchase order log"
      )
    }
    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: purchaseOrder,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const deletePurchaseOrder = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await purchaseOrderService.deletePurchaseOrderById(
      req.params.purchaseOrderId
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

export {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  updatePurchaseOrderPayment,
}

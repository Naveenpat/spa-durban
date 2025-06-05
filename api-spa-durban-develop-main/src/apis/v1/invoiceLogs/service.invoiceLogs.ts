import httpStatus from "http-status"
import ApiError from "../../../../utilities/apiError"
import mongoose from "mongoose"
import InvoiceLog from "./schema.invoiceLogs"
import Invoice, {
  InvoiceDocument,
  InvoiceModel,
} from "../invoice/schema.invoice"

export const createOrUpdateInvoiceLog = async (
  invoice: InvoiceDocument,
  isPaymentChanged: boolean
) => {
  try {
    const invoiceId = invoice._id

    // Create or update InvoiceLog using spread operator
    const invoiceLogData = {
      ...JSON.parse(JSON.stringify(invoice)), // Spread all fields from Invoice
      invoiceId: invoiceId, // Ensure invoiceId is explicitly set
      _id: new mongoose.Types.ObjectId(), // Assign new ObjectId for _id
      isPaymentChanged,
    }

    // Upsert the InvoiceLog document
    await InvoiceLog.create(invoiceLogData)
    return true
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, "Error occured")
  }
}

export const getInvoicePaymentLogByInvoiceId = async (id: string | number) => {
  if (typeof id === "string" || typeof id === "number") {
    const result = await InvoiceLog.aggregate([
      {
        $match: {
          invoiceId: new mongoose.Types.ObjectId(id),
          isDeleted: false,
          isPaymentChanged: true,
        },
      },
      {
        $project: {
          amountReceived: 1,
          totalAmount: 1,
          totalDiscount: 1,
          amountPaid: 1,
          balanceDue: 1,
          invoiceId: 1,
          invoiceDate: 1,
          employeeId: 1,
          remark: 1,
        },
      },
      { $unwind: "$amountReceived" },

      {
        $lookup: {
          from: "paymentmodes",
          localField: "amountReceived.paymentModeId",
          foreignField: "_id",
          as: "paymentmode",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                modeName: 1,
                type: 1,
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
          "amountReceived.paymentmode": {
            $arrayElemAt: ["$paymentmode.modeName", 0],
          },
          "amountReceived.modetype": {
            $arrayElemAt: ["$paymentmode.type", 0],
          },
          employeeName: {
            $arrayElemAt: ["$employee.name", 0],
          },
        },
      },
      {
        $unset: ["paymentmode"],
      },
      {
        $group: {
          _id: "$_id",
          amountReceived: {
            $push: "$amountReceived",
          },
          amountPaid: { $first: "$amountPaid" },
          balanceDue: { $first: "$balanceDue" },
          invoiceDate: { $first: "$invoiceDate" },
          remark: { $first: "$remark" },
        },
      },
      {
        $sort: { invoiceDate: -1 },
      },
    ]).exec()
    return result.length > 0 ? result : null
  }
  return null
}

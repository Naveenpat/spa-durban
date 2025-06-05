import { Request, Response } from "express"
import { format, parseISO, startOfDay, endOfDay, isBefore } from "date-fns"
import httpStatus from "http-status"
import { pick } from "../../../../utilities/pick"
import ApiError from "../../../../utilities/apiError"
import catchAsync from "../../../../utilities/catchAsync"
import { invoiceLogService } from "../service.index"
import { searchKeys, allowedDateFilterKeys } from "./schema.invoiceLogs"
import { AuthenticatedRequest } from "../../../utils/interface"

export const getInvoicePaymentLogByInvoiceId = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const invoice = await invoiceLogService.getInvoicePaymentLogByInvoiceId(
      req.params.invoiceId
    )
    if (!invoice) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found")
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: invoice,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

import { Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../../utilities/apiError";
import catchAsync from "../../../../utilities/catchAsync";
import { AuthenticatedRequest } from "../../../utils/interface";
import mongoose from "mongoose";
import { invoiceService } from "../service.index";
import { sendEmail } from "../../../helper/sendEmail";
import config from "../../../../config/config";
import { AggregatedInvoiceDocument } from "../invoice/schema.invoice";
import { pdfMimeType } from "../../../helper/mimeTypes";
import fs from "fs";
import Outlet from "../outlet/schema.outlet";

const sendInvoice = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { invoiceId } = req.params;
  const { emailBody } = req.body;
  // console.log('------sendInvoice--call');
  // ✅ Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid invoiceId.");
  }

  // ✅ Find invoice and join customer
  // const invoiceExist = await invoiceService.getInvoiceAggrigate([
  //   {
  //     $match: {
  //       _id: new mongoose.Types.ObjectId(invoiceId),
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "customers", //new code
  //       localField: "customerId",
  //       foreignField: "_id",
  //       as: "customer",
  //     },
  //   },
  //   {
  //     $addFields: {
  //       customer: { $arrayElemAt: ["$customer", 0] }, // allow null instead of failing
  //     },
  //   },
  // ]);

  const invoiceExist = await invoiceService.getInvoiceAggrigate([
  {
    $match: {
      _id: new mongoose.Types.ObjectId(invoiceId),
    },
  },
  // Join customer
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
      customer: { $arrayElemAt: ["$customer", 0] },
    },
  },
  // Join outlet
  {
    $lookup: {
      from: "outlets",
      localField: "outletId",
      foreignField: "_id",
      as: "outlet",
    },
  },
  {
    $addFields: {
      outlet: { $arrayElemAt: ["$outlet", 0] },
    },
  },
  // Join company
  {
    $lookup: {
      from: "companies",
      localField: "companyId",
      foreignField: "_id",
      as: "company",
    },
  },
  {
    $addFields: {
      company: { $arrayElemAt: ["$company", 0] },
    },
  },
  // Lookup payment mode names from amountReceived.paymentModeId
  {
    $unwind: {
      path: "$amountReceived",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: "paymentmodes",
      localField: "amountReceived.paymentModeId",
      foreignField: "_id",
      as: "amountReceived.paymentMode",
    },
  },
  {
    $addFields: {
      "amountReceived.paymentMode": {
        $arrayElemAt: ["$amountReceived.paymentMode", 0],
      },
    },
  },
  {
    $group: {
      _id: "$_id",
      doc: { $first: "$$ROOT" },
      amountReceived: { $push: "$amountReceived" },
    },
  },
  {
    $addFields: {
      "doc.amountReceived": "$amountReceived",
    },
  },
  {
    $replaceRoot: {
      newRoot: "$doc",
    },
  },
  // Extract only itemName from items array
  {
    $addFields: {
      items: {
        $map: {
          input: "$items",
          as: "item",
          in: {
            itemName: "$$item.itemName",
          },
        },
      },
    },
  },
]);


  if (!invoiceExist || !invoiceExist.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found.");
  }

  const invoice = invoiceExist[0] as AggregatedInvoiceDocument;
  // console.log('----------invoice---neww', invoice?.amountReceived)
  if (!invoice.customer || !invoice.customer.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Customer email not found.");
  }

  // ✅ Validate file
  if (!req.files || !Array.isArray(req.files) || !req.files.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invoice attachment is required.");
  }

  const file = req.files[0];
  if (!pdfMimeType.includes(file.mimetype)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Only PDF files are allowed.");
  }

  if (!fs.existsSync(file.path)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "File does not exist.");
  }

  const formattedDate = new Date(invoice?.invoiceDate).toLocaleDateString('en-IN', {
  day: '2-digit',
  month: 'long', // or 'short' or '2-digit'
  year: 'numeric',
});


  // ✅ Prepare email data
  const buffer = fs.readFileSync(file.path);

  const emailData = {
  emailSubject: 'Your SPA Payment is Confirmed – Invoice Attached',
  emailBody: `
<table style="width: 100%; font-family: Arial, sans-serif; font-size: 16px; color: #333;">
  <tr>
    <td>
      <p>Dear ${invoice.customer?.name || 'Customer'},</p>

      <p>Thank you for choosing our SPA services.</p>

      <p>
        We’re pleased to inform you that your payment of 
        <strong>R ${invoice?.totalAmount?.toFixed(2) || '0.00'}</strong> has been successfully received.
        Please find your invoice attached for your reference.
      </p>

      <h3 style="margin-top: 20px; color: #4a4a4a;">Service Summary:</h3>
      <ul style="padding-left: 20px; line-height: 1.6;">
        <li><strong>Service:</strong> ${invoice?.items[0]?.itemName || 'SPA Service'}</li>
        <li><strong>Date:</strong> ${formattedDate}</li>
        <li><strong>Invoice No.:</strong> ${invoice?.invoiceNumber || 'N/A'}</li>
        <li><strong>Payment Method:</strong> ${invoice?.amountReceived[0]?.paymentMode?.modeName || 'N/A'}</li>
      </ul>

      <p>
        If you have any questions or need assistance, feel free to reply to this email or 
        contact our support team.
      </p>

      <p>We look forward to serving you again.</p>

      <p>
        Warm regards,<br/>
        <strong>${invoice?.outlet?.name}</strong><br/>
        Phone: <a href="tel:${invoice?.outlet?.phone}">${invoice?.outlet?.phone}</a><br/>
        <a href="https://spadurban.co.za/">www.spadurban.co.za</a>
      </p>
    </td>
  </tr>
</table>
`.trim(),
  sendTo: invoice.customer.email,
  sendFrom: config.smtp_mail_email,
  attachments: [
    {
      filename: `${invoice.invoiceNumber}.pdf`,
      content: buffer,
      path: file.path,
      encoding: 'base64',
      contentType: file.mimetype,
    },
  ],
};



  const sendEmailResult = await sendEmail(emailData);

  return res.status(httpStatus.CREATED).send({
    message: "Invoice sent!",
    data: sendEmailResult,
    status: true,
    code: "OK",
    issue: null,
  });
});


const sendEmailBYEmail = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { outletId } = req.params;
  const { emailBody } = req.body;
  // ✅ Validate outletId
  if (!mongoose.Types.ObjectId.isValid(outletId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid outletId.");
  }

  // ✅ Fetch outlet
  const outlet = await Outlet.findById(outletId);
  if (!outlet || !outlet.email) {
    throw new ApiError(httpStatus.NOT_FOUND, "Outlet or its email not found.");
  }

  // ✅ Validate file
  if (!req.files || !Array.isArray(req.files) || !req.files.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invoice attachment is required.");
  }

  const file = req.files[0];
  if (!pdfMimeType.includes(file.mimetype)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Only PDF files are allowed.");
  }

  if (!fs.existsSync(file.path)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "File does not exist.");
  }

  // ✅ Prepare email
  const buffer = fs.readFileSync(file.path);
  const emailData = {
    emailSubject: `Today Close Registe`,
    emailBody: emailBody,
    sendTo: outlet?.email, // ✅ Send to outlet email
    sendFrom: config.smtp_mail_email,
    attachments: [
      {
        filename: `close-register.pdf`,
        content: buffer,
        path: file.path,
        encoding: "base64",
        contentType: file.mimetype,
      },
    ],
  };

  const sendEmailResult = await sendEmail(emailData);

  return res.status(httpStatus.CREATED).send({
    message: "Invoice sent to outlet email!",
    data: sendEmailResult,
    status: true,
    code: "OK",
    issue: null,
  });
});


export { sendInvoice, sendEmailBYEmail };

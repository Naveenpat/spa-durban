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

  // ✅ Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid invoiceId.");
  }

  // ✅ Find invoice and join customer
  const invoiceExist = await invoiceService.getInvoiceAggrigate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(invoiceId),
      },
    },
    {
      $lookup: {
        from: "customers", //new code
        localField: "customerId",
        foreignField: "_id",
        as: "customer",
      },
    },
    {
      $addFields: {
        customer: { $arrayElemAt: ["$customer", 0] }, // allow null instead of failing
      },
    },
  ]);

  if (!invoiceExist || !invoiceExist.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found.");
  }

  const invoice = invoiceExist[0] as AggregatedInvoiceDocument;
  console.log('----------invoice', invoice)
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

  // ✅ Prepare email data
  const buffer = fs.readFileSync(file.path);
  // const emailData = {
  //   emailSubject: `Invoice - ${invoice.invoiceNumber}`,
  //   emailBody: emailBody,
  //   sendTo: invoice.customer.email,
  //   sendFrom: config.smtp_mail_email,
  //   attachments: [
  //     {
  //       filename: `${invoice.invoiceNumber}.pdf`,
  //       content: buffer,
  //       path: file.path,
  //       encoding: "base64",
  //       contentType: file.mimetype,
  //     },
  //   ],
  // };

  const emailData = {
    emailSubject: 'Your Payment is Confirmed – Invoice for Your SPA Service',
    emailBody: `
Dear ${invoice.customer?.name || 'Customer'},

Thank you for choosing our SPA services.

We’re pleased to inform you that your payment has been successfully received. Please find the invoice attached with this email for your reference.

Details:

Service: ${invoice?.serviceName || 'SPA Service'}
Date: ${invoice?.date || 'N/A'}
Invoice No.: ${invoice?.invoiceNumber}
Amount Paid: ₹${invoice?.amount || '0.00'}

If you have any questions or require further assistance, feel free to reply to this email or contact our support team.

We look forward to serving you again soon!

Warm regards,  
'Your SPA Name' 
'Phone: 123-456-7890'
'www.yourspa.com'
  `.trim(),
    sendTo: invoice.customer.email,
    sendFrom: config.smtp_mail_email,
    attachments: [
      {
        filename: `${invoice.invoiceNumber}.pdf`,
        content: buffer,
        path: file.path,
        encoding: "base64",
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
    sendTo: 'np.221196.np@gmail.com', // ✅ Send to outlet email
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

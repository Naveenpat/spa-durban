import httpStatus from "http-status"
import nodemailer, { Transporter, SendMailOptions } from "nodemailer"
import config from "../../config/config"
import logger from "../../config/logger"
import { catchErr } from "../../utilities/resError"
import ApiError from "../../utilities/apiError"

interface ResponseData {
  sendStatus: boolean
  response: any
  error: boolean
}

export const emailSend = async (
  transporter: Transporter,
  mailOptions: SendMailOptions
): Promise<string | null> => {
  try {
    let dataToSend: ResponseData = {
      sendStatus: false,
      response: {},
      error: false,
    }

    const result = await new Promise<ResponseData>((resolve) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (!error && info.response.includes("250 Ok")) {
          dataToSend = {
            sendStatus: true,
            response: info.response,
            error: false,
          }
        } else if (error) {
          let errData = catchErr(error)
          logger.info(error)
          dataToSend = {
            sendStatus: false,
            response: errData.resData.message,
            error: true,
          }
        }
        resolve(dataToSend)
      })
    })

    if (result.sendStatus) {
      return result.response
    } else {
      return null
    }
  } catch (err) {
    let errData = catchErr(err)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      errData.resData.message
    )
  }
}

export const createTransporter = async (outlet: any): Promise<Transporter> => {
  try {
    // const transporter = nodemailer.createTransport({
    //   host: config.smtp_mail_host,
    //   port: 25,
    //   secure: false,
    //   auth: {
    //     user: config.smtp_mail_user,
    //     pass: config.smtp_mail_password,
    //   },
    //   debug: true,
    // })


    const smtp = outlet?.smtp || {};
    const {
      host,
      port,
      username,
      password
    } = smtp;

    const transporter = nodemailer.createTransport({
      host: host || config.smtp_mail_host || 'smtp.office365.com',
      port: port || 587,
      secure: false,
      pool: true,
      auth: {
        user: username || config.smtp_mail_user || 'info4@spadurban.co.za',
        pass: password || config.smtp_mail_password || 'Sp@durban!',
      },
      tls: { ciphers: 'SSLv3' }
    })

    transporter.verify((error, success) => {
      if (error) {
        console.error("SMTP connection failed:", error);
      } else {
        console.log("SMTP server is ready to send emails");
      }
    });

    return transporter
  } catch (err) {
    let errData = catchErr(err)
    logger.info("Failed to create email transporter.")
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      errData.resData.message
    )
  }
}

export const createMailOptions = async (emailData: {
  emailSubject: string
  emailBody: string
  sendTo: string
  sendFrom: string
  attachments: any[]
}, outlet: any): Promise<SendMailOptions> => {
  try {
    const { emailSubject, emailBody, sendTo, sendFrom, attachments } = emailData

    const smtp = outlet?.smtp || {};
    const {
      sendFrom: outletSendFrom,
      ccEmails,
      bccEmails,
    } = smtp;


    const mailOptions: SendMailOptions = {
      from: outletSendFrom || 'info4@spadurban.co.za',
      to: sendTo,
      subject: emailSubject,
      html: emailBody,
      attachments: attachments || [],
      cc: ccEmails ? ccEmails.split(',') : undefined,
      bcc: bccEmails ? bccEmails.split(',') : undefined,
    };

    // console.log('-----mailOptions',mailOptions)

    return mailOptions
  } catch (err) {
    let errData = catchErr(err)
    logger.info("Failed to create mail options.")
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      errData.resData.message
    )
  }
}

export const sendEmail = async (emailData: any, outlet: any): Promise<boolean> => {
  try {

    const transporter = await createTransporter(outlet)
    const mailOptions = await createMailOptions(emailData, outlet)
    const isEmailSent = await emailSend(transporter, mailOptions)
    return isEmailSent ? true : false
  } catch (err) {
    let errData = catchErr(err)
    logger.info(errData.resData.message)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      errData.resData.message
    )
  }
}

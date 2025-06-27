import httpStatus from "http-status"
import Ticket, { TicketDocument } from "./schema.ticket" // Adjust TicketDocument based on your schema setup
import ApiError from "../../../../utilities/apiError"
import mongoose from "mongoose"
import { RangeFilter } from "../../../utils/interface"
import config from "../../../../config/config"
import { sendEmail } from "../../../helper/sendEmail"

/**
 * Create a ticket
 * @param {Object} ticketBody
 * @returns {Promise<TicketDocument>}
 */
const createTicket = async (ticketBody: any): Promise<TicketDocument> => {
  return Ticket.create(ticketBody)
}

/**
 * Query for tickets
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @param {any} [options.isPaginationRequired] - isPaginationRequired
 * @returns {Promise<{ data: TicketDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryTickets = async (
  filter: any,
  options: any
): Promise<{
  data: TicketDocument[]
  page: number
  limit: number
  totalPages: number
  totalResults: number
  search: any
  dateFilter: any
  filterBy: any
  rangeFilterBy: RangeFilter | undefined
  isPaginationRequired: boolean | undefined
}> => {
  const tickets = await Ticket.paginate(filter, options)
  return tickets
}

/**
 * Update ticket by id
 * @param {string | number} ticketId
 * @param {Object} updateBody
 * @returns {Promise<TicketDocument>}
 */
const updateTicketById = async (
  ticketId: string | number,
  updateBody: any
): Promise<TicketDocument> => {
  const ticket = await getTicketById(ticketId)
  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, "Ticket not found")
  }

  Object.assign(ticket, updateBody)
  await ticket.save()
  return ticket
}

/**
 * Delete ticket by id
 * @param {string | number} ticketId
 * @returns {Promise<TicketDocument>}
 */
const deleteTicketById = async (
  ticketId: string | number
): Promise<TicketDocument> => {
  const ticket = await getTicketById(ticketId)
  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, "Ticket not found")
  }
  await Ticket.updateOne(
    { _id: ticket._id },
    { isDeleted: true },
    { new: true }
  )
  return ticket
}

interface FilterObject {
  [key: string]: any // Adjust any as per your field types
}

interface ExistsResult {
  exists: boolean
  existsSummary: string
}

/**
 * Check if certain conditions exist in the database
 * @param {Array<FilterObject>} filterArray - Array of filters to check
 * @param {Array<string>} exceptIds - Array of IDs to exclude from checks
 * @param {Boolean} combined - Whether to combine filters with AND logic
 * @returns {Promise<ExistsResult>}
 */
const isExists = async (
  filterArray: FilterObject[],
  exceptIds: string[] = [],
  combined: boolean = false
): Promise<ExistsResult> => {
  if (combined) {
    let combinedObj = await combineObjects(filterArray)
    if (exceptIds.length > 0) {
      combinedObj["_id"] = { $nin: exceptIds }
    }
    if (await getOneByMultiField({ ...combinedObj })) {
      return {
        exists: true,
        existsSummary: `${Object.keys(combinedObj)} already exist.`,
      }
    }
    return { exists: false, existsSummary: "" }
  }

  let mappedArray = await Promise.all(
    filterArray.map(async (element) => {
      if (exceptIds.length > 0) {
        element["_id"] = { $nin: exceptIds }
      }
      if (await getOneByMultiField({ ...element })) {
        return { exists: true, fieldName: Object.keys(element)[0] }
      }
      return { exists: false, fieldName: Object.keys(element)[0] }
    })
  )

  return mappedArray.reduce(
    (acc, ele) => {
      if (ele.exists) {
        acc.exists = true
        acc.existsSummary += `${ele.fieldName.toLowerCase()} already exist. `
      }
      return acc
    },
    { exists: false, existsSummary: "" } as ExistsResult // Ensure initial type assignment
  )
}

// Example functions used in the code, add typings accordingly
async function combineObjects(
  filterArray: FilterObject[]
): Promise<FilterObject> {
  // Implementation
  return {} as FilterObject
}

async function getOneByMultiField(filter: FilterObject): Promise<boolean> {
  // Implementation
  return false
}

/**
 * Get Ticket by id
 * @param {string | number} id
 * @returns {Promise<TicketDocument | null>}
 */
const getTicketById = async (
  id: string | number
): Promise<TicketDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return Ticket.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    })
  }
  return null
}

/**
 * Get Tickets by an array of IDs
 * @param {Array<string | number>} ids
 * @returns {Promise<Array<TicketDocument | null>>}
 */
const getTicketsByIds = async (
  ids: Array<string | number>
): Promise<Array<TicketDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id))
  return Ticket.find({ _id: { $in: objectIds }, isDeleted: false }).exec()
}

/**
 * send email to all the employees
 */

const sendTicketEmailEmployee = async (ticketId: string, userData: any) => {
  let ticketDetail = await Ticket.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(ticketId),
      },
    },
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
      $match: {
        "customer.email": { $ne: null },
      },
    },
    {
      $project: {
        email: { $arrayElemAt: ["$customer.email", 0] },
        ticket: "$ticketTitle",
        ticketType: "$ticketType",
        _id: 0,
      },
    },
  ])

  if (ticketDetail && ticketDetail.length) {
    let emailBody = `<p><strong>Dear Customer,<br /><br /></strong>A new ticket for ${ticketDetail[0].ticketType} was added.</p>
                     <p><strong>Ticket</strong>: ${ticketDetail[0].ticket}</p>
                     <p>&nbsp;</p>`

    let sendTo = ticketDetail.map((ele) => ele.email)
    let emailData = {
      emailSubject: "New ticket was added.",
      emailBody: emailBody,
      sendTo: sendTo,
      sendFrom: config.smtp_mail_email,
      attachments: [],
    }

    const outletData = {};
    const sendEmailResult = await sendEmail(emailData,outletData)
    // console.log(sendEmailResult, "sendEmailResult")
  }
  return ticketDetail
}

export {
  createTicket,
  queryTickets,
  updateTicketById,
  deleteTicketById,
  isExists,
  getTicketById,
  getTicketsByIds,
  sendTicketEmailEmployee,
}

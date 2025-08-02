import { Request, Response } from "express"
import httpStatus from "http-status"
import { pick } from "../../../../utilities/pick"
import ApiError from "../../../../utilities/apiError"
import catchAsync from "../../../../utilities/catchAsync"
import { giftCardService, customerService } from "../service.index"
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
import GiftCard, { searchKeys, allowedDateFilterKeys } from "./schema.giftCard"
import XLSX from "xlsx";
import fs from "fs";

const createGiftCard = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const customerId = req?.body?.customerId
    let { giftCardName } = req.body

    if (customerId) {
      // customer exists check
      let customerExists = await customerService.getCustomerById(customerId)
      if (!customerExists) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid customer!")
      }
    }

    const { exists, existsSummary } = await giftCardService.isExists(
      [{ giftCardName }],
      [],
      true
    )
    if (exists) {
      throw new ApiError(httpStatus.BAD_REQUEST, existsSummary)
    }

    const giftCard = await giftCardService.createGiftCard(req.body)
    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: giftCard,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const getGiftCards = catchAsync(
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
      const objectIdFileds: string[] = ["customerId"]

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
          localField: "customerId", // The field in the Service collection
          foreignField: "_id", // The field in the Outlet collection
          as: "customerData", // The field name for the joined outlet data
          pipeline: [
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
          customerName: {
            $arrayElemAt: ["$customerData.name", 0],
          },
        },
      },
      {
        $unset: ["customerData"],
      },
    ]
    options["additionalQuery"] = additionalQuery as any
    const result = await giftCardService.queryGiftCards(filter, options)
    return res.status(httpStatus.OK).send(result)
  }
)

const getGiftCard = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const customerId = req?.body?.customerId

    if (customerId) {
      // customer exists check
      let customerExists = await customerService.getCustomerById(customerId)
      if (!customerExists) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid customer!")
      }
    }
    const giftCard = await giftCardService.getGiftCardById(
      req.params.giftCardId
    )
    if (!giftCard) {
      throw new ApiError(httpStatus.NOT_FOUND, "GiftCard not found")
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: giftCard,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const updateGiftCard = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let { giftCardName } = req.body

    const { exists, existsSummary } = await giftCardService.isExists(
      [{ giftCardName }],
      [req.params.giftCardId],
      true
    )

    if (exists) {
      throw new ApiError(httpStatus.BAD_REQUEST, existsSummary)
    }

    const giftCard = await giftCardService.updateGiftCardById(
      req.params.giftCardId,
      req.body
    )
    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: giftCard,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const deleteGiftCard = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await giftCardService.deleteGiftCardById(req.params.giftCardId)
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    })
  }
)

const toggleGiftCardStatus = catchAsync(async (req: Request, res: Response) => {
  const updatedGiftCard = await giftCardService.toggleGiftCardStatusById(
    req.params.giftCardId
  )
  return res.status(httpStatus.OK).send({
    message: "Status updated successfully.",
    data: updatedGiftCard,
    status: true,
    code: "OK",
    issue: null,
  })
})

const uploadGiftCardCsv = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "CSV or Excel file is required.",
      status: false,
      code: "BAD_REQUEST",
      issue: "No file uploaded",
    });
  }

  try {
    // Read the file
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Map the Excel fields to DB fields
    const giftCardstt = (data as any[]).map((row) => ({
      giftCardName: row.number,
      giftCardAmount: Number(row.balance || 0),
      total_sold: Number(row.total_sold || 0),
      total_redeemed: Number(row.total_redeemed || 0),
      giftCardExpiryDate:new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
      type:"WHOEVER_BOUGHT"
    }));

    // Save to DB
    await GiftCard.insertMany(giftCardstt);

    // Remove file after import
    fs.unlinkSync(req.file.path);

    return res.status(httpStatus.CREATED).json({
      message: "Gift cards uploaded successfully.",
      data: {
        inserted: giftCardstt.length,
      },
      status: true,
      code: "CREATED",
      issue: null,
    });
  } catch (error) {
    console.error("Error uploading CSV:", error);

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Failed to process CSV file.",
      status: false,
      code: "SERVER_ERROR",
      issue: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export {
  createGiftCard,
  getGiftCards,
  getGiftCard,
  updateGiftCard,
  deleteGiftCard,
  toggleGiftCardStatus,
  uploadGiftCardCsv
}

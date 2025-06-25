import httpStatus from "http-status" // Assuming http-status library is used for status codes
import ApiError from "../../utilities/apiError"
import { ObjectId } from "mongodb"
import mongoose from "mongoose"
import { format, parseISO, startOfDay, endOfDay, isBefore } from "date-fns"
import {
  DateFilter,
  FilterByItem,
  FilterQueryResult,
  Filter,
  RangeFilter,
} from "../utils/interface"

/**
 * Formats a Date object into a string in the format YYYY-MM-DD HH:mm:ss.
 * @param date - The Date object to format.
 * @returns A formatted date string.
 */
export const getFormattedTimestamp = (): string => {
  const date = new Date()
  const formattedDate = format(date, "yyyy-MM-dd HH:mm:ss")
  return formattedDate
}

/**
 * Generates MongoDB query objects for text search across multiple fields.
 * @param {string[]} searchIn - Fields to search in if provided.
 * @param {string[]} searchKeys - Default fields to search in if searchIn is not provided.
 * @param {string | undefined | null} searchValue - Search string to match against.
 * @returns {any} - Array of MongoDB query objects or null if searchValue is empty.
 */
// export const getSearchQuery = (
//   searchIn: string[] | undefined,
//   searchKeys: string[],
//   searchValue: string | undefined | null
// ): Record<string, any>[] | null => {
//   let queryArray: Record<string, any>[] = []

//   if (searchValue && searchValue.trim() !== "") {
//     const value = { $regex: `.*${searchValue}.*`, $options: "i" }
//     const searchFields = searchIn && searchIn.length ? searchIn : searchKeys

//     for (const key of searchFields) {
//       queryArray.push({ [key]: value })
//     }
//   }

//   return queryArray.length ? queryArray : null
// }

export const getSearchQuery = (
  searchIn: string[] | undefined,
  searchKeys: string[],
  searchValue: string | undefined | null
): Record<string, any>[] | null => {
  let queryArray: Record<string, any>[] = [];

  if (searchValue && searchValue.trim() !== "") {
    const value = { $regex: `^${searchValue}`, $options: "i" }; // Starts with
    const searchFields = searchIn && searchIn.length ? searchIn : searchKeys;

    for (const key of searchFields) {
      queryArray.push({ [key]: value });
    }
  }

  return queryArray.length ? queryArray : null;
};


interface InvalidParamsResponse {
  message: string
  status: boolean
  data: null
  code: number
  issue: string | null
}

/**
 * Checks and validates search parameters.
 * @param {string[] | undefined} searchIn - Fields to search in.
 * @param {string[]} searchKeys - Valid search keys.
 * @returns {InvalidParamsResponse} - Response object indicating validation status.
 */
export const checkInvalidParams = (
  searchIn: string[],
  searchKeys: string[]
): InvalidParamsResponse => {
  if (!searchIn) {
    searchIn = []
  } else if (!Array.isArray(searchIn)) {
    return {
      message: `Search in params must be an array.`,
      status: false,
      data: null,
      code: httpStatus.OK,
      issue: "INVALID_REQUEST",
    }
  }

  for (const key of searchIn) {
    if (!key || key === "") {
      return {
        message: `Search in params key should not be blank.`,
        status: false,
        data: null,
        code: httpStatus.OK,
        issue: "INVALID_REQUEST",
      }
    } else if (!searchKeys.includes(key)) {
      return {
        message: `Invalid field ${key} in params to be searched.`,
        status: false,
        data: null,
        code: httpStatus.OK,
        issue: "INVALID_REQUEST",
      }
    }
  }

  return {
    message: `All OK`,
    status: true,
    data: null,
    code: httpStatus.OK,
    issue: null,
  }
}

export const getDateFilterQuery = (
  dateFilter: DateFilter | null,
  allowedDateFilterKeys: string[]
): Record<string, any>[] | null => {
  if (!dateFilter) {
    return null
  }
  // const jsonObject = JSON.parse(dateFilter as any)
  const { dateFilterKey, startDate, endDate } = dateFilter

  if (dateFilterKey && !allowedDateFilterKeys.includes(dateFilterKey)) {
    throw new ApiError(
      httpStatus.NOT_IMPLEMENTED,
      `Date filter key is invalid.`
    )
  }

  const filterKey = dateFilterKey || "createdAt"
  const start = startDate || endDate
  const end = endDate || startDate

  if (!start || !end) {
    return null
  }

  const startOfDayISO = startOfDay(parseISO(start)).toISOString()
  const endOfDayISO = endOfDay(parseISO(end)).toISOString()

  return [
    {
      [filterKey]: {
        $gte: startOfDayISO,
        $lte: endOfDayISO,
      },
    },
  ]
}

export const getFilterQuery = (
  filterBy: Filter[] | undefined,
  booleanFields: string[],
  numberFields: string[],
  objectIdFields: string[],
  withoutRegexFields: string[]
): { message?: string; status?: boolean; data?: null } | any[] | null => {
  let queryArray: any[] = []
  objectIdFields =
    objectIdFields && Array.isArray(objectIdFields) ? objectIdFields : []
  withoutRegexFields =
    withoutRegexFields && Array.isArray(withoutRegexFields)
      ? withoutRegexFields
      : []

  let invalidData = ["null", null, undefined, "undefined", ""]

  if (filterBy !== undefined) {
    if (!Array.isArray(filterBy)) {
      return {
        message: `filterBy must be an array.`,
        status: true,
        data: null,
      }
    }

    if (filterBy.length > 0) {
      for (let each in filterBy) {
        if (!invalidData.includes(filterBy[each].fieldName)) {
          let fieldName = filterBy[each].fieldName
          let filterValue = filterBy[each].value

          if (
            withoutRegexFields.includes(fieldName) &&
            filterValue !== "" &&
            filterValue !== null &&
            filterValue !== undefined
          ) {
            let orQuery: any[] = []

            filterValue.forEach((val: any) => {
              orQuery.push({
                [fieldName]: val,
              })
            })
            queryArray.push(...orQuery)
          } else if (
            Array.isArray(filterValue) &&
            filterValue.length &&
            !booleanFields.includes(fieldName) &&
            !numberFields.includes(fieldName) &&
            !objectIdFields.includes(fieldName)
          ) {
            let orQuery: any[] = []
            filterValue.forEach((val: any) => {
              orQuery.push({
                [fieldName]: {
                  $regex: `.*${val}.*`,
                  $options: "i",
                },
              })
            })
            queryArray.push({ $or: orQuery })
          } else if (filterValue !== "") {
            if (
              typeof filterValue === "string" &&
              !booleanFields.includes(fieldName) &&
              !numberFields.includes(fieldName) &&
              !objectIdFields.includes(fieldName)
            ) {
              queryArray.push({
                [fieldName]: {
                  $regex: `.*${filterValue}.*`,
                  $options: "i",
                },
              })
            } else if (
              numberFields.includes(fieldName) &&
              !isNaN(parseInt(filterValue))
            ) {
              let filterValue = filterBy[each].value
              if (Array.isArray(filterValue) && filterValue.length) {
                let orQuery: any[] = []
                filterValue.forEach((val: any) => {
                  orQuery.push({
                    [fieldName]: parseInt(val),
                  })
                })
                queryArray.push({ $or: orQuery })
              } else {
                queryArray.push({
                  [fieldName]: parseInt(filterValue),
                })
              }
            } else if (objectIdFields.includes(fieldName)) {
              let filterValue = filterBy[each].value
              if (filterValue) {
                filterValue = JSON.parse(JSON.stringify(filterValue))

                if (Array.isArray(filterValue) && filterValue.length) {
                  if (filterValue.length) {
                    let orQuery: any[] = []
                    filterValue.forEach((val: any) => {
                      orQuery.push({
                        [fieldName]: new mongoose.Types.ObjectId(val),
                      })
                    })
                    queryArray.push({ $or: orQuery })
                  }
                } else if (typeof filterValue === "string") {
                  queryArray.push({
                    [fieldName]: new mongoose.Types.ObjectId(filterValue),
                  })
                }
              }
            } else if (
              typeof filterValue === "boolean" ||
              booleanFields.includes(fieldName)
            ) {
              queryArray.push({
                [fieldName]:
                  filterValue === true || filterValue === "true" ? true : false,
              })
            }
          }
        }
      }
    }
  }

  return queryArray.length ? queryArray : null
}

export const getRangeQuery = (
  rangeFilterBy: RangeFilter | null
): any[] | null => {
  if (!rangeFilterBy) {
    return null
  }

  const { rangeFilterKey, rangeInitial, rangeEnd } = rangeFilterBy

  if (
    typeof rangeFilterKey !== "string" ||
    !rangeFilterKey ||
    isNaN(parseFloat(rangeInitial as string)) ||
    isNaN(parseFloat(rangeEnd as string))
  ) {
    return null
  }

  const queryArray = [
    { [rangeFilterKey]: { $gte: parseFloat(rangeInitial as string) } },
    { [rangeFilterKey]: { $lte: parseFloat(rangeEnd as string) } },
  ]

  return queryArray.length ? queryArray : null
}

export const calculatePercentage = (number: number, percentage: number) => {
  const answer = number * (percentage / 100)
  return answer
}

/**
 * Checks if the given date has passed
 * @param {Date | string | number} dateTime - The date to check
 * @returns {boolean} - Returns true if the date has passed, false otherwise
 */
export const dateHasPassed = (dateTime: Date | string | number): boolean => {
  const now = new Date()
  const date = new Date(dateTime)

  return isBefore(date, now)
}

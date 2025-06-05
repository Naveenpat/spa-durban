import { JwtPayload } from "jsonwebtoken"
import { Request } from "express"
import mongoose from "mongoose"
export interface TokenUser {
  _id: string // Adjust type as per your application's actual _id type
  userType: string // Adjust type as per your application's actual user type
  // Add other properties as needed
}

export interface DecodedToken extends JwtPayload {
  Id?: string
  userType?: string
  tokenType?: string
}

export interface DateFilter {
  dateFilterKey?: string
  startDate?: string
  endDate?: string
}

export interface FilterByItem {
  fieldName: string
  value: any
}

export interface FilterQueryResult {
  message: string
  status: boolean
  data: any
}

export interface RangeFilter {
  rangeFilterKey: string
  rangeInitial: number | string
  rangeEnd: number | string
}

// Extend the Request type to include the userData property
export interface AuthenticatedRequest extends Request {
  files?: any
  userData?: {
    tokenType: string
    Id: string
    userType: string
    userName: string
    name: string
    phone: string
    email: string
    userID: mongoose.Types.ObjectId
    outletsData: any
  }
}

export interface Filter {
  fieldName: string
  value: any
}

export interface ItemForInvoice {
  itemId: string
  quantity: number
  itemType: string
  itemTaxes: []
}

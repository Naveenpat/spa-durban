import mongoose from "mongoose"
import ApiError from "../../../../utilities/apiError"
import httpStatus from "http-status"
import { ObjectId } from "mongoose"
import { loyaltyService, loyaltyLogService } from "../service.index"
import { LoyaltyDocument } from "../loyalty/schema.loyalty"

export const addToLoyaltyLog = async (
  loyalty: LoyaltyDocument,
  userId: string
) => {
  try {
    if (!loyalty) {
      throw new ApiError(httpStatus.NOT_FOUND, "Loyalty not found.")
    }
    let { _id } = loyalty
    const loyaltyId = _id

    // Create or update loyaltyLog using spread operator
    const loyaltyLogData = {
      ...JSON.parse(JSON.stringify(loyalty)), // Spread all fields from loyalty
      loyaltyId: loyaltyId, // Ensure loyaltyId is explicitly set
      _id: new mongoose.Types.ObjectId(), // Assign new ObjectId for _id
      updatedByUserId: userId,
    }

    // Upsert the loyaltyLog document
    await loyaltyLogService.createLoyaltyLog(loyaltyLogData)
    return true
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, "Eror occured")
  }
}

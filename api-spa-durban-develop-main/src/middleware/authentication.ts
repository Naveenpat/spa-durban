import mongoose from "mongoose"
import httpStatus from "http-status"
import { Response, NextFunction } from "express"
import catchAsync from "../../utilities/catchAsync"
import {
  authService,
  tokenService,
  userService,
  outletService,
} from "../apis/v1/service.index"
import config from "../../config/config"
import { TokenEnum, UserEnum } from "../utils/enumUtils"
import ApiError from "../../utilities/apiError"
import { AuthenticatedRequest } from "../utils/interface"

/**
 *
 * check token exists in req body: done
 * decode token: done
 * check token type valid: done
 * check userId valid: done
 * check userType valid: done
 * check device id exists in req body: done
 * check user exist and active
 * check token exist in redis: done
 *
 */

// Factory function to create middleware
const authenticate = (authForUser: string[], authTokenType: string) => {
  return catchAsync(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.headers.authorization) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication Failed")
      }

      const token = authService.fetchToken(req)

      const tokenDoc = (await tokenService.verifyToken(
        token,
        authTokenType === TokenEnum.Refresh
          ? config.jwt_secret_refresh
          : config.jwt_secret_access
      )) as { Id: string; userType: string; tokenType: string }

      const { Id, userType, tokenType } = tokenDoc

      if (!Id || Id === undefined || Id === null) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Authentication Failed. Invalid User."
        )
      }

      if (tokenType !== authTokenType) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Authentication Failed. Invalid Token"
        )
      }

      if (!authForUser.includes(userType)) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Authentication Failed. Invalid user type."
        )
      }

      // Check user in db
      let user = await userService.getUserById(Id)
      if (!user) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Authentication Failed. User not found."
        )
      }

      // Ensure user._id is of type string or ObjectId
      const userID = new mongoose.Types.ObjectId(Id)

      let allOutlets = await outletService.getOutletAggrigate([
        { $match: { isDeleted: false } },
      ])

      let allOutletsIdsForAdmin = allOutlets?.map((ele: any) => {
        return { _id: ele?._id, name: ele?.name }
      })

      // get outlets
      let outletsData: any = await userService.getUserAggrigate([
        { $match: { _id: new mongoose.Types.ObjectId(Id) } },
        {
          $lookup: {
            from: "employees",
            localField: "_id",
            foreignField: "_id",
            as: "employeeData",
            pipeline: [
              {
                $project: {
                  outletsId: 1,
                },
              },
              {
                $lookup: {
                  from: "outlets",
                  localField: "outletsId",
                  foreignField: "_id",
                  as: "outletsData",
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        name: 1,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          $project: {
            outlets: {
              $arrayElemAt: ["$employeeData.outletsData", 0],
            },
          },
        },
      ])

      let allOutleIds = outletsData?.outlets?.map((ele: any) => {
        return { _id: ele?._id, name: ele?.name }
      })

      console.log("users============>",user)
      // Use the additional parameter here if needed
      let userData = {
        tokenType: TokenEnum.Access,
        Id: Id.toString(), // Ensure this is a string
        userType: user.userType,
        userName: user.userName,
        name: user.name,
        phone: user.phone,
        email: user.email,
        userID: userID,
        outletsData:
          user.userType === UserEnum.Admin
            ? allOutletsIdsForAdmin
            : allOutleIds,
      }

      req.userData = userData
      next()
    }
  )
}

export { authenticate }

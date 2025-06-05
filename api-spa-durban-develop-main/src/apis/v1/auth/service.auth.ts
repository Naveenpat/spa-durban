import httpStatus from "http-status";
import ApiError from "../../../../utilities/apiError";
import {
  tokenService,
  userService,
  redisService,
  employeeService,
  outletService,
} from "../service.index";
import config from "../../../../config/config";
import { Request } from "express";
import { sendEmail } from "../../../helper/sendEmail";
import { UserEnum } from "../../../utils/enumUtils";
import mongoose from "mongoose";

/**
 * Login with userName and password
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * @returns {Promise<User>} - The authenticated user
 */
const loginUserWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  // Fetch the user by email
  const user: any = await userService.getUserByEmail(email);

  // Check if user exists and password matches
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect User");
  }
  if (!(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }
  let outletsData;
  if (user?.userType === UserEnum.Employee) {
    outletsData = await userService.getUserAggrigate([
      { $match: { _id: new mongoose.Types.ObjectId(user._id) } },
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
    ]);
  }
  return { user, outletsData };
};

const loginUserWithBookingUserId = async (bookingUserId: string) => {
  // Fetch the user by email
  const user: any = await userService.getUserByBookingUserId(bookingUserId);

  // Check if user exists and password matches
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect User");
  }
  // if (!(await user.isPasswordMatch(password))) {
  //   throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  // }
  let outletsData;
  if (user?.userType === UserEnum.Employee) {
    outletsData = await userService.getUserAggrigate([
      { $match: { _id: new mongoose.Types.ObjectId(user._id) } },
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
    ]);
  }
  return { user, outletsData };
};

/**
 * Logout user by removing tokens from Redis
 * @param {string} userId - The ID of the user
 * @param {string} deviceId - The device ID
 * @param {boolean} logOutAll - Whether to logout from all devices
 * @returns {Promise<void>}
 */
const logout = async (userId: string, deviceId: string, logOutAll: boolean) => {
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
  }

  return await redisService.removeFromRedisByKey(userId, deviceId, logOutAll);
};

/**
 * Async function to provide authentication
 * @param {object} user - The user object
 * @param {string} deviceId - The device ID
 * @returns {Promise<object>} - The authentication response
 */
const authenticationProvider = async (
  user: object,
  deviceId: string,
  outletsData?: any
) => {
  try {
    // Deep copy of user object to prevent modification of original
    const userCopy = JSON.parse(JSON.stringify(user));

    // Generate authentication tokens
    const { accessToken, refreshToken } = await tokenService.generateAuthTokens(
      userCopy
    );
    // Construct token string for Redis storage
    const tokenString = `${accessToken}***${refreshToken}`;
    // Set and get tokens from Redis
    const { tokenSet, tokenGet } = await redisService.setAndGetToRedis(
      `${userCopy._id}${deviceId}`,
      tokenString
    );
    // Check if tokens were successfully set and retrieved
    if (tokenSet && tokenGet) {
      return {
        message: "Successful!",
        data: {
          user: {
            _id: userCopy._id,
            name: userCopy.name,
            email: userCopy.email,
            userType: userCopy.userType,
            userName: userCopy.userName,
          },
          outlets: outletsData ? outletsData?.outlets : [],
          access: accessToken,
          refresh: refreshToken,
        },
        status: true,
      };
    } else {
      // Throw an error if tokens could not be set or retrieved
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Could not set or retrieve the authentication tokens."
      );
    }
  } catch (err) {
    // Catch any errors during token generation, Redis operation, or JSON parsing
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "An error occurred while processing authentication."
    );
  }
};

/**
 * Refresh authentication tokens
 * @param {string} refreshToken - The refresh token
 * @param {string} deviceId - The device ID
 * @returns {Promise<object>} - The refreshed authentication response
 */
const refreshAuth = async (refreshToken: string, deviceId: string) => {
  try {
    // Verify the refresh token
    const refreshTokenDoc = (await tokenService.verifyToken(
      refreshToken,
      config.jwt_secret_refresh
    )) as { Id: string };

    const userId = refreshTokenDoc.Id;
    if (!userId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
    }

    // Fetch the user by ID
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
    }

    // Logout the user
    await logout(userId, deviceId, false);

    // Provide new authentication tokens
    let resposeData = await authenticationProvider(user, deviceId);
    return resposeData;
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }
};

/**
 * Change the user's password
 * @param {string} deviceId - The device ID
 * @param {string} userId - The ID of the user
 * @param {string} password - The new password
 * @returns {Promise<object>} - The response data after changing the password
 */
const changePassword = async (
  deviceId: string,
  userId: string,
  password: string
) => {
  // Update the user's password
  const updated = await userService.updateUserById(userId, {
    password: password,
  });

  // Logout the user from all devices
  await logout(userId, deviceId, true);

  // Provide new authentication tokens
  let responseData = await authenticationProvider(updated, deviceId);
  return responseData;
};

/**
 * Extract the token from the request headers
 * @param {Request} req - The HTTP request
 * @returns {string} - The extracted token
 */
const fetchToken = (req: Request) => {
  if (!req.headers.authorization) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication Failed");
  }

  const authHeader = req.headers.authorization;
  if (!authHeader.startsWith("Bearer ")) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication Failed");
  }

  // Check Authorization header if token is not found in cookies
  const token = authHeader.split(" ")[1];
  return token;
};

/**
 * Extract the device ID from the request headers
 * @param {Request} req - The HTTP request
 * @returns {string} - The extracted device ID
 */
const fetchDeviceId = (req: Request) => {
  let deviceId = req.headers["device-id"]
    ? (req.headers["device-id"] as string)
    : "";

  if (!deviceId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Device ID is required");
  }
  return deviceId;
};

/**
 * forgot password
 * @param {string} email - The email of the user
 * @returns {boolean} - The authenticated user
 */
const forgotPassword = async (email: string) => {
  // Fetch the user by email
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found.");
  }
  const userData = JSON.parse(JSON.stringify(user));
  const accessToken = await tokenService.generatePasswordResetToken(userData);
  let emailData = {
    emailSubject: "Reset Password Link",
    emailBody: accessToken,
    sendTo: email,
    sendFrom: config.smtp_mail_email,
    attachments: [],
  };
  const sendEmailResult = await sendEmail(emailData);

  //create otp and store in respective database
  //send email
  //send sms

  return user;
};

export {
  loginUserWithEmailAndPassword,
  refreshAuth,
  authenticationProvider,
  logout,
  changePassword,
  fetchToken,
  fetchDeviceId,
  forgotPassword,
  loginUserWithBookingUserId,
};

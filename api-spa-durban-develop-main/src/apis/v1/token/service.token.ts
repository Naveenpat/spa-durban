import jwt from "jsonwebtoken"
import config from "../../../../config/config"
import { TokenEnum } from "../../../utils/enumUtils"
import { TokenUser } from "../../../utils/interface" // Adjust path as per your application structure
import ApiError from "../../../../utilities/apiError"
import httpStatus from "http-status"
import { redisService } from "../service.index" // Adjusted import
const options = { expiresIn: "1h" }
//generate otp verify token
const generateOtpVerifyToken = async (user: TokenUser) => {
  
  
  const token = jwt.sign(
    {
      Id: user._id,
      userType: user.userType,
      tokenType: TokenEnum.OtpVerify,
    },
    config.jwt_secret_access,
    {
      expiresIn: '1m',
    }
  )
  return token
}

//generate password reset token
const generatePasswordResetToken = async (user: TokenUser) => {
  const token = jwt.sign(
    {
      Id: user._id,
      userType: user.userType,
      tokenType: TokenEnum.PasswordReset,
    },
    config.jwt_secret_access,
    {
      expiresIn:  "24h",
    }
  )
  return token
}

//generate access token
const generateAccessToken = async (user: TokenUser) => {
  const token = jwt.sign(
    {
      Id: user._id,
      userType: user.userType,
      tokenType: TokenEnum.Access,
    },
    config.jwt_secret_access,
    {
      expiresIn:"24h",
    }
  )
  return token
}

//generate refresh token
const generateRefreshTokens = async (user: TokenUser) => {
  const token = jwt.sign(
    {
      Id: user._id,
      userType: user.userType,
      tokenType: TokenEnum.Refresh,
    },
    config.jwt_secret_refresh,
    {
      expiresIn: "24h",
    }
  )
  return token
}

//verify token
const verifyToken = async (token: string, secretKey: string) => {
  const decoded = (await jwt.verify(token, secretKey)) as {
    Id: string
    tokenType: string
  }

  if (!decoded || !decoded.Id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token")
  }

  const tokenType = decoded.tokenType
  if (
    tokenType === TokenEnum.OtpVerify ||
    tokenType === TokenEnum.PasswordReset
  ) {
    return decoded
  }
  const tokenKey = `${decoded.Id}*`

  if (await redisService.getMatchedKeysByPattern(tokenKey, token)) {
    return decoded
  } else {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "An error occurred while verifying the token"
    )
  }
}

//generate access and refresh tokens
const generateAuthTokens = async (user: TokenUser) => {
  // Get access token
  const accessToken = await generateAccessToken(user)

  // Get refresh token
  const refreshToken = await generateRefreshTokens(user)
  return { accessToken, refreshToken }
}

export {
  generateAccessToken,
  generateRefreshTokens,
  generateAuthTokens,
  verifyToken,
  generateOtpVerifyToken,
  generatePasswordResetToken,
}

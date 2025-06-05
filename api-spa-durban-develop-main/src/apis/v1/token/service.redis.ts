import ApiError from "../../../../utilities/apiError"
import httpStatus from "http-status"
import { getRedisClient } from "../../../../database/redis"

//match token in redis by keys
const getMatchedKeysByPattern = async (keyPattern: string, token: string) => {
  const redisClient = await getRedisClient()
  if (!redisClient) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to connect to Redis."
    )
  }
  const allRedisKeys = await redisClient.keys(keyPattern)

  if (!allRedisKeys.length) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Invalid token, User not found."
    )
  }
  let tokenExist = false
  for (const key of allRedisKeys) {
    let tokenValue = await redisClient.get(key)
    // match access token
    if (tokenValue && tokenValue.includes(token)) {
      tokenExist = true
    }
  }
  if (!tokenExist) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token.")
  }
  return allRedisKeys
}

//get token by key from redis
const getTokenByKeyRedis = async (key: string) => {
  try {
    const redisClient = await getRedisClient()
    if (!redisClient) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to connect to Redis."
      )
    }
    const result = await redisClient.get(key)
    return result
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "An error occurred while getting the token."
    )
  }
}

//set token to the redis
const setTokenRedis = async (key: string, tokenString: string) => {
  try {
    const redisClient = await getRedisClient()
    if (!redisClient) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to connect to Redis."
      )
    }
    let tokenSet = await redisClient.set(key, tokenString)
    return tokenSet
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "An error occurred while setting the token"
    )
  }
}

//set token in the redis and check if successfull
const setAndGetToRedis = async (key: string, tokenString: string) => {
  const tokenSet = await setTokenRedis(key, tokenString)

  const tokenGet = await getTokenByKeyRedis(key)

  return {
    tokenSet,
    tokenGet,
  }
}

const removeFromRedisByKey = async (
  userId: string,
  deviceId: string,
  logOutAll: boolean
) => {
  const redisClient = await getRedisClient()
  if (!redisClient) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to connect to Redis."
    )
  }

  if (deviceId !== "" && !logOutAll) {
    await redisClient.del(`${userId}${deviceId}`)
  } else {
    const tokenKey = `${userId}*`
    const allRedisValue = await redisClient.keys(tokenKey)
    const deletePromises = allRedisValue.map(
      async (key) => await redisClient.del(key)
    )

    await Promise.all(deletePromises)
  }
  return {
    message: "Logged Out!",
    status: true,
    data: null,
    code: httpStatus.OK,
    issue: null,
  }
}

export {
  getMatchedKeysByPattern,
  getTokenByKeyRedis,
  setTokenRedis,
  setAndGetToRedis,
  removeFromRedisByKey,
}

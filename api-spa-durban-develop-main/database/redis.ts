/* eslint-disable no-inline-comments */
import type { RedisClientType } from "redis"
import { createClient } from "redis"
import config from "../config/config"
import logger from "../config/logger"

let redisClient: RedisClientType
let isReady = false

// const cacheOptions = config.redis
const cacheOptions = {
  url: config.redis.url,
}

if (config.redis.tlsFlag) {
  Object.assign(cacheOptions, {
    socket: {
      keepAlive: 300, // 5 minutes DEFAULT
      tls: false,
    },
  })
}

async function getRedisClient(): Promise<RedisClientType> {
  if (!isReady) {
    redisClient = createClient({
      ...cacheOptions,
    })
    redisClient.on("connect", () => {
      logger.info("Redis connected")
      isReady = true
    })
    redisClient.on("error", (err) => {
      logger.error(`Redis Error: ${err}`)
      isReady = false
    })

    await redisClient.connect()
  }
  return redisClient
}

getRedisClient().catch((err) => {
  logger.error(err, "Failed to connect to Redis")
})

export { getRedisClient }

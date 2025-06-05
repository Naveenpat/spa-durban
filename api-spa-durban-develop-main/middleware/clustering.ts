import cluster from "node:cluster"
import os from "node:os"
import process from "node:process"
import logger from "../config/logger"
import * as http from "http"
import app from "../app"
import config from "../config/config"
const port: number = config.port || 8000

export const startServer = () => {
  const server: http.Server = http.createServer(app)
  // Start server
  server.listen(port, () => {
    logger.info(`Server is running on port ${port}`)
    logger.info(`Worker ${process.pid} started`)
  })
}

export const serverStartWithCluster = async () => {
  const numCPUs = os.cpus().length - 1

  if (cluster.isPrimary) {
    logger.info(`Primary ${process.pid} is running`)

    // Fork workers without blocking the event loop
    for (let i = 0; i < numCPUs; i++) {
      setImmediate(() => {
        cluster.fork()
      })
    }

    cluster.on("exit", (worker, code, signal) => {
      logger.info(`worker ${worker.process.pid} died`)
      logger.info("Starting a new worker")
      setImmediate(() => {
        cluster.fork()
      })
    })
  } else {
    startServer()
  }
}

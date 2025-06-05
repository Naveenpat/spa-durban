import morgan, { TokenIndexer } from "morgan"
import { Request, Response } from "express"
import config from "./config"
import logger from "./logger"

// Define custom token for morgan
morgan.token(
  "message",
  (req: Request, res: Response) => res.locals.errorMessage || ""
)

const getIpFormat = (): string =>
  config.env === "production" ? ":remote-addr - " : ""

const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`

const successHandler = morgan(successResponseFormat, {
  skip: (req: Request, res: Response) => res.statusCode! >= 400,
  stream: { write: (message: string) => logger.info(message.trim()) },
})

const errorHandler = morgan(errorResponseFormat, {
  skip: (req: Request, res: Response) => res.statusCode! < 400,
  stream: { write: (message: string) => logger.error(message.trim()) },
})

// Export the entire module as an object
export default {
  successHandler,
  errorHandler,
  // You can add more exports here if needed
}

// ./middleware/setupMiddleware.ts
import express from "express"
import helmet from "helmet"
import cors from "cors"
import cookieParser from "cookie-parser"
import corsOptions from "../config/corsOptions"
import { jsonParser, urlencodedParser } from "../config/bodyParser"
import morgan from "../config/morgan"
import config from "../config/config"

export const setupMiddleware = (app: express.Express) => {
  // Setup security headers
  app.use(helmet())

  // Setup CORS
  app.use(cors(corsOptions))

  // Setup body parsers
  app.use(jsonParser)
  app.use(urlencodedParser)

  // Setup cookie parser
  app.use(cookieParser())

  // Setup request logging in non-development environments

  app.use(morgan.successHandler)
  app.use(morgan.errorHandler)
}

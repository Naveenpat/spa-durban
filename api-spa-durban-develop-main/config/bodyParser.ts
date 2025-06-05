// ./config/bodyParserConfig.ts
import express from "express"

export const jsonParser = express.json({ limit: "10mb" })
export const urlencodedParser = express.urlencoded({
  extended: true,
  limit: "10mb",
})

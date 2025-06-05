import { Response } from "express"

declare module "express" {
  interface Response {
    locals: {
      errorMessage?: string
      // Add any other custom properties you might use with morgan
    }
  }
}

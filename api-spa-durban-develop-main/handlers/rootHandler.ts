import { Request, Response } from "express"

// Function to handle the root endpoint
export const rootHandler = (req: Request, res: Response) => {
  // Get request IP address
  const requestIp = req.socket?.remoteAddress

  // Send a meaningful response
  return res.send({ message: "Welcome to the root endpoint!", requestIp })
}

import { Request, Response } from "express"
import client, { Histogram, Counter } from "prom-client"
import responseTime from "response-time"

// Function to setup server monitoring
export const setupMonitoring = (app: any) => {
  // Collect default metrics
  const collectDefaultMetrics = client.collectDefaultMetrics
  collectDefaultMetrics({ register: client.register })

  // Histogram to measure request/response time
  const reqResTime = new Histogram({
    name: "http_sacchabhav_req_res_time",
    help: "This tells how much time is taken by req and res",
    labelNames: ["method", "route", "status_code"],
    buckets: [1, 10, 50, 100, 200, 500, 1000, 2000, 5000],
  })

  // Counter to count total requests
  const totalReqCounter = new Counter({
    name: "total_req",
    help: "Tells total req count",
  })

  // Middleware to measure response time and count requests
  app.use(
    responseTime((req: Request, res: Response, time: number) => {
      totalReqCounter.inc()
      reqResTime
        .labels({
          method: req.method,
          route: req.originalUrl,
          status_code: res.statusCode.toString(),
        })
        .observe(time)
    })
  )

  // Endpoint to get server metrics
  app.get("/metrics", async (req: Request, res: Response) => {
    res.setHeader("Content-Type", client.register.contentType)
    const metrics = await client.register.metrics()
    res.send(metrics)
  })
}

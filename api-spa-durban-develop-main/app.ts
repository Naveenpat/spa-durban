import express from "express"
import path from "path"
import routes from "./src/apis/v1/route" // Adjust path based on your project structure
import { errorConverter, errorHandler } from "./handlers/errorHandler"
import notFoundHandler from "./handlers/notFoundHandler"
import { setupMiddleware } from "./middleware/setupMiddleware"
import { setupMonitoring } from "./middleware/monitoringSetup"
import { rootHandler } from "./handlers/rootHandler" // Import the root handler
import { startBirthdayCouponCron } from "./src/cron/birthdayCoupons"
import { runRewardCheck } from "./src/cron/rewardCheckCron"
// Initialize express app
const app = express()
/**
 * Database connection established
 */
require("./database/redis")
require("./database/mongo")

/**
 * Middleware setup
 */
setupMiddleware(app)

// Setup monitoring
setupMonitoring(app)
startBirthdayCouponCron();
runRewardCheck()
/**
 * Routes setup
 */
app.use("/public", express.static(path.join(__dirname, "/public")))
app.use('/v1/uploads', express.static(path.join(__dirname, 'public/uploads'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // 👈 Important
  },
}));
app.use(`/v1`, routes)
app.use('/v1/uploads', (req, res, next) => {
  console.log('Trying to access:', req.url);
  next();
});


// Root endpoint
app.get("/", rootHandler)

// Use the new 404 error handler for unknown API requests
app.use(notFoundHandler)

// Convert error to ApiError, if needed
app.use(errorConverter)

// Handle error
app.use(errorHandler)

app.listen(3002, '0.0.0.0', () => {
  console.log('Listening on port 3002');
});

export default app

import { Router } from "express";
import * as analyticsController from "./controller.analytics";
import validate from "../../../middleware/validate";
import * as analyticsValidation from "./validation.analytics";
import { authenticate } from "../../../middleware/authentication";
import { UserEnum, TokenEnum } from "../../../utils/enumUtils";
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: analytics endpoints
 */

/**
 * @swagger
 * /analytics/top-items:
 *   get:
 *     summary: Get top selling items
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of documents at a time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The requested page number
 *       - in: query
 *         name: sortByValue
 *         schema:
 *           type: integer
 *           enum: [1, -1]
 *         description: Sort order (1 for ascending, -1 for descending)
 *       - in: query
 *         name: dateFilterKey
 *         schema:
 *           type: string
 *         description: The key for the date filter
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: The start date for the filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: The end date for the filter
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: string
 *         description: Outlet ID in hexadecimal object ID
 *         example: 66865ab71a563a25727793c5
 *       - in: query
 *         name: itemType
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [PRODUCT, SERVICE]
 *         description: Either PRODUCT or SERVICE or both
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Internal Server Error
 */

router.get(
  "/top-items",
  parseBodyAndQuery,
  (req, res, next) => {
    if (req.query.itemType && typeof req.query.itemType === "string") {
      req.query.itemType = [req.query.itemType];
    }
    next();
  },
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(analyticsValidation.getTopItems),
  analyticsController.getTopItems
);

/**
 * @swagger
 * /analytics/top-customer:
 *   get:
 *     summary: Get top selling customers
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of documents at a time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The requested page number
 *       - in: query
 *         name: sortByValue
 *         schema:
 *           type: integer
 *           enum: [1, -1]
 *         description: Sort order (1 for ascending, -1 for descending)
 *       - in: query
 *         name: dateFilterKey
 *         schema:
 *           type: string
 *         description: The key for the date filter
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: The start date for the filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: The end date for the filter
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: string
 *         description: Outlet ID in hexadecimal object ID
 *         example: 66865ab71a563a25727793c5
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Internal Server Error
 */

router.get(
  "/top-customer",
  parseBodyAndQuery,
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(analyticsValidation.getTopCustomer),
  analyticsController.getTopCustomer
);
/**
 * @swagger
 * /analytics/top-outlet:
 *   get:
 *     summary: Get top selling outlets
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of documents at a time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The requested page number
 *       - in: query
 *         name: sortByValue
 *         schema:
 *           type: integer
 *           enum: [1, -1]
 *         description: Sort order (1 for ascending, -1 for descending)
 *       - in: query
 *         name: dateFilterKey
 *         schema:
 *           type: string
 *         description: The key for the date filter
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: The start date for the filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: The end date for the filter
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Internal Server Error
 */

router.get(
  "/top-outlet",
  parseBodyAndQuery,
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(analyticsValidation.getTopOutlet),
  analyticsController.getTopOutlet
);

/**
 * @swagger
 * /analytics/outlet/sales-report:
 *   get:
 *     summary: Get outlet sales report
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reportDuration
 *         schema:
 *           type: string
 *           enum: [MONTHLY, WEEKLY, DAILY]
 *         description: The duration of the report
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Internal Server Error
 */

router.get(
  "/outlet/sales-report",
  parseBodyAndQuery,
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(analyticsValidation.getOutletReport),
  analyticsController.getOutletReport
);

router.get(
  "/outlet/sales-report-daily",
  parseBodyAndQuery,
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  // validate(analyticsValidation.getOutletReport),
  analyticsController.getOutletDailyReport
);
export default router;

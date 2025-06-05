import { Router } from "express";
import {
  createOutlet,
  getOutlets,
  getOutlet,
  updateOutlet,
  deleteOutlet,
  toggleOutletStatus,
} from "./controller.outlet";
import validate from "../../../middleware/validate";
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
  toggleStatusDocument,
} from "./validation.outlet";

import { authenticate } from "../../../middleware/authentication";
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery";
import { UserEnum, TokenEnum } from "../../../utils/enumUtils";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Outlets
 *   description: Outlet management endpoints
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /outlet/add:
 *   post:
 *     summary: Create a new outlet
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
  
*               name:
*                   type: string
*               address:
*                   type: string
*               city:
*                   type: string
*               region:
*                   type: string
*               country:
*                   type: string
*               phone:
*                   type: string
*               email:
*                   type: string
*               taxID:
*                   type: string
*               invoicePrefix:
*                   type: string
*               invoiceNumber:
*                   type: number
*               onlinePaymentAccountId:
*                   type: objectid
 *           required:
  
*               -name
*               -address
*               -city
*               -region
*               -country
*               -phone
*               -email
*               -taxID
*               -invoicePrefix
*               -invoiceNumber
*               -onlinePaymentAccountId
 *     parameters:
 *     responses:
 *       '201':
 *         description: Created
 *       '400':
 *         description: Bad Request
 *       '500':
 *         description: Internal Server Error
 */
router.post(
  "/add",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  // validate(create),
  createOutlet
);

/**
 * @swagger
 * /outlet/pagination:
 *   get:
 *     summary: Get all outlets with pagination
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: searchValue
 *         schema:
 *           type: string
 *       - in: query
 *         name: searchIn
 *         schema:
 *           type: array
 *           description: valid keys are name , email
 *           items:
 *             type: string
 *       - in: query
 *         name: dateFilter
 *         schema:
 *           type: Object
 *       - in: query
 *         name: rangeFilterBy
 *         schema:
 *           type: Object
 *       - in: query
 *         name: filterBy
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Internal Server Error
 */

router.get(
  "/pagination",
  parseBodyAndQuery,
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getAllFilter),
  getOutlets
);

/**
 * @swagger
 * /outlet/{outletId}:
 *   get:
 *     summary: Get a outlet by ID
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: outletId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Outlet not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:outletId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getOutlet
);

/**
 * @swagger
 * /outlet/{outletId}:
 *   put:
 *     summary: Update a outlet by ID
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: outletId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 
*               name:
*                   type: string
*               address:
*                   type: string
*               city:
*                   type: string
*               region:
*                   type: string
*               country:
*                   type: string
*               phone:
*                   type: string
*               email:
*                   type: string
*               taxID:
*                   type: string
*               invoicePrefix:
*                   type: string
*               invoiceNumber:
*                   type: number
*               onlinePaymentAccountId:
*                   type: objectid
 *           required:
 
*               -name
*               -address
*               -city
*               -region
*               -country
*               -phone
*               -email
*               -taxID
*               -invoicePrefix
*               -invoiceNumber
*               -onlinePaymentAccountId
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Outlet not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:outletId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  // validate(update),
  updateOutlet
);

/**
 * @swagger
 * /outlet/{outletId}:
 *   delete:
 *     summary: Delete a outlet by ID
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: outletId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content
 *       '404':
 *         description: Outlet not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:outletId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deleteOutlet
);

/**
 * @swagger
 * /outlet/toggle-status/{outletId}:
 *   put:
 *     summary: Toggle outlet status by ID
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: outletId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Outlet not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/toggle-status/:outletId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(toggleStatusDocument),
  toggleOutletStatus
);

export default router;

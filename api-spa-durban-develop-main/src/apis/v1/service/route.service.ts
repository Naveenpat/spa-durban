import { Router } from "express";
import {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
  toggleServiceStatus,
  addServiceToTop,
} from "./controller.service";
import validate from "../../../middleware/validate";
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
  toggleStatusDocument,
} from "./validation.service";
import { authenticate } from "../../../middleware/authentication";
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery";
import { UserEnum, TokenEnum } from "../../../utils/enumUtils";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Service management endpoints
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
 * /service/add:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceName:
 *                 type: string
 *               categoryId:
 *                 type: string
 *                 format: objectid
 *               subCategoryId:
 *                 type: string
 *                 format: objectid
 *               serviceCode:
 *                 type: string
 *               sellingPrice:
 *                 type: number
 *               outletIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: objectid
 *               description:
 *                 type: string
 *               termsAndConditions:
 *                 type: string
 *               serviceImageUrl:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: objectid
 *                     quantity:
 *                       type: number
 *           required:
 *             - serviceName
 *             - categoryId
 *             - subCategoryId
 *             - serviceCode
 *             - sellingPrice
 *             - outletIds
 *             - description
 *             - termsAndConditions
 *             - serviceImageUrl
 *             - products
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
  createService
);

/**
 * @swagger
 * /service/pagination:
 *   get:
 *     summary: Get all services with pagination
 *     tags: [Services]
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
  getServices
);
/**
 * @swagger
 * /service/{serviceId}:
 *   get:
 *     summary: Get a service by ID
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Service not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:serviceId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getService
);

/**
 * @swagger
 * /service/{serviceId}:
 *   put:
 *     summary: Update a service by ID
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
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
 
*               serviceName:
*                   type: string
*               categoryId:
*                   type: objectid
*               subCategoryId:
*                   type: objectid
*               serviceCode:
*                   type: string
*               sellingPrice:
*                   type: number
*               outletIds:
*                   type: objectid
*               description:
*                   type: string
*               termsAndConditions:
*                   type: string
*               serviceImageUrl:
*                   type: string
*               products:
*                   type: string
 *           required:
 
*               -serviceName
*               -categoryId
*               -subCategoryId
*               -serviceCode
*               -sellingPrice
*               -outletIds
*               -description
*               -termsAndConditions
*               -serviceImageUrl
*               -products
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Service not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:serviceId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  // validate(update),
  updateService
);
router.put(
  "/ToTop/:serviceId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  // validate(update),
  addServiceToTop
);
/**
 * @swagger
 * /service/{serviceId}:
 *   delete:
 *     summary: Delete a service by ID
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content
 *       '404':
 *         description: Service not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:serviceId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deleteService
);

/**
 * @swagger
 * /service/toggle-status/{serviceId}:
 *   put:
 *     summary: Toggle service status by ID
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Service not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/toggle-status/:serviceId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(toggleStatusDocument),
  toggleServiceStatus
);

export default router;

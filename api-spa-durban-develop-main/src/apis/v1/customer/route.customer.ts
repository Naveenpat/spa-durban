import { Router } from "express";
import {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  toggleCustomerStatus,
  createCustomerByBooking,
  exportCustomerCsvSheet,
  importCustomerCsvSheet,
  getCustomerDropdown,
} from "./controller.customer";
import validate from "../../../middleware/validate";
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
  toggleStatusDocument,
} from "./validation.customer";
import { authenticate } from "../../../middleware/authentication";
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery";
import { UserEnum, TokenEnum } from "../../../utils/enumUtils";
import multer, { FileFilterCallback } from "multer"

const router = Router();
const upload = multer();
/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management endpoints
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

router.post(
  "/booking/add",
  //authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  // validate(create),
  createCustomerByBooking
);
/**
 * @swagger
 * /customer/add:
 *   post:
 *     summary: Create a new customer
 *     tags:
 *       - Customers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               region:
 *                 type: string
 *               country:
 *                 type: string
 *               taxNo:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *               gender:
 *                 type: string
 *               customerType:
 *                 type: string
 *             required:
 *               - customerName
 *               - phone
 *               - email
 *               - address
 *               - city
 *               - region
 *               - country
 *               - taxNo
 *               - customerType
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
  createCustomer
);

/**
 * @swagger
 * /customer/pagination:
 *   get:
 *     summary: Get all customers with pagination
 *     tags: [Customers]
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
  getCustomers
);
/**
 * @swagger
 * /customer/{customerId}:
 *   get:
 *     summary: Get a customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Customer not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:customerId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getCustomer
);

/**
 * @swagger
 * /customer/{customerId}:
 *   put:
 *     summary: Update a customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
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
 
*               customerName:
*                   type: string
*               phone:
*                   type: string
*               email:
*                   type: string
*               address:
*                   type: string
*               city:
*                   type: string
*               region:
*                   type: string
*               country:
*                   type: string
*               taxNo:
*                   type: string
*               dateOfBirth:
*                   type: string
*               gender:
*                   type: string
*               customerType:
*                   type: string
*           required:
 
*               -customerName
*               -phone
*               -email
*               -address
*               -city
*               -region
*               -country
*               -taxNo
*               -customerType
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Customer not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:customerId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  // validate(update),
  updateCustomer
);

/**
 * @swagger
 * /customer/{customerId}:
 *   delete:
 *     summary: Delete a customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content
 *       '404':
 *         description: Customer not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:customerId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deleteCustomer
);

/**
 * @swagger
 * /customer/toggle-status/{customerId}:
 *   put:
 *     summary: Toggle customer status by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Customer not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/toggle-status/:customerId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(toggleStatusDocument),
  toggleCustomerStatus
);

router.post(
  '/new/import-csv',
  authenticate([UserEnum.Admin], TokenEnum.Access),
  upload.single('file'), // `file` is the name expected in form-data
  importCustomerCsvSheet
);


router.get(
  '/new/export-csv',
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  exportCustomerCsvSheet
);

router.get(
  "/new/dropdown",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  getCustomerDropdown
)

export default router;

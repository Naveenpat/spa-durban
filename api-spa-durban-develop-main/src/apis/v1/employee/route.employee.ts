import { Router } from "express";
import {
  createEmployee,
  getEmployees,
  getEmployee,
  getEmployeeRoles,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeStatus,
  createBookingEmployee,
  exportEmployeeCsvSheet,
  importEmployeeCsvSheet,
} from "./controller.employee";
import validate from "../../../middleware/validate";
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
  toggleStatusDocument,
} from "./validation.employee";
import { authenticate } from "../../../middleware/authentication";
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery";
import { UserEnum, TokenEnum } from "../../../utils/enumUtils";
import { fileUpload } from "../../../middleware/multerFileUpload";
import multer, { FileFilterCallback } from "multer"


const upload = multer();
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management endpoints
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
  // authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  // validate(create),
  createBookingEmployee
);
/**
 * @swagger
 * /employee/add:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                   type: string
 *               email:
 *                   type: string
 *               password:
 *                   type: string
 *               userRoleId:
 *                   type: string
 *               outletsId:
 *                   type: array
 *                   items:
 *                        type: string
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
 *               salesCommissionPercent:
 *                   type: string
 *           required:
 *               -userName
 *               -email
 *               -password
 *               -userRoleId
 *               -outletsId
 *               -name
 *               -address
 *               -city
 *               -region
 *               -country
 *               -phone
 *               -salesCommissionPercent
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
  validate(create),
  createEmployee
);

/**
 * @swagger
 * /employee/pagination:
 *   get:
 *     summary: Get all employees with pagination
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: objectid
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
 *           required:
 *               -outletId
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
  getEmployees
);

/**
 * @swagger
 * /employee/get-employee-roles:
 *   get:
 *     summary: Get employee Roles
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Employee not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/get-employee-roles",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  // validate(getById),
  getEmployeeRoles
);

/**
 * @swagger
 * /employee/{employeeId}:
 *   get:
 *     summary: Get a employee by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Employee not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:employeeId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getEmployee
);

/**
 * @swagger
 * /employee/{employeeId}:
 *   put:
 *     summary: Update a employee by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
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
 *               userName:
 *                   type: string
 *               email:
 *                   type: string
 *               password:
 *                   type: string
 *               userRoleId:
 *                   type: string
 *               outletsId:
 *                   type: array
 *                   items:
 *                        type: string
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
 *               salesCommissionPercent:
 *                   type: string
 *           required:
 *               -userName
 *               -email
 *               -password
 *               -userRoleId
 *               -outletsId
 *               -name
 *               -address
 *               -city
 *               -region
 *               -country
 *               -phone
 *               -salesCommissionPercent
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Employee not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:employeeId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(update),
  updateEmployee
);

/**
 * @swagger
 * /employee/{employeeId}:
 *   delete:
 *     summary: Delete a employee by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content
 *       '404':
 *         description: Employee not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:employeeId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deleteEmployee
);

/**
 * @swagger
 * /employee/toggle-status/{employeeId}:
 *   put:
 *     summary: Toggle employee status by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: employee not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/toggle-status/:employeeId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(toggleStatusDocument),
  toggleEmployeeStatus
);

router.post(
  '/new/import-csv',
  authenticate([UserEnum.Admin], TokenEnum.Access),
  upload.single('file'), // file input must be named 'file'
  importEmployeeCsvSheet
);


router.get(
  '/new/export-csv',
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  exportEmployeeCsvSheet
);


export default router;

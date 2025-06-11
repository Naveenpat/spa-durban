import { Router } from "express";
import validate from "../../../middleware/validate";
import {
  create,
  update,
  getAll,
  getById,
} from "./validation.company";
import { authenticate } from "../../../middleware/authentication";
import { UserEnum, TokenEnum } from "../../../utils/enumUtils";
import {
  createCompanys,
  getByIdCompanys,
  updateByIdCompanys,
  removeCompanys,
  toggleStatusCompanys,
  getComponies
} from "./controller.company";
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery"
import { getAllFilter } from "../category/validation.category";
import { queryRoles } from "./service.company";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Company
 *   description: Company management endpoints
 */

/**
 * @swagger
 * /company/add:
 *   post:
 *     summary: Create a new company
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               logo:
 *                 type: string
 *             required:
 *               - companyName
 *               - email
 *               - phone
 *     responses:
 *       '201':
 *         description: Created
 */
router.post(
  "/add",
  authenticate([UserEnum.Admin], TokenEnum.Access),
  validate(create),
  createCompanys
);

/**
 * @swagger
 * /company:
 *   get:
 *     summary: Get all companies
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: OK
 */
router.get(
  "/pagination",
  parseBodyAndQuery,
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getAllFilter),
  getComponies
)

/**
 * @swagger
 * /company/{id}:
 *   get:
 *     summary: Get company by ID
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Not Found
 */
router.get(
  "/:id",
  authenticate([UserEnum.Admin], TokenEnum.Access),
  validate(getById),
  getByIdCompanys
);

/**
 * @swagger
 * /company/{id}:
 *   put:
 *     summary: Update company by ID
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               companyName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               logo:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Updated
 */
router.put(
  "/:id",
  authenticate([UserEnum.Admin], TokenEnum.Access),
  validate(update),
  updateByIdCompanys
);


router.delete(
  "/:id",
  authenticate([UserEnum.Admin], TokenEnum.Access), // Only admins can delete
  // validate(deleteCompany), // Optional: validate ObjectId format
  removeCompanys
);
export default router;

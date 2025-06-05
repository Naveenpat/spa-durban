import { Router } from "express";
import {
  createRegister,
  getRegisters,
  getRegisterById,
  updateRegister,
  deleteRegister,
  toggleRegisterStatus,
  getRegisterCurentDate,
  createCloseRegister,
  getGivenChangeSum
} from "./controller.register";
import validate from "../../../middleware/validate";
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
} from "./validation.register";
import { authenticate } from "../../../middleware/authentication";
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery";
import { UserEnum, TokenEnum } from "../../../utils/enumUtils";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Register
 *   description: Register management endpoints
 */

/**
 * @swagger
 * /register/add:
 *   post:
 *     summary: Add a new register entry
 *     tags: [Register]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               openingBalance:
 *                 type: number
 *               outletId:
 *                 type: string
 *             required:
 *               - openingBalance
 *               - outletId
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
  createRegister
);
router.post(
  "/addClose",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  // validate(create),
  createCloseRegister
);

/**
 * @swagger
 * /register/pagination:
 *   get:
 *     summary: Get all registers with pagination
 *     tags: [Register]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchValue
 *         schema:
 *           type: string
 *       - in: query
 *         name: searchIn
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: dateFilter
 *         schema:
 *           type: object
 *       - in: query
 *         name: rangeFilterBy
 *         schema:
 *           type: object
 *       - in: query
 *         name: filterBy
 *         schema:
 *           type: array
 *           items:
 *             type: object
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
  getRegisters
);

/**
 * @swagger
 * /register/{registerId}:
 *   get:
 *     summary: Get a register by ID
 *     tags: [Register]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Register not found
 *       '500':
 *         description: Internal Server Error
 */

router.get(
  "/currentDate/:outletId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  // validate(getById),
  getRegisterCurentDate
);

router.get(
  "/given-change/:outletId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  getGivenChangeSum
);


router.get(
  "/:registerId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getRegisterById
);

/**
 * @swagger
 * /register/toggle-status/{registerId}:
 *   put:
 *     summary: Toggle register status by ID
 *     tags: [Register]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Register not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/toggle-status/:registerId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  // validate(toggleStatusDocument),
  toggleRegisterStatus
);

/**
 * @swagger
 * /register/{registerId}:
 *   put:
 *     summary: Update a register by ID
 *     tags: [Register]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registerId
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
 *               openingBalance:
 *                 type: number
 *               outletId:
 *                 type: string
 *             required:
 *               - openingBalance
 *               - outletId
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Register not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:registerId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(update),
  updateRegister
);

/**
 * @swagger
 * /register/{registerId}:
 *   delete:
 *     summary: Delete a register by ID
 *     tags: [Register]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Deleted successfully
 *       '404':
 *         description: Register not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:registerId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deleteRegister
);

export default router;

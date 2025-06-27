import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductDetailByBarcode,
  searchInProductAndService,
  toggleProductStatus,
  searchInProductAndServiceAll,
} from "./controller.product";
import validate from "../../../middleware/validate";
import {} from "./controller.product";
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
  getByBarcode,
  toggleStatusDocument,
  productAndService,
} from "./validation.product";

import { authenticate } from "../../../middleware/authentication";
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery";
import { UserEnum, TokenEnum } from "../../../utils/enumUtils";
import { fileUpload } from "../../../middleware/multerFileUpload";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
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
 * /product/add:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                   type: string
 *               productCode:
 *                   type: string
 *               subCategoryId:
 *                   type: string
 *               brandId:
 *                   type: string
 *               productImageUrl:
 *                   type: string
 *               description:
 *                   type: string
 *               measurementUnitId:
 *                   type: string
 *               barcode:
 *                   type: string
 *               mrp:
 *                   type: number
 *               sellingPrice:
 *                   type: number
 *               purchasePrice:
 *                   type: number
 *               taxIds:
 *                   type: array
 *                   items:
 *                      type: string
 *                      description: MongoDB ObjectId
 *             required:
 *               -productName
 *               -productCode
 *               -subCategoryId
 *               -brandId
 *               -productImageUrl
 *               -description
 *               -measurementUnitId
 *               -barcode
 *               -mrp
 *               -sellingPrice
 *               -purchasePrice
 *               -taxIds
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
  createProduct
);

/**
 * @swagger
 * /product/pagination:
 *   get:
 *     summary: Get all products with pagination
 *     tags: [Products]
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
  getProducts
);
/**
 * @swagger
 * /product/service-search:
 *   get:
 *     summary: search Api for product and service
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchValue
 *         schema:
 *           type: string
 *       - in: query
 *         name: filterBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Internal Server Error
 */

router.get(
  "/service-search",
  parseBodyAndQuery,
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(productAndService),
  searchInProductAndService
);

router.get(
  "/service-search-all",
  parseBodyAndQuery,
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(productAndService),
  searchInProductAndServiceAll
);
/**
 * @swagger
 * /product/{productId}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Product not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:productId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getProduct
);
/**
 * @swagger
 * /product/{barcode}/details:
 *   get:
 *     summary: Get a product details by barcode
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Product detail not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:barcode/details",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getByBarcode),
  getProductDetailByBarcode
);

/**
 * @swagger
 * /product/{productId}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
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
 *               productName:
 *                   type: string
 *               productCode:
 *                   type: string
 *               subCategoryId:
 *                   type: string
 *               brandId:
 *                   type: string
 *               productImageUrl:
 *                   type: string
 *               description:
 *                   type: string
 *               measurementUnitId:
 *                   type: string
 *               barcode:
 *                   type: string
 *               mrp:
 *                   type: number
 *               sellingPrice:
 *                   type: number
 *               purchasePrice:
 *                   type: number
 *               taxIds:
 *                   type: array
 *                   items:
 *                      type: string
 *                      description: MongoDB ObjectId
 *             required:
 *               -productName
 *               -productCode
 *               -subCategoryId
 *               -brandId
 *               -productImageUrl
 *               -description
 *               -measurementUnitId
 *               -barcode
 *               -mrp
 *               -sellingPrice
 *               -purchasePrice
 *               -taxIds
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Product not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:productId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  // validate(update),
  updateProduct
);

/**
 * @swagger
 * /product/{productId}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content
 *       '404':
 *         description: Product not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:productId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deleteProduct
);

/**
 * @swagger
 * /product/toggle-status/{productId}:
 *   put:
 *     summary: Toggle product status by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Product not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/toggle-status/:productId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(toggleStatusDocument),
  toggleProductStatus
);


router.post("/upload", fileUpload.single("file"), (req, res) => {
  const { folder = "default" } = req.body
  const file = req.file

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" })
  }

  const safeFolder = folder.replace(/[^a-zA-Z0-9-_]/g, "")
  const filePath = `uploads/${safeFolder}/${file.filename}`

  return res.status(200).json({
    message: "File uploaded successfully",
    file_path: filePath,
    originalName: file.originalname,
  })
})


export default router;

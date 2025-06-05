import express, { Router } from "express";
import swaggerJsdoc, { Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import config from "../../../config/config";
import * as fs from "fs";
const version = require("../../../package.json").version;

const router: Router = express.Router();
let files = fs.readdirSync("src/apis/v1/");
let swaggerSchema: string[] = [];
for (let i in files) {
  if (fs.existsSync(`src/apis/v1/${files[i]}/route.${files[i]}.ts`)) {
    swaggerSchema.push(`src/apis/v1/${files[i]}/route.${files[i]}.ts`);
  }
}
const options: Options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: config.project,
      version: version,
      description: `API Library for ${config.project} project`,
    },
    servers: [
      {
        url: `/v1`,
      },
    ],
    schemes: ["https", "http"],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
  },
  apis: [...swaggerSchema], // Adjust this path if necessary
};

const specs = swaggerJsdoc(options);

router.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
  })
);

export default router;

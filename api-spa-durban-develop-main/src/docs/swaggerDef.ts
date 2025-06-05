import { SwaggerDefinition } from "swagger-jsdoc";
import config from "../../config/config";

const { version } = require("../../../package.json");

const swaggerDef: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: config.project,
    version: version,
    description: `API Library for ${config.project} project`,
    license: {
      name: "",
      url: "",
    },
  },
  securityDefinitions: {
    security: [{ bearerAuth: [] }], // Ensure bearerAuth matches the expected structure
    bearerAuth: {
      type: "string",
      name: "x-access-token",
      scheme: "bearer",
      in: "headers",
    },
  },
  servers: [
    {
      url: `localhost:${config.port}/v1`,
    },
  ],
};

export default swaggerDef;

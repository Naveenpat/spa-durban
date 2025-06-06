import config from "./config";

// ./config/corsOptions.ts
const corsOptions = {
  origin:"*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization", "Device-id"],
};

export default corsOptions;

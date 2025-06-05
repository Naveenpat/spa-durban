import dotenv from "dotenv"
import Joi from "joi"
import ApiError from "../utilities/apiError"
import httpStatus from "http-status"

dotenv.config()

interface EnvVars {
  PROJECT_NAME: string
  NODE_ENV: "production" | "development" | "test"
  PORT: string // Change PORT type to string in the interface
  MONGODB_URL: string
  JWT_SECRET_ACCESS: string
  JWT_SECRET_REFRESH: string
  JWT_EXPIRATION_ACCESS: string
  JWT_EXPIRATION_REFRESH: string
  REDIS_URL: string
  REDIS_URL_TLS: string
  ALLOWED_ORIGINS: string
  JWT_EXPIRATION_RESET_PASSWORD: string
  JWT_EXPIRATION_OTP_VERIFY: string
  SMTP_MAIL_HOST: string
  SMTP_MAIL_USER: string
  SMTP_MAIL_PASSWORD: string
  SMTP_EMAIL_ID: string
}

// Destructure process.env and assert as EnvVars
const {
  PROJECT_NAME,
  NODE_ENV,
  PORT,
  MONGODB_URL,
  JWT_SECRET_ACCESS,
  JWT_SECRET_REFRESH,
  JWT_EXPIRATION_ACCESS,
  JWT_EXPIRATION_REFRESH,
  REDIS_URL,
  REDIS_URL_TLS,
  ALLOWED_ORIGINS,
  JWT_EXPIRATION_RESET_PASSWORD,
  JWT_EXPIRATION_OTP_VERIFY,
  SMTP_MAIL_HOST,
  SMTP_MAIL_USER,
  SMTP_MAIL_PASSWORD,
  SMTP_EMAIL_ID,
} = process.env as unknown as EnvVars // Assert as EnvVars

// Define the object representing environment variables
const envObj: EnvVars = {
  PROJECT_NAME,
  NODE_ENV: NODE_ENV as "production" | "development" | "test",
  PORT: PORT, // Use a default string value for PORT if not provided
  MONGODB_URL,
  JWT_SECRET_ACCESS,
  JWT_SECRET_REFRESH,
  JWT_EXPIRATION_ACCESS,
  JWT_EXPIRATION_REFRESH,
  REDIS_URL,
  REDIS_URL_TLS,
  ALLOWED_ORIGINS,
  JWT_EXPIRATION_RESET_PASSWORD,
  JWT_EXPIRATION_OTP_VERIFY,
  SMTP_MAIL_HOST,
  SMTP_MAIL_USER,
  SMTP_MAIL_PASSWORD,
  SMTP_EMAIL_ID,
}

// Define Joi schema to validate environment variables
const envVarsSchema = Joi.object<EnvVars>({
  PROJECT_NAME: Joi.string().default("SPA DURBON").required(),
  NODE_ENV: Joi.string().valid("production", "development", "test").required(),
  PORT: Joi.string().required(), // Ensure PORT is treated as a string
  MONGODB_URL: Joi.string().required().label("Mongo DB url"),

  REDIS_URL: Joi.string().required().label("REDIS URL url"),
  REDIS_URL_TLS: Joi.string().required().label("REDIS URL TLS url"),

  JWT_SECRET_ACCESS: Joi.string().required().label("JWT secret key"),
  JWT_SECRET_REFRESH: Joi.string().required().label("JWT secret refresh key"),

  JWT_EXPIRATION_ACCESS: Joi.string()
    .required()
    .label("JWT access token expiration"),

  JWT_EXPIRATION_REFRESH: Joi.string()
    .required()
    .label("JWT refresh token expiration"),

  JWT_EXPIRATION_RESET_PASSWORD: Joi.string()
    .required()
    .label("JWT access token expiration"),

  JWT_EXPIRATION_OTP_VERIFY: Joi.string()
    .required()
    .label("JWT refresh token expiration"),

  ALLOWED_ORIGINS: Joi.string()
    .required()
    .label("Allowed cors origin urls saperated by comma (,) are required"),

  SMTP_MAIL_HOST: Joi.string().required().description("smtp mail host"),
  SMTP_MAIL_USER: Joi.string().required().description("smtp mail user."),
  SMTP_MAIL_PASSWORD: Joi.string().required().description("smtp mail password"),
  SMTP_EMAIL_ID: Joi.string().required().description("smtp email id"),
}).required()

// Validate environment variables against the schema
const { value: envVars, error } = envVarsSchema.validate(envObj, {
  abortEarly: false, // Ensure all errors are captured
  allowUnknown: true, // Allow unknown keys (if any) in envObj
})

// Handle validation errors if any
if (error) {
  throw new ApiError(
    httpStatus.INTERNAL_SERVER_ERROR,
    `Config validation error: ${error.message}`
  )
}

// Export the validated configuration
export default {
  env: envVars.NODE_ENV,
  port: parseInt(envVars.PORT, 10), // Ensure PORT is parsed as a number when needed
  mongoose: {
    url: envVars.MONGODB_URL,
    options: {
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true,
      autoIndex: true,
    },
  },
  project: envVars.PROJECT_NAME,

  jwt_secret_access: envVars.JWT_SECRET_ACCESS,
  jwt_secret_refresh: envVars.JWT_SECRET_REFRESH,

  jwt_expires_access: envVars.JWT_EXPIRATION_ACCESS,
  jwt_expires_refresh: envVars.JWT_EXPIRATION_REFRESH,

  jwt_expires_reset_password: envVars.JWT_EXPIRATION_RESET_PASSWORD,
  jwt_expires_otp_verify: envVars.JWT_EXPIRATION_OTP_VERIFY,

  base_url: `localhost:${envVars.PORT}/`,

  redis: {
    tlsFlag: true, // Whether to use TLS for Redis
    url: envVars.REDIS_URL, // Redis URL (non-TLS)
    urlTls: envVars.REDIS_URL_TLS, // Redis URL with TLS
    // Add other Redis configuration options as needed
  },

  allowed_origins:
    envVars.NODE_ENV === "production"
      ? envVars.ALLOWED_ORIGINS?.split(",")
      : "*",

  smtp_mail_host: envVars.SMTP_MAIL_HOST,
  smtp_mail_user: envVars.SMTP_MAIL_USER,
  smtp_mail_password: envVars.SMTP_MAIL_PASSWORD,
  smtp_mail_email: envVars.SMTP_EMAIL_ID,
}

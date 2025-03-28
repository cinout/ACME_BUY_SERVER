import "dotenv/config";

const SERVER_PORT = process.env.SERVER_PORT || 3001;
const DATABASE_PORT = process.env.DATABASE_PORT;
const DATABASE_NAME_DEV = process.env.DATABASE_NAME_DEV;
const DATABASE_NAME_TEST = process.env.DATABASE_NAME_TEST;
const DATABASE_NAME_PROD = process.env.DATABASE_NAME_PROD;
const AUTH_SECRET = process.env.AUTH_SECRET;
const NODE_ENV = process.env.NODE_ENV;

const CLOUD_NAME = process.env.CLOUD_NAME;
const CLOUD_API_KEY = process.env.CLOUD_API_KEY;
const CLOUD_API_SECRET = process.env.CLOUD_API_SECRET;

const config = {
  SERVER_PORT,
  DATABASE_PORT,
  DATABASE_NAME_DEV,
  DATABASE_NAME_TEST,
  DATABASE_NAME_PROD,
  AUTH_SECRET,
  NODE_ENV,
  CLOUD_NAME,
  CLOUD_API_KEY,
  CLOUD_API_SECRET,
};

export default config;

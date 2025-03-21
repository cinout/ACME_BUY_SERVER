import "dotenv/config";

export const serverPort = process.env.SERVER_PORT || 3001;
export const db_port = process.env.DATABASE_PORT;
export const db_name = process.env.DATABASE_NAME;
export const authSecret = process.env.AUTH_SECRET;
export const nodeEnv = process.env.NODE_ENV;

export const cloudinaryName = process.env.CLOUD_NAME;
export const cloudinaryAPIKey = process.env.CLOUD_API_KEY;
export const cloudinaryAPISecret = process.env.CLOUD_API_SECRET;

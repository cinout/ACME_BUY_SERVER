import jwt from "jsonwebtoken";

const createToken = (data: Record<string, unknown>) => {
  const token = jwt.sign(data, process.env.AUTH_SECRET as string, {
    expiresIn: "7d", // Controls when the token becomes invalid, regardless of whether it is stored in a cookie or elsewhere.
  });
  return token;
};

// Setting expiry in both "expiresIn" and "maxAge" to the same value ensures the cookie and token expire at the same time.

export const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // (in milliseconds), no need to use expires as maxAge servers the purpose already. This determines when the cookie itself gets deleted from the user's browser.
  httpOnly: true, // Prevents the cookie from being accessed via JavaScript (enhanced security)
  secure: process.env.NODE_ENV === "production", // Ensures the cookie is only sent over HTTPS in production
  sameSite: "strict" as const, // telling TypeScript that "strict" is a literal value // Prevents the cookie from being sent with cross-origin requests
  // TODO: add domain property?
};

export default createToken;

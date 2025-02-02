// import crypto from "crypto";
// export const secret = crypto.randomBytes(64).toString("hex"); // generate secure secret, rather than hardcoded in .env file
// console.log(secret);

import argon2 from "argon2";
const password = argon2.hash("12345678", {
  type: argon2.argon2id,
});
password.then((a) => console.log(a));

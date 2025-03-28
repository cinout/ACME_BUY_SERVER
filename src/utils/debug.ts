import argon2 from "argon2";
const pw = argon2.hash("12345678", {
  type: argon2.argon2id,
});
pw.then((a) => console.log(a));

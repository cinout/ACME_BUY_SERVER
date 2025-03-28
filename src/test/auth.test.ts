import { test, after, before, describe } from "node:test";
import mongoose from "mongoose";
import supertest from "supertest";
import app from "../app";
import { RoleEnum, UserSignupMethodEnum, UserStatusEnum } from "@/utils/enums";
import UserModel from "@/models/UserModel";
import assert from "node:assert";

// create a superagent object
const api = supertest(app);

// create fixture(dummy) data
const fixtureUser = {
  firstname: "Jack",
  lastname: "Smith",
  email: "jack.smith@yahoo.com",
  password: "12345678",
  status: UserStatusEnum.Pending,
  signupMethod: UserSignupMethodEnum.Default,
  imageUrl: "some_url",
  imageName: "some_name",
  role: RoleEnum.User,
};
const unregisteredUserEmail = "randomEmail";
const wrongPassword = "random";

describe("sign up", () => {
  before(async () => {
    await UserModel.deleteMany({}); // clear database collection
  });

  test("new user registering", async () => {
    const response = await api
      .post("/api/auth/user-signup")
      .send(fixtureUser)
      .expect(201)
      .expect("Content-Type", /application\/json/); // ues regex so that Content-Type "contains" the value instead of equating to the value

    assert(Object.keys(response.body).includes("message"));
    assert(Object.keys(response.body).includes("accessToken"));
    assert.strictEqual(response.body.message, "New user successfully created.");
  });

  test("duplicate user registering", async () => {
    const response = await api
      .post("/api/auth/user-signup")
      .send(fixtureUser)
      .expect(409)
      .expect("Content-Type", /application\/json/); // ues regex so that Content-Type "contains" the value instead of equating to the value

    assert(Object.keys(response.body).includes("error"));
    assert.strictEqual(response.body.error, "Email already exists.");
  });

  after(async () => {
    await UserModel.deleteMany({}); // clear database collection
  });
});

describe("log in", () => {
  before(async () => {
    await UserModel.deleteMany({}); // clear database collection
    await UserModel.create(fixtureUser); // create fixture data
  });

  test("registered user with correct password", async () => {
    const response = await api
      .post("/api/auth/user-login")
      .send({
        email: fixtureUser.email,
        password: fixtureUser.password,
      })
      .expect(200)
      .expect("Content-Type", /application\/json/); // ues regex so that Content-Type "contains" the value instead of equating to the value

    assert(Object.keys(response.body).includes("message"));
    assert(Object.keys(response.body).includes("accessToken"));
    assert.strictEqual(response.body.message, "Login success.");
  });

  test("registered user with wrong password", async () => {
    const response = await api
      .post("/api/auth/user-login")
      .send({
        email: fixtureUser.email,
        password: wrongPassword,
      })
      .expect(404)
      .expect("Content-Type", /application\/json/); // ues regex so that Content-Type "contains" the value instead of equating to the value

    assert(Object.keys(response.body).includes("error"));
    assert.strictEqual(response.body.error, "Password does not match.");
  });

  test("unregistered user", async () => {
    const response = await api
      .post("/api/auth/user-login")
      .send({
        email: unregisteredUserEmail,
        password: wrongPassword,
      })
      .expect(404)
      .expect("Content-Type", /application\/json/); // ues regex so that Content-Type "contains" the value instead of equating to the value

    assert(Object.keys(response.body).includes("error"));
    assert.strictEqual(response.body.error, "Email not found.");
  });

  after(async () => {
    await UserModel.deleteMany({}); // clear database collection
  });
});

after(async () => {
  await mongoose.connection.close();
});

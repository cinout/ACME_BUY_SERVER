import UserModel from "@/models/UserModel";
import { selectRandomItemFromArray } from "@/utils/array";
import { RoleEnum, UserSignupMethodEnum, UserStatusEnum } from "@/utils/enums";
import { faker } from "@faker-js/faker";
import { Country, State, City } from "country-state-city";
import seedingScriptConnectDB from ".";
import argon2 from "argon2";

seedingScriptConnectDB();

async function userScript() {
  try {
    // Dummy Data
    const password = "12345678";
    const pwEnc = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const allCountries = Country.getAllCountries();

    const userStats = Array.from({ length: 50 }, () => {
      const country = selectRandomItemFromArray(allCountries).isoCode;

      const allStates = State.getStatesOfCountry(country);
      let state = "";
      if (allStates?.length > 0) {
        state = selectRandomItemFromArray(allStates).isoCode;
      }

      let city = "";
      if (state) {
        const allCities = City.getCitiesOfState(country, state);
        if (allCities?.length > 0) {
          city = selectRandomItemFromArray(allCities).name;
        }
      }

      return {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        email: faker.internet.email(),
        password: pwEnc,

        status: UserStatusEnum.Active,
        signupMethod: UserSignupMethodEnum.Default,
        shopName: faker.company.name(),

        imageUrl: faker.image.personPortrait({ size: 256 }),
        imageName: "default_image.jpg",

        rating:
          Math.random() < 0.5
            ? faker.number.float({ min: 0, max: 5, multipleOf: 0.1 })
            : 4.6,

        country: country,
        state: state,
        city: city,

        zipCode: faker.location.zipCode(),
        role: RoleEnum.User,
      };
    });

    console.log(userStats[2]);

    // Insert
    await UserModel.insertMany(userStats);
    console.log("User Data are successfully inserted!");
  } catch (err) {
    console.error("Error while seeding data:", err);
  }
}

userScript();

import SellerModel from "@/models/SellerModel";
import { selectRandomItemFromArray } from "@/utils/array";
import { SellerSignupMethodEnum, SellerStatusEnum } from "@/utils/enums";
import { faker } from "@faker-js/faker";
import { Country, State, City } from "country-state-city";
import seedingScriptConnectDB from ".";

seedingScriptConnectDB();

async function sellerScript() {
  try {
    // Dummy Data
    const password = "12345678";

    const allCountries = Country.getAllCountries();

    const sellerStats = Array.from({ length: 100 }, () => {
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
        password: password,

        status: SellerStatusEnum.Active,
        signupMethod: SellerSignupMethodEnum.Default,
        shopName: faker.company.name(),

        imageUrl: faker.image.personPortrait({ size: 256 }),
        imageName: "default_image.jpg",

        country: country,
        state: state,
        city: city,

        zipCode: faker.location.zipCode(),
      };
    });

    console.log(sellerStats);

    // Insert
    await SellerModel.insertMany(sellerStats);
    console.log("Seller Data are successfully inserted!");
  } catch (err) {
    console.error("Error while seeding data:", err);
  }
}

sellerScript();

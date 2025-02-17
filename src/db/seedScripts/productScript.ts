import UserModel from "@/models/UserModel";
import ProductModel from "@/models/ProductModel";
import GenreModel from "@/models/GenreModel";
import { selectRandomItemFromArray } from "@/utils/array";
import { faker } from "@faker-js/faker";
import seedingScriptConnectDB from ".";
import musicInfo from "@/utils/musicInfo.json";
import { v7 } from "uuid";
import { GradingEnum, MediaFormatEnum, ReleaseRegionEnum } from "@/utils/enums";

seedingScriptConnectDB();

async function productScript() {
  try {
    // get all Users
    const allUsers = await UserModel.find().select("id");
    const allUserIds = allUsers.map((a) => a._id.toString());

    // get all Genres
    const allGenres = await GenreModel.find().select("id");
    const allGenreIds = allGenres.map((a) => a._id.toString());

    // get all Music
    const products = musicInfo.map((music) => ({
      name: music.title,
      artist: music.artist,
      year: music.year,
      images: music.images.map((a, i) => ({
        id: v7(),
        file: a,
        name: `image ${i}`,
      })),
      format: selectRandomItemFromArray(Object.values(MediaFormatEnum)),
      grading: selectRandomItemFromArray(Object.values(GradingEnum)),
      region: selectRandomItemFromArray(Object.values(ReleaseRegionEnum)),
      genreId: selectRandomItemFromArray(allGenreIds),
      userId: selectRandomItemFromArray(allUserIds),
      stock: faker.number.int({ min: 0, max: 100, multipleOf: 1 }),
      price: faker.number.float({ min: 0, max: 600, multipleOf: 0.01 }),
      discount:
        Math.random() < 0.05
          ? faker.number.float({ min: 0, max: 100, multipleOf: 0.1 })
          : 0,
      rating: faker.number.float({ min: 0, max: 5, multipleOf: 0.1 }),
      description: faker.lorem.paragraph({ min: 1, max: 8 }),
    }));

    // insert data
    await ProductModel.insertMany(products);
    console.log("Product data are successfully inserted!");
  } catch (err) {
    console.error("Error while seeding data:", err);
  }
}

productScript();

import UserModel from "@/models/UserModel";
import ProductModel from "@/models/ProductModel";
import GenreModel from "@/models/GenreModel";
import {
  selectRandomItemFromArray,
  selectRandomNItemsFromArray,
} from "@/utils/array";
import { faker } from "@faker-js/faker";

import musicInfo from "@/utils/musicInfo.json";
import { v7 } from "uuid";
import { GradingEnum, MediaFormatEnum, ReleaseRegionEnum } from "@/utils/enums";
import { getRandomDate } from "@/utils/date";
import connectDB from "@/db";
await connectDB();

async function productScript() {
  try {
    // get all Users
    const allUsers = await UserModel.find().select("id");
    const allUserIds = allUsers.map((a) => a._id.toString());

    // get all Genres
    const allGenres = await GenreModel.find().select("id");
    const allGenreIds = allGenres.map((a) => a._id.toString());

    // get all Music
    const products = musicInfo.map((music) => {
      const randomDate = getRandomDate(new Date("2023-01-01"), new Date());

      return {
        name: music.title,
        artist: music.artist,
        year: music.year,
        images: music.images.map((a, i) => ({
          id: v7(),
          file: a,
          name: `image ${i}`,
        })),
        tracklist: music.tracklist?.map((a) => ({
          title: a.title,
          indexDisplay: a.indexDisplay,
        })),
        format: selectRandomItemFromArray(Object.values(MediaFormatEnum)),
        grading: selectRandomItemFromArray(Object.values(GradingEnum)),
        region: selectRandomItemFromArray(Object.values(ReleaseRegionEnum)),
        genreIds: selectRandomNItemsFromArray(
          allGenreIds,
          selectRandomItemFromArray([1, 2, 3])
        ),

        userId: selectRandomItemFromArray(allUserIds),
        stock: faker.number.int({ min: 0, max: 6, multipleOf: 1 }),
        price: faker.number.float({ min: 1, max: 100, multipleOf: 0.01 }),
        discount:
          Math.random() < 0.1
            ? faker.number.float({ min: 0, max: 100, multipleOf: 0.1 })
            : 0,
        description: faker.lorem.paragraph({ min: 1, max: 8 }),
        createdAt: randomDate,
        updatedAt: randomDate,
      };
    });

    // insert data
    await ProductModel.insertMany(products);
    console.log("Product data are successfully inserted!");
  } catch (err) {
    console.error("Error while seeding data:", err);
  }
}

productScript();

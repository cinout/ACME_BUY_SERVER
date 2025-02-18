import UserModel from "@/models/UserModel";
import ProductModel from "@/models/ProductModel";
import GenreModel from "@/models/GenreModel";
import { selectRandomItemFromArray } from "@/utils/array";
import { faker } from "@faker-js/faker";
import seedingScriptConnectDB from ".";
import musicInfo from "@/utils/musicInfo.json";
import { v7 } from "uuid";
import { GradingEnum, MediaFormatEnum, ReleaseRegionEnum } from "@/utils/enums";
import { getRandomDate } from "@/utils/date";

seedingScriptConnectDB();

async function productScript() {
  try {
    // get all Genres
    const allProducts = await ProductModel.find().select("id");
    const allProductIds = allProducts.map((a) => a._id.toString());

    for (const id of allProductIds) {
      const randomDate = getRandomDate(new Date("2023-01-01"), new Date());
      console.log(id, randomDate);
      // Update createdAt and updatedAt
      const result = await ProductModel.findOneAndUpdate(
        { _id: id },
        { createdAt: randomDate, updatedAt: randomDate },
        { timestamps: false }
      );

      if (!result) {
        throw new Error("wrong");
      }
    }
    console.log("successfully updated!");
  } catch (err) {
    console.error("Error while seeding data:", err);
  }
}

productScript();

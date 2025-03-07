import UserModel from "@/models/UserModel";
import ProductModel from "@/models/ProductModel";
import GenreModel from "@/models/GenreModel";
import {
  selectRandomItemFromArray,
  selectRandomNItemsFromArray,
} from "@/utils/array";
import { faker } from "@faker-js/faker";
import seedingScriptConnectDB from ".";
import musicInfo from "@/utils/musicInfo.json";
import { v7 } from "uuid";
import {
  GradingEnum,
  MediaFormatEnum,
  ProductStatusEnum,
  ReleaseRegionEnum,
} from "@/utils/enums";
import { getRandomDate } from "@/utils/date";

seedingScriptConnectDB();

async function productScript() {
  try {
    // insert data
    await ProductModel.updateMany(
      {},
      {
        $set: {
          status: ProductStatusEnum.Active,
        },
      }
    );
    console.log("Product data are successfully updated!");
  } catch (err) {
    console.error("Error while seeding data:", err);
  }
}

productScript();

import seedingScriptConnectDB from ".";
import ProductModel from "@/models/ProductModel";
import UserModel from "@/models/UserModel";
import { selectRandomNItemsFromArray } from "@/utils/array";
import { RoleEnum } from "@/utils/enums";
import { faker } from "@faker-js/faker";

seedingScriptConnectDB();

async function userScript() {
  try {
    const allProducts = await ProductModel.find().select(["id", "userId"]);

    const allUsers = await UserModel.find({
      role: { $ne: RoleEnum.Admin },
    }).select(["id"]);

    // create wishlist Items for each user
    const bulkOps = allUsers.map((user) => {
      const userId = user.id;

      // avoid wishlist their own products
      const availableProductIds = allProducts
        .filter((a) => a.userId.toString() !== userId.toString())
        .map((a) => a.id);

      return {
        updateOne: {
          filter: { _id: userId },
          update: {
            $set: {
              wishList: selectRandomNItemsFromArray(
                availableProductIds,
                faker.number.int({ min: 10, max: 30, multipleOf: 1 })
              ),
            },
          },
        },
      };
    });

    if (bulkOps.length > 0) {
      await UserModel.bulkWrite(bulkOps);
    }

    console.log("User wishList is successfully updated!");
  } catch (err) {
    console.error("Error while seeding data:", err);
  }
}

userScript();

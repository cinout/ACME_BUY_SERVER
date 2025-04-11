import ProductModel from "@/models/ProductModel";
import UserModel from "@/models/UserModel";
import WishListModel from "@/models/WishListModel";
import { selectRandomNItemsFromArray } from "@/utils/array";
import { RoleEnum } from "@/utils/enums";
import { faker } from "@faker-js/faker";
import connectDB from "@/db";
await connectDB();

async function userScript() {
  try {
    const allProducts = await ProductModel.find().select(["id", "userId"]);

    const allUsers = await UserModel.find({
      role: { $ne: RoleEnum.Admin },
    }).select(["id"]);

    // create wishlist Items for each user
    const allResults = allUsers.reduce<{ userId: any; productId: any }[]>(
      (acc, user) => {
        const userId = user.id;

        // avoid wishlist their own products
        const availableProductIds = allProducts
          .filter((a) => a.userId.toString() !== userId.toString())
          .map((a) => a.id);

        const randomProductIds = selectRandomNItemsFromArray(
          availableProductIds,
          faker.number.int({ min: 10, max: 30, multipleOf: 1 })
        );

        const results = randomProductIds.map((productId) => ({
          userId: userId,
          productId: productId,
        }));

        return acc.concat(results);
      },
      []
    );

    if (allResults.length > 0) {
      await WishListModel.insertMany(allResults);
    }

    console.log("WishList is successfully created!");
  } catch (err) {
    console.error("Error while seeding data:", err);
  }
}

userScript();

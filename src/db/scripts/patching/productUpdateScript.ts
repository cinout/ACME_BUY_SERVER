import ProductModel from "@/models/ProductModel";

import { ProductStatusEnum } from "@/utils/enums";
import connectDB from "@/db";
await connectDB();

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

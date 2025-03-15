import ProductModel from "@/models/ProductModel";
import seedingScriptConnectDB from ".";
import { ProductStatusEnum } from "@/utils/enums";

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

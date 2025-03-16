import UserModel from "@/models/UserModel";
import seedingScriptConnectDB from ".";

seedingScriptConnectDB();

async function userUpdate() {
  try {
    // insert data
    await UserModel.updateMany(
      {},
      {
        $set: {
          wishList: [],
        },
      }
    );
    console.log("User data are successfully updated!");
  } catch (err) {
    console.error("Error while seeding data:", err);
  }
}

userUpdate();

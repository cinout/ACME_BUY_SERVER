import GenreModel from "@/models/GenreModel";
import UserModel from "@/models/UserModel";
import ProductModel from "@/models/ProductModel";
import DataLoader from "dataloader";
import { ObjectId } from "mongoose";

export interface Loaders {
  userDataLoader: DataLoader<string, typeof UserModel>;
  genreDataLoader: DataLoader<string, typeof GenreModel>;
  productDataLoader: DataLoader<string, typeof ProductModel>;
}

export const userDataLoader = new DataLoader(
  async (userIds: readonly ObjectId[]) => {
    const users = await UserModel.find({ _id: { $in: userIds } });
    // Map results back in order
    const userMap = userIds.map((id) =>
      users.find((user) => user.id === id.toString())
    );
    return userMap;
  }
);

// Instead of calling the database multiple times, DataLoader groups all .load() calls and makes a single database request. Instead of immediately making separate queries, DataLoader collects these calls and waits.
export const genreDataLoader = new DataLoader(
  async (genreIds: readonly ObjectId[]) => {
    const genres = await GenreModel.find({ _id: { $in: genreIds } });
    // Map results back in order
    const genreMap = genreIds.map((id) =>
      genres.find((genre) => genre.id === id.toString())
    );

    return genreMap;
  }
);

export const productDataLoader = new DataLoader(
  async (productIds: readonly ObjectId[]) => {
    const products = await ProductModel.find({ _id: { $in: productIds } });
    // Map results back in order
    const productMap = productIds.map((id) =>
      products.find((product) => product.id === id.toString())
    );

    return productMap;
  }
);


import DataLoader from "dataloader";
import User from "../models/User.js";
import Category from "../models/Category.js";

export function createLoaders() {
  return {
    userLoader: new DataLoader(async (ids) => {
      const users = await User.find({
        _id: { $in: ids }
      });

      return ids.map(id =>
        users.find(user => user._id.toString() === id.toString())
      );
    }),

    categoryLoader: new DataLoader(async (ids) => {
      const categories = await Category.find({
        _id: { $in: ids }
      });

      return ids.map(id =>
        categories.find(
          category => category._id.toString() === id.toString()
        )
      );
    })
  };
}

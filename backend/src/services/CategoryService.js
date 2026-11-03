
import Category from "../models/Category.js";
import Event from "../models/Event.js";
import { requireRole } from "../middleware/auth.js";

class CategoryService {

  async getAll() {
    return Category.find();
  }

  async create(name, user) {
    requireRole(user, ["ADMIN"]);

    if (!name || !name.trim()) {
      throw new Error("Category name is required");
    }

    return Category.create({
      name: name.trim()
    });
  }

  async delete(id, user) {
    requireRole(user, ["ADMIN"]);

    const used = await Event.exists({ category: id });

    if (used) {
      throw new Error("Category is used by events");
    }

    const result = await Category.findByIdAndDelete(id);

    if (!result) {
      throw new Error("Category not found");
    }

    return true;
  }
}

export default new CategoryService();

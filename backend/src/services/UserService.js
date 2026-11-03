
import User from "../models/User.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import { requireRole } from "../middleware/auth.js";

class UserService {

  async getAll(user) {
    requireRole(user, ["ADMIN"]);

    return User.find().select("-password");
  }

  async updateRole(userId, role, user) {
    requireRole(user, ["ADMIN"]);

    if (!["ADMIN", "ORGANIZER", "PARTICIPANT"].includes(role)) {
      throw new Error("Invalid role");
    }

    if (userId.toString() === user._id.toString()) {
      throw new Error("Cannot change your own role");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  }

  async delete(userId, user) {
    requireRole(user, ["ADMIN"]);

    if (userId.toString() === user._id.toString()) {
      throw new Error("Cannot delete yourself");
    }

    const organizerHasEvents = await Event.exists({
      organizer: userId
    });

    const hasRegistrations = await Registration.exists({
      participant: userId
    });

    if (organizerHasEvents || hasRegistrations) {
      throw new Error("Cannot delete user with existing activity");
    }

    const result = await User.findByIdAndDelete(userId);

    if (!result) {
      throw new Error("User not found");
    }

    return true;
  }
}

export default new UserService();

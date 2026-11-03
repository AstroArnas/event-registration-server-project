
import AuthService from "../services/AuthService.js";
import User from "../models/User.js";

export async function getUserFromToken(token) {
  if (!token) return null;

  try {
    const decoded = AuthService.verifyToken(token);

    const user = await User.findById(decoded.id);

    return user;
  } catch {
    return null;
  }
}

export function requireAuth(user) {
  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

export function requireRole(user, roles) {
  requireAuth(user);

  if (!roles.includes(user.role)) {
    throw new Error("Access denied");
  }

  return user;
}

export function checkOwnership(user, event) {
  requireAuth(user);

  if (
    user.role !== "ADMIN" &&
    event.organizer.toString() !== user._id.toString()
  ) {
    throw new Error("You cannot manage this event");
  }
}

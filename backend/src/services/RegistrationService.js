
import mongoose from "mongoose";

import Event from "../models/Event.js";
import Registration from "../models/Registration.js";

import {
  requireRole,
  checkOwnership
} from "../middleware/auth.js";

class RegistrationService {

  // Register participant for an event
  async register(eventId, user) {
    requireRole(user, ["PARTICIPANT"]);

    const session = await mongoose.startSession();

    try {
      let registration;

      await session.withTransaction(async () => {

        // Check if already registered
        const existing = await Registration.findOne({
          event: eventId,
          participant: user._id,
          status: "ACTIVE"
        }).session(session);

        if (existing) {
          throw new Error("Already registered for this event");
        }

        // Atomically reserve one available seat
        const event = await Event.findOneAndUpdate(
          {
            _id: eventId,
            status: "PUBLISHED",
            date: { $gt: new Date() },
            $expr: {
              $lt: ["$registeredCount", "$capacity"]
            }
          },
          {
            $inc: { registeredCount: 1 }
          },
          {
            new: true,
            session
          }
        );

        if (!event) {
          throw new Error(
            "Event unavailable or no seats remaining"
          );
        }

        const [created] = await Registration.create(
          [{
            event: eventId,
            participant: user._id,
            status: "ACTIVE"
          }],
          { session }
        );

        registration = created;
      });

      return registration;

    } catch (error) {
      if (error.code === 11000) {
        throw new Error("Already registered for this event");
      }

      throw error;
    } finally {
      await session.endSession();
    }
  }

  // Cancel registration
  async cancel(registrationId, user) {
    requireRole(user, ["PARTICIPANT"]);

    const session = await mongoose.startSession();

    try {
      let registration;

      await session.withTransaction(async () => {

        registration = await Registration.findOne({
          _id: registrationId,
          participant: user._id,
          status: "ACTIVE"
        }).session(session);

        if (!registration) {
          throw new Error("Registration not found");
        }

        registration.status = "CANCELLED";
        await registration.save({ session });

        await Event.findOneAndUpdate(
          {
            _id: registration.event,
            registeredCount: { $gt: 0 }
          },
          {
            $inc: { registeredCount: -1 }
          },
          { session }
        );
      });

      return registration;

    } finally {
      await session.endSession();
    }
  }

  // Participant's registrations
  async myRegistrations(user) {
    requireRole(user, ["PARTICIPANT"]);

    return Registration.find({
      participant: user._id
    }).populate("event").populate("participant");
  }

  // Organizer views registrations for own event
  async eventRegistrations(eventId, user) {
    requireRole(user, ["ORGANIZER", "ADMIN"]);

    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    checkOwnership(user, event);

    return Registration.find({
      event: eventId
    })
      .populate("event")
      .populate("participant");
  }
}

export default new RegistrationService();

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import User from "../models/User.js";
import Event from "../models/Event.js";
import Category from "../models/Category.js";
import Registration from "../models/Registration.js";

import EventService from "../services/EventService.js";
import RegistrationService from "../services/RegistrationService.js";

let mongo;
let admin, organizer, participant, participant2;
let category, event;

describe("Event Registration System", () => {

  beforeAll(async () => {
    mongo = await MongoMemoryReplSet.create({
      replSet: { count: 1 }
    });

    await mongoose.connect(mongo.getUri());

    await Promise.all([
      User.init(),
      Event.init(),
      Category.init(),
      Registration.init()
    ]);

    admin = await User.create({
      name: "Admin",
      email: "admin@test.com",
      password: "hashed",
      role: "ADMIN"
    });

    organizer = await User.create({
      name: "Organizer",
      email: "organizer@test.com",
      password: "hashed",
      role: "ORGANIZER"
    });

    participant = await User.create({
      name: "Participant",
      email: "participant@test.com",
      password: "hashed",
      role: "PARTICIPANT"
    });

    participant2 = await User.create({
      name: "Participant 2",
      email: "participant2@test.com",
      password: "hashed",
      role: "PARTICIPANT"
    });

    category = await Category.create({
      name: "Music"
    });

    event = await Event.create({
      title: "Test Event",
      description: "Test",
      location: "Vilnius",
      date: new Date("2027-06-20"),
      capacity: 1,
      category: category._id,
      organizer: organizer._id,
      status: "PUBLISHED"
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it("should allow organizer to create event", async () => {
    const created = await EventService.create({
      title: "New Event",
      description: "Description",
      location: "Kaunas",
      date: "2027-08-20",
      capacity: 20,
      category: category._id
    }, organizer);

    expect(created.title).toBe("New Event");
    expect(created.status).toBe("DRAFT");
  });

  it("should prevent participant from creating event", async () => {
    await expect(
      EventService.create({
        title: "Bad Event",
        location: "Vilnius",
        date: "2027-08-20",
        capacity: 10,
        category: category._id
      }, participant)
    ).rejects.toThrow("Access denied");
  });

  it("should prevent organizer from editing another organizer's event", async () => {
    const otherOrganizer = await User.create({
      name: "Other",
      email: "other@test.com",
      password: "hashed",
      role: "ORGANIZER"
    });

    await expect(
      EventService.update(event._id, {
        title: "Hacked Event"
      }, otherOrganizer)
    ).rejects.toThrow("You cannot manage this event");
  });

  it("should allow participant to register", async () => {
    const registration = await RegistrationService.register(
      event._id,
      participant
    );

    expect(registration.status).toBe("ACTIVE");

    const updatedEvent = await Event.findById(event._id);

    expect(updatedEvent.registeredCount).toBe(1);
  });

  it("should prevent duplicate active registration", async () => {
    await expect(
      RegistrationService.register(event._id, participant)
    ).rejects.toThrow();
  });

  it("should prevent registration when event is full", async () => {
    await expect(
      RegistrationService.register(event._id, participant2)
    ).rejects.toThrow();
  });

  it("should allow participant to cancel registration", async () => {
    const registration = await Registration.findOne({
      event: event._id,
      participant: participant._id
    });

    const cancelled = await RegistrationService.cancel(
      registration._id,
      participant
    );

    expect(cancelled.status).toBe("CANCELLED");

    const updatedEvent = await Event.findById(event._id);

    expect(updatedEvent.registeredCount).toBe(0);
  });

  it("should allow participant to register again after cancellation", async () => {
    const registration = await RegistrationService.register(
      event._id,
      participant
    );

    expect(registration.status).toBe("ACTIVE");
  });

});

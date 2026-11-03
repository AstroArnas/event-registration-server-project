
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "./config/database.js";

import User from "./models/User.js";
import Category from "./models/Category.js";
import Event from "./models/Event.js";

async function seed() {
  await connectDB();

  await User.deleteMany({});
  await Category.deleteMany({});
  await Event.deleteMany({});

  const password = await bcrypt.hash("password123", 10);

  const users = await User.insertMany([
    {
      name: "Admin",
      email: "admin@example.com",
      password,
      role: "ADMIN"
    },
    {
      name: "Organizer",
      email: "organizer@example.com",
      password,
      role: "ORGANIZER"
    },
    {
      name: "Participant One",
      email: "participant1@example.com",
      password,
      role: "PARTICIPANT"
    },
    {
      name: "Participant Two",
      email: "participant2@example.com",
      password,
      role: "PARTICIPANT"
    }
  ]);

  const categories = await Category.insertMany([
    { name: "Music" },
    { name: "Technology" },
    { name: "Sports" }
  ]);

  await Event.insertMany([
    {
      title: "Music Festival",
      description: "A live music festival",
      location: "Vilnius",
      date: new Date("2027-06-20T18:00:00Z"),
      capacity: 100,
      registeredCount: 0,
      category: categories[0]._id,
      organizer: users[1]._id,
      status: "PUBLISHED"
    },
    {
      title: "Technology Conference",
      description: "Technology and programming",
      location: "Kaunas",
      date: new Date("2027-07-15T10:00:00Z"),
      capacity: 50,
      registeredCount: 0,
      category: categories[1]._id,
      organizer: users[1]._id,
      status: "PUBLISHED"
    }
  ]);

  console.log("Demo data created successfully!");

  await mongoose.disconnect();
}

seed().catch(async error => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});

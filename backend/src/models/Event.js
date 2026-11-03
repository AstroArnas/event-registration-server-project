import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
  },

  location: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    required: true
  },

  capacity: {
    type: Number,
    required: true,
    min: 1
  },

  registeredCount: {
    type: Number,
    default: 0
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
    type: String,
    enum: ["DRAFT", "PUBLISHED", "CANCELLED"],
    default: "DRAFT"
  }
  
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
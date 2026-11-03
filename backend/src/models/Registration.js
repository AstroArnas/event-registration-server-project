import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({

  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },

  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
    type: String,
    enum: ["ACTIVE", "CANCELLED"],
    default: "ACTIVE"
  }
  
}, { timestamps: true });

registrationSchema.index(
  { event: 1, participant: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "ACTIVE" }
  }
);

export default mongoose.model("Registration", registrationSchema);
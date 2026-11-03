
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Category from "../models/Category.js";
import {
  requireRole,
  checkOwnership
} from "../middleware/auth.js";

class EventService {

  // Create event
  async create(input, user) {
    requireRole(user, ["ORGANIZER", "ADMIN"]);

    const category = await Category.findById(input.category);

    if (!category) {
      throw new Error("Category not found");
    }

    if (new Date(input.date) <= new Date()) {
      throw new Error("Event date must be in the future");
    }

    return Event.create({
      ...input,
      organizer: user._id,
      status: "DRAFT"
    });
  }

  // Update event
  async update(id, input, user) {
    const event = await Event.findById(id);

    if (!event) {
      throw new Error("Event not found");
    }

    checkOwnership(user, event);

    if (event.status === "CANCELLED") {
      throw new Error("Cannot edit cancelled event");
    }

    if (new Date(event.date) <= new Date()) {
      throw new Error("Cannot edit an event that has started");
    }

    if (
      input.capacity !== undefined &&
      input.capacity < event.registeredCount
    ) {
      throw new Error("Capacity cannot be below registered count");
    }

    if (input.date !== undefined &&
        new Date(input.date) <= new Date()) {
      throw new Error("Event date must be in the future");
    }

    if (input.category) {
      const category = await Category.findById(input.category);

      if (!category) {
        throw new Error("Category not found");
      }
    }

    Object.assign(event, input);

    await event.save();

    return event;
  }

  // Publish event
  async publish(id, user) {
    const event = await Event.findById(id);

    if (!event) {
      throw new Error("Event not found");
    }

    checkOwnership(user, event);

    if (event.status === "CANCELLED") {
      throw new Error("Cannot publish cancelled event");
    }

    if (new Date(event.date) <= new Date()) {
      throw new Error("Event date must be in the future");
    }

    event.status = "PUBLISHED";

    return event.save();
  }

  // Cancel event
  async cancel(id, user) {
    const event = await Event.findById(id);

    if (!event) {
      throw new Error("Event not found");
    }

    checkOwnership(user, event);

    if (event.status === "CANCELLED") {
      throw new Error("Event already cancelled");
    }

    const session = await Event.startSession();

    try {
      await session.withTransaction(async () => {
        event.status = "CANCELLED";
        await event.save({ session });

        await Registration.updateMany(
          {
            event: event._id,
            status: "ACTIVE"
          },
          {
            status: "CANCELLED"
          },
          { session }
        );

        event.registeredCount = 0;
        await event.save({ session });
      });
    } finally {
      await session.endSession();
    }

    return event;
  }

  // Public event search
  async getEvents(filter = {}, page = 1, limit = 10, sort = "ASC") {
    page = Math.max(1, Number(page) || 1);
    limit = Math.min(50, Math.max(1, Number(limit) || 10));

    const query = {
      status: "PUBLISHED"
    };

    if (filter.search) {
      query.$text = { $search: filter.search };
    }

    if (filter.category) {
      query.category = filter.category;
    }

    if (filter.dateFrom || filter.dateTo) {
      query.date = {};

      if (filter.dateFrom) {
        query.date.$gte = new Date(filter.dateFrom);
      }

      if (filter.dateTo) {
        query.date.$lte = new Date(filter.dateTo);
      }
    }

    const [items, total] = await Promise.all([
      Event.find(query)
        .populate("category")
        .populate("organizer")
        .sort({ date: sort === "DESC" ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit),

      Event.countDocuments(query)
    ]);

    return {
      items,
      total,
      page,
      limit
    };
  }

  // Get one public event
  async getEvent(id) {
    return Event.findOne({
      _id: id,
      status: "PUBLISHED"
    })
      .populate("category")
      .populate("organizer");
  }
}

export default new EventService();

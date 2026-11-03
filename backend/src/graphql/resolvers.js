import AuthService from "../services/AuthService.js";
import EventService from "../services/EventService.js";
import { requireAuth } from "../middleware/auth.js";

const resolvers = {
  Query: {
    me: (_, __, { user }) => {
      return requireAuth(user);
    },

    events: (_, args) => {
      return EventService.getEvents(
        args.filter,
        args.page,
        args.limit,
        args.sort
      );
    },

    event: (_, { id }) => {
      return EventService.getEvent(id);
    }
  },

  Mutation: {
    register: (_, { input }) => {
      return AuthService.register(input);
    },

    login: (_, { input }) => {
      return AuthService.login(input);
    },

    createEvent: (_, { input }, { user }) => {
      return EventService.create(input, user);
    },

    updateEvent: (_, { id, input }, { user }) => {
      return EventService.update(id, input, user);
    },

    publishEvent: (_, { id }, { user }) => {
      return EventService.publish(id, user);
    },

    cancelEvent: (_, { id }, { user }) => {
      return EventService.cancel(id, user);
    }
  },

  Event: {
    category: (event) => event.category,
    organizer: (event) => event.organizer
  }
};

export default resolvers;

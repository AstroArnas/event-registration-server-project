import AuthService from "../services/AuthService.js";
import EventService from "../services/EventService.js";
import RegistrationService from "../services/RegistrationService.js";
import CategoryService from "../services/CategoryService.js";
import UserService from "../services/UserService.js";

import { requireAuth } from "../middleware/auth.js";

const resolvers = {

  // QUERIES
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
    },

    myRegistrations: (_, __, { user }) => {
      return RegistrationService.myRegistrations(user);
    },

    eventRegistrations: (_, { eventId }, { user }) => {
      return RegistrationService.eventRegistrations(eventId, user);
    },

    users: (_, __, { user }) => {
      return UserService.getAll(user);
    },

    categories: () => {
      return CategoryService.getAll();
    }
  },

  // MUTATIONS
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

    cancelEvent: (_, { id }, { user }) => {
      return EventService.cancel(id, user);
    },

    publishEvent: (_, { id }, { user }) => {
      return EventService.publish(id, user);
    },

    registerForEvent: (_, { eventId }, { user }) => {
      return RegistrationService.register(eventId, user);
    },

    cancelRegistration: (_, { id }, { user }) => {
      return RegistrationService.cancel(id, user);
    },

    createCategory: (_, { name }, { user }) => {
      return CategoryService.create(name, user);
    },

    deleteCategory: (_, { id }, { user }) => {
      return CategoryService.delete(id, user);
    },

    updateUserRole: (_, { userId, role }, { user }) => {
      return UserService.updateRole(userId, role, user);
    },

    deleteUser: (_, { userId }, { user }) => {
      return UserService.delete(userId, user);
    }
  },

  // RELATED DATA
  Event: {
    category: (event, _, { loaders }) => {
      const id = event.category?._id || event.category;
      if (event.category?.name) return event.category;
      return loaders.categoryLoader.load(id.toString());
    },

    organizer: (event, _, { loaders }) => {
      const id = event.organizer?._id || event.organizer;
      if (event.organizer?.email) return event.organizer;
      return loaders.userLoader.load(id.toString());
    }
  },

  Registration: {
    event: (registration) => registration.event,

    participant: (registration, _, { loaders }) => {
      const id = registration.participant?._id ||
        registration.participant;

      if (registration.participant?.email) {
        return registration.participant;
      }

      return loaders.userLoader.load(id.toString());
    }
  }
};

export default resolvers;

import AuthService from "../services/AuthService.js";
import { requireAuth } from "../middleware/auth.js";

const resolvers = {
  Query: {
    me: (_, __, { user }) => {
      return requireAuth(user);
    }
  },

  Mutation: {
    register: (_, { input }) => {
      return AuthService.register(input);
    },

    login: (_, { input }) => {
      return AuthService.login(input);
    }
  }
};

export default resolvers;

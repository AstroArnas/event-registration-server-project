
import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import typeDefs from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers.js";
import { createLoaders } from "./graphql/loaders.js";

import { connectDB } from "./config/database.js";
import { getUserFromToken } from "./middleware/auth.js";

await connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const { url } = await startStandaloneServer(server, {
  listen: {
    port: process.env.PORT || 4000
  },

  context: async ({ req }) => {
    const authHeader = req.headers.authorization || "";

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    const user = await getUserFromToken(token);

    return {
      user,
      loaders: createLoaders()
    };
  }
});

console.log(`Server ready at ${url}`);


import { gql } from "@apollo/server";

const typeDefs = gql`

  # ENUMS

  enum Role {
    ADMIN
    ORGANIZER
    PARTICIPANT
  }

  enum EventStatus {
    DRAFT
    PUBLISHED
    CANCELLED
  }

  enum RegistrationStatus {
    ACTIVE
    CANCELLED
  }

  enum SortOrder {
    ASC
    DESC
  }

  # TYPES

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
  }

  type Category {
    id: ID!
    name: String!
  }

  type Event {
    id: ID!
    title: String!
    description: String
    location: String!
    date: String!
    capacity: Int!
    registeredCount: Int!
    category: Category!
    organizer: User!
    status: EventStatus!
  }

  type Registration {
    id: ID!
    event: Event!
    participant: User!
    status: RegistrationStatus!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # PAGINATION

  type EventPage {
    items: [Event!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  # INPUT TYPES

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input EventInput {
    title: String!
    description: String
    location: String!
    date: String!
    capacity: Int!
    category: ID!
  }

  input EventUpdateInput {
    title: String
    description: String
    location: String
    date: String
    capacity: Int
    category: ID
  }

  input EventFilter {
    search: String
    category: ID
    dateFrom: String
    dateTo: String
    status: EventStatus
  }

  # QUERIES

  type Query {
    me: User

    events(
      filter: EventFilter
      page: Int = 1
      limit: Int = 10
      sort: SortOrder = ASC
    ): EventPage!

    event(id: ID!): Event

    myRegistrations: [Registration!]!

    eventRegistrations(eventId: ID!): [Registration!]!

    users: [User!]!

    categories: [Category!]!
  }

  # MUTATIONS

  type Mutation {
    register(input: RegisterInput!): AuthPayload!

    login(input: LoginInput!): AuthPayload!

    createEvent(input: EventInput!): Event!

    updateEvent(
      id: ID!
      input: EventUpdateInput!
    ): Event!

    cancelEvent(id: ID!): Event!

    publishEvent(id: ID!): Event!

    registerForEvent(eventId: ID!): Registration!

    cancelRegistration(id: ID!): Registration!

    createCategory(name: String!): Category!

    deleteCategory(id: ID!): Boolean!

    updateUserRole(userId: ID!, role: Role!): User!

    deleteUser(userId: ID!): Boolean!
  }
`;

export default typeDefs;

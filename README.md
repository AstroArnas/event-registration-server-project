
# Event Registration System

A backend event registration system built with:

- JavaScript
- Node.js
- Apollo Server
- GraphQL
- MongoDB
- Mongoose
- JWT
- bcryptjs

## Installation

Clone the repository:

    git clone YOUR_REPOSITORY_URL

Install dependencies:

    npm install

Create a .env file:

    PORT=4000
    MONGO_URI=mongodb://127.0.0.1:27017/event_registration
    JWT_SECRET=your_secret

## Database

MongoDB must run as a replica set because the
application uses transactions.

## Run application

    npm run dev

Open Apollo Sandbox:

    http://localhost:4000/

## Demo data

    npm run seed

Demo accounts (password: password123):

| Role | Email |
|---|---|
| Admin | admin@example.com |
| Organizer | organizer@example.com |
| Participant | participant1@example.com |
| Participant | participant2@example.com |

## Run tests

    npm test

## User roles

ADMIN:
- Manage users
- Manage categories
- Manage all events

ORGANIZER:
- Create events
- Edit own events
- Publish and cancel own events
- View event participants

PARTICIPANT:
- Register for events
- View own registrations
- Cancel registrations

PUBLIC:
- View published events
- Search and filter events

## Business rules

- Only organizers and admins can create events.
- Organizers can manage only their own events.
- Only published future events accept registrations.
- Event capacity cannot be exceeded.
- Duplicate active registrations are forbidden.
- Cancelled registrations release seats.
- Cancelled events cancel their active registrations.
- Events cannot be edited after they start.
- Event capacity cannot be reduced below active registrations.

## Architecture

Models:
MongoDB data structures using Mongoose.

Services:
Business logic using classes.

GraphQL:
Queries, mutations and resolvers.

Middleware:
Authentication and authorization.

DataLoader:
Reduces N+1 database queries.

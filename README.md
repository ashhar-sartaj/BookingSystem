# Event Management System
An application where users can create events, book tickets, and manage attendance.
---
## Features
- Create and manage events
-  View all upcoming events
-  Book tickets for events
-  Generate unique booking codes
-  Retrieve user bookings
-  Mark attendance using booking codes
-  API documentation using Swagger (OpenAPI)
---
## Tech Stack
### Backend

- Node.js
- Express.js
- MySQL / TiDB
- Swagger (OpenAPI)

### Frontend
* React.js
* CSS
---
##  Project Structure

```
project/
│
├── backend/
│   ├── controllers/
├   ├── database/
│   ├── routes/
│   ├── app.js
├───├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│       ├── components/
├       ├    └──Booking.jsx
│       │    └──LandingPage.jsx
│       └── App.jsx
│       └── main.jsx
│
├── swagger.yaml
└── README.md
```

---

## Setup Instructions

### 1. Clone the repository

```
git clone <your-repo-url>
cd BOOKINGSYSTEM
```
---
### 2. Backend Setup
```
cd backend
npm install
```
Create a `.env` file:
```
DB_HOST=your_host
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
PORT=3000
```
Start backend:
```
npm run dev
```
---
### 3. Frontend Setup
```
cd frontend
npm install
npm run dev
```
---

## API Endpoints

| Method | Endpoint                 | Description             |
| ------ | ------------------------ | ----------------------- |
| GET    | `/events`                | Get all upcoming events |
| POST   | `/events`                | Create a new event      |
| GET    | `/events/:id/details`    | Get event details       |
| POST   | `/bookings`              | Book tickets            |
| GET    | `/users/:id/bookings`    | Get user bookings by userId |
| POST   | `/events/:id/attendance` | Mark attendance and returns count of tickets, with id as unique code generated when booking is issued       |
| POST   | `/createUser`            | Create user             |

---

## Future Improvements

- Authentication (JWT)
- Role-based access (Admin/User)
- Payment integration
- UI enhancements

---

## Conclusion

This project demonstrates:

- Backend API design
- Database transaction handling
- Full-stack integration

## API Documentation
Swagger UI available at:
https://bookingsystem-uy7w.onrender.com/api-docs/

## Postman Collection
Import the following file into Postman to test APIs:
bookingSystem.postman_collection.json

## Database Schema
The database schema is provided in the following file:
single_file_backup.sql

## Live
- Frontend: https://eventbukingsystem.netlify.app/
- Backend: https://bookingsystem-uy7w.onrender.com
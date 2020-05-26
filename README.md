# MyPlace App - Backend

Code-along repo for Maximillian Schwarzmuller's Udemy course - The MERN Fullstack Guide

> Commits start from Section7: Node.js & Express.js - Building our REST API

## API Endpoints

### /api/users/

- **GET "/"** - Retrieve list of all users
- **POST "/signup"** - Create new user + log user in
- **POST "/login"** - Log user in

### /api/places/

- **GET "/user":uid"** - Retrieve list of all places for a given user id (uid)
- **GET "/:pid"** - Get a specific place by place id (pid)
- **POST "/"** - Create a new place
- **PATCH "/:pid"** - Update a place by id(pid)
- **DELETE "/:pid"** - Delete a place by id (pid)

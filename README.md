# MyPlace App - Backend

Code-along repo for Maximillian Schwarzmuller's Udemy course - The MERN Fullstack Guide

> Commits start from Section7: Node.js & Express.js - Building our REST API

## API Endpoints

### /api/users/

- **GET "/"** - Retrieve list of all users
- **POST "/signup"** - Create new user + log user in
- **POST "/login"** - Log user in

### /api/places/

- **GET "/user/:uid"** - Retrieve list of all places for a given user id (uid)
- **GET "/:pid"** - Get a specific place by place id (pid)
- **POST "/"** - Create a new place
- **PATCH "/:pid"** - Update a place by id(pid)
- **DELETE "/:pid"** - Delete a place by id (pid)

## Application Data

### User(s)

- Name
- Email
- Password
- Image

### Place(s)

- Title
- Description
- Address
- Location (lat, lng)
- Image

### Relationship: One-to-many

- One user can create multiple places
- One place belongs to exactly one user

When creating a new place, store creator id into the new place document, and add the id of the newly created place to the places field of the creator.

## Deploying a Standalone REST API to Heroku

- Download and install Heroku CLI

```bash
brew tap heroku/brew && brew install heroku
```

- Run `heroku login`

- Create a new heroku app

  - On https://dashboard.heroku.com/apps
  - On terminal: `heroku create`
  - Confirm a remote named `heroku` has been set for your app

  ```bash
  git remote -v
  ```

- Create a Heroku remote

```bash
heroku git:remote -a app-name
```

- Go to app settings and copy environment variables into Config Vars.

- Deploy the app to Heroku

```bash
git push heroku master
```

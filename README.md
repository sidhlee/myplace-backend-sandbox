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

## Storing uploaded images in Amazon S3

### References

- [File Upload to AWS S3 bucket in a Node-React-Mongo full-stack app and using multer](https://medium.com/@paulrohan/file-upload-to-aws-s3-bucket-in-a-node-react-mongo-app-and-using-multer-72884322aada)
- [Deleting Objects from S3](https://gist.github.com/jeonghwan-kim/9597478)
- [Simple image upload with Node on Amazon S3](https://www.youtube.com/watch?v=ASuU4km3VHE)

### Implementation Overview

- Install [multer-s3](https://github.com/badunk/multer-s3#readme)
- Replace multer storage engine with multerS3
- Insert multer middleware at the post route.
- Save user document with the object name stored in s3

  - the following fields are available at `req.file`

  ```js
  { fieldname: 'image',
  originalname: 'user_placeholder.png',
  encoding: '7bit',
  mimetype: 'image/png',
  size: 216568,
  bucket: 'mern-myplace-uploads-images',
  key: '1592481231805',
  acl: 'public-read',
  contentType: 'application/octet-stream',
  contentDisposition: null,
  storageClass: 'STANDARD',
  serverSideEncryption: null,
  metadata: { fieldName: 'image' },
  location:
   'https://mern-myplace-uploads-images.s3.amazonaws.com/1592481231805',
  etag: '"4788048f319dc48101678d9e69f5077e"',
  versionId: undefined }

  ```

- Delete uploaded file in the global error handler providing the object key from the req.file
- Change the src url on the client application to point to the cloudfront / s3 bucket address.

### Use Cloudfront for faster serving

- [Deliver Content Faster](https://aws.amazon.com/getting-started/hands-on/deliver-content-faster/)
- **Disable when not using** to avoid being charged.

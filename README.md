# MERN App - MyPlace Run 3

## Debugging Note

- Don't forget to put `await` in front of mongoose query methods.

```js
let existingUser;
try {
  // Returns unresolved Promise
  existingUser = User.findOne({ email });
} catch (err) {
  return next(
    new HttpError(
      'An error occurred while checking existing user. Please try again',
      500
    )
  );
}

// existingUser is truthy (Promise)
if (existingUser) {
  // Generates error
  return next(new HttpError('Could not sign up. Email already exists.', 422));
}
```

- Don't forget to convert mongoose documents to regular JS objects when adding them to the response.

```js
// getters creates 'id' field where you can access string instead of ObjectId
return res.status(200).json({ place: place.toObject({ getters: true }) });
```

## Upload Images to Cloudinary

- [multer-storage-cloudinary](https://github.com/affanshahid/multer-storage-cloudinary)

- Google's PlacePhoto API requires api key in the uri string. If you save this url into the database, your Google API key will be exposed to the client. You can prevent this by uploading PlacePhoto into 3rd party CDN services (like Cloudinary) and save the CDN uri into the database.
  [get-google-place.js]('./middleware/get-google-place.js)

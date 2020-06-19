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

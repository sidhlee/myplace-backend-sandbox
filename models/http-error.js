// extends built-in Error

class HttpError extends Error {
  /**
   * Create a Error with message and errorCode
   * @param {string} message
   * @param {number} errorCode
   */
  constructor(message, errorCode) {
    super(message); // Adds a "message" property
    this.code = errorCode; // Adds a "code" property
  }
}

module.exports = HttpError;

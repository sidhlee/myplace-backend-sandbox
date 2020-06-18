class HttpError extends Error {
  /**
   * Creates an Error with message and error code
   * @param {string} errorMessage error message
   * @param {number} errorCode HTTP error code
   */
  constructor(errorMessage, errorCode) {
    super(errorMessage);
    this.code = errorCode;
  }
}

module.exports = HttpError;

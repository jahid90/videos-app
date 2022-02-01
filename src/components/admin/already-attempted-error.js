function AlreadyAttemptedError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.name = 'AlreadyAttemptedError';
}

AlreadyAttemptedError.prototype = Object.create(Error.prototype);
AlreadyAttemptedError.prototype.constructor = AlreadyAttemptedError;

module.exports = AlreadyAttemptedError;

function AlreadyLockedError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.name = 'AlreadyLockedError';
}

AlreadyLockedError.prototype = Object.create(Error.prototype);
AlreadyLockedError.prototype.constructor = AlreadyLockedError;

module.exports = AlreadyLockedError;

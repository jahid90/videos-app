function AlreadyPublishedError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.name = 'AlreadyPublishedError';
}

AlreadyPublishedError.prototype = Object.create(Error.prototype);
AlreadyPublishedError.prototype.constructor = AlreadyPublishedError;

module.exports = AlreadyPublishedError;

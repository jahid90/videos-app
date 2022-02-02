function AlreadySentError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.name = 'AlreadySentError';
}

AlreadySentError.prototype = Object.create(Error.prototype);
AlreadySentError.prototype.constructor = AlreadySentError;

module.exports = AlreadySentError;

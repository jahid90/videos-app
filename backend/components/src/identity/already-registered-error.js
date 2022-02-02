function AlreadyRegisteredError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.name = 'AlreadyRegisteredError';
}

AlreadyRegisteredError.prototype = Object.create(Error.prototype);
AlreadyRegisteredError.prototype.constructor = AlreadyRegisteredError;

module.exports = AlreadyRegisteredError;

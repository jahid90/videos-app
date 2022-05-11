function NotFoundError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.name = 'NotFoundError';
}

NotFoundError.prototype = Object.create(Error.prototype);
NotFoundError.prototype.constructor = NotFoundError;

module.exports = NotFoundError;

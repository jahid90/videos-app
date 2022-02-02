function IdempotenceError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.name = 'IdempotenceError';
}

IdempotenceError.prototype = Object.create(Error.prototype);
IdempotenceError.prototype.constructor = IdempotenceError;

module.exports = IdempotenceError;

function SendError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.name = 'SendError';
}

SendError.prototype = Object.create(Error.prototype);
SendError.prototype.constructor = SendError;

module.exports = SendError;

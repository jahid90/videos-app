function AlreadySentRegistrationEmailError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.name = 'AlreadySentRegistrationEmailError';
}

AlreadySentRegistrationEmailError.prototype = Object.create(Error.prototype);
AlreadySentRegistrationEmailError.prototype.constructor =
    AlreadySentRegistrationEmailError;

module.exports = AlreadySentRegistrationEmailError;

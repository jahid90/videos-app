function CredentialMismatchError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.name = 'CredentialMismatchError';
}

CredentialMismatchError.prototype = Object.create(Error.prototype);
CredentialMismatchError.prototype.constructor = CredentialMismatchError;

module.exports = CredentialMismatchError;

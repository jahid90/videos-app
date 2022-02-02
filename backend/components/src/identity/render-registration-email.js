const { join } = require('path');
const Email = require('email-templates');

const templateRoot = join(__dirname, 'templates');

const renderEmail = (context) => {
    const email = new Email({ views: { root: templateRoot } });

    return email.renderAll('registration-email', {}).then((rendered) => {
        context.email = rendered;
        return context;
    });
};

module.exports = renderEmail;

const express = require('express');
const supertest = require('supertest');

const createExpressApp = require('../src/express');
const createPingApp = require('../src/apps/ping');

const testEnv = {
    appName: 'Videos App Test',
    env: 'test',
};

const noOpRouter = express.Router();

const testConfig = {
    homeApp: noOpRouter,
    pingApp: createPingApp({ env: testEnv }),
    recordViewingsApp: noOpRouter,
    registerUsersApp: noOpRouter,
    authenticationApp: noOpRouter,
    creatorsPortalApp: noOpRouter,
    adminApp: noOpRouter,
    manageUsersApp: noOpRouter,
};

const app = createExpressApp({ config: testConfig, env: testEnv });

describe('GET /ping', () => {
    it('responds to ping requests', async () => {
        await supertest(app)
            .get('/ping')
            .expect(200)
            .then((res) => expect(res.text).toBe('OK'));
    });
});

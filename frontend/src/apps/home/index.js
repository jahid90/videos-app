const camelCaseKeys = require('camelcase-keys');
const express = require('express');

const createHandlers = ({ queries }) => {
    const home = (req, res, next) => {
        return queries
            .loadHomePage()
            .then(queries.loadVideos)
            .then((viewData) =>
                res.render('apps/home/templates/home', { ...viewData })
            )
            .catch(next);
    };

    return {
        home,
    };
};

const createQueries = ({ db }) => {
    const loadHomePage = () => {
        return db.then((client) =>
            client('pages')
                .where({ page_name: 'home' })
                .limit(1)
                .then(camelCaseKeys)
                .then((rows) => rows[0])
        );
    };

    const loadVideos = (prevViewData) => {
        return db
            .then((client) =>
                client('creators_portal_videos').select([
                    'id',
                    'name',
                    'description',
                    'views',
                ])
            )
            .then(camelCaseKeys)
            .then((rows) => {
                const newViewData = {
                    ...prevViewData,
                    videos: rows,
                };

                return newViewData;
            });
    };

    return {
        loadHomePage,
        loadVideos,
    };
};

const createHome = ({ db }) => {
    const queries = createQueries({ db });
    const handlers = createHandlers({ queries });

    const router = express.Router();
    router.route('/').get(handlers.home);

    return router;
};

module.exports = createHome;

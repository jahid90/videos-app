const camelCaseKeys = require('camelcase-keys');
const express = require('express');

const createHandlers = ({ queries }) => {

    const home = (req, res, next) => {
        return queries
            .loadHomePage()
            .then(viewData => res.render('home/templates/home', viewData))
            .catch(next);
    }

    return {
        home,
    }
}

const createQueries = ({ db }) => {

    const loadHomePage = () => {
        return db.then(client => client('videos')
            .sum('view_count as videosWatched')
            .then(rows => rows[0])
        );
    }

    return {
        loadHomePage,
    }
}

const createHome = ({ db }) => {
    const queries = createQueries({ db });
    const handlers = createHandlers({ queries });

    const router = express.Router();
    router.route('/').get(handlers.home);

    return {
        handlers,
        queries,
        router,
    }
}

module.exports = createHome;

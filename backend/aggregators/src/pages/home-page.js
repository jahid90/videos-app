const env = require('../env');

const createHandlers = ({ actions }) => {
    return {
        VideoViewed: (event) =>
            actions.incrementVideosWatched(event.globalPosition),
    };
};

const createActions = ({ db }) => {
    const incrementVideosWatched = (globalPosition) => {
        const queryString = `
            UPDATE
                pages
            SET
                page_data = jsonb_set(
                    jsonb_set(
                        page_data,
                        '{videosWatched}',
                        ((page_data->>'videosWatched')::int + 1)::text::jsonb
                    ),
                    '{lastViewProcessed}',
                    :globalPosition::text::jsonb
                )
            WHERE
                page_name = 'home' AND
                (page_data->>'lastViewProcessed')::int < :globalPosition
        `;

        return db
            .then((client) => client.raw(queryString, { globalPosition }))
            .then((changed) => {
                if (env.enableDebug && !changed) {
                    console.debug(
                        `[HomePageAgg-incrementVideosWatched-${id}] skipping ${globalPosition}`
                    );
                }
            });
    };

    const ensureHomePage = () => {
        const initialData = {
            pageData: {
                lastViewProcessed: 0,
                videosWatched: 0,
            },
        };

        const queryString = `
            INSERT INTO
                pages(page_name, page_data)
            VALUES
                ('home', :pageData)
            ON CONFLICT DO NOTHING
        `;

        return db.then((client) => client.raw(queryString, initialData));
    };

    return {
        ensureHomePage,
        incrementVideosWatched,
    };
};

const build = ({ db, messageStore }) => {
    const actions = createActions({ db });
    const handlers = createHandlers({ actions });

    const subscription = messageStore.createSubscription({
        streamName: 'viewing',
        handlers,
        subscriberId: 'aggregators:home-page',
    });

    const init = () => {
        return actions.ensureHomePage();
    };

    const start = () => {
        init().then(subscription.start);
    };

    return {
        start,
    };
};

module.exports = build;

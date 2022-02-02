const env = require('../env');

const createHandlers = ({ queries }) => {
    return {
        VideoViewed: (event) =>
            queries.incrementVideosWatched(event.globalPosition),
    };
};

const createQueries = ({ db }) => {
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
    const queries = createQueries({ db });
    const handlers = createHandlers({ queries });

    const subscription = messageStore.createSubscription({
        streamName: 'viewing',
        handlers,
        subscriberId: 'aggregators:home-page',
    });

    const init = () => {
        return queries.ensureHomePage();
    };

    const start = () => {
        init().then(subscription.start);
    };

    return {
        queries,
        handlers,
        init,
        start,
    };
};

module.exports = build;

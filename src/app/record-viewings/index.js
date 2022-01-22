const { v4: uuid } = require('uuid');
const express = require('express');

const createActions = ({ messageStore }) => {

    const recordViewing = (traceId, videoId, userId) => {

        console.log(`Recording video view for videoId: ${videoId} and traceId: ${traceId}`);

        const viewedEvent = {
            id: uuid(),
            type: 'VideoViewed',
            metadata: {
                traceId,
                userId,
            },
            data: {
                userId,
                videoId,
            }
        }

        const streamName = `viewing-${videoId}`;

        return messageStore.write(streamName, viewedEvent);
    }

    return {
        recordViewing,
    }
}

const createHandlers = ({ actions }) => {

    const handleRecordViewing = (req, res) => {
        return actions
            .recordViewing(req.context.traceId, req.params.videoId)
            .then(() => res.redirect('/'));
    }

    return {
        handleRecordViewing,
    }
}

const createRecordViewings = ({ messageStore }) => {

    const actions = createActions({ messageStore });
    const handlers = createHandlers({ actions });

    const router = express.Router();
    router.route('/:videoId').post(handlers.handleRecordViewing);

    return {
        actions,
        handlers,
        router,
    }
}



module.exports = createRecordViewings;

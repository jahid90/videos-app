const subscriberPositionProjection = {
    $init: () => {
        return {
            readEventIds: [],
            resetEventIds: [],
        };
    },
    Read: (projection, event) => {
        projection.readEventIds.push(event.metadata.traceId);

        return projection;
    },
    PositionReset: (projection, event) => {
        projection.resetEventIds.push(event.metadata.traceId);
        return projection;
    },
};

module.exports = subscriberPositionProjection;

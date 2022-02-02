const subscriberPositionProjection = {
    $init: () => {
        return {
            sequence: 0,
        };
    },
    Read: (projection, event) => {
        projection.sequence = event.globalPosition;

        return projection;
    },
    PositionReset: (projection, event) => {
        projection.sequence = event.globalPosition;

        return projection;
    },
};

module.exports = subscriberPositionProjection;

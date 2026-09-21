const getDelay = async (trip, feed) => {
    const newFeed = feed.entity
    .map(d => ({
        tripId: d.tripUpdate.trip.tripId,
        stopTimeUpdate: d.tripUpdate.stopTimeUpdate,
        trip: d.tripUpdate.trip
    }))
    .filter(row => row.tripId == trip)
    .map(d => ({
        tripId: d.tripId,
        delay: d.stopTimeUpdate[0].arrival.delay,
        stopSeq: d.stopTimeUpdate[0].stopSequence
    }))
    .filter(d => d.stopSeq!=0)

    if (newFeed[0]) return newFeed[0].delay;
    else return 0;
}

module.exports = {
    getDelay
}
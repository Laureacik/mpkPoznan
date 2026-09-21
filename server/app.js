//app.js
let {
  stopsData,
  stopTimesData,
  routesData,
  tripsData,
  calendarData,
  downloadGtfs,
  downloadRT,
  reloadGtfsData
} = require("./data");


const days = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];


function scheduleGtfsUpdate() {
  const now = new Date();

  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);

  const timeUntilMidnight = nextMidnight - now;

  console.log(
    `GTFS: zaplanowano aktualizację na ${nextMidnight.toLocaleString("pl-PL")}`
  );

  setTimeout(async () => {
    try {
      await downloadGtfs();
      reloadGtfsData();
    } catch (err) {
      console.error("Błąd aktualizacji GTFS:", err);
    }

    setInterval(async () => {
      try {
        await downloadGtfs();
        reloadGtfsData();
      } catch (err) {
        console.error("Błąd aktualizacji GTFS:", err);
      }
    }, 24 * 60 * 60 * 1000);

  }, timeUntilMidnight);
}

scheduleGtfsUpdate();

const currentDate = new Date();
const currentTime = currentDate.toTimeString().slice(0, 8);
const currentDay = days[currentDate.getDay()];

function normTime(time) {
  let [h, m, s] = time.split(":").map(Number);
  h = h % 24;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
} //godziny modulo 24

function timeToMin(time) {
  let [h, m] = time.split(":").map(Number);
  return h * 60 + m;
} //czas na minuty, uzywane do obliczania roznicy czasu


function calcTime(time, delay) {
  let [h, m, s] = time.split(":").map(Number);
  let totalSeconds = h*3600 + m*60 + s + delay;

  h = Math.floor(totalSeconds / 3600);
  m = Math.floor((totalSeconds % 3600) / 60);
  s = totalSeconds % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
} //obliczanie czasu odjazdu z uwzglednieniem opoznienia

function czas(depTime, curTime, delay = 0) {
  const [depH, depM, depS] = depTime.split(":").map(Number);
  const [curH, curM, curS] = curTime.split(":").map(Number);

  const depTotalSeconds = depH * 3600 + depM * 60 + depS + delay;
  const curTotalSeconds = curH * 3600 + curM * 60 + curS;

  const diffSeconds = depTotalSeconds - curTotalSeconds;

  return Math.floor(diffSeconds / 60);
}


function getActiveServiceIds() {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  const currentDate = new Date();
  const currentDay = days[currentDate.getDay()];

  return calendarData
    .filter(service => service[currentDay] === "1")
    .map(service => service.service_id);
}
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const profiles = [
  {
    name: "Unijna",
    trackedTrips: []
  },
  {
    name: "Os. Lubonianka",
    trackedTrips: []
  },
  {
    name: "Sikorskiego",
    trackedTrips: []
  }
];

const trackRoute = (profileIndex, stopName, line, course) => {
  const trackedTrips = profiles[profileIndex].trackedTrips
  
  const matchingStops = stopsData
    .filter(row => row.stop_name == stopName)
    .map(row => row.stop_id);

  const matchingTrips = tripsData
    .filter(row => row.route_id == line)
    .filter(row => row.trip_headsign == course)
    .map(row => row.trip_id);

  const matchingStopTimes = stopTimesData
    .filter(row => matchingStops.includes(row.stop_id))
    .filter(row => matchingTrips.includes(row.trip_id));

  matchingStopTimes.forEach(row => {
    const alreadyTracked = trackedTrips.some(item =>
      item.tripId == row.trip_id &&
      item.stopId == row.stop_id
    );

    if (!alreadyTracked) {
      trackedTrips.push({
        tripId: row.trip_id,
        stopId: row.stop_id
      });
    }
  });
};

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

const showDepartures = async (qty = 3, trips, feed) => {
  const currentDate = new Date();
  const currentTime = currentDate.toTimeString().slice(0, 8);
  const activeServiceIds = getActiveServiceIds();

  const stopTimes = await Promise.all(
  stopTimesData
    .filter(row =>
      trips.some(trip =>
        trip.tripId == row.trip_id &&
        trip.stopId == row.stop_id
      )
    )
    .filter(row => {
    const trip = tripsData.find(t => t.trip_id == row.trip_id);
    return trip && activeServiceIds.includes(trip.service_id);
    })
    .map(async d => { 
    const trip = tripsData.find(row => row.trip_id == d.trip_id);
    const delay = await getDelay(d.trip_id, feed)
    return { 
      routeId: trip.route_id, 
      headsign: trip.trip_headsign, 
      timeToDep: czas(d.departure_time,currentTime, delay),
      depTime: normTime(calcTime(d.departure_time, delay)),

      compTime: calcTime(d.departure_time, delay),
      rawTime: d.departure_time,
      delay: delay
    } }))
    
    return stopTimes
    .sort((a, b) => a.compTime.localeCompare(b.compTime))
    .filter(dep => dep.compTime > currentTime)
    .slice(0, qty); 
};

async function main() {
  const feed = await downloadRT();

  trackRoute("Luboń/Unijna","610","Górczyn PKM")
  trackRoute("Luboń/Unijna","616","Górczyn PKM")
  trackRoute("Luboń/Unijna","702","Górczyn PKM")
  console.log(await showDepartures(4, trackedTrips, feed))
}

//main()


module.exports = {
  trackRoute,
  showDepartures,
  profiles
};

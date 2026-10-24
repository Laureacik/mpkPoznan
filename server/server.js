const express = require("express");
const path = require("path");

const {
  trackRoute,
  showDepartures,
  profiles
} = require("./app");

const {
  downloadRT,
  stopsData,
  stopTimesData,
  tripsData
} = require("./data");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../client")));


const stopNames = [...new Set(stopsData.map(s => s.stop_name))]
  .sort((a, b) => a.localeCompare(b, "pl"));
const stopNameSet = new Set(stopNames);

const routesCache = new Map(); // nazwa przystanku -> gotowy wynik


function getRoutesForStopNew(name) {
  const stopIds = new Set(
    stopsData.filter(s => s.stop_name == name).map(s => s.stop_id)
  );

  // trip_id -> stop_id (na którym słupku zatrzymuje się ten kurs)
  const tripToStop = new Map();
  stopTimesData.forEach(d => {
    if (stopIds.has(d.stop_id)) tripToStop.set(d.trip_id, d.stop_id);
  });

  const grouped = {};

  tripsData.forEach(d => {
    const stopId = tripToStop.get(d.trip_id);
    if (stopId === undefined) return;          // kurs nie jedzie przez ten przystanek

    const line = Number(d.route_id);
    if (line >= 200 && line <= 299){
      if(!grouped["Nocne linie"]){
        //grouped["Nocne linie"] = { stop_id: "Nocne linie", headsigns: [], lines: [] };
      }
      return
    };    // nocne na razie pomijamy

    if (!grouped[stopId]) {
      grouped[stopId] = { stop_id: stopId, headsigns: [], lines: [] };
    }
    if (!grouped[stopId].headsigns.includes(d.trip_headsign) && d.trip_id.search("\\^[A-Z]*[,+]*[FGS]")<0) {
      grouped[stopId].headsigns.push(d.trip_headsign);
    }
    if (!grouped[stopId].lines.includes(d.route_id)) {
      grouped[stopId].lines.push(d.route_id);
    }
  });

  return Object.values(grouped);
}
app.get("/api/stops", (req, res) => {
  res.json(stopNames);
});

app.get("/api/stops/routes", (req, res) => {
  const name = req.query.name;

  if (!name || !stopNameSet.has(name)) {
    return res.status(400).json({ error: "Nieznany przystanek" });
  }

  res.json(getRoutesForStopNew(name));
});

app.get("/api/schedule", (req,res) => {
  
})



// ===============================
// KONFIGURACJA PROFILI
// ===============================

// Profil 0
trackRoute(0, "Luboń/Unijna", "610", "Górczyn PKM");
trackRoute(0, "Luboń/Unijna", "616", "Górczyn PKM");
trackRoute(0, "Luboń/Unijna", "702", "Górczyn PKM");

// Profil 1
trackRoute(1, "Luboń/Os. Lubonianka", "611", "Dębiec PKM");
trackRoute(1, "Luboń/Os. Lubonianka", "610", "Dębiec PKM");
trackRoute(1, "Luboń/Os. Lubonianka", "614", "Górczyn PKM");
trackRoute(1, "Luboń/Os. Lubonianka", "701", "Górczyn PKM");

// Profil 2
trackRoute(2, "Luboń/Sikorskiego", "611", "Dębiec PKM");

//Profil 3
trackRoute(3, "Górczyn PKM", "17", "Małe Garbary");

// ===============================
// CACHE DANYCH
// ===============================

let profilesCache = [];

let isUpdating = false;
async function updateProfilesCache() {
  if (isUpdating) {
    console.warn("Trwa aktualizacja");
    return;
  }
  isUpdating = true;
  try {
    const feed = await downloadRT();

    profilesCache = await Promise.all(
      profiles.map(async profile => {
        const departures = await showDepartures(
          3,
          profile.trackedTrips,
          feed
        );

        return {
          profileName: profile.name,
          departures: departures
        };
      })
    );

    console.log("Profile zaktualizowane:", new Date().toTimeString().slice(0, 8));
  } catch (err) {
    console.error("Błąd aktualizacji profili:", err.message);
    console.error("Cause:", err.cause);
  }
    finally {
    isUpdating = false
  }
}

// pierwsze pobranie po starcie serwera
updateProfilesCache();

// odświeżanie co 60 sekund
setInterval(updateProfilesCache, 60000);

// ===============================
// API
// ===============================

app.get("/api/profiles", (req, res) => {
  res.json(profilesCache);
});

app.get("/api/time", (req, res) => {
  const currentDate = new Date();
  const time = currentDate.toTimeString().slice(0, 8);

  res.json(time);
});

// ===============================
// START SERWERA
// ===============================

app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});

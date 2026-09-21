const express = require("express");
const path = require("path");

const {
  trackRoute,
  showDepartures,
  profiles
} = require("./app");

const {
  downloadRT,
  downloadGtfs
} = require("./data");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../client")));

// ===============================
// POBIERANIE GTFS
// ===============================

/*function scheduleGtfsUpdate() {
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
    } catch (err) {
      console.error("Błąd aktualizacji GTFS:", err);
    }

    setInterval(async () => {
      try {
        await downloadGtfs();
      } catch (err) {
        console.error("Błąd aktualizacji GTFS:", err);
      }
    }, 24 * 60 * 60 * 1000);

  }, timeUntilMidnight);
}

scheduleGtfsUpdate();*/


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

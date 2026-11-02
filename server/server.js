const express = require("express");
const path = require("path");

const { 
  showDepartures, 
  buildTrackedTrips 
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
app.use(express.json({ limit: "20kb" }));

const stopNames = [...new Set(stopsData.map(s => s.stop_name))]
  .sort((a, b) => a.localeCompare(b, "pl"));
const stopNameSet = new Set(stopNames);

const routesCache = new Map(); // nazwa przystanku -> gotowy wynik


function getRoutesForStopNew(name) {
  const stopIds = new Set(
    stopsData.filter(s => s.stop_name == name).map(s => s.stop_id)
  );

  // wszystkie kursy, które zatrzymują się na którymkolwiek słupku o tej nazwie
  const tripIds = new Set();
  stopTimesData.forEach(d => {
    if (stopIds.has(d.stop_id)) tripIds.add(d.trip_id);
  });

  const lines = {};

  tripsData.forEach(d => {
    if (!tripIds.has(d.trip_id)) return;

    const line = Number(d.route_id);
    if (line >= 200 && line <= 299) return;    // nocne na razie pomijamy

    if (!lines[d.route_id]) {
      lines[d.route_id] = { line: d.route_id, headsigns: [] };
    }

    if (!lines[d.route_id].headsigns.includes(d.trip_headsign)
        && d.trip_id.search("\\^[A-Z]*[,+]*[FGS]") < 0) {
      lines[d.route_id].headsigns.push(d.trip_headsign);
    }
  });

  return Object.values(lines)
    .filter(l => l.headsigns.length)
    .sort((a, b) => a.line.localeCompare(b.line, "pl", { numeric: true }));
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

// ===============================
// ODJAZDY DLA PROFILI Z KLIENTA
// ===============================

// klient przysyła własne dane, więc sprawdzamy kształt i limity
function cleanProfile(p) {
  if (!p || !stopNameSet.has(p.name) || !Array.isArray(p.lines) || p.lines.length > 30) return null;

  const lines = [];
  for (const l of p.lines) {
    if (!l || typeof l.line !== "string") return null;
    if (!Array.isArray(l.headsigns) || l.headsigns.length > 30) return null;
    if (!l.headsigns.every(h => typeof h === "string")) return null;
    lines.push({ line: l.line, headsigns: l.headsigns });
  }
  return { name: p.name, lines };
}

function profileKey(p) {
  return p.name + "|" + p.lines
    .map(l => `${l.line}:${[...l.headsigns].sort().join(",")}`)
    .sort()
    .join(";");
}

// jedno pobranie danych RT współdzielone przez wszystkich klientów (30 s)
let feedCache = { time: 0, promise: null };
function getFeed() {
  if (!feedCache.promise || Date.now() - feedCache.time > 30000) {
    feedCache.time = Date.now();
    feedCache.promise = downloadRT().catch(err => {
      feedCache.promise = null;
      throw err;
    });
  }
  return feedCache.promise;
}

const tripsCache = new Map();       // klucz profilu -> wiersze stop_times (dane statyczne)
const departuresCache = new Map();  // klucz profilu -> { time, data }

async function getProfileDepartures(p) {
  const key = profileKey(p);

  const cached = departuresCache.get(key);
  if (cached && Date.now() - cached.time < 20000) return cached.data;

  if (!tripsCache.has(key)) {
    if (tripsCache.size > 500) tripsCache.clear();
    tripsCache.set(key, buildTrackedTrips(p.name, p.lines));
  }

  const feed = await getFeed();
  const data = await showDepartures(3, tripsCache.get(key), feed);

  if (departuresCache.size > 500) departuresCache.clear();
  departuresCache.set(key, { time: Date.now(), data });
  return data;
}

app.post("/api/departures", async (req, res) => {
  const input = req.body && req.body.profiles;

  if (!Array.isArray(input) || input.length > 10) {
    return res.status(400).json({ error: "Nieprawidłowe dane" });
  }

  const cleaned = input.map(cleanProfile);
  if (cleaned.includes(null)) {
    return res.status(400).json({ error: "Nieprawidłowy profil" });
  }

  try {
    const result = await Promise.all(
      cleaned.map(async p => ({
        profileName: p.name,
        departures: await getProfileDepartures(p)
      }))
    );
    res.json(result);
  } catch (err) {
    console.error("Błąd /api/departures:", err.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});





// ===============================
// API
// ===============================



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

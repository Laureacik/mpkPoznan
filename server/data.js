
const fs = require("fs")
const csv = require("csv-parse/sync");
const gtfsrt = require("gtfs-realtime-bindings");
const AdmZip = require("adm-zip");
const dir = "server/dynamicGTFS"

const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

async function downloadGtfs() {
  const url = "https://www.ztm.poznan.pl/pl/dla-deweloperow/getGTFSFile";
  const zipPath = "GTFS.zip";
  const outputDir = "server/dynamicGTFS";

  console.log("Pobieranie aktualnego GTFS...");

  try {
    await execFileAsync("curl", [
      "-f",
      "-L",
      "-o",
      zipPath,
      url
    ]);

    console.log("GTFS pobrany.");

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(outputDir, true);

    fs.unlinkSync(zipPath);

    console.log("GTFS zaktualizowany.");

  } catch (err) {
    console.error("Błąd pobierania GTFS:", err.message);
  }
}

async function downloadRT() {
  const url = "https://www.ztm.poznan.pl/pl/dla-deweloperow/getGtfsRtFile?file=trip_updates.pb"
  
  console.log("Pobieranie aktualnych danych RT...");
  
  const res = await fetch(url)
  const buf = await res.arrayBuffer();

  const feed = gtfsrt.transit_realtime.FeedMessage.decode(
    new Uint8Array(buf)
  )
  console.log("Dane RT pobrane")
  return feed;
}

function parseCsv(data) {
  return csv.parse(data, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });
}

let stopsData = parseCsv(fs.readFileSync(`${dir}/stops.txt`, "utf8"));
let stopTimesData = parseCsv(fs.readFileSync(`${dir}/stop_times.txt`, "utf8"));
let routesData = parseCsv(fs.readFileSync(`${dir}/routes.txt`, "utf8"));
let tripsData = parseCsv(fs.readFileSync(`${dir}/trips.txt`, "utf8"));
let calendarData = parseCsv(fs.readFileSync(`${dir}/calendar.txt`, "utf8"));


function reloadGtfsData() {
  console.log("Wczytywanie nowych danych GTFS...");

  stopsData = parseCsv(fs.readFileSync(`${dir}/stops.txt`, "utf8"));
  stopTimesData = parseCsv(fs.readFileSync(`${dir}/stop_times.txt`, "utf8"));
  routesData = parseCsv(fs.readFileSync(`${dir}/routes.txt`, "utf8"));
  tripsData = parseCsv(fs.readFileSync(`${dir}/trips.txt`, "utf8"));
  calendarData = parseCsv(fs.readFileSync(`${dir}/calendar.txt`, "utf8"));

  console.log("Dane GTFS przeładowane.");
}

module.exports = {
  get stopsData() { return stopsData; },
  get stopTimesData() { return stopTimesData; },
  get routesData() { return routesData; },
  get tripsData() { return tripsData; },
  get calendarData() { return calendarData; },
  downloadGtfs,
  downloadRT,
  reloadGtfsData
};



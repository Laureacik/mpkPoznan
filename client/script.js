let chosenProfile = 0;

let profilesData = [
  {
    profileName: "Profil 1",
    departures: []
  },
  {
    profileName: "Profil 2",
    departures: []
  },
  {
    profileName: "Profil 3",
    departures: []
  }
];

const btnLeft = document.querySelector("button.left");
const btnRight = document.querySelector("button.right");
const btnCfg = document.querySelector("button.config")

async function loadProfiles() {
try {
  const response = await fetch("/api/profiles");
  if (!response.ok){throw new Error(`Błąd HTTP: ${response.status}`);}

  const data = await response.json();

    profilesData = data;

    renderDepartures();
} catch(err) {
console.error("Błąd funkcji loadProfiles:",err)}
}

function renderDepartures() {
  const table = document.querySelector("#departuresTable");
  const header = document.querySelector(".config h1")

  table.innerHTML = "";
  header.textContent = profilesData[chosenProfile].profileName

  const profile = profilesData[chosenProfile];

  if (!profile) return;

  const departures = profile.departures;

  departures.forEach(dep => {
    const row = document.createElement("tr");
    let timeToDep = (time) => {
      if(Number(time)>59)
      {
        return ">1godz";
      }
      else if(Number(time)==0)
      {
        return "Odjazd"
      }
      else
      {
        return `${time}min`;
      }
    }
    row.innerHTML = `
      <td>${dep.routeId}</td>
      <td>${dep.headsign}</td>
      <td>${timeToDep(dep.timeToDep)}</td>
    `;

    table.appendChild(row);
  });
}

function loadCurTime() {
  const currentDate = new Date();

  const h = String(currentDate.getHours()).padStart(2, "0");
  const m = String(currentDate.getMinutes()).padStart(2, "0");
  const s = currentDate.getSeconds();

  const timeHeader = document.querySelector(".time h1");

  if (timeHeader) {
    const colonClass = s % 2 === 0 ? "hidden-colon" : "";

    timeHeader.innerHTML = `${h}<span class="${colonClass}">:</span>${m}`;
  }
}

btnLeft.addEventListener("click", () => {
  chosenProfile = (chosenProfile - 1 + 3) % 3;
  renderDepartures();
});

btnRight.addEventListener("click", () => {
  chosenProfile = (chosenProfile + 1) % 3;
  renderDepartures();
});

// start
loadProfiles();
loadCurTime();

// zegar co sekundę
setInterval(loadCurTime, 1000);

setInterval(loadProfiles, 45000);

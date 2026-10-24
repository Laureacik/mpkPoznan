//const { createElement } = require("react");

const STORAGE_KEY = "mpkState";
let chosenProfile = 0;
let state = loadState();
if (!state) state = defaultState();


const svgBus = `
  <g>
    <path d="M503.467,153.6H25.6c-4.71,0-8.533,3.823-8.533,8.533v90.334L2.5,267.034c-1.604,1.596-2.5,3.772-2.5,6.033V332.8
        c0,4.71,3.823,8.533,8.533,8.533h115.678c5.922,10.155,16.811,17.067,29.389,17.067c12.578,0,23.467-6.912,29.389-17.067H354.62
        c5.922,10.155,16.811,17.067,29.389,17.067c12.826,0,23.885-7.194,29.713-17.673l91.273-16.597
        c4.053-0.742,7.006-4.275,7.006-8.397v-153.6C512,157.423,508.177,153.6,503.467,153.6z M153.6,341.333
        c-9.412,0-17.067-7.654-17.067-17.067S144.188,307.2,153.6,307.2c9.412,0,17.067,7.654,17.067,17.067
        S163.012,341.333,153.6,341.333z M384,341.333c-9.412,0-17.067-7.654-17.067-17.067S374.588,307.2,384,307.2
        c9.412,0,17.067,7.654,17.067,17.067S393.412,341.333,384,341.333z M494.933,238.933H409.6V204.8h85.333V238.933z
        M494.933,187.733h-435.2c-4.71,0-8.533,3.823-8.533,8.533v93.867c0,4.71,3.823,8.533,8.533,8.533H102.4
        c4.71,0,8.533-3.823,8.533-8.533V256h384v17.067H486.4c-4.71,0-8.533,3.823-8.533,8.533c0,4.71,3.823,8.533,8.533,8.533h8.533
        v18.483l-76.971,13.995c-0.888-18.039-15.71-32.478-33.963-32.478c-18.825,0-34.133,15.309-34.133,34.133H187.733
        c0-18.825-15.309-34.133-34.133-34.133c-18.825,0-34.133,15.309-34.133,34.133h-102.4V307.2H25.6c4.71,0,8.533-3.823,8.533-8.533
        c0-4.71-3.823-8.533-8.533-8.533h-8.533v-13.534l14.566-14.566c1.604-1.596,2.5-3.772,2.5-6.033v-85.333h460.8V187.733z
        M392.533,204.8v34.133H307.2V204.8H392.533z M290.133,204.8v34.133H204.8V204.8H290.133z M187.733,204.8v34.133h-76.8V204.8
        H187.733z M93.867,204.8v76.8h-25.6v-76.8H93.867z"/>
  </g>`;
const svgTram = `
  <g>
    <path d="M502.927,282.862l-21.273-56.727h4.753c4.719,0,8.533-3.823,8.533-8.533s-3.814-8.533-8.533-8.533h-16.87
      c-0.136,0-0.264,0-0.401,0h-42.468h-8.533c0-4.71-3.814-8.533-8.533-8.533h-27.63l33.091-27.578
      c1.945-1.621,3.063-4.019,3.063-6.553c0-2.534-1.126-4.932-3.063-6.553l-51.197-42.665c-3.166-2.645-7.765-2.645-10.931,0
      l-51.197,42.665c-1.937,1.621-3.063,4.019-3.063,6.553c0,2.534,1.126,4.932,3.063,6.553l33.099,27.578h-27.63
      c-4.719,0-8.533,3.823-8.533,8.533h-85.329c0-4.71-3.814-8.533-8.533-8.533h-27.63l33.091-27.578
      c1.945-1.621,3.063-4.019,3.063-6.553c0-2.534-1.126-4.932-3.063-6.553l-51.197-42.665c-3.166-2.645-7.765-2.645-10.931,0
      l-51.197,42.665c-1.937,1.621-3.063,4.019-3.063,6.553c0,2.534,1.126,4.932,3.063,6.553l33.099,27.578h-27.63
      c-4.719,0-8.533,3.823-8.533,8.533h-8.533h-59.73c-4.719,0-8.533,3.823-8.533,8.533s3.814,8.533,8.533,8.533h4.753l-20.94,55.848
      c-0.128,0.247-0.239,0.503-0.341,0.768c-9.983,25.462-11.724,43.117-5.333,53.954c4.386,7.432,10.888,8.644,12.151,8.815
      c0.367,0.051,0.802,0.077,1.178,0.077h25.599c0,18.824,15.308,34.132,34.132,34.132s34.132-15.308,34.132-34.132h25.599
      c0,18.824,15.308,34.132,34.132,34.132c18.824,0,34.132-15.308,34.132-34.132h102.395c0,18.824,15.308,34.132,34.132,34.132
      s34.132-15.308,34.132-34.132h25.599c0,18.824,15.308,34.132,34.132,34.132s34.132-15.308,34.132-34.132h25.599
      c0.375,0,0.751-0.026,1.126-0.077c1.254-0.171,7.765-1.382,12.151-8.815C514.6,325.86,512.859,308.214,502.927,282.862z
      M48.61,226.136h28.218v59.73H26.202L48.61,226.136z M18.761,328.531c-1.442-1.587-3.379-8.635,1.485-25.599h56.573v25.599H18.761
      z M76.819,362.662c-9.412,0-17.066-7.654-17.066-17.066h34.132C93.885,355.008,86.231,362.662,76.819,362.662z M119.484,328.531
      H93.885V226.136h25.599V328.531z M320.545,166.405l37.86-31.555l37.869,31.555l-37.869,31.555L320.545,166.405z M221.879,226.136
      h68.263v59.73h-68.263V226.136z M204.813,226.136v59.73H136.55v-59.73H204.813z M115.755,166.405l37.86-31.555l37.869,31.555
      l-37.861,31.555L115.755,166.405z M170.681,362.662c-9.412,0-17.066-7.654-17.066-17.066h34.132
      C187.747,355.008,180.093,362.662,170.681,362.662z M341.339,362.662c-9.412,0-17.066-7.654-17.066-17.066h34.132
      C358.405,355.008,350.751,362.662,341.339,362.662z M375.471,328.531H136.55v-25.599h238.921V328.531z M375.471,285.866h-68.263
      v-59.73h68.263V285.866z M435.21,226.136h28.218l22.399,59.73H435.21V226.136z M392.537,328.531V226.136h25.599v102.395H392.537z
      M435.201,362.662c-9.412,0-17.066-7.654-17.066-17.066h34.132C452.267,355.008,444.613,362.662,435.201,362.662z
      M493.208,328.531h-58.007v-25.599h56.513C496.587,319.895,494.642,326.943,493.208,328.531z"/>
  </g>
  <g>
    <path d="M503.465,379.728h-68.263h-93.862H170.681H76.819H8.556c-4.719,0-8.533,3.823-8.533,8.533c0,4.71,3.814,8.533,8.533,8.533
      h494.909c4.719,0,8.533-3.823,8.533-8.533S508.183,379.728,503.465,379.728z"/>
  </g>`;




function defaultState() {
  return { version: 1, activeId: null, profiles: [] };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Błąd odczytu stanu:", err);
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Błąd zapisu stanu:", err);
  }
}



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
  },
  {
    profileName: "Profil 4",
    departures: []
  }
];



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
  const container = document.querySelector("div.schedule");
  const header = document.querySelector(".config h1");

  container.innerHTML = "";
  header.textContent = profilesData[chosenProfile].profileName;

  const profile = profilesData[chosenProfile];
  if (!profile) return;

  const departures = profile.departures;

  const timeToDep = (time) => {
    if (Number(time) > 59) return ">1godz";
    if (Number(time) === 0) return "Odjazd";
    return `${time}min`;
  };

  const isDelayed = (delay) => {
    if (Number(delay) == 0) return `">Na czas`;
  return `delayed">Opóźnienie: +${delay} min`;
  };

  departures.forEach(dep => {
    const svg = (dep.routeId / 100 >= 1) ? svgBus : svgTram;
    const card = document.createElement("div");
    card.className = "departureCard";
    card.innerHTML = `
      <div class="upperRow">
        <span class="line">${dep.routeId}</span>
        <span class="endStop">${dep.headsign}</span>
        <span class="timeToDep">${timeToDep(dep.timeToDep)}</span>  
      </div>
      <div class="lowerRow">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${svg}</svg>
        <span class="depArrTime">
          ${dep.depTime.slice(0,-3)} 
          <i class="ti ti-arrow-narrow-right"></i>
          ${dep.arrTime.slice(0,-3)}
        </span>
        <span class="status${isDelayed(dep.delay)}</span>
      </div>
      
    `;
    container.appendChild(card);
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


const body = document.querySelector("body");
const btnLeft = document.querySelector("button.left");
const btnRight = document.querySelector("button.right");
const btnCfg = document.querySelector("button.config")
const btnDayNight = document.querySelector("button.daynight");


btnLeft.addEventListener("click", () => {
  chosenProfile = (chosenProfile - 1 + 4) % 4;
  renderDepartures();
});

btnRight.addEventListener("click", () => {
  chosenProfile = (chosenProfile + 1) % 4;
  renderDepartures();
});


if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark-mode");
}

btnDayNight.addEventListener("click", () => {
  const isDark = body.classList.toggle("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});



async function loadStopNames() {
  try {
    const response = await fetch("/api/stops");
    if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}`);

    const names = await response.json();
    const datalist = document.querySelector("#stopNamesList");

    names.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      datalist.appendChild(option);
    });
  } catch (err) {
    console.error("Błąd funkcji loadStopNames:", err);
  }
}

async function loadRoutes(stopName) {
  const routeListDiv = document.querySelector("#destinationGroups");
  routeListDiv.innerHTML = "";   // wyczyść poprzednie grupy

  if (!stopName) return;

  try {
    const response = await fetch(`/api/stops/routes?name=${encodeURIComponent(stopName)}`);
    if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}`);

    const routes = await response.json();
    //routeListDiv.innerHTML=JSON.stringify(routes);
    routes.forEach(stop => {
      let fieldset = document.createElement("fieldset")
      fieldset.classList = "destGroup";
      fieldset.id = stop;

      let legend = document.createElement("legend")
      stop.headsigns.forEach(headsign => {
        legend.textContent += `${headsign}, `;
      })
      legend.textContent.slice(0,-3);

      stop.lines.forEach(line => {
        let label = document.createElement("label");
        label.textContent = line;

        let checkbox = document.createElement("input");
        checkbox.type="checkbox";
        checkbox.value=line;
        checkbox.checked = 1;
        label.appendChild(checkbox);
        fieldset.appendChild(label);
      });
      fieldset.appendChild(legend)
      routeListDiv.appendChild(fieldset)
    });
  } catch (err) {
    console.error("Błąd funkcji loadRoutes:", err);
  }
}
document.querySelector("#startStopInput").addEventListener("change", (e) => {
  loadRoutes(e.target.value);
});

const tabBtns = document.querySelectorAll('button.changeTab')
const tabs = document.querySelectorAll('div.tab')
tabBtns.forEach(btn => {
  btn.addEventListener("click",()=>{
    tabs.forEach(tab => {
      tab.style.display = "none";
      if (tab.id == btn.id) tab.style.display = "flex";
    })

  })
});


let editStopCardBtns = document.querySelectorAll('div.stopCard button.editStopCard')
let delStopCardBtns = document.querySelectorAll('div.stopCard button.deleteStopCard')

const newStopBtn = document.querySelector("div.stopCard button.newStop")
const dialog = document.querySelector("dialog")

const inputStopName = dialog.querySelector("input#startStopInput")

const dialogSaveBtn = dialog.querySelector("button#saveStop")
const dialogCancelBtn = dialog.querySelector("button#cancel")

newStopBtn.addEventListener("click",() => {
  dialog.showModal();
})

dialogSaveBtn.addEventListener("click",()=>{
  localStorage.setItem("followedLines",inputStopName.value);
  let stops = document.querySelectorAll("dialog div#destinationGroups fieldset")
  let followedRoutes = [];
  stops.forEach(stop => {
    let followedLines = Document.querySelectorAll(`${stop} input:checked`)
    followedRoutes.push(followedLines)
  })
  dialog.close();
})

dialogCancelBtn.addEventListener("click",()=>{
  dialog.close();
})



// start
loadProfiles();
loadCurTime();
loadStopNames();

// zegar co sekundę
setInterval(loadCurTime, 1000);

setInterval(loadProfiles, 45000);

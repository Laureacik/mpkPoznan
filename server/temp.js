function getRoutesForStopNew(name) {
  if (routesCache.has(name)) return routesCache.get(name);
  const grouped = {};
  // wszystkie słupki o tej nazwie (zamiast 979 || 980)
  const stopIds = new Set(
    stopsData.filter(s => s.stop_name == name).map(s => s.stop_id)
  );

  const tripList = new Set(
      stopTimesData
        .filter(d => stopIds.has(d.stop_id))
        .map(d => ({
            stop_id: d.stop_id,
            trip_id: d.trip_id
        }))
    );

  tripsData
    .filter(d => tripList.has(d.trip_id))
    .forEach(d => {
        const line = Number(d.route_id);

        if (line >= 200 || line <= 299) {
            
        } else {
            if(!d.trip_id.search('^')){
                
            }
            if(!grouped[d.stop_id]) {
                grouped[d.stop_id] = {
                    stop_id: d.stop_id, 
                    headsigns: [], 
                    lines: []
                }}
            if(!grouped[d.stop_id.headsigns.includes(d.trip_headsign)]){
                grouped[d.stop_id].headsigns.push(d.trip_headsign)
            }
            if(!grouped[d.stop_id.headsigns.includes(d.lines)]){
                grouped[d.stop_id].headsigns.push(d.route_id)
            }

        }
        });
    
    const result = {
        routes: Object.values(grouped),
    };

    routesCache.set(name, result);
    return result;

}






let data = {
    "Profiles": {
        "Profile1": {
            "Stop":{
                "StopId":123,
                "Lines":[1,2,3,4,5]
            },
            "Stop":{
                "StopId":456,
                "Lines":[12,23,34,45,56]
            }
        },
        "Profile2": {
            "Stop":{
                "StopId":68,
                "Lines":[123,345,456]
            }
        }
    }
}


document.querySelector("#startStopInput").addEventListener("change", (e) => {
  loadRoutes(e.target.value);
});


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
      fieldset.id = stop.stop_id;

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




const response = await fetch(`/api/stops/routes?name=${encodeURIComponent(stopName)}`);
    if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}`);

    const lines = await response.json();

    lines.forEach(l => {
      const details = document.createElement("details");
      details.className = "lineGroup";
      details.dataset.line = l.line;

      const summary = document.createElement("summary");
      summary.textContent = l.line;
      details.appendChild(summary);

      l.headsigns.forEach(headsign => {
        const label = document.createElement("label");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = headsign;
        checkbox.checked = true;

        label.appendChild(checkbox);
        label.append(` ${headsign}`);
        details.appendChild(label);
      });

      routeListDiv.appendChild(details);
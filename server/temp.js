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
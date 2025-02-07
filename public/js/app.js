jQuery(document).ready(function ($) {
  var url = "/api/data.json";
  $.getJSON(url, function (data) {
    createOverviewMap(data);
  });
});

function createOverviewMap(dataset) {
  var map = new maplibregl.Map({
    container: "overview-map", // container id
    style: "https://demotiles.maplibre.org/style.json", // style URL
    center: [0, 0], // starting position [lng, lat]
    zoom: 1, // starting zoom
  });

  Object.values(dataset).forEach((portal) => {
    const loc = portal.location;
    if (!loc) {
      return;
    }

    const coordinates = loc.split(",");
    const lat = parseFloat(coordinates[0]);
    const lng = parseFloat(coordinates[1]);

    const marker = new maplibregl.Marker();
    marker.setLngLat([lng, lat]);
    marker.addTo(map);
  });
}

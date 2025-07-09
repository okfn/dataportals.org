document.addEventListener("DOMContentLoaded", () => {
  const url = "/api/data.json";
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      createOverviewMap(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
});

const createOverviewMap = (dataset) => {
  const map = new maplibregl.Map({
    container: "overview-map", // container id
    style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json", // style URL
    center: [0, 0], // starting position [lng, lat]
    zoom: 1, // starting zoom
  });

  // based on
  // https://maplibre.org/maplibre-gl-js/docs/examples/cluster/
  map.on("load", () => {
    const features = createGeoJSONFeatures(dataset);
    addMapLayers(map, features);
    setupMapInteractions(map);
  });
};

const includePortalOnMap = (portal) =>
  portal.status === "active" && !!portal.location;

const portalToGeoJSON = (portal) => {
  const coordinates = portal.location.split(",");
  const lat = parseFloat(coordinates[0]);
  const lng = parseFloat(coordinates[1]);

  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [lng, lat],
    },
    properties: portal,
  };
};

const createGeoJSONFeatures = (dataset) => {
  const portals = Object.values(dataset).filter(includePortalOnMap);
  return portals.map(portalToGeoJSON);
};

const addMapLayers = (map, features) => {
  addDataSource(map, features);
  addClusterLayer(map);
  addClusterCountLayer(map);
  addUnclusteredPointLayer(map);
};

const addDataSource = (map, features) => {
  map.addSource("portals", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features,
    },
    cluster: true,
    clusterMaxZoom: 14, // Max zoom to cluster points on
    clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
  });
};

const addClusterLayer = (map) => {
  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "portals",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#51bbd6",
        10,
        "#f1f075",
        100,
        "#f28cb1",
      ],
      "circle-radius": 20,
    },
  });
};

const addClusterCountLayer = (map) => {
  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "portals",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      // "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
  });
};

const addUnclusteredPointLayer = (map) => {
  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "portals",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#11b4da",
      "circle-radius": 4,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  });
};

const setupMapInteractions = (map) => {
  setupClusterClickHandler(map);
  setupPointClickHandler(map);
  setupCursorHandlers(map);
};

// inspect a cluster on click
const setupClusterClickHandler = (map) => {
  map.on("click", "clusters", async (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    const clusterId = features[0].properties.cluster_id;
    const zoom = await map
      .getSource("portals")
      .getClusterExpansionZoom(clusterId);
    map.easeTo({
      center: features[0].geometry.coordinates,
      zoom,
    });
  });
};

// When a click event occurs on a feature in
// the unclustered-point layer, open a popup at
// the location of the feature, with
// description HTML from its properties.
const setupPointClickHandler = (map) => {
  map.on("click", "unclustered-point", (e) => {
    const feature = e.features[0];
    const coordinates = feature.geometry.coordinates.slice();
    const { name, title, description_html, url } = feature.properties;

    // Ensure that if the map is zoomed out such that
    // multiple copies of the feature are visible, the
    // popup appears over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(
        `<p>
          <a href="portal/${name}">${title}</a>
        </p>
        ${description_html}
        <p>
          <strong>URL:</strong> <a href="${url}">${url}</a>
        </p>`
      )
      .addTo(map);
  });
};

const setupCursorHandlers = (map) => {
  map.on("mouseenter", "clusters", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "clusters", () => {
    map.getCanvas().style.cursor = "";
  });
};

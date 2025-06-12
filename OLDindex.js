const initialView = {
  center: [20.99, -89.63],
  zoom: 8,
};

const map = L.map("map").setView([20.99, -89.63], 8);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

const markerCluster = L.markerClusterGroup();
let allMarkers = [];
let municipiosSet = new Set();
let municipioLayers = {}; // ✅ Guardamos las capas de municipios

const entidades = [
  { nombre: "IDEFEEY", color: "orange" },
  { nombre: "INCAY", color: "green" },
  { nombre: "INCCOPY", color: "yellow" },
  { nombre: "IVEY", color: "purple" },
  { nombre: "JAPAY", color: "red" },
];

const estatusList = ["finalizada", "proceso", "planeacion"];

function getParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    entidad: urlParams.get("entidad") || "todos",
    municipio: urlParams.get("municipio") || "todos",
    estatus: urlParams.get("estatus") || "todos",
  };
}

function setParams(entidad, municipio, estatus) {
  const url = new URL(window.location);
  url.searchParams.set("entidad", entidad);
  url.searchParams.set("municipio", municipio);
  url.searchParams.set("estatus", estatus);
  window.history.replaceState({}, "", url);
}

fetch("yucatan_municipios_2023.json")
  .then((res) => res.json())
  .then((data) => {
    const geoLayer = L.geoJSON(data, {
      style: {
        color: "#901B45",
        weight: 2,
        fillColor: "#E1A740",
        fillOpacity: 0.5,
      },
      onEachFeature: (feature, layer) => {
        const municipio = feature.properties.NOMGEO;
        municipiosSet.add(municipio);
        municipioLayers[municipio] = layer; // ✅ Guardamos la capa

        layer.on("click", () =>
          layer.bindPopup(`<strong>${municipio}</strong>`).openPopup()
        );
        layer.on("mouseover", (e) =>
          layer.bindPopup(`<strong>${municipio}</strong>`).openPopup(e.latlng)
        );
        layer.on("mouseout", () => layer.closePopup());

        const bounds = layer.getBounds();
        const count = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < count; i++) {
          const ent = entidades[Math.floor(Math.random() * entidades.length)];
          const estado =
            estatusList[Math.floor(Math.random() * estatusList.length)];
          const lat =
            bounds.getSouthWest().lat +
            Math.random() *
              (bounds.getNorthEast().lat - bounds.getSouthWest().lat);
          const lng =
            bounds.getSouthWest().lng +
            Math.random() *
              (bounds.getNorthEast().lng - bounds.getSouthWest().lng);

          const icon = L.divIcon({
            className: "custom-div-icon",
            html: `<div style="background:${ent.color};width:20px;height:20px;border-radius:50%;"></div>`,
            iconSize: [20, 20],
            popupAnchor: [0, -10],
          });

          const m = L.marker([lat, lng], { icon });
          m.props = { entidad: ent.nombre, municipio, estatus: estado };
          const mid = `pop-${ent.nombre}-${municipio}-${i}`.replace(
            /[\s.]/g,
            "_"
          );

          m.bindPopup(`
              <div><strong>${ent.nombre}</strong><br>${municipio}<br>Estatus: ${estado}
              <div id="${mid}" style="width:100px;height:100px;"></div></div>
            `);
          m.on("popupopen", () => {
            const c = document.getElementById(mid);
            if (c)
              lottie.loadAnimation({
                container: c,
                renderer: "svg",
                loop: true,
                autoplay: true,
                path: "public/animations/construction.json",
              });
          });

          allMarkers.push(m);
          markerCluster.addLayer(m);
        }
      },
    });
    map.addLayer(geoLayer);
    map.addLayer(markerCluster);

    addMunicipioOptions();
    setFiltersFromURL();
    applyFilters();
    addLegend();
  });

function addMunicipioOptions() {
  const sel = document.getElementById("filtro-municipio");
  Array.from(municipiosSet)
    .sort()
    .forEach((mun) => {
      const o = document.createElement("option");
      o.value = mun;
      o.textContent = mun;
      sel.appendChild(o);
    });
}

function applyFilters() {
  const fe = document.getElementById("filtro-entidad").value;
  const fm = document.getElementById("filtro-municipio").value;
  const fo = document.getElementById("filtro-estatus").value;

  setParams(fe, fm, fo);

  markerCluster.clearLayers();
  allMarkers
    .filter((m) => {
      return (
        (fe === "todos" || m.props.entidad === fe) &&
        (fm === "todos" || m.props.municipio === fm) &&
        (fo === "todos" || m.props.estatus === fo)
      );
    })
    .forEach((m) => markerCluster.addLayer(m));

  // ✅ Restablecer estilo por defecto a todos
  Object.values(municipioLayers).forEach((layer) =>
    layer.setStyle({
      color: "#901B45",
      weight: 2,
      fillColor: "#E1A740",
      fillOpacity: 0.5,
    })
  );

  // ✅ Si hay municipio seleccionado, resaltar su capa
  if (fm !== "todos" && municipioLayers[fm]) {
    municipioLayers[fm].setStyle({
      color: "#000000",
      weight: 3,
      fillColor: "#ffff00",
      fillOpacity: 0.7,
    });
    map.fitBounds(municipioLayers[fm].getBounds());
  }
}

function setFiltersFromURL() {
  const { entidad, municipio, estatus } = getParams();
  document.getElementById("filtro-entidad").value = entidad;
  document.getElementById("filtro-municipio").value = municipio;
  document.getElementById("filtro-estatus").value = estatus;
}

["filtro-entidad", "filtro-municipio", "filtro-estatus"].forEach((id) =>
  document.getElementById(id).addEventListener("change", applyFilters)
);

document.getElementById("clear-filters").addEventListener("click", () => {
  document.getElementById("filtro-entidad").value = "todos";
  document.getElementById("filtro-municipio").value = "todos";
  document.getElementById("filtro-estatus").value = "todos";
  applyFilters();

  // ✅ Restablecer el centro y zoom del mapa
  map.setView(initialView.center, initialView.zoom);
});

function addLegend() {
  const legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");
    div.style.background = "white";
    div.style.padding = "10px";
    div.style.border = "1px solid #ccc";
    div.style.borderRadius = "8px";
    div.style.fontSize = "14px";
    div.innerHTML += "<strong>Entidades</strong><br>";

    entidades.forEach((ent) => {
      div.innerHTML += `
          <div style="margin-bottom:4px;">
            <i style="background:${ent.color}; width:12px; height:12px; border-radius:50%; display:inline-block; margin-right:5px;"></i>
            ${ent.nombre}
          </div>`;
    });

    div.innerHTML += "<hr style='margin:6px 0;'><strong>Estatus</strong><br>";
    estatusList.forEach((e) => {
      div.innerHTML += `<div style="margin-bottom:4px;">🟢 ${e}</div>`;
    });

    return div;
  };

  legend.addTo(map);
}

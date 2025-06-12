// Galerías por marcador
const galerias = {
  obra1: {
    descripcion: "Descripción de la obra 1.",
    imagenes: [
      "https://img.lajornadamaya.mx/610411711504800FScorredormeridacentrouman.jpg",
      "https://arandano.lajornadamaya.mx/img/cuerpo-3/FScorredormeridacentrouman1.jpeg",
      "https://www.cmic.org/wp-content/uploads/2021/09/Industria-de-la-construccion-sigue-siendo-motor-economico-de-Yucatan.jpg",
    ],
  },
  obra2: {
    descripcion: "Descripción de la obra 2.",
    imagenes: [
      "https://www.cmic.org/wp-content/uploads/2023/02/CMIC-Yucatan-levantara-la-mano-para-obras-publicas-del-2023.jpg",
      "https://meridamoderna.com/wp-content/uploads/2022/05/Obreros.jpg",
      "https://meridamoderna.com/wp-content/uploads/2022/05/Trabajadores.jpg",
    ],
  },
  obra3: {
    descripcion: "Descripción de la obra 3.",
    imagenes: [
      "https://www.hermanosotero.com/que-se-considera-una-obra-civil_img51515t1.jpg",
      "https://pyhca.com/wp-content/uploads/2023/06/estudio-de-los-suelos-importancia.jpg",
      "https://pyhca.com/wp-content/uploads/2023/06/estudio-de-los-suelos-ventajas.jpg",
    ],
  },
};

// Inicializar el Swiper
let swiper = new Swiper(".galeria-swiper", {
  loop: true,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});

// Función para actualizar galería
function actualizarGaleria(obraKey) {
  const data = galerias[obraKey];
  const wrapper = document.getElementById("swiper-wrapper");
  wrapper.innerHTML = "";

  data.imagenes.forEach((url) => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    slide.innerHTML = `<img src="${url}" alt="Obra">`;
    wrapper.appendChild(slide);
  });

  document.getElementById(
    "descripcion-obra"
  ).innerHTML = `<p>${data.descripcion}</p>`;

  swiper.update(); // refrescar swiper
  swiper.slideTo(0); // ir al inicio
}

// Inicializar Leaflet
const map = L.map("map2").setView([20.97, -89.62], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Map data © OpenStreetMap contributors",
}).addTo(map);

const marcadores = [
  {
    key: "obra1",
    nombre: "Obra 1",
    coords: [20.98, -89.62],
  },
  {
    key: "obra2",
    nombre: "Obra 2",
    coords: [20.96, -89.61],
  },
  {
    key: "obra3",
    nombre: "Obra 3",
    coords: [20.97, -89.63],
  },
];

marcadores.forEach((obra) => {
  L.marker(obra.coords)
    .addTo(map)
    .bindPopup(obra.nombre)
    .on("click", () => actualizarGaleria(obra.key));
});

// Carga inicial
actualizarGaleria("obra1");

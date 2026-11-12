import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, renderer, camera, camcontrols;
let mapa,
  mapsx,
  mapsy,
  scale = 5;

// Latitud y longitud de los extremos del mapa de la imagen
let minlon = -18.8,
  maxlon = 4.8;
let minlat = 27.2,
  maxlat = 44.4;
// Dimensiones textura (mapa)
let txwidth, txheight;
let texturacargada = false;

let objetos = [];
let lineas;
const bolas = []; // esferitas reutilizables, una por vuelo activo
const geoBola = new THREE.SphereGeometry(0.01, 8, 8);
const matBola = new THREE.MeshBasicMaterial({ color: 0x00ff2b });

//Datos fecha, aeropuertos, vuelos
const fechaInicio = new Date(2018, 5, 7); // 7 de junio de 2018 (mes 0 es enero)
let fechaActual;
let totalMinutos = 330, // 5:30 como arranque
  fecha2show;
let pactivos = 0; // contabiliza vuelos activos
const datosVuelos = [],
  datosAeropuertos = [];

// Formatea salida
const opcionesfecha = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

init();
animate();

function init() {
  // Muestra fecha actual como título
  fecha2show = document.createElement("div");
  fecha2show.style.position = "absolute";
  fecha2show.style.top = "30px";
  fecha2show.style.width = "100%";
  fecha2show.style.textAlign = "center";
  fecha2show.style.color = "#fff";
  fecha2show.style.fontWeight = "bold";
  fecha2show.style.backgroundColor = "rgba(0, 0, 0, 0.65)";
  fecha2show.style.zIndex = "1";
  fecha2show.style.fontFamily = "Monospace";
  fecha2show.innerHTML = "";
  document.body.appendChild(fecha2show);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camcontrols = new OrbitControls(camera, renderer.domElement);

  // CARGA TEXTURA (MAPA)
  const tx1 = new THREE.TextureLoader().load(
    "src/mapa_espana.png",
    function (texture) {
      const txaspectRatio = texture.image.width / texture.image.height;
      mapsy = scale;
      mapsx = mapsy * txaspectRatio;
      Plano(0, 0, 0, mapsx, mapsy);

      mapa.material.map = texture;
      mapa.material.needsUpdate = true;

      texturacargada = true;

      // CARGA DE DATOS DE AEROPUERTOS
      fetch("src/aeropuertos_espana.csv")
        .then((response) => {
          if (!response.ok) throw new Error("Error: " + response.statusText);
          return response.text();
        })
        .then((content) => {
          procesarCSVAeropuertos(content);
        })
        .catch((error) => {
          console.error("Error al cargar aeropuertos:", error);
        });

      // CARGA DE DATOS DE VUELOS
      fetch("src/vuelos_filtrados.csv")
        .then((response) => {
          if (!response.ok) throw new Error("Error: " + response.statusText);
          return response.text();
        })
        .then((content) => {
          procesarCSVVuelos(content);
        })
        .catch((error) => {
          console.error("Error al cargar vuelos:", error);
        });
    }
  );
}

// Procesamiento datos csv aeropuertos
function procesarCSVAeropuertos(content) {
  const sep = ";";
  const filas = content.split("\n");
  const encabezados = filas[0].split(sep);
  const indices = {
    code: encabezados.indexOf("code"),
    nombre: encabezados.indexOf("name"),
    lat: encabezados.indexOf("lat"),
    lon: encabezados.indexOf("lon"),
  };

  for (let i = 1; i < filas.length; i++) {
    const columna = filas[i].split(sep);
    if (columna.length > 1) {
      let mlon = Map2Range(columna[indices.lon], minlon, maxlon, -mapsx / 2, mapsx / 2);
      let mlat = Map2Range(columna[indices.lat], minlat, maxlat, -mapsy / 2, mapsy / 2);

      datosAeropuertos.push({
        code: columna[indices.code].trim(),
        nombre: columna[indices.nombre],
        lat: columna[indices.lat],
        lon: columna[indices.lon],
        latmap: mlat,
        longmap: mlon,
      });
      Esfera(mlon, mlat, 0, 0.01, 10, 10, 0x009688);
    }
  }
  console.log("Archivo csv aeropuertos cargado");
}

// Procesamiento datos csv vuelos
function procesarCSVVuelos(content) {
  const sep = ";";
  const filas = content.split("\n");
  const encabezados = filas[0].split(sep);

  const indices = {
    t_inicio_f: encabezados.indexOf("dep_date"),
    t_inicio_h: encabezados.indexOf("dep_time"),
    t_fin_f: encabezados.indexOf("arr_date"),
    t_fin_h: encabezados.indexOf("arr_time"),
    p_inicio: encabezados.indexOf("dep_airport_code"),
    p_fin: encabezados.indexOf("arr_airport_code"),
  };

  for (let i = 1; i < filas.length; i++) {
    const columna = filas[i].split(sep);
    if (columna.length > 1 && columna[indices.p_inicio]) {
      const tInicio = convertirFechaVuelo(columna[indices.t_inicio_f], columna[indices.t_inicio_h]);
      
      // Algunos vuelos pueden tener llegada vacía en el CSV; maneja un fallback de 1 hora si falta
      let tFin;
      if (columna[indices.t_fin_f] && columna[indices.t_fin_h] && columna[indices.t_fin_f].trim() !== "") {
        tFin = convertirFechaVuelo(columna[indices.t_fin_f], columna[indices.t_fin_h]);
      } else {
        tFin = new Date(tInicio.getTime() + 60 * 60000); 
      }

      datosVuelos.push({
        t_inicio: tInicio,
        t_fin: tFin,
        p_inicio: columna[indices.p_inicio].trim(),
        p_fin: columna[indices.p_fin].trim(),
      });
    }
  }
  console.log("Archivo csv vuelos cargado");
}

// Mapea valores a rango
function Map2Range(val, vmin, vmax, dmin, dmax) {
  let t = 1 - (vmax - val) / (vmax - vmin);
  return dmin + t * (dmax - dmin);
}

function Esfera(px, py, pz, radio, nx, ny, col) {
  let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
  let material = new THREE.MeshBasicMaterial({ color: col });
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  objetos.push(mesh);
  scene.add(mesh);
}

function Plano(px, py, pz, sx, sy) {
  let geometry = new THREE.PlaneGeometry(sx, sy);
  let material = new THREE.MeshBasicMaterial({});
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  mapa = mesh;
}

// Conversor fecha adaptado para el formato DD/MM/YY de los vuelos
function convertirFechaVuelo(fechaStr, horaStr) {
  const [dia, mes, año] = fechaStr.split("/").map(Number);
  const [horas, minutos] = (horaStr || "00:00").split(":").map(Number);
  const anioCompleto = 2000 + año; // Convierte '18' en 2018
  return new Date(anioCompleto, mes - 1, dia, horas, minutos);
}

// Llegada del último vuelo
const fechaFinSimulacion = new Date(2018, 5, 11, 14, 50);

function actualizarFecha() {
  totalMinutos += 1;
  fechaActual = new Date(fechaInicio.getTime() + totalMinutos * 60000);
  
  // Si termina el último vuelo, se reinicia
  if (fechaActual > fechaFinSimulacion) {
    totalMinutos = 330;
    actualizarFecha();
  }
}

// Vuelos activos en un momento dado
function filtraparadasActivas() {
  const registrosFiltrados = datosVuelos.filter((registro) => {
    return registro.t_inicio <= fechaActual && registro.t_fin >= fechaActual;
  });

  if (lineas) {
    scene.remove(lineas);
    lineas.geometry.dispose();
  }

  const norm = (s) => (s ? s.trim().toUpperCase() : "");
  // Búsqueda por código de aeropuerto (ej: 'MAD', 'LCG')
  const buscaAeropuerto = (code) =>
    datosAeropuertos.find((e) => norm(e.code) === norm(code));

  const pts = [];
  let nBolas = 0;
  for (const r of registrosFiltrados) {
    const a = buscaAeropuerto(r.p_inicio);
    const b = buscaAeropuerto(r.p_fin);
    
    if (a && b) {
      pts.push(new THREE.Vector3(a.longmap, a.latmap, 0.01));
      pts.push(new THREE.Vector3(b.longmap, b.latmap, 0.01));

      if (a !== b) {
        const dur = Math.max(r.t_fin - r.t_inicio, 60000);
        const t = Math.min(1, Math.max(0, (fechaActual - r.t_inicio) / dur));
        if (!bolas[nBolas]) {
          const m = new THREE.Mesh(geoBola, matBola);
          scene.add(m);
          bolas.push(m);
        }
        bolas[nBolas].position.set(
          a.longmap + (b.longmap - a.longmap) * t,
          a.latmap + (b.latmap - a.latmap) * t,
          0.02
        );
        bolas[nBolas].visible = true;
        nBolas++;
      }
    }
  }

  // Ocultar las esferas sobrantes del fotograma anterior que ya no se usan
  for (let j = nBolas; j < bolas.length; j++) {
    bolas[j].visible = false;
  }

  lineas = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );
  scene.add(lineas);

  if (registrosFiltrados.length > 0) {
    const aeropuertosA = new Set(registrosFiltrados.map((registro) => registro.p_inicio));
    const aeropuertosB = new Set(registrosFiltrados.map((registro) => registro.p_fin));

    pactivos = registrosFiltrados.length;

    let i = 0;
    for (const estacion of datosAeropuertos) {
      if (
        aeropuertosA.has(estacion.code) ||
        aeropuertosB.has(estacion.code)
      ) {
        if (
          aeropuertosA.has(estacion.code) &&
          aeropuertosB.has(estacion.code)
        )
          objetos[i].material.color.set(0x005aa0);
        else {
          if (aeropuertosA.has(estacion.code))
            objetos[i].material.color.set(0x8a2be2); // salida
          else objetos[i].material.color.set(0xc81e3c); // destino
        }
        objetos[i].scale.set(2, 2, 2);
      } else {
        objetos[i].material.color.set(0x009688);
        objetos[i].scale.set(1, 1, 1);
      }
      i++;
    }
  }
}

// Bucle de animación
function animate() {
  if (texturacargada) {
    actualizarFecha();
    filtraparadasActivas();

    fecha2show.innerHTML = fechaActual.toLocaleString("es-ES", opcionesfecha);
    fecha2show.innerHTML += " · " + pactivos + " vuelos en curso";
  }

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
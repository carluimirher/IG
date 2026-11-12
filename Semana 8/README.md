# Visor de Tráfico Aéreo en España 3D

## Descripción del proyecto

Una aplicación interactiva en Three.js que visualiza en un plano 3D la evolución temporal de los vuelos en España en tiempo real simulado, mostrando trayectorias, estado de los aeropuertos y movimiento dinámico de las aeronaves.

## Enlace al proyecto

Para ver el código y poder ejecutarlo, aquí se encuentra el link de CodeSandbox:
https://codesandbox.io/p/devbox/ig-s8-forked-5ffpk2?workspaceId=ws_BN8J5f7AgfrDxujuwvtsyc

## Características Principales

- **Mapa Plano 3D Interactivo:** Textura proyectada del mapa de España con coordenadas geográficas calibradas (latitud y longitud) y control de cámara fluida (`OrbitControls`).
- **Simulación de Vuelos en Tiempo Real:**
  - Posicionamiento e interpolación lineal del movimiento de cada avión según su horario de salida y llegada.
  - Generación dinámica y reutilización de geometría para optimizar el rendimiento del renderizado de las aeronaves activas.
- **Visualización de Aeropuertos y Rutas:**
  - Representación de la red aeroportuaria española a partir de datos CSV.
  - Indicadores dinámicos de color en cada aeropuerto según su estado actual (aeropuerto de origen, de destino o punto intermedio/ambos).
  - Trazado de líneas de conexión directas para los vuelos en curso.
- **Reloj de Simulación y Bucle Temporal:**
  - Avance minuto a minuto del tiempo de simulación con reinicio automático al finalizar la ventana temporal de los datos.
  - Indicador flotante superior en pantalla con fecha, hora en formato local y recuento de vuelos activos.

## Estructura del Proyecto

El código está organizado de la siguiente manera:

```text
├── src/
│   ├── mapa_espana.png         # Textura base del mapa de España
│   ├── aeropuertos_espana.csv  # Base de datos con coordenadas y códigos
│   ├── vuelos_filtrados.csv    # Registro de vuelos con horarios y rutas
│   ├── script.js               # Código principal (Three.js, parsers CSV, bucle de animación)
│   └── index.html
└── package.json
```

## Controles de Usuario

- **Rotar la vista:** Clic izquierdo + arrastrar.
- **Desplazar el plano:** Clic derecho + arrastrar.
- **Zoom:** Rueda del ratón / pinch en pantallas táctiles.

## Resultado final

Al hacer click en la siguiente imagen, se redirigirá a un video de YouTuber donde se hace una demostración de la ejecución del código.

[![Ver Demostración en YouTube](https://img.youtube.com/vi/RdQ3jTj8CAw/maxresdefault.jpg)](https://youtu.be/RdQ3jTj8CAw)
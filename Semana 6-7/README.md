# Simulación de un Sistema Planetario 3D

## Descripción del proyecto

Este proyecto consiste en una simulación interactiva en tres dimensiones de un sistema planetario desarrollada con **Three.js** y ejecutada en CodeSandbox. Permite explorar una representación del espacio desde dos perspectivas diferentes: una **vista general**, que facilita la observación del sistema planetario completo, y una **vista subjetiva**, que permite desplazarse libremente por el entorno espacial como si el usuario se encontrara dentro de él.

La simulación incluye una estrella central, varios planetas con texturas, satélites naturales, un fondo espacial y un meteorito que se aproxima a la Tierra. Además, incorpora una cuenta atrás de 60 segundos que acompaña el desarrollo del evento y modifica determinados elementos visuales cuando se alcanza el tiempo establecido.

## Enlace al proyecto

Para ver el código y poder ejecutarlo, aquí se encuentra el link de CodeSandbox:
https://codesandbox.io/p/sandbox/ig-s6-7-2psdkz

## Funcionalidades principales

- **Entorno espacial 3D:** representación de un sistema planetario mediante geometrías esféricas, materiales, texturas e iluminación.
- **Dos perspectivas de navegación:** alternancia entre una vista orbital general y una vista subjetiva con desplazamiento libre.
- **Movimiento orbital:** animación de los planetas y satélites mediante funciones trigonométricas.
- **Rotación planetaria:** giro de los planetas sobre su propio eje.
- **Texturas astronómicas:** aplicación de imágenes para representar superficies planetarias, la estrella, el espacio y los satélites.
- **Efecto de relieve:** uso de mapas de desplazamiento aparente (*bump maps*) y mapas especulares para aportar mayor detalle a la superficie terrestre.
- **Capa de nubes:** representación adicional de la atmósfera nubosa de la Tierra mediante transparencia y texturas.
- **Meteorito en trayectoria de colisión:** objeto que desciende progresivamente hacia la Tierra durante un intervalo de 60 segundos.
- **Cuenta atrás:** indicador visual que muestra el tiempo restante y cambia de color cuando se aproxima el final.
- **Cambios visuales tras el impacto:** modificación del color de determinados objetos y eliminación posterior del contador.

## Elementos de la simulación

### Estrella central

La estrella ocupa el centro del sistema y actúa como referencia para la distribución espacial de los planetas. Se representa mediante una esfera con textura y una fuente de luz puntual que ilumina el entorno.

### Planetas

El sistema incluye varios cuerpos planetarios con diferentes tamaños, distancias y velocidades orbitales. Se utilizan texturas para distinguir sus superficies y conseguir una representación visual más detallada.

También se utiliza una esfera adicional como representación de una capa de nubes asociada a la Tierra.

### Satélites

Los satélites orbitan alrededor de determinados planetas. Su movimiento se calcula mediante un sistema de pivotes (`THREE.Object3D`), que permite establecer inclinaciones orbitales.

### Meteorito

El meteorito se crea como una esfera pequeña y se sitúa inicialmente a gran altura respecto a la Tierra. Durante el minuto de simulación, sigue la posición global del planeta objetivo y desciende por el eje vertical.

Al llegar al objetivo, el meteorito se elimina de la escena.

### Fondo espacial

El entorno se representa mediante una esfera de gran radio con una textura espacial aplicada en su cara interior. Esta técnica permite rodear la escena con una imagen del espacio.

## Modos de cámara

Una de las características principales del proyecto es la posibilidad de alternar entre dos formas de explorar el sistema.

### 1. Vista general: OrbitControls

El modo inicial utiliza `OrbitControls`, que permite observar el sistema planetario desde el exterior.

Con este modo se puede:

- Orbitar alrededor del punto de interés.
- Acercar y alejar la cámara.
- Examinar la distribución y el movimiento de los cuerpos celestes.

Esta perspectiva es especialmente útil para comprender la estructura general del sistema planetario y observar las órbitas.

### 2. Vista subjetiva: FlyControls

Al pulsar el botón **FlyControls**, se activa un modo de navegación libre mediante `FlyControls`.

Este modo permite desplazarse por el espacio y orientar la cámara en diferentes direcciones, ofreciendo una perspectiva más inmersiva.

El `dragToLook` está activado para controlar la orientación de la cámara mediante el arrastre del ratón.

Para volver a la vista general, basta con pulsar el botón **OrbitControls**. Al realizar el cambio, se actualiza el punto de interés orbital para conservar, en la medida de lo posible, la dirección actual de la cámara.

## Cuenta atrás y evento del meteorito

La simulación incorpora un temporizador de 60 segundos que representa el tiempo disponible antes del final del evento.

| Tiempo transcurrido | Evento |
|---|---|
| 0 segundos | Comienza la simulación y el meteorito inicia su descenso. |
| 50 segundos | El contador cambia a color rojo para indicar la proximidad del final. |
| 60 segundos | El meteorito desaparece de la escena y se modifican los colores de del planeta afectado. |
| 65 segundos | El contador se elimina de la interfaz. |

El movimiento del meteorito se calcula a partir del tiempo transcurrido desde el inicio. Su progreso aumenta de 0 a 1 durante los primeros 60 segundos y determina la altura a la que se encuentra.

## Estructura de recursos

Las rutas de las texturas utilizadas por la simulación siguen una organización similar a la siguiente:

```text
src/
└── img/
    ├── spacemap.jpg
    ├── sunmap.jpg
    ├── planetas/
    │   ├── earth/
    │   │   ├── earthmap1k.jpg
    │   │   ├── earthbump1k.jpg
    │   │   ├── earthspec1k.jpg
    │   │   ├── earthcloudmap.jpg
    │   │   └── earthcloudmaptrans_invert.jpg
    │   ├── marsmap.jpg
    │   ├── jupitermap.jpg
    │   ├── neptunemap.jpg
    │   └── makemakemap.jpg
    └── satelites/
        ├── moonmap.jpg
        ├── mercurymap.jpg
        ├── haumeamap.jpg
        ├── erismap.jpg
        └── ceresmap.jpg
```

## Funcionamiento técnico

La simulación se organiza en varias funciones que facilitan la creación y actualización de los objetos.

- `init()`: configura la escena, la cámara, el renderizador, las luces, las texturas, los controles y los objetos celestes.
- `FondoEspacial()`: crea la esfera que representa el fondo del espacio.
- `Estrella()`: genera la estrella central.
- `Planeta()`: crea los planetas, configura sus materiales y almacena los parámetros de movimiento.
- `Luna()`: crea los satélites y sus pivotes orbitales.
- `Meteorito()`: genera el meteorito y guarda los datos necesarios para controlar su trayectoria.
- `animationLoop()`: actualiza las órbitas, las rotaciones, el descenso del meteorito, la cuenta atrás y el renderizado de cada fotograma.

Las órbitas se calculan mediante funciones seno y coseno. Para cada planeta, la posición horizontal y la profundidad dependen del tiempo, la velocidad orbital, la distancia y los factores de escala almacenados en `userData`.

El bucle de animación utiliza `requestAnimationFrame()` para actualizar la escena de forma continua.

## Resultado final

Aquí hay una demostración de la ejecución del código

[![Ver vídeo en YouTube](https://img.youtube.com/vi/oB7a3vygBxo/maxresdefault.jpg)](https://www.youtube.com/watch?v=oB7a3vygBxo)

## Uso de IA

Para este proyecto, se usado la Inteligencia Artificial ChatGPT para las siguientes consultas:

- La cuenta atrás: https://chatgpt.com/share/6ae3c3f2-2208-83eb-ba14-5088abe97214
- El botón interactuable: https://chatgpt.com/share/6ae3c0e1-9794-83eb-a3a2-47ae609ad6d4

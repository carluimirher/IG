# Simulador Físico 3D con Three.js y Ammo.js

## Descripción del proyecto

Una aplicación interactiva en 3D desarrollada con Three.js y el motor físico Ammo.js. El proyecto simula un entorno tridimensional delimitado por vallas donde el jugador puede desplazarse libremente desde una perspectiva en primera persona, interactuar con el entorno mediante físicas y disparar proyectiles a ovejas.

## Enlace al proyecto

Para ver el código y poder ejecutarlo, aquí se encuentra el link de CodeSandbox: https://codesandbox.io/p/sandbox/ig-s11-6m4x4j

## Características Principales

- **Cámara y Control del Jugador en Primera Persona:**
  - Control de orientación mediante las teclas de dirección.
  - Movimiento continuo con teclas e implementación de deslizamiento en paredes u obstáculos.
  - Detección de colisiones en tiempo real con vallas y ovejas.
- **Simulación Física Integrada (Ammo.js):**
  - Mundo físico tridimensional dinámico con gravedad y cuerpos rígidos.
  - Generación de formas de colisión personalizadas para objetos complejos (`btBoxShape`, `btSphereShape`).
- **Mecánica de Disparo y Audio:**
  - Creación dinámica de proyectiles con masa e impulso aplicados en la dirección del visor de la cámara.
  - Integración de audio mediante `THREE.AudioListener` al disparar los proyectiles.
- **Modelado Procedural de Elementos 3D:**
  - Construcción de modelos modulares a partir de primitivas (ovejas estándar, oveja "alone", ovejas "devil" y segmentos de valla).
  - Distribución espacial programada de objetos.

## Estructura del Proyecto

El código está organizado de la siguiente manera:

```text
├── src/
│   ├── shoot.mp3       # Efecto de sonido para el disparo
│   ├── models.js       # Construcción modular de modelos 3D (ovejas, vallas)
│   ├── script.js       # Lógica principal (Three.js, Ammo.js, controles y bucle físico)
│   └── index.html
└── package.json
```

## Controles de Usuario

- **Desplazamiento:** Teclas `W`, `A`, `S`, `D` para moverse hacia adelante, atrás, izquierda y derecha.
- **Orientación de cámara:** Flechas de teclado (`Izquierda` / `Derecha` para rotación horizontal, `Arriba` / `Abajo` para la inclinación vertical).
- **Disparar proyectil:** Tecla `Espacio` (reproduce sonido y lanza una bola de masa física).

## Uso de Inteligencia Artificial

Para este proyecto, se hicieron algunas preguntas a las Inteligencias Artificiales ChatGPT y Gemini, aquí adjunto las conversaciones:

- **1º diseño del modelo de la oveja:** https://chatgpt.com/share/6b074d77-5b54-83ed-a77f-b8c5167964f5
- **Giro vertical limitado de la cámara:** https://chatgpt.com/share/6b074dd0-4fd8-83ed-9f03-531e853cc1a5
- **Arreglo de error de colisión de vallas:** https://share.gemini.google/2wJwrWnjT8Nw

## Resultado final

Al hacer click en la siguiente imagen, se redirigirá a un video de YouTube donde se hace una demostración de la ejecución del código.

[![Ver Demostración en YouTube](https://img.youtube.com/vi/brZs8kJfhWc/maxresdefault.jpg)](https://youtu.be/brZs8kJfhWc)

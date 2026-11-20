# Shaders en GLSL: Buenas Noches y Tiny Code

## Descripción del proyecto

Este proyecto contiene una colección de shaders desarrollados en fragment GLSL utilizando el editor de **The Book of Shaders**. Las obras representan escenas animadas mediante matemáticas y funciones implícitas de renderizado, centradas en la figura de una oveja:

1. **BuenasNoches:** Una escena nocturna completa en la que una oveja salta una valla de forma cíclica.
2. **TC:** Una demostración de miniaturización extrema de código donde una oveja gira sobre su centro en un archivo comprimido de menos de 512 bytes.
3. **TinyCodeExplicado:** La versión formateada, documentada y legible del shader *TC* para facilitar su comprensión y análisis.

## Características Principales

- **Buenas Noches:**
  - **Bucle Temporal y Movimiento Parabólico:** Control de la fase de salto (`jumpPhase`) mediante la parametrización del tiempo (`u_time`) y funciones trigonométricas ($\sin$) para modelar la trayectoria parabólica.
  - **Cinemática Traslacional en Patas:** Rotación dinámica de articulaciones mediante matrices 2D (`rotate2d`) adaptadas a la velocidad y estado del salto (impulso y aterrizaje).
  - **Composición por Capas y Profundidad:** Renderizado procedural en orden Z mediante mezcla de color (`mix`) y elipses suavizadas para diferenciar el fondo nocturno, el suelo, la valla trasera, la oveja y la valla frontal.

- **TC & Tiny Code:**
  - **Restricción de Tamaño (< 512 Bytes):** Reducción extrema del código GLSL eliminando espacios, unificando declaraciones de variables y acortando funciones complejas a fórmulas algebraicas compactas.
  - **Rotación Global del Espacio:** Transformación bidimensional de coordenadas usando una matriz de rotación accionada por `u_time`.
  - **Patas Vectorizadas:** Renderizado simultáneo de las cuatro patas mediante un vector `vec4` y la función `step` acoplada al cálculo geométrico directo.
  - **Versión Didáctica (`TinyCode`):** Código de la versión *TC* reestructurado con nombres descriptivos y comentarios exhaustivos sobre el pipeline numérico.

## Resultado final

Al hacer clic en las siguientes imágenes, se redirigirá a un vídeo demostrativo de la ejecución de los shaders.

[![Ver Demostración BuenasNoches](https://img.youtube.com/vi/rhQzaA1-iC0/maxresdefault.jpg)](https://youtu.be/rhQzaA1-iC0)

[![Ver Demostración TC](https://img.youtube.com/vi/VhVnBU-0UeM/maxresdefault.jpg)](https://youtu.be/VhVnBU-0UeM)

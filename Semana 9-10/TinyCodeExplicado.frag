precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    // Ángulo de rotación en función del tiempo
    float a = u_time * 2.;

    // Coordenadas normalizadas centradas en (0, 0), ajustadas al eje vertical
    vec2 p = mat2(cos(a), -sin(a), sin(a), cos(a)) * (gl_FragCoord.xy - u_resolution * .5) / u_resolution.y;

    // Coordenada vertical desplazada para el cálculo de las patas
    float y = p.y + .1;

    // Se recorta y se resta la parte clampada entre -.2 y 0. para declarar la longitud de las patas de la oveja
    y -= clamp(y, -.2, 0.);

    // Posiciones en X de las cuatro patas
    vec4 v = p.x - vec4(-.2, -.1, .1, .2);

    // Color oscuro para las patas y la cabeza
    vec3 k = vec3(.1),

        // Mezcla de las capas de color
        c = mix(
            mix(
                mix(
                    // Fondo de noche
                    vec3(.12, .16, .2),
                    
                    // Patas: suma de pasos circulares en las 4 posiciones de v
                    k,
                    min(dot(step(sqrt(v * v + y * y), vec4(.015)), vec4(1.)), 1.)
                ),
                
        		// Cuerpo de la oveja: elipse de color casi blanco
                vec3(.96, .94, .88),
                step(length(p / vec2(1.2, .85) - vec2(0., .035)), .21)
            ),
            
        	// Cabeza de la oveja: elipse desplazada hacia arriba y a la derecha
            k,
            step(length((p - vec2(.26, .1)) / vec2(1.1, .9)), .092)
        );

    // Color final del shader
    gl_FragColor = vec4(c, 1.);
}
#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform float u_time;

vec3 color;
vec2 st;
float time;
vec2 sheepOffset;
float jumpPhase; // 0.0 = inicio salto, 0.5 = punto más alto, 1.0 = final/aterrizaje

// Matriz de rotación 2D
mat2 rotate2d(float _angle) {
    return mat2(cos(_angle), -sin(_angle),
                sin(_angle),  cos(_angle));
}

// Dibuja una elipse con bordes suaves
float ellipse(vec2 p, vec2 center, vec2 radius) {
    float d = length((p - center) / radius);
    return 1.0 - smoothstep(0.95, 1.04, d);
}

// Dibuja una línea con extremos redondeados
float line(vec2 p, vec2 a, vec2 b, float width) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    float d = length(pa - ba * h);
    return 1.0 - smoothstep(width, width + 0.006, d);
}

// Rota el extremo (b) de una pata a partir de su articulación (a)
float legLine(vec2 p, vec2 a, vec2 b, float width, float angle) {
    vec2 rotB = a + rotate2d(angle) * (b - a);
    return line(p, a, rotB, width);
}

// Dibuja el suelo
void floor() {
    float floor = ellipse(st, vec2(0.01, -0.44), vec2(0.77, 0.35));
    color = mix(color, vec3(0.093,0.364,0.114), floor);
}

// Dibuja una valla
void back_fence() {
    float fence = 0.0;
    
    fence = max(fence, line(st, vec2( 0.20,-0.30), vec2(0.20, 0.00), 0.04));
    fence = max(fence, line(st, vec2(-0.2,-0.3), vec2(0.20,-0.05), 0.02));
    fence = max(fence, line(st, vec2(-0.2,-0.4), vec2(0.20,-0.15), 0.02));

    color = mix(color, vec3(0.45,0.26,0.13), fence);
}

void front_fence() {
    float fence = line(st, vec2(-0.20,-0.50), vec2(-0.20,-0.20), 0.04);
    
    color = mix(color, vec3(0.45,0.26,0.13), fence);
}

// Dibuja una oveja
void sheep() {
    // Coordenadas locales de la oveja
    st -= sheepOffset;
    
    // Colores
    vec3 wool = vec3(0.96, 0.94, 0.88);
    vec3 black = vec3(0.12, 0.10, 0.10);

    // 1. Cuerpo
    float body = 0.0;

    body = max(body, ellipse(st, vec2(-0.04, 0.00), vec2(0.27, 0.17)));
    body = max(body, ellipse(st, vec2(-0.25, 0.04), vec2(0.12, 0.13)));
    body = max(body, ellipse(st, vec2(-0.13, 0.16), vec2(0.13, 0.12)));
    body = max(body, ellipse(st, vec2( 0.02, 0.17), vec2(0.13, 0.12)));
    body = max(body, ellipse(st, vec2( 0.16, 0.09), vec2(0.13, 0.12)));
    body = max(body, ellipse(st, vec2( 0.17,-0.04), vec2(0.12, 0.12)));
    body = max(body, ellipse(st, vec2(-0.13,-0.12), vec2(0.13, 0.10)));

    color = mix(color, wool, body);

    // 2. Patas
    // Impulso al inicio
    float takeoff = 1.0 - smoothstep(0.15, 0.3, jumpPhase);
    // Aterrizaje
    float landing = smoothstep(0.65, 0.8, jumpPhase);

    // Giro de las patas
    float backLegAngle  = takeoff * 0.45 - landing * 0.25;
    float frontLegAngle = takeoff * 0.45 + landing * 0.25;

    float legs = 0.0;

    // Patas traseras
    legs = max(legs, legLine(st, vec2(-0.20,-0.09), vec2(-0.29,-0.31), 0.012, backLegAngle));
    legs = max(legs, legLine(st, vec2(-0.08,-0.12), vec2(-0.17,-0.31), 0.012, backLegAngle));
    legs = max(legs, legLine(st, vec2( 0.09,-0.11), vec2( 0.25,-0.31), 0.012, frontLegAngle));
    legs = max(legs, legLine(st, vec2( 0.18,-0.06), vec2( 0.35,-0.25), 0.012, frontLegAngle));

    color = mix(color, black, legs);

    // 3. Cabeza
    float head = 0.0;

    head = max(head, ellipse(st, vec2(0.29, 0.09), vec2(0.10, 0.14)));
    head = max(head, ellipse(st, vec2(0.35, 0.04), vec2(0.085, 0.075)));

    color = mix(color, black, head);

    // 4. Ojo
    float eyeWhite = ellipse(st, vec2(0.31, 0.14), vec2(0.018, 0.025));
    float pupil = ellipse(st, vec2(0.315, 0.14), vec2(0.009, 0.015));

    color = mix(color, vec3(1.0), eyeWhite);
    color = mix(color, black, pupil);
    
    // 5. Oreja
    float hair = 0.0;
    hair = max(hair, ellipse(st, vec2(0.28, 0.22), vec2(0.07, 0.04)));
    hair = max(hair, ellipse(st, vec2(0.22, 0.17), vec2(0.06, 0.07)));
    float ear = line(st, vec2( 0.23, 0.19), vec2( 0.215, 0.145), 0.022);
    
    color = mix(color, wool, hair);
    color = mix(color, black, ear);
    
    // Restaurar coordenadas
    st += sheepOffset;
}

void main() {
    // Coordenadas centradas y normalizadas
    st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    
    time = u_time;

    // Movimiento de la oveja
    float cycle = mod(time * 0.35, 2.0);
    float x = cycle - 0.5;
    float y = 0.25 * sin(x * PI);

    // Normalizamos el tramo del salto
    jumpPhase = cycle / 2.0;

    sheepOffset = vec2(x - 0.6, y);
    
    // Fondo de noche
    color = vec3(0.123,0.164,0.205);

    // Suelo y media valla
    floor();
    back_fence();
    
    // Oveja
    sheep();
    
    // Valla de enfrente
    front_fence();    
    
    // Dibuja todo
    gl_FragColor = vec4(color, 1.0);
}
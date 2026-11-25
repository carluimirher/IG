import * as THREE from "three";
import Ammo from "ammojs-typed";
import { createFenceSegmentModel, createSheepModel } from "./models";

let camera, scene, renderer;
let listener, soundBuffer;
let textureLoader;
const clock = new THREE.Clock();

const ballMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 });

// Estado del jugador / cámara
const player = {
  y: 1.2,
  yaw: 0, // orientación horizontal (0 mira hacia +X, -PI/2 hacia -Z)
  pitch: 0, // mirar arriba / abajo
  radius: 0.45,
  moveSpeed: 6,
  turnSpeed: 2.0,
};
const keysPressed = {};
const obstacles = [];

// Mundo físico con Ammo
let physicsWorld;
const gravityConstant = 7.8;
let collisionConfiguration;
let dispatcher;
let broadphase;
let solver;
const margin = 0.05;

// Objetos rígidos
const rigidBodies = [];

const pos = new THREE.Vector3();
const quat = new THREE.Quaternion();
//Variables temporales para actualizar transformación en el bucle
let transformAux1;
let tempBtVec3_1;

//Inicialización ammo
Ammo(Ammo).then(start);

function start() {
  //Elementos gráficos
  initGraphics();
  //Elementos del mundo físico
  initPhysics();
  //Objetos
  createObjects();
  //Eventos
  initInput();

  animationLoop();
}

function initGraphics() {
  //Cámara, escena y renderer
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.2,
    2000
  );
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbfd1e5);
  camera.position.set(-14, player.y, 16);
  updateCameraLook();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  textureLoader = new THREE.TextureLoader();

  //Luces
  const ambientLight = new THREE.AmbientLight(0x707070);
  scene.add(ambientLight);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(-10, 18, 5);
  light.castShadow = true;
  const d = 14;
  light.shadow.camera.left = -d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = -d;

  light.shadow.camera.near = 2;
  light.shadow.camera.far = 50;

  light.shadow.mapSize.x = 1024;
  light.shadow.mapSize.y = 1024;

  scene.add(light);
  //Redimensión de la ventana
  window.addEventListener("resize", onWindowResize);

  // Audio
  listener = new THREE.AudioListener();
  camera.add(listener);
  // Carga de sonido
  const audioLoader = new THREE.AudioLoader();
  // Fuente: https://pixabay.com/es/sound-effects/pel%C3%ADculas-y-efectos-especiales-usas-12-sound-effect-353937/
  audioLoader.load("src/shoot.mp3", function (buffer) {
    soundBuffer = buffer;
  });
}

function updateCameraLook() {
  // Limita pitch para no dar la vuelta completa
  const maxPitch = Math.PI * 0.45;
  player.pitch = Math.max(-maxPitch, Math.min(maxPitch, player.pitch));

  const dirX = Math.cos(player.pitch) * Math.cos(player.yaw);
  const dirY = Math.sin(player.pitch);
  const dirZ = Math.cos(player.pitch) * Math.sin(player.yaw);

  camera.lookAt(
    camera.position.x + dirX,
    camera.position.y + dirY,
    camera.position.z + dirZ
  );
}

function playSound() {
  if (!soundBuffer) return;
  const sound = new THREE.Audio(listener);
  sound.setBuffer(soundBuffer);
  sound.setLoop(false);
  sound.setVolume(0.5);
  sound.play();
}

function initPhysics() {
  // Configuración Ammo
  // Colisiones
  collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  // Gestor de colisiones convexas y cóncavas
  dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  // Colisión fase amplia
  broadphase = new Ammo.btDbvtBroadphase();
  // Resuelve resricciones de reglas físicas como fuerzas, gravedad, etc.
  solver = new Ammo.btSequentialImpulseConstraintSolver();
  // Crea en mundo físico
  physicsWorld = new Ammo.btDiscreteDynamicsWorld(
    dispatcher,
    broadphase,
    solver,
    collisionConfiguration
  );
  // Establece gravedad
  physicsWorld.setGravity(new Ammo.btVector3(0, -gravityConstant, 0));

  transformAux1 = new Ammo.btTransform();
  tempBtVec3_1 = new Ammo.btVector3(0, 0, 0);
}

function createObjects() {
  // Suelo
  pos.set(0, -0.5, 0);
  quat.set(0, 0, 0, 1);
  const suelo = createBoxWithPhysics(
    100,
    1,
    100,
    0,
    pos,
    quat,
    false,
    new THREE.MeshPhongMaterial({ color: 0x20982d })
  );
  suelo.receiveShadow = true;
  textureLoader.load(
    "https://cdn.glitch.global/8b114fdc-500a-4e05-b3c5-a4afa5246b07/grid.png?v=1669716810074",
    function (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(40, 40);
      suelo.material.map = texture;
      suelo.material.needsUpdate = true;
    }
  );

  // Valla
  fence();

  // Ovejas
  sheeps();
}

function fence() {
  const halfSize = 25;
  const segmentLength = 2;
  const count = (halfSize * 2) / segmentLength;
  const fenceHeight = 1.2;
  const fenceDepth = 0.2;
  const y = fenceHeight * 0.5;

  for (let i = 0; i < count; i++) {
    const offset = -halfSize + segmentLength * 0.4 + i * segmentLength;

    // Lado norte
    quat.set(0, 0, 0, 1);
    pos.set(offset, y, -halfSize);
    createBoxWithPhysics(
      segmentLength,
      fenceHeight,
      fenceDepth,
      0,
      pos,
      quat,
      "fence"
    );

    // Lado sur
    quat.set(0, 1, 0, 0);
    pos.set(-offset, y, halfSize);
    createBoxWithPhysics(
      segmentLength,
      fenceHeight,
      fenceDepth,
      0,
      pos,
      quat,
      "fence"
    );

    // Lado oeste
    quat.set(0, 0.705, 0, 0.705);
    pos.set(-halfSize, y, -offset);
    createBoxWithPhysics(
      segmentLength,
      fenceHeight,
      fenceDepth,
      0,
      pos,
      quat,
      "fence"
    );

    // Lado este
    quat.set(0, -0.705, 0, 0.705);
    pos.set(halfSize, y, offset);
    createBoxWithPhysics(
      segmentLength,
      fenceHeight,
      fenceDepth,
      0,
      pos,
      quat,
      "fence"
    );
  }
}

function sheeps() {
  const sheepMass = 5;
  const sheepLength = 1.2;
  const sheepDepth = 0.6;
  const sheepHeight = sheepLength * 0.5;

  const numSheepsBase = 6;
  const space = 0.12;
  const stepX = sheepDepth + space;

  quat.set(0, 0, 0, 1);

  // 1. Pirámide
  for (let j = 0; j < numSheepsBase; j++) {
    const nRow = numSheepsBase - j;
    const x0 = -((nRow - 1) * stepX) * 0.5;
    const y = sheepHeight * 0.5 + j * sheepHeight;

    for (let i = 0; i < nRow; i++) {
      pos.set(x0 + i * stepX, y, 0);

      createBoxWithPhysics(
        sheepDepth,
        sheepHeight,
        sheepLength,
        sheepMass,
        pos,
        quat,
        "sheep"
      );
    }
  }

  const sheepY = sheepHeight * 0.5;

  // 2. 5 ovejas "devil"
  const devilCenterX = -10;
  const devilCenterZ = -10;
  const devilRadius = 2.2;
  const forward = new THREE.Vector3(0, 0, 1);

  for (let i = 0; i < 5; i++) {
    const theta = (i / 5) * Math.PI * 2;
    const x = devilCenterX + Math.cos(theta) * devilRadius;
    const z = devilCenterZ + Math.sin(theta) * devilRadius;

    // Vector desde la oveja hacia el centro del pentágono
    const toCenter = new THREE.Vector3(devilCenterX - x, 0, devilCenterZ - z).normalize();
    quat.setFromUnitVectors(forward, toCenter);
    pos.set(x, sheepY, z);

    createBoxWithPhysics(
      sheepDepth,
      sheepHeight,
      sheepLength,
      sheepMass,
      pos,
      quat,
      "sheep",
      null,
      { devil: true }
    );
  }

  // 3. Oveja "alone"
  quat.set(0, 0.5, 0, -1);
  pos.set(19, sheepY, -19);

  createBoxWithPhysics(
    sheepDepth,
    sheepHeight,
    sheepLength,
    sheepMass,
    pos,
    quat,
    "sheep",
    null,
    { alone: true }
  );

  // 4. Resto de ovejas
  const scatteredCoords = [
    [-14, 12, 0.4],
    [-6, 14, -0.8],
    [8, 11, 1.2],
    [14, 6, -1.5],
    [10, -8, 2.1],
    [-2, -15, 0.9],
    [-18, 2, -0.3],
    [4, 18, 1.7],
    [-20, -16, 1.1],
    [-18, 19, -2.1],
    [12, 18, 0.6],
    [20, 14, -1.2],
    [18, -2, 2.5],
    [6, -19, -0.5],
    [-11, -20, 1.4],
    [-21, -7, -1.9],
    [-8, 6, 0.2],
    [7, 4, -2.4],
    [-14, 0, 1.8],
    [15, 14, -0.7],
  ];

  for (const [sx, sz, yaw] of scatteredCoords) {
    quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    pos.set(sx, sheepY, sz);

    createBoxWithPhysics(
      sheepDepth,
      sheepHeight,
      sheepLength,
      sheepMass,
      pos,
      quat,
      "sheep"
    );
  }
}

function createBoxWithPhysics(sx, sy, sz, mass, pos, quat, type, material, options = {}) {
  let object;
  if (type === "sheep") {
    object = createSheepModel(options.devil, options.alone);
  } else if (type === "fence") {
    object = createFenceSegmentModel(sx, sy, sz);
  } else {
    object = new THREE.Mesh(
      new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1),
      material
    );
  }

  //Estructura geométrica de colisión
  //Crea caja orientada en el espacio, especificando dimensiones
  const shape = new Ammo.btBoxShape(
    new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5)
  );
  //Margen para colisiones
  shape.setMargin(margin);

  createRigidBody(object, shape, mass, pos, quat);

  // Registrar obstáculos (vallas y ovejas) para la colisión del jugador
  if (type === "fence" || type === "sheep") {
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    box.getSize(size);

    obstacles.push({
      x: pos.x,
      z: pos.z,
      halfX: size.x * 0.5,
      halfZ: size.z * 0.5,
      quat: quat.clone(),
      object,
      dynamic: type === "sheep" && mass > 0,
    });
  }

  return object;
}

//Creación de cuerpo rígido, con masa, sujeto a fuerzas, colisiones...
function createRigidBody(object, physicsShape, mass, pos, quat, vel, angVel) {
  //Posición
  if (pos) {
    object.position.copy(pos);
  } else {
    pos = object.position;
  }
  //Cuaternión, es decir orientación
  if (quat) {
    object.quaternion.copy(quat);
  } else {
    quat = object.quaternion;
  }
  //Matriz de transformación
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
  const motionState = new Ammo.btDefaultMotionState(transform);
  //Inercia inicial y parámetros de rozamiento, velocidad
  const localInertia = new Ammo.btVector3(0, 0, 0);
  physicsShape.calculateLocalInertia(mass, localInertia);
  //Crea el cuerpo
  const rbInfo = new Ammo.btRigidBodyConstructionInfo(
    mass,
    motionState,
    physicsShape,
    localInertia
  );
  const body = new Ammo.btRigidBody(rbInfo);

  body.setFriction(0.5);

  if (vel) {
    body.setLinearVelocity(new Ammo.btVector3(vel.x, vel.y, vel.z));
  }

  if (angVel) {
    body.setAngularVelocity(new Ammo.btVector3(angVel.x, angVel.y, angVel.z));
  }

  //Enlaza primitiva gráfica con física
  object.userData.physicsBody = body;
  object.userData.collided = false;

  scene.add(object);
  //Si tiene masa
  if (mass > 0) {
    rigidBodies.push(object);
    // Disable deactivation
    body.setActivationState(4);
  }
  //Añadido al universo físico
  physicsWorld.addRigidBody(body);

  return body;
}

function shootBall() {
  playSound();

  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);

  const ballMass = 10;
  const ballRadius = 0.1;
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(ballRadius, 14, 10),
    ballMaterial
  );
  ball.castShadow = true;
  ball.receiveShadow = true;

  const ballShape = new Ammo.btSphereShape(ballRadius);
  ballShape.setMargin(margin);

  pos.copy(camera.position).addScaledVector(dir, 0.5);
  quat.set(0, 0, 0, 1);
  const ballBody = createRigidBody(ball, ballShape, ballMass, pos, quat);

  pos.copy(dir).multiplyScalar(24);
  ballBody.setLinearVelocity(new Ammo.btVector3(pos.x, pos.y, pos.z));
}

function checkPlayerCollision(nextX, nextZ) {
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    const cx = obs.dynamic ? obs.object.position.x : obs.x;
    const cz = obs.dynamic ? obs.object.position.z : obs.z;

    const minX = cx - obs.halfX;
    const maxX = cx + obs.halfX;
    const minZ = cz - obs.halfZ;
    const maxZ = cz + obs.halfZ;

    const closestX = Math.max(minX, Math.min(nextX, maxX));
    const closestZ = Math.max(minZ, Math.min(nextZ, maxZ));

    const dx = nextX - closestX;
    const dz = nextZ - closestZ;

    if (dx * dx + dz * dz < player.radius * player.radius) {
      return true;
    }
  }
  return false;
}

function updatePlayer(deltaTime) {
  // Rotación con flechas izquierda / derecha y mirar arriba / abajo
  if (keysPressed["ArrowLeft"]) player.yaw -= player.turnSpeed * deltaTime;
  if (keysPressed["ArrowRight"]) player.yaw += player.turnSpeed * deltaTime;
  if (keysPressed["ArrowUp"]) player.pitch += player.turnSpeed * deltaTime;
  if (keysPressed["ArrowDown"]) player.pitch -= player.turnSpeed * deltaTime;

  // Vectores horizontales forward y right según yaw
  const forwardX = Math.cos(player.yaw);
  const forwardZ = Math.sin(player.yaw);
  const rightX = -forwardZ;
  const rightZ = forwardX;

  let moveForward = 0;
  let moveRight = 0;
  if (keysPressed["KeyW"]) moveForward += 1;
  if (keysPressed["KeyS"]) moveForward -= 1;
  if (keysPressed["KeyD"]) moveRight += 1;
  if (keysPressed["KeyA"]) moveRight -= 1;

  let vx = forwardX * moveForward + rightX * moveRight;
  let vz = forwardZ * moveForward + rightZ * moveRight;
  const len = Math.hypot(vx, vz);
  if (len > 0) {
    vx = (vx / len) * player.moveSpeed * deltaTime;
    vz = (vz / len) * player.moveSpeed * deltaTime;

    const nextX = camera.position.x + vx;
    const nextZ = camera.position.z + vz;

    // Deslizamiento en ejes X / Z
    if (!checkPlayerCollision(nextX, nextZ)) {
      camera.position.x = nextX;
      camera.position.z = nextZ;
    } else if (!checkPlayerCollision(nextX, camera.position.z)) {
      camera.position.x = nextX;
    } else if (!checkPlayerCollision(camera.position.x, nextZ)) {
      camera.position.z = nextZ;
    }
  }

  updateCameraLook();
}

// Eventos de teclado
function initInput() {
  window.addEventListener("keydown", function (event) {
    keysPressed[event.code] = true;

    if (event.code === "Space") {
      event.preventDefault();
      shootBall();
    }
  });

  window.addEventListener("keyup", function (event) {
    keysPressed[event.code] = false;
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animationLoop() {
  requestAnimationFrame(animationLoop);

  const deltaTime = clock.getDelta();
  updatePlayer(deltaTime);
  updatePhysics(deltaTime);

  renderer.render(scene, camera);
}

function updatePhysics(deltaTime) {
  // Avanza la simulación en función del tiempo
  physicsWorld.stepSimulation(deltaTime, 10);

  // Actualiza cuerpos rígidos
  for (let i = 0, il = rigidBodies.length; i < il; i++) {
    const objThree = rigidBodies[i];
    const objPhys = objThree.userData.physicsBody;
    //Obtiene posición y rotación
    const ms = objPhys.getMotionState();
    //Actualiza la correspondiente primitiva gráfica asociada
    if (ms) {
      ms.getWorldTransform(transformAux1);
      const p = transformAux1.getOrigin();
      const q = transformAux1.getRotation();
      objThree.position.set(p.x(), p.y(), p.z());
      objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());

      objThree.userData.collided = false;
    }
  }
}
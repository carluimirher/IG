import * as THREE from "three";

// Función auxiliar para crear bloques
function addPart(width, height, depth, material, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createSheepModel(devil = false, alone = false) {
  const sheep = new THREE.Group();
  const sx = 0.6;
  const sy = 0.6;
  const sz = 1.2;

  // Materiales
  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0x242424 });
  let bodyMaterial;
  if (devil) {
    bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x880000 });
  }
  else if (alone) {
    bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x101010 });
  }
  else {
    bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
  }

  // Dimensiones base ajustadas a (sx, sy, sz)
  const bodyWidth = sx;
  const bodyHeight = sy * 0.65;
  const bodyDepth = sz * 0.8;

  const headWidth = sx * 0.5;
  const headHeight = sy * 0.35;
  const headDepth = sz * 0.2;

  const legWidth = sx * 0.2;
  const legHeight = sy * 0.35;
  const legDepth = sz * 0.1;

  const legY = -sy * 0.5 + legHeight * 0.5;
  const bodyY = -sy * 0.5 + legHeight + bodyHeight * 0.5;
  const headY = bodyY + bodyHeight * 0.2;

  const bodyZ = -sz * 0.5 + bodyDepth * 0.5;
  const headZ = sz * 0.5 - headDepth * 0.5;

  // Cuerpo
  sheep.add(addPart(bodyWidth, bodyHeight, bodyDepth, bodyMaterial, 0, bodyY, bodyZ));

  // Cabeza
  sheep.add(addPart(headWidth, headHeight, headDepth, skinMaterial, 0, headY, headZ));

  if (devil) {
      // Cuernos
      sheep.add(addPart(sx * 0.1, sy * 0.2, sz * 0.05, bodyMaterial, headWidth * 0.25, sy * 0.5, headZ))
      sheep.add(addPart(sx * 0.1, sy * 0.2, sz * 0.05, bodyMaterial,-headWidth * 0.25, sy * 0.5, headZ))
  }

  // Orejas
  const earWidth = sx * 0.1;
  const earHeight = sy * 0.12;
  const earDepth = sz * 0.1;
  const earX = headWidth * 0.5 + earWidth * 0.5;

  sheep.add(addPart(
    earWidth,
    earHeight,
    earDepth,
    skinMaterial,
    -earX,
    headY + headHeight * 0.15,
    headZ
  ));

  sheep.add(addPart(
    earWidth,
    earHeight,
    earDepth,
    skinMaterial,
    earX,
    headY + headHeight * 0.15,
    headZ
  ));

  // Patas
  const legX = bodyWidth * 0.28;
  const legZ = bodyDepth * 0.32;
  const legZFront = bodyZ + legZ;
  const legZBack = bodyZ - legZ;

  sheep.add(addPart(legWidth, legHeight, legDepth, skinMaterial, -legX, legY, legZFront));
  sheep.add(addPart(legWidth, legHeight, legDepth, skinMaterial, legX, legY, legZFront));
  sheep.add(addPart(legWidth, legHeight, legDepth, skinMaterial, -legX, legY, legZBack));
  sheep.add(addPart(legWidth, legHeight, legDepth, skinMaterial, legX, legY, legZBack));

  return sheep;
}

export function createFenceSegmentModel(sx, sy, sz) {
  const segment = new THREE.Group();
  const fenceMaterial = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });

  const postWidth = sx * 0.14;
  const postHeight = sy;
  const postDepth = sz;
  const railLength = sx;
  const railHeight = sy * 0.14;
  const railDepth = sz * 0.6;
  const railCenterX = postWidth * 0.5 + railLength * 0.5 - sx * 0.5;

  // Poste vertical
  segment.add(
    addPart(postWidth, postHeight, postDepth, fenceMaterial, -sx * 0.5 + postWidth * 0.5, 0, 0)
  );

  // Postes horizontales
  segment.add(
    addPart(railLength, railHeight, railDepth, fenceMaterial, railCenterX, sy * 0.25, 0)
  );
  segment.add(
    addPart(railLength, railHeight, railDepth, fenceMaterial, railCenterX, -sy * 0.15, 0)
  );

  return segment;
}
import * as THREE from 'three';
import type { CustomerPersonality, StandId } from './types';

export interface CustomerRig {
  group: THREE.Group;
  headGroup: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  bagGroup: THREE.Group;
  hitbox: THREE.Mesh;
}

export interface CashRegisterRig {
  group: THREE.Group;
  drawer: THREE.Mesh;
  hitbox: THREE.Mesh;
}

export interface ChairRig {
  group: THREE.Group;
  hitbox: THREE.Mesh;
}

export interface DeliveryBoxRig {
  group: THREE.Group;
  hitbox: THREE.Mesh;
}

export interface TeaStationRig {
  group: THREE.Group;
  teaLiquid: THREE.Mesh;
  hitbox: THREE.Mesh;
}

export interface LedgerBookRig {
  group: THREE.Group;
  hitbox: THREE.Mesh;
}

export interface ApprenticeRig {
  group: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  hitbox: THREE.Mesh;
}

export interface StreetStallRig {
  group: THREE.Group;
  displaySlot: THREE.Group;
  hitbox: THREE.Mesh;
}

export interface DepotRackRig {
  group: THREE.Group;
  crateMeshes: THREE.Mesh[];
  hitbox: THREE.Mesh;
}

export interface WorkbenchRig {
  group: THREE.Group;
  hitbox: THREE.Mesh;
}

export interface RadioRig {
  group: THREE.Group;
  dialMat: THREE.MeshStandardMaterial;
  hitbox: THREE.Mesh;
}

export interface ClockRig {
  group: THREE.Group;
  hourPivot: THREE.Group;
  minutePivot: THREE.Group;
}

export interface BoardRig {
  group: THREE.Group;
  hitbox: THREE.Mesh;
}

function addPart(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/**
 * 15 distinct 3D silhouettes (5 categories x 3 tiers)
 */
export function createProductModel(
  catIndex: number,
  tier: number,
  hue: number,
): THREE.Group {
  const group = new THREE.Group();

  // Category 0: Vida & Cıvata
  if (catIndex === 0) {
    if (tier === 1) {
      // Vida kutusu: cardboard box + label + trim + brass screw
      const boxMat = new THREE.MeshStandardMaterial({ color: 0xb98d56, roughness: 0.88 });
      const labelMat = new THREE.MeshStandardMaterial({ color: 0xf4ead2, roughness: 0.65 });
      const trimMat = new THREE.MeshStandardMaterial({ color: 0x8a3a28, roughness: 0.5 });
      addPart(group, new THREE.BoxGeometry(0.28, 0.16, 0.2), boxMat, 0, 0.08, 0);
      addPart(group, new THREE.BoxGeometry(0.29, 0.024, 0.21), trimMat, 0, 0.16, 0);
      addPart(group, new THREE.BoxGeometry(0.012, 0.095, 0.13), labelMat, 0.144, 0.085, 0);
      const screw = addPart(
        group,
        new THREE.CylinderGeometry(0.014, 0.014, 0.025, 10),
        new THREE.MeshStandardMaterial({ color: 0xd0a84c, metalness: 0.85, roughness: 0.25 }),
        0.148,
        0.085,
        0.035,
      );
      screw.rotation.z = Math.PI / 2;
    } else if (tier === 2) {
      // Cıvata-somun seti: metal organizer tray with compartments & hex nuts
      const trayMat = new THREE.MeshStandardMaterial({ color: 0x3b4d5e, metalness: 0.55, roughness: 0.42 });
      const lidMat = new THREE.MeshStandardMaterial({
        color: 0xd8e6ee,
        transparent: true,
        opacity: 0.45,
        roughness: 0.15,
      });
      const boltMat = new THREE.MeshStandardMaterial({ color: 0xb4b8bd, metalness: 0.9, roughness: 0.22 });
      addPart(group, new THREE.BoxGeometry(0.32, 0.06, 0.24), trayMat, 0, 0.03, 0);
      for (let i = -1; i <= 1; i++) {
        addPart(group, new THREE.CylinderGeometry(0.022, 0.022, 0.03, 6), boltMat, i * 0.08, 0.072, -0.04);
        addPart(group, new THREE.CylinderGeometry(0.014, 0.014, 0.06, 8), boltMat, i * 0.08, 0.07, 0.05).rotation.x = Math.PI / 2;
      }
      addPart(group, new THREE.BoxGeometry(0.31, 0.012, 0.23), lidMat, 0, 0.095, 0);
    } else {
      // Dübel seti: hanging blister card with ribbed anchors + screws
      const cardMat = new THREE.MeshStandardMaterial({ color: 0x2f5f8f, roughness: 0.6 });
      const plugMat = new THREE.MeshStandardMaterial({ color: 0xd96028, roughness: 0.5 });
      const steelMat = new THREE.MeshStandardMaterial({ color: 0xc2c6ca, metalness: 0.88, roughness: 0.2 });
      addPart(group, new THREE.BoxGeometry(0.03, 0.24, 0.22), cardMat, -0.02, 0.12, 0);
      for (let i = 0; i < 4; i++) {
        addPart(group, new THREE.CylinderGeometry(0.014, 0.01, 0.11, 8), plugMat, 0.01, 0.11, -0.075 + i * 0.05);
        addPart(group, new THREE.CylinderGeometry(0.008, 0.005, 0.09, 8), steelMat, 0.03, 0.11, -0.075 + i * 0.05);
      }
    }
    return group;
  }

  // Category 1: El Aleti
  if (catIndex === 1) {
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xa4a8ad, metalness: 0.88, roughness: 0.25 });
    if (tier === 1) {
      // Çekiç
      const woodHandle = new THREE.MeshStandardMaterial({ color: 0x8f5b32, roughness: 0.78 });
      const gripMat = new THREE.MeshStandardMaterial({ color: 0xb93728, roughness: 0.65 });
      addPart(group, new THREE.BoxGeometry(0.24, 0.034, 0.036), woodHandle, 0.02, 0.04, 0);
      addPart(group, new THREE.BoxGeometry(0.11, 0.042, 0.044), gripMat, 0.14, 0.04, 0);
      addPart(group, new THREE.BoxGeometry(0.06, 0.055, 0.11), steelMat, -0.1, 0.05, 0);
      addPart(group, new THREE.BoxGeometry(0.05, 0.045, 0.05), steelMat, -0.1, 0.05, -0.07);
    } else if (tier === 2) {
      // Pense (dual handles + jaws + pivot)
      const blueGrip = new THREE.MeshStandardMaterial({ color: 0x2665a0, roughness: 0.68 });
      const h1 = addPart(group, new THREE.BoxGeometry(0.18, 0.022, 0.026), blueGrip, 0.07, 0.025, 0.035);
      h1.rotation.y = -0.18;
      const h2 = addPart(group, new THREE.BoxGeometry(0.18, 0.022, 0.026), blueGrip, 0.07, 0.025, -0.035);
      h2.rotation.y = 0.18;
      addPart(group, new THREE.CylinderGeometry(0.028, 0.028, 0.028, 12), steelMat, -0.03, 0.026, 0);
      addPart(group, new THREE.BoxGeometry(0.1, 0.02, 0.022), steelMat, -0.09, 0.026, 0.012);
      addPart(group, new THREE.BoxGeometry(0.1, 0.02, 0.022), steelMat, -0.09, 0.026, -0.012);
    } else {
      // Tornavida seti (rack of 3 drivers)
      const rackMat = new THREE.MeshStandardMaterial({ color: 0x282828, roughness: 0.65 });
      const handleColors = [0xd99b26, 0xc0392b, 0x2d7fb8];
      addPart(group, new THREE.BoxGeometry(0.06, 0.04, 0.24), rackMat, 0, 0.02, 0);
      for (let i = 0; i < 3; i++) {
        const zOff = -0.075 + i * 0.075;
        const hMat = new THREE.MeshStandardMaterial({ color: handleColors[i], roughness: 0.55 });
        addPart(group, new THREE.CylinderGeometry(0.018, 0.015, 0.1, 10), hMat, 0, 0.08, zOff);
        addPart(group, new THREE.CylinderGeometry(0.005, 0.005, 0.11, 8), steelMat, 0, 0.18, zOff);
      }
    }
    return group;
  }

  // Category 2: Elektrik
  if (catIndex === 2) {
    if (tier === 1) {
      // Ampul
      const brass = new THREE.MeshStandardMaterial({ color: 0xb8a369, metalness: 0.85, roughness: 0.26 });
      const ceramic = new THREE.MeshStandardMaterial({ color: 0xebe6da, roughness: 0.45 });
      const glass = new THREE.MeshStandardMaterial({
        color: 0xfff3c4,
        emissive: 0x624a12,
        emissiveIntensity: 0.6,
        roughness: 0.18,
      });
      addPart(group, new THREE.CylinderGeometry(0.04, 0.034, 0.065, 14), brass, 0, 0.032, 0);
      addPart(group, new THREE.CylinderGeometry(0.05, 0.044, 0.035, 14), ceramic, 0, 0.082, 0);
      addPart(group, new THREE.SphereGeometry(0.088, 16, 14), glass, 0, 0.18, 0);
    } else if (tier === 2) {
      // Duvar Prizi
      const whitePlastic = new THREE.MeshStandardMaterial({ color: 0xf0ece0, roughness: 0.35 });
      const recessMat = new THREE.MeshStandardMaterial({ color: 0xd8d2c2, roughness: 0.55 });
      const darkPin = new THREE.MeshStandardMaterial({ color: 0x24201c, roughness: 0.8 });
      const brassClip = new THREE.MeshStandardMaterial({ color: 0xc9a34c, metalness: 0.85, roughness: 0.25 });
      addPart(group, new THREE.BoxGeometry(0.06, 0.2, 0.2), whitePlastic, 0, 0.1, 0);
      addPart(group, new THREE.CylinderGeometry(0.065, 0.065, 0.025, 16), recessMat, 0.025, 0.1, 0).rotation.z = Math.PI / 2;
      addPart(group, new THREE.CylinderGeometry(0.011, 0.011, 0.02, 8), darkPin, 0.034, 0.1, -0.025).rotation.z = Math.PI / 2;
      addPart(group, new THREE.CylinderGeometry(0.011, 0.011, 0.02, 8), darkPin, 0.034, 0.1, 0.025).rotation.z = Math.PI / 2;
      addPart(group, new THREE.BoxGeometry(0.02, 0.02, 0.012), brassClip, 0.036, 0.145, 0);
    } else {
      // Uzatma kablosu (3-outlet strip + red switch + coiled cord)
      const stripMat = new THREE.MeshStandardMaterial({ color: 0xece8dd, roughness: 0.4 });
      const cordMat = new THREE.MeshStandardMaterial({ color: 0x232427, roughness: 0.82 });
      const switchMat = new THREE.MeshStandardMaterial({ color: 0xc93b2b, emissive: 0x450d08, roughness: 0.35 });
      addPart(group, new THREE.BoxGeometry(0.11, 0.045, 0.28), stripMat, -0.04, 0.022, 0);
      addPart(group, new THREE.BoxGeometry(0.035, 0.02, 0.045), switchMat, -0.04, 0.048, -0.095);
      for (let i = 0; i < 3; i++) {
        addPart(group, new THREE.CylinderGeometry(0.028, 0.028, 0.012, 12), cordMat, -0.04, 0.045, -0.02 + i * 0.055);
      }
      const coil = addPart(group, new THREE.TorusGeometry(0.075, 0.018, 8, 18), cordMat, 0.075, 0.025, 0);
      coil.rotation.x = Math.PI / 2;
    }
    return group;
  }

  // Category 3: Boya
  if (catIndex === 3) {
    if (tier === 1) {
      // İç cephe boyası (teneke kova)
      const tinMat = new THREE.MeshStandardMaterial({ color: 0xd6d7d4, metalness: 0.72, roughness: 0.34 });
      const bandMat = new THREE.MeshStandardMaterial({ color: hue, roughness: 0.55 });
      const lidMat = new THREE.MeshStandardMaterial({ color: 0x909294, metalness: 0.8, roughness: 0.28 });
      addPart(group, new THREE.CylinderGeometry(0.125, 0.115, 0.25, 18), tinMat, 0, 0.125, 0);
      addPart(group, new THREE.CylinderGeometry(0.129, 0.127, 0.075, 18), bandMat, 0, 0.16, 0);
      addPart(group, new THREE.CylinderGeometry(0.132, 0.132, 0.02, 18), lidMat, 0, 0.258, 0);
      addPart(group, new THREE.BoxGeometry(0.26, 0.012, 0.014), lidMat, 0, 0.22, 0);
    } else if (tier === 2) {
      // Silikon ve tutkal (cartridge + glue bottle)
      const tubeMat = new THREE.MeshStandardMaterial({ color: 0xf1ece0, roughness: 0.45 });
      const labelMat = new THREE.MeshStandardMaterial({ color: 0x2c6ca3, roughness: 0.55 });
      const nozzleMat = new THREE.MeshStandardMaterial({ color: 0xdad5c8, roughness: 0.4 });
      const glueMat = new THREE.MeshStandardMaterial({ color: 0xe6af32, roughness: 0.48 });
      addPart(group, new THREE.CylinderGeometry(0.036, 0.036, 0.18, 12), tubeMat, 0, 0.09, -0.05);
      addPart(group, new THREE.CylinderGeometry(0.037, 0.037, 0.09, 12), labelMat, 0, 0.095, -0.05);
      addPart(group, new THREE.ConeGeometry(0.018, 0.085, 10), nozzleMat, 0, 0.22, -0.05);
      addPart(group, new THREE.BoxGeometry(0.075, 0.12, 0.055), glueMat, 0.03, 0.06, 0.06);
      addPart(group, new THREE.CylinderGeometry(0.015, 0.02, 0.035, 10), new THREE.MeshStandardMaterial({ color: 0xb93828 }), 0.03, 0.135, 0.06);
    } else {
      // Fırça ve rulo seti
      const fuzzyMat = new THREE.MeshStandardMaterial({ color: 0xf4ebd0, roughness: 0.96 });
      const redHandle = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.55 });
      const steelRod = new THREE.MeshStandardMaterial({ color: 0xa6aaae, metalness: 0.85, roughness: 0.25 });
      const bristleMat = new THREE.MeshStandardMaterial({ color: 0x6b4f32, roughness: 0.92 });
      const roller = addPart(group, new THREE.CylinderGeometry(0.042, 0.042, 0.2, 14), fuzzyMat, -0.03, 0.18, 0);
      roller.rotation.x = Math.PI / 2;
      addPart(group, new THREE.BoxGeometry(0.014, 0.12, 0.014), steelRod, -0.03, 0.11, 0);
      addPart(group, new THREE.CylinderGeometry(0.018, 0.016, 0.1, 10), redHandle, -0.03, 0.05, 0);
      addPart(group, new THREE.BoxGeometry(0.025, 0.08, 0.09), bristleMat, 0.06, 0.17, 0.02);
      addPart(group, new THREE.BoxGeometry(0.028, 0.035, 0.094), steelRod, 0.06, 0.115, 0.02);
      addPart(group, new THREE.BoxGeometry(0.02, 0.1, 0.035), new THREE.MeshStandardMaterial({ color: 0x9c6c40 }), 0.06, 0.05, 0.02);
    }
    return group;
  }

  // Category 4: Su Tesisatı
  if (catIndex === 4) {
    if (tier === 1) {
      // Musluk contası: card + rubber washers
      const cardMat = new THREE.MeshStandardMaterial({ color: 0x8f3426, roughness: 0.65 });
      const rubberMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.85 });
      const brassRing = new THREE.MeshStandardMaterial({ color: 0xc59b43, metalness: 0.85, roughness: 0.28 });
      addPart(group, new THREE.BoxGeometry(0.025, 0.22, 0.22), cardMat, -0.02, 0.11, 0);
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
          const torus = addPart(
            group,
            new THREE.TorusGeometry(0.028, 0.009, 8, 14),
            r === 0 ? rubberMat : brassRing,
            0.004,
            0.07 + r * 0.08,
            -0.045 + c * 0.09,
          );
          torus.rotation.y = Math.PI / 2;
        }
      }
    } else if (tier === 2) {
      // Boru ve rakor
      const copperMat = new THREE.MeshStandardMaterial({ color: 0xb86d3e, metalness: 0.82, roughness: 0.28 });
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xc59b43, metalness: 0.88, roughness: 0.24 });
      const pipe = addPart(group, new THREE.CylinderGeometry(0.034, 0.034, 0.28, 12), copperMat, 0, 0.042, 0);
      pipe.rotation.z = Math.PI / 2;
      addPart(group, new THREE.CylinderGeometry(0.048, 0.048, 0.055, 6), brassMat, -0.12, 0.042, 0).rotation.z = Math.PI / 2;
      addPart(group, new THREE.CylinderGeometry(0.048, 0.048, 0.055, 6), brassMat, 0.12, 0.042, 0).rotation.z = Math.PI / 2;
      addPart(group, new THREE.CylinderGeometry(0.026, 0.026, 0.08, 10), copperMat, 0, 0.08, 0);
    } else {
      // Lavabo bataryası (chrome mixer faucet)
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd0d5d8, metalness: 0.92, roughness: 0.15 });
      addPart(group, new THREE.CylinderGeometry(0.045, 0.052, 0.03, 16), chromeMat, 0, 0.015, 0);
      addPart(group, new THREE.CylinderGeometry(0.032, 0.036, 0.14, 16), chromeMat, 0, 0.095, 0);
      const spout = addPart(group, new THREE.CylinderGeometry(0.016, 0.02, 0.16, 12), chromeMat, 0.055, 0.155, 0);
      spout.rotation.z = -Math.PI / 3;
      addPart(group, new THREE.BoxGeometry(0.09, 0.015, 0.024), chromeMat, -0.02, 0.18, 0);
    }
    return group;
  }

  // Category 5: Bahçe
  if (catIndex === 5) {
    if (tier === 1) {
      // Budama makası
      const greenGrip = new THREE.MeshStandardMaterial({ color: 0x3b8a42, roughness: 0.65 });
      const steelMat = new THREE.MeshStandardMaterial({ color: 0xc2c6ca, metalness: 0.88, roughness: 0.22 });
      const h1 = addPart(group, new THREE.BoxGeometry(0.16, 0.024, 0.028), greenGrip, 0.06, 0.03, 0.036);
      h1.rotation.y = -0.22;
      const h2 = addPart(group, new THREE.BoxGeometry(0.16, 0.024, 0.028), greenGrip, 0.06, 0.03, -0.036);
      h2.rotation.y = 0.22;
      addPart(group, new THREE.CylinderGeometry(0.024, 0.024, 0.026, 10), steelMat, -0.03, 0.03, 0);
      addPart(group, new THREE.BoxGeometry(0.11, 0.016, 0.042), steelMat, -0.09, 0.03, 0);
    } else if (tier === 2) {
      // Hortum başlığı
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd99b26, roughness: 0.45 });
      const gripMat = new THREE.MeshStandardMaterial({ color: 0x26292c, roughness: 0.85 });
      const brassTip = new THREE.MeshStandardMaterial({ color: 0xc9a34c, metalness: 0.85, roughness: 0.25 });
      addPart(group, new THREE.BoxGeometry(0.055, 0.14, 0.045), gripMat, 0.03, 0.075, 0);
      const barrel = addPart(group, new THREE.CylinderGeometry(0.032, 0.028, 0.16, 12), bodyMat, -0.02, 0.15, 0);
      barrel.rotation.z = Math.PI / 2;
      const nozzle = addPart(group, new THREE.CylinderGeometry(0.038, 0.026, 0.04, 12), brassTip, -0.11, 0.15, 0);
      nozzle.rotation.z = Math.PI / 2;
    } else {
      // Sulama bidonu
      const canMat = new THREE.MeshStandardMaterial({ color: 0x2f7d47, roughness: 0.52 });
      const spoutRose = new THREE.MeshStandardMaterial({ color: 0xe0b238, roughness: 0.4 });
      addPart(group, new THREE.CylinderGeometry(0.11, 0.12, 0.2, 14), canMat, 0, 0.1, 0);
      const spout = addPart(group, new THREE.CylinderGeometry(0.014, 0.024, 0.2, 10), canMat, 0.13, 0.14, 0);
      spout.rotation.z = -0.65;
      addPart(group, new THREE.CylinderGeometry(0.036, 0.018, 0.04, 12), spoutRose, 0.21, 0.22, 0);
      const handle = addPart(group, new THREE.TorusGeometry(0.09, 0.014, 8, 14, Math.PI), canMat, -0.04, 0.19, 0);
      handle.rotation.z = Math.PI / 4;
    }
    return group;
  }

  // Category 6: Kilit & Anahtar
  if (catIndex === 6) {
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd0a848, metalness: 0.86, roughness: 0.24 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xbac0c6, metalness: 0.9, roughness: 0.2 });
    if (tier === 1) {
      // Asma kilit
      addPart(group, new THREE.BoxGeometry(0.11, 0.13, 0.055), brassMat, 0, 0.075, 0);
      const shackle = addPart(group, new THREE.TorusGeometry(0.042, 0.011, 8, 16, Math.PI), steelMat, 0, 0.14, 0);
      shackle.rotation.y = Math.PI / 2;
      addPart(group, new THREE.BoxGeometry(0.018, 0.035, 0.015), new THREE.MeshStandardMaterial({ color: 0x22201c }), 0.052, 0.065, 0);
    } else if (tier === 2) {
      // Kapı bareli
      const cyl = addPart(group, new THREE.CylinderGeometry(0.028, 0.028, 0.22, 14), brassMat, 0, 0.07, 0);
      cyl.rotation.x = Math.PI / 2;
      addPart(group, new THREE.BoxGeometry(0.025, 0.06, 0.21), brassMat, 0, 0.045, 0);
      addPart(group, new THREE.CylinderGeometry(0.03, 0.03, 0.025, 12), new THREE.MeshStandardMaterial({ color: 0x222222 }), 0, 0.07, 0);
      addPart(group, new THREE.BoxGeometry(0.01, 0.04, 0.09), steelMat, 0, 0.07, 0.14);
    } else {
      // Çelik zincir kilit
      const sleeveMat = new THREE.MeshStandardMaterial({ color: 0x2d343d, roughness: 0.85 });
      for (let i = 0; i < 4; i++) {
        const ring = addPart(group, new THREE.TorusGeometry(0.055, 0.014, 8, 14), i % 2 === 0 ? sleeveMat : steelMat, -0.06 + i * 0.04, 0.03, 0);
        ring.rotation.x = Math.PI / 2;
      }
      addPart(group, new THREE.BoxGeometry(0.09, 0.09, 0.05), brassMat, 0.1, 0.05, 0);
    }
    return group;
  }

  // Category 7: Yapı Malzemesi
  if (catIndex === 7) {
    if (tier === 1) {
      // Çelik mala
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0xc4c9ce, metalness: 0.88, roughness: 0.22 });
      const woodGrip = new THREE.MeshStandardMaterial({ color: 0x8c562c, roughness: 0.8 });
      addPart(group, new THREE.BoxGeometry(0.14, 0.012, 0.26), bladeMat, 0, 0.015, 0);
      addPart(group, new THREE.BoxGeometry(0.016, 0.06, 0.016), bladeMat, 0, 0.045, 0.03);
      addPart(group, new THREE.CylinderGeometry(0.02, 0.018, 0.11, 10), woodGrip, 0, 0.08, 0.06).rotation.x = Math.PI / 2;
    } else if (tier === 2) {
      // Derz dolgu harcı torbası
      const bagMat = new THREE.MeshStandardMaterial({ color: 0xebe4d4, roughness: 0.9 });
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0x2f6ba3, roughness: 0.65 });
      addPart(group, new THREE.BoxGeometry(0.16, 0.24, 0.22), bagMat, 0, 0.12, 0);
      addPart(group, new THREE.BoxGeometry(0.165, 0.065, 0.225), stripeMat, 0, 0.14, 0);
      addPart(group, new THREE.BoxGeometry(0.14, 0.03, 0.21), bagMat, 0, 0.245, 0);
    } else {
      // Su terazisi
      const levelMat = new THREE.MeshStandardMaterial({ color: 0xe3b129, metalness: 0.35, roughness: 0.42 });
      const capMat = new THREE.MeshStandardMaterial({ color: 0x25282c, roughness: 0.8 });
      const vialMat = new THREE.MeshStandardMaterial({ color: 0x8ef05a, emissive: 0x256614, roughness: 0.2 });
      addPart(group, new THREE.BoxGeometry(0.055, 0.065, 0.34), levelMat, 0, 0.04, 0);
      addPart(group, new THREE.BoxGeometry(0.06, 0.07, 0.03), capMat, 0, 0.04, -0.17);
      addPart(group, new THREE.BoxGeometry(0.06, 0.07, 0.03), capMat, 0, 0.04, 0.17);
      addPart(group, new THREE.BoxGeometry(0.062, 0.025, 0.055), vialMat, 0, 0.05, 0);
    }
    return group;
  }

  // Category 8: Temizlik & Kimyasal
  if (tier === 1) {
    // Sentetik tiner tenekesi
    const tinMat = new THREE.MeshStandardMaterial({ color: 0xc2c5c8, metalness: 0.72, roughness: 0.32 });
    const labelMat = new THREE.MeshStandardMaterial({ color: 0xb93c2c, roughness: 0.58 });
    addPart(group, new THREE.BoxGeometry(0.14, 0.24, 0.11), tinMat, 0, 0.12, 0);
    addPart(group, new THREE.BoxGeometry(0.144, 0.12, 0.114), labelMat, 0, 0.12, 0);
    addPart(group, new THREE.CylinderGeometry(0.018, 0.018, 0.03, 10), new THREE.MeshStandardMaterial({ color: 0xd9a838 }), 0.02, 0.255, 0);
  } else if (tier === 2) {
    // Pas sökücü sprey
    const canMat = new THREE.MeshStandardMaterial({ color: 0x1e4c8a, metalness: 0.4, roughness: 0.38 });
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xe6b82c, roughness: 0.45 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0xc43628, roughness: 0.5 });
    addPart(group, new THREE.CylinderGeometry(0.042, 0.042, 0.2, 14), canMat, 0, 0.1, 0);
    addPart(group, new THREE.CylinderGeometry(0.043, 0.043, 0.07, 14), bandMat, 0, 0.11, 0);
    addPart(group, new THREE.CylinderGeometry(0.036, 0.04, 0.045, 12), capMat, 0, 0.22, 0);
  } else {
    // İş eldiveni ve toz maskesi seti
    const gloveMat = new THREE.MeshStandardMaterial({ color: 0xd98426, roughness: 0.88 });
    const maskMat = new THREE.MeshStandardMaterial({ color: 0xf1ede4, roughness: 0.75 });
    const strapMat = new THREE.MeshStandardMaterial({ color: 0x3b6fa0, roughness: 0.65 });
    addPart(group, new THREE.BoxGeometry(0.1, 0.035, 0.18), gloveMat, -0.05, 0.025, 0);
    addPart(group, new THREE.BoxGeometry(0.1, 0.035, 0.18), gloveMat, 0.05, 0.055, 0.01);
    addPart(group, new THREE.SphereGeometry(0.075, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), maskMat, 0.02, 0.07, -0.02);
    addPart(group, new THREE.BoxGeometry(0.09, 0.012, 0.02), strapMat, 0.02, 0.11, -0.02);
  }

  return group;
}

export function createCustomerModel(personality: CustomerPersonality): CustomerRig {
  const group = new THREE.Group();
  const skinColor = [0xe8b898, 0xd9a07a, 0xc58a64][Math.floor(Math.random() * 3)];
  const shirtColor =
    personality === 'craftsman'
      ? new THREE.Color(0x2d4a6b)
      : personality === 'kid'
        ? new THREE.Color().setHSL(Math.random(), 0.65, 0.52)
        : new THREE.Color().setHSL(Math.random(), 0.44, 0.38);
  const hairColor = [0x2a1c12, 0x6f6c68, 0x6a4a2a][Math.floor(Math.random() * 3)];

  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x323740, roughness: 0.88 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1d1916, roughness: 0.72 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.85 });
  const vestMat = new THREE.MeshStandardMaterial({
    color: personality === 'craftsman' ? 0x9c652c : 0x453b31,
    roughness: 0.9,
  });
  const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.78 });
  const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.95 });

  const legL = new THREE.Group();
  const legR = new THREE.Group();
  legL.position.set(-0.1, 0.8, 0);
  legR.position.set(0.1, 0.8, 0);

  [legL, legR].forEach((leg) => {
    addPart(leg, new THREE.BoxGeometry(0.14, 0.72, 0.15), pantsMat, 0, -0.36, 0);
    addPart(leg, new THREE.BoxGeometry(0.15, 0.09, 0.21), shoeMat, 0, -0.755, 0.025);
    group.add(leg);
  });

  addPart(group, new THREE.CylinderGeometry(0.2, 0.23, 0.64, 14), shirtMat, 0, 1.12, 0);
  addPart(group, new THREE.BoxGeometry(0.28, 0.34, 0.04), vestMat, 0, 1.05, 0.21);

  addPart(group, new THREE.CylinderGeometry(0.065, 0.075, 0.12, 10), skinMat, 0, 1.47, 0);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.5, 0);
  addPart(headGroup, new THREE.SphereGeometry(0.15, 16, 14), skinMat, 0, 0.13, 0);
  addPart(
    headGroup,
    new THREE.SphereGeometry(0.158, 16, 10, 0, Math.PI * 2, 0, 1.38),
    hairMat,
    0,
    0.15,
    -0.01,
  );

  if (personality === 'craftsman') {
    const capMat = new THREE.MeshStandardMaterial({ color: 0x26384d, roughness: 0.75 });
    addPart(headGroup, new THREE.CylinderGeometry(0.155, 0.16, 0.08, 14), capMat, 0, 0.25, 0);
    addPart(headGroup, new THREE.BoxGeometry(0.2, 0.02, 0.12), capMat, 0, 0.22, 0.14);
  }

  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1e1814, roughness: 0.4 });
  addPart(headGroup, new THREE.SphereGeometry(0.018, 8, 8), eyeMat, -0.055, 0.14, 0.135);
  addPart(headGroup, new THREE.SphereGeometry(0.018, 8, 8), eyeMat, 0.055, 0.14, 0.135);
  group.add(headGroup);

  const armL = new THREE.Group();
  const armR = new THREE.Group();
  armL.position.set(-0.27, 1.35, 0);
  armR.position.set(0.27, 1.35, 0);
  [armL, armR].forEach((arm) => {
    addPart(arm, new THREE.CylinderGeometry(0.052, 0.048, 0.48, 10), shirtMat, 0, -0.24, 0);
    addPart(arm, new THREE.SphereGeometry(0.048, 10, 10), skinMat, 0, -0.5, 0);
    group.add(arm);
  });

  // Kraft paper shopping bag carried out after purchase
  const bagGroup = new THREE.Group();
  bagGroup.position.set(0.04, -0.56, 0.03);
  const bagMat = new THREE.MeshStandardMaterial({ color: 0xc89e64, roughness: 0.9 });
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x6f4b27, roughness: 0.8 });
  addPart(bagGroup, new THREE.BoxGeometry(0.13, 0.24, 0.2), bagMat, 0, -0.1, 0);
  addPart(bagGroup, new THREE.BoxGeometry(0.02, 0.06, 0.1), handleMat, 0, 0.03, 0);
  bagGroup.visible = false;
  armR.add(bagGroup);

  if (personality === 'kid') {
    group.scale.setScalar(0.76);
  }

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 1.85, 0.72),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitbox.position.set(0, 0.95, 0);
  group.add(hitbox);

  return { group, headGroup, legL, legR, armL, armR, bagGroup, hitbox };
}

export function createChairModel(): ChairRig {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x6b4324, roughness: 0.82 });
  const cushionMat = new THREE.MeshStandardMaterial({ color: 0x7c3629, roughness: 0.92 });

  [
    [-0.19, 0.22, -0.19],
    [0.19, 0.22, -0.19],
    [-0.19, 0.22, 0.19],
    [0.19, 0.22, 0.19],
  ].forEach(([x, y, z]) => {
    addPart(group, new THREE.BoxGeometry(0.05, 0.44, 0.05), woodMat, x, y, z);
  });

  addPart(group, new THREE.BoxGeometry(0.36, 0.035, 0.035), woodMat, 0, 0.16, 0.19);
  addPart(group, new THREE.BoxGeometry(0.36, 0.035, 0.035), woodMat, 0, 0.16, -0.19);

  addPart(group, new THREE.BoxGeometry(0.46, 0.05, 0.46), woodMat, 0, 0.45, 0);
  addPart(group, new THREE.BoxGeometry(0.42, 0.04, 0.42), cushionMat, 0, 0.495, 0);

  addPart(group, new THREE.BoxGeometry(0.05, 0.44, 0.05), woodMat, -0.19, 0.69, -0.19);
  addPart(group, new THREE.BoxGeometry(0.05, 0.44, 0.05), woodMat, 0.19, 0.69, -0.19);
  addPart(group, new THREE.BoxGeometry(0.44, 0.16, 0.045), woodMat, 0, 0.83, -0.19);

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 1.0, 0.6),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitbox.position.set(0, 0.5, 0);
  group.add(hitbox);

  return { group, hitbox };
}

export function createCashRegisterModel(): CashRegisterRig {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x3b3d3a,
    metalness: 0.45,
    roughness: 0.42,
  });
  const drawerMat = new THREE.MeshStandardMaterial({
    color: 0x525552,
    metalness: 0.55,
    roughness: 0.35,
  });
  const keyMat = new THREE.MeshStandardMaterial({
    color: 0xdfd7c3,
    roughness: 0.6,
  });
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x7fd09a,
    emissive: 0x1b472a,
    emissiveIntensity: 0.7,
    roughness: 0.3,
  });

  addPart(group, new THREE.BoxGeometry(0.44, 0.11, 0.36), bodyMat, 0, 0.055, 0);
  const drawer = addPart(group, new THREE.BoxGeometry(0.38, 0.075, 0.32), drawerMat, 0, 0.048, -0.02);
  addPart(group, new THREE.BoxGeometry(0.12, 0.02, 0.02), keyMat, 0, 0.048, -0.185);
  addPart(group, new THREE.BoxGeometry(0.4, 0.15, 0.24), bodyMat, 0, 0.18, 0.03);
  addPart(group, new THREE.BoxGeometry(0.3, 0.03, 0.12), keyMat, 0, 0.26, -0.02);
  addPart(group, new THREE.BoxGeometry(0.28, 0.11, 0.04), bodyMat, 0, 0.31, 0.1);
  addPart(group, new THREE.BoxGeometry(0.23, 0.065, 0.045), screenMat, 0, 0.31, 0.1);

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.45, 0.48),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitbox.position.set(0, 0.2, 0);
  group.add(hitbox);

  return { group, drawer, hitbox };
}

export function createDeliveryBoxModel(): DeliveryBoxRig {
  const group = new THREE.Group();
  const cardMat = new THREE.MeshStandardMaterial({ color: 0xb68a52, roughness: 0.9 });
  const tapeMat = new THREE.MeshStandardMaterial({ color: 0xd9b87c, roughness: 0.55 });
  const stickerMat = new THREE.MeshStandardMaterial({ color: 0xf4ecd8, roughness: 0.6 });

  addPart(group, new THREE.BoxGeometry(0.48, 0.36, 0.38), cardMat, 0, 0.18, 0);
  addPart(group, new THREE.BoxGeometry(0.49, 0.02, 0.08), tapeMat, 0, 0.362, 0);
  addPart(group, new THREE.BoxGeometry(0.18, 0.12, 0.01), stickerMat, 0.08, 0.2, 0.194);

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.46, 0.48),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitbox.position.set(0, 0.22, 0);
  group.add(hitbox);

  return { group, hitbox };
}

export function createTeaStationModel(): TeaStationRig {
  const group = new THREE.Group();
  const saucerMat = new THREE.MeshStandardMaterial({ color: 0xf2ead6, roughness: 0.35 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xe8d9be,
    transparent: true,
    opacity: 0.55,
    roughness: 0.12,
  });
  const teaMat = new THREE.MeshStandardMaterial({
    color: 0xa83614,
    emissive: 0x360c02,
    roughness: 0.2,
  });
  const metalPot = new THREE.MeshStandardMaterial({
    color: 0xc5c8cc,
    metalness: 0.9,
    roughness: 0.2,
  });

  // Saucer & tulip glass
  addPart(group, new THREE.CylinderGeometry(0.06, 0.042, 0.012, 14), saucerMat, 0, 0.006, 0);
  addPart(group, new THREE.CylinderGeometry(0.032, 0.025, 0.09, 14), glassMat, 0, 0.055, 0);
  const teaLiquid = addPart(
    group,
    new THREE.CylinderGeometry(0.026, 0.021, 0.068, 12),
    teaMat,
    0,
    0.046,
    0,
  );

  // Small brass-knob kettle beside the glass
  addPart(group, new THREE.CylinderGeometry(0.055, 0.068, 0.11, 14), metalPot, 0.16, 0.055, -0.03);
  addPart(group, new THREE.CylinderGeometry(0.042, 0.048, 0.06, 14), metalPot, 0.16, 0.135, -0.03);
  addPart(group, new THREE.SphereGeometry(0.014, 10, 10), new THREE.MeshStandardMaterial({ color: 0x2c221b }), 0.16, 0.175, -0.03);

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.25, 0.24),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitbox.position.set(0.07, 0.12, 0);
  group.add(hitbox);

  return { group, teaLiquid, hitbox };
}

export function createLedgerBookModel(): LedgerBookRig {
  const group = new THREE.Group();
  const coverMat = new THREE.MeshStandardMaterial({ color: 0x5c261c, roughness: 0.78 });
  const pageMat = new THREE.MeshStandardMaterial({ color: 0xf4ead0, roughness: 0.85 });
  const penMat = new THREE.MeshStandardMaterial({ color: 0x233852, roughness: 0.4 });

  addPart(group, new THREE.BoxGeometry(0.28, 0.022, 0.22), coverMat, 0, 0.011, 0);
  addPart(group, new THREE.BoxGeometry(0.255, 0.018, 0.195), pageMat, 0, 0.025, 0);
  const pen = addPart(group, new THREE.CylinderGeometry(0.006, 0.004, 0.16, 8), penMat, 0.06, 0.038, 0.02);
  pen.rotation.z = Math.PI / 2;
  pen.rotation.y = 0.35;

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.14, 0.28),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitbox.position.set(0, 0.06, 0);
  group.add(hitbox);

  return { group, hitbox };
}

export function createApprenticeModel(): ApprenticeRig {
  const group = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xe3b18f, roughness: 0.78 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0xd9cbb1, roughness: 0.85 });
  const apronMat = new THREE.MeshStandardMaterial({ color: 0x3b5842, roughness: 0.88 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x2f3742, roughness: 0.88 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1d1916, roughness: 0.72 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x8e4028, roughness: 0.78 });

  const legL = new THREE.Group();
  const legR = new THREE.Group();
  legL.position.set(-0.09, 0.76, 0);
  legR.position.set(0.09, 0.76, 0);
  [legL, legR].forEach((leg) => {
    addPart(leg, new THREE.BoxGeometry(0.13, 0.68, 0.14), pantsMat, 0, -0.34, 0);
    addPart(leg, new THREE.BoxGeometry(0.14, 0.08, 0.2), shoeMat, 0, -0.71, 0.02);
    group.add(leg);
  });

  addPart(group, new THREE.CylinderGeometry(0.18, 0.21, 0.6, 14), shirtMat, 0, 1.06, 0);
  // Workshop apron on front
  addPart(group, new THREE.BoxGeometry(0.28, 0.48, 0.04), apronMat, 0, 0.98, 0.2);

  addPart(group, new THREE.CylinderGeometry(0.06, 0.07, 0.11, 10), skinMat, 0, 1.4, 0);
  addPart(group, new THREE.SphereGeometry(0.14, 16, 14), skinMat, 0, 1.54, 0);

  // Apprentice cap
  addPart(group, new THREE.CylinderGeometry(0.145, 0.15, 0.07, 14), capMat, 0, 1.65, 0);
  addPart(group, new THREE.BoxGeometry(0.18, 0.02, 0.11), capMat, 0, 1.62, 0.13);

  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1e1814, roughness: 0.4 });
  addPart(group, new THREE.SphereGeometry(0.016, 8, 8), eyeMat, -0.05, 1.55, 0.125);
  addPart(group, new THREE.SphereGeometry(0.016, 8, 8), eyeMat, 0.05, 1.55, 0.125);

  const armL = new THREE.Group();
  const armR = new THREE.Group();
  armL.position.set(-0.24, 1.28, 0);
  armR.position.set(0.24, 1.28, 0);
  [armL, armR].forEach((arm) => {
    addPart(arm, new THREE.CylinderGeometry(0.048, 0.042, 0.44, 10), shirtMat, 0, -0.22, 0);
    addPart(arm, new THREE.SphereGeometry(0.044, 10, 10), skinMat, 0, -0.46, 0);
    group.add(arm);
  });

  group.scale.setScalar(0.92);

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 1.75, 0.7),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitbox.position.set(0, 0.9, 0);
  group.add(hitbox);

  return { group, legL, legR, armL, armR, hitbox };
}

export function createStreetStallModel(): StreetStallRig {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5c34, roughness: 0.85 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x56351c, roughness: 0.82 });
  const clothMat = new THREE.MeshStandardMaterial({ color: 0xb63f2a, roughness: 0.8 });

  // Four legs & top tray
  [
    [-0.55, 0.42, -0.28],
    [0.55, 0.42, -0.28],
    [-0.55, 0.42, 0.28],
    [0.55, 0.42, 0.28],
  ].forEach(([lx, ly, lz]) => {
    addPart(group, new THREE.BoxGeometry(0.06, 0.84, 0.06), trimMat, lx, ly, lz);
  });

  addPart(group, new THREE.BoxGeometry(1.26, 0.06, 0.7), woodMat, 0, 0.86, 0);
  addPart(group, new THREE.BoxGeometry(1.28, 0.08, 0.04), trimMat, 0, 0.92, 0.34);
  addPart(group, new THREE.BoxGeometry(1.28, 0.08, 0.04), trimMat, 0, 0.92, -0.34);
  // Decorative fabric front skirt
  addPart(group, new THREE.BoxGeometry(1.18, 0.24, 0.02), clothMat, 0, 0.7, 0.34);

  const displaySlot = new THREE.Group();
  displaySlot.position.set(0, 0.9, 0);
  group.add(displaySlot);

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.35, 0.9),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitbox.position.set(0, 0.68, 0);
  group.add(hitbox);

  return { group, displaySlot, hitbox };
}

export function createDepotRackModel(): DepotRackRig {
  const group = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x4b555f,
    metalness: 0.65,
    roughness: 0.42,
  });
  const plankMat = new THREE.MeshStandardMaterial({ color: 0x9b6d3f, roughness: 0.88 });
  const crateMat = new THREE.MeshStandardMaterial({ color: 0xb88950, roughness: 0.9 });

  // Vertical posts
  [
    [-0.36, 1.1, -0.92],
    [0.36, 1.1, -0.92],
    [-0.36, 1.1, 0.92],
    [0.36, 1.1, 0.92],
  ].forEach(([px, py, pz]) => {
    addPart(group, new THREE.BoxGeometry(0.06, 2.2, 0.06), steelMat, px, py, pz);
  });

  // 3 heavy shelf tiers
  const levels = [0.14, 0.92, 1.72];
  levels.forEach((ly) => {
    addPart(group, new THREE.BoxGeometry(0.76, 0.05, 1.9), plankMat, 0, ly, 0);
  });

  const crateMeshes: THREE.Mesh[] = [];
  const cratePositions: Array<[number, number, number]> = [
    [0, 0.36, -0.52],
    [0, 0.36, 0.05],
    [0, 0.36, 0.6],
    [0, 1.14, -0.48],
    [0, 1.14, 0.14],
    [0, 1.14, 0.64],
    [0, 1.94, -0.45],
    [0, 1.94, 0.2],
  ];
  cratePositions.forEach(([cx, cy, cz]) => {
    const crate = addPart(
      group,
      new THREE.BoxGeometry(0.56, 0.36, 0.44),
      crateMat,
      cx,
      cy,
      cz,
    );
    crate.visible = false;
    crateMeshes.push(crate);
  });

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 2.2, 2.0),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitbox.position.set(0, 1.1, 0);
  group.add(hitbox);

  return { group, crateMeshes, hitbox };
}

export function createNazarModel(): THREE.Group {
  const group = new THREE.Group();
  const deepBlue = new THREE.MeshStandardMaterial({ color: 0x104a8e, roughness: 0.2, metalness: 0.15 });
  const whiteRing = new THREE.MeshStandardMaterial({ color: 0xf4f4ee, roughness: 0.3 });
  const skyBlue = new THREE.MeshStandardMaterial({ color: 0x5ab2e6, roughness: 0.25 });
  const pupil = new THREE.MeshStandardMaterial({ color: 0x11131a, roughness: 0.2 });

  const outer = addPart(group, new THREE.CylinderGeometry(0.11, 0.11, 0.025, 20), deepBlue, 0, 0, 0);
  outer.rotation.x = Math.PI / 2;
  const white = addPart(group, new THREE.CylinderGeometry(0.075, 0.075, 0.028, 18), whiteRing, 0, 0, 0.002);
  white.rotation.x = Math.PI / 2;
  const cyan = addPart(group, new THREE.CylinderGeometry(0.048, 0.048, 0.03, 16), skyBlue, 0, 0, 0.004);
  cyan.rotation.x = Math.PI / 2;
  const dot = addPart(group, new THREE.CylinderGeometry(0.022, 0.022, 0.033, 12), pupil, 0, 0, 0.006);
  dot.rotation.x = Math.PI / 2;

  return group;
}

/**
 * 3D Usta Tezgâhı: Key cutting wheel, brass counter scale, vise & hacksaw, and paint mixing buckets
 */
export function createWorkbenchModel(): WorkbenchRig {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x7d4f2a, roughness: 0.82 });
  const topMat = new THREE.MeshStandardMaterial({ color: 0x9b6b3e, roughness: 0.68 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x7b8288, metalness: 0.72, roughness: 0.34 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xc9a34c, metalness: 0.88, roughness: 0.24 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xa43426, roughness: 0.55 });
  const paintMat = new THREE.MeshStandardMaterial({ color: 0x569a74, roughness: 0.45 });

  // Bench legs + bottom shelf + thick oak benchtop
  [
    [-0.92, 0.46, -0.34],
    [0.92, 0.46, -0.34],
    [-0.92, 0.46, 0.34],
    [0.92, 0.46, 0.34],
  ].forEach(([lx, ly, lz]) => {
    addPart(group, new THREE.BoxGeometry(0.08, 0.92, 0.08), woodMat, lx, ly, lz);
  });
  addPart(group, new THREE.BoxGeometry(1.9, 0.05, 0.7), woodMat, 0, 0.25, 0);
  addPart(group, new THREE.BoxGeometry(2.05, 0.08, 0.84), topMat, 0, 0.94, 0);

  // Left: Key cutting machine
  addPart(group, new THREE.BoxGeometry(0.32, 0.1, 0.26), steelMat, -0.66, 1.03, 0);
  const wheel = addPart(group, new THREE.CylinderGeometry(0.065, 0.065, 0.025, 16), brassMat, -0.66, 1.14, -0.02);
  wheel.rotation.z = Math.PI / 2;
  addPart(group, new THREE.BoxGeometry(0.14, 0.05, 0.08), redMat, -0.66, 1.12, 0.08);

  // Center: Brass balance scale
  addPart(group, new THREE.BoxGeometry(0.24, 0.04, 0.14), woodMat, -0.1, 1.0, 0);
  addPart(group, new THREE.CylinderGeometry(0.015, 0.02, 0.28, 10), brassMat, -0.1, 1.14, 0);
  addPart(group, new THREE.BoxGeometry(0.32, 0.016, 0.016), brassMat, -0.1, 1.27, 0);
  addPart(group, new THREE.CylinderGeometry(0.07, 0.05, 0.02, 12), brassMat, -0.25, 1.17, 0);
  addPart(group, new THREE.CylinderGeometry(0.07, 0.05, 0.02, 12), brassMat, 0.05, 1.17, 0);

  // Right-Center: Paint mixing bucket
  addPart(group, new THREE.CylinderGeometry(0.09, 0.08, 0.16, 14), steelMat, 0.34, 1.06, -0.06);
  addPart(group, new THREE.CylinderGeometry(0.082, 0.082, 0.015, 14), paintMat, 0.34, 1.138, -0.06);

  // Far Right: Bench vise + hacksaw handle
  addPart(group, new THREE.BoxGeometry(0.18, 0.12, 0.14), redMat, 0.72, 1.04, 0.22);
  addPart(group, new THREE.BoxGeometry(0.09, 0.1, 0.12), steelMat, 0.72, 1.12, 0.22);
  addPart(group, new THREE.BoxGeometry(0.34, 0.025, 0.04), steelMat, 0.65, 1.0, -0.14);

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(2.15, 1.45, 0.96),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitbox.position.set(0, 0.72, 0);
  group.add(hitbox);

  return { group, hitbox };
}

export function createStandModel(
  standId: StandId,
  signTex?: THREE.CanvasTexture,
): WorkbenchRig {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x734724, roughness: 0.82 });
  const topMat = new THREE.MeshStandardMaterial({ color: 0x9b6b3e, roughness: 0.66 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x7b8288, metalness: 0.74, roughness: 0.34 });
  const darkSteelMat = new THREE.MeshStandardMaterial({ color: 0x3b4147, metalness: 0.65, roughness: 0.45 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xc9a34c, metalness: 0.88, roughness: 0.24 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xa43426, roughness: 0.55 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb8663a, metalness: 0.78, roughness: 0.3 });

  const benchW = standId === 'key_cut' ? 1.08 : 1.18;
  const benchD = 0.72;
  const lx = benchW * 0.44;
  const lz = benchD * 0.39;

  // Shared sturdy frame
  [
    [-lx, 0.45, -lz],
    [lx, 0.45, -lz],
    [-lx, 0.45, lz],
    [lx, 0.45, lz],
  ].forEach(([px, py, pz]) => {
    addPart(
      group,
      new THREE.BoxGeometry(0.075, 0.9, 0.075),
      standId === 'cut_measure' || standId === 'paint_mix' ? darkSteelMat : woodMat,
      px,
      py,
      pz,
    );
  });
  addPart(group, new THREE.BoxGeometry(benchW - 0.14, 0.05, benchD - 0.14), woodMat, 0, 0.24, 0);
  addPart(group, new THREE.BoxGeometry(benchW, 0.08, benchD), topMat, 0, 0.92, 0);

  // Front signboard plaque facing +Z
  if (signTex) {
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.86, 0.22),
      new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.65 }),
    );
    signMesh.position.set(0, 0.68, benchD * 0.46 + 0.01);
    group.add(signMesh);
  }

  if (standId === 'scale_repair') {
    // Brass two-pan balance scale on left
    addPart(group, new THREE.BoxGeometry(0.26, 0.04, 0.16), woodMat, -0.26, 0.98, -0.02);
    addPart(group, new THREE.CylinderGeometry(0.015, 0.02, 0.28, 10), brassMat, -0.26, 1.12, -0.02);
    addPart(group, new THREE.BoxGeometry(0.32, 0.018, 0.018), brassMat, -0.26, 1.25, -0.02);
    addPart(group, new THREE.CylinderGeometry(0.075, 0.052, 0.024, 12), brassMat, -0.41, 1.15, -0.02);
    addPart(group, new THREE.CylinderGeometry(0.075, 0.052, 0.024, 12), brassMat, -0.11, 1.15, -0.02);

    // 3 Screw / Nail sorting trays + Repair tool mat on right
    [0.14, 0.28, 0.42].forEach((tx, idx) => {
      const trayMat = idx === 0 ? steelMat : idx === 1 ? brassMat : redMat;
      addPart(group, new THREE.BoxGeometry(0.11, 0.05, 0.13), darkSteelMat, tx, 0.985, -0.14);
      addPart(group, new THREE.BoxGeometry(0.085, 0.02, 0.1), trayMat, tx, 1.005, -0.14);
    });
    // Green rubber repair mat + wrench & screwdriver
    const matGreen = new THREE.MeshStandardMaterial({ color: 0x2f5a44, roughness: 0.85 });
    addPart(group, new THREE.BoxGeometry(0.36, 0.015, 0.22), matGreen, 0.26, 0.968, 0.14);
    addPart(group, new THREE.BoxGeometry(0.22, 0.02, 0.03), steelMat, 0.22, 0.985, 0.11);
    addPart(group, new THREE.BoxGeometry(0.14, 0.026, 0.026), redMat, 0.34, 0.988, 0.19);
  } else if (standId === 'cut_measure') {
    // Brass ruler bar along front edge
    addPart(group, new THREE.BoxGeometry(benchW - 0.12, 0.02, 0.07), brassMat, 0, 0.97, 0.26);
    // Support riser blocks + copper pipe clamped across table
    addPart(group, new THREE.BoxGeometry(0.14, 0.07, 0.16), woodMat, -0.34, 0.995, -0.02);
    addPart(group, new THREE.BoxGeometry(0.14, 0.07, 0.16), woodMat, 0.22, 0.995, -0.02);
    const pipe = addPart(group, new THREE.CylinderGeometry(0.024, 0.024, 0.86, 12), copperMat, -0.05, 1.055, -0.02);
    pipe.rotation.z = Math.PI / 2;
    // Heavy red bench vise on right
    addPart(group, new THREE.BoxGeometry(0.2, 0.12, 0.16), redMat, 0.38, 1.02, 0.08);
    addPart(group, new THREE.BoxGeometry(0.1, 0.11, 0.14), steelMat, 0.38, 1.11, 0.08);
    // Hacksaw frame resting behind
    addPart(group, new THREE.BoxGeometry(0.42, 0.024, 0.03), steelMat, -0.14, 0.975, -0.2);
    addPart(group, new THREE.BoxGeometry(0.11, 0.045, 0.04), redMat, -0.36, 0.99, -0.2);
  } else if (standId === 'key_cut') {
    // Back pegboard panel with hanging blank brass keys
    addPart(group, new THREE.BoxGeometry(benchW - 0.1, 0.42, 0.04), darkSteelMat, 0, 1.17, -0.29);
    for (let i = 0; i < 5; i++) {
      addPart(group, new THREE.BoxGeometry(0.025, 0.075, 0.014), brassMat, -0.3 + i * 0.15, 1.16, -0.26);
    }
    // Motorized key duplicator body + spinning brass grinding wheel + carriage
    addPart(group, new THREE.BoxGeometry(0.44, 0.14, 0.32), darkSteelMat, -0.05, 1.03, 0.02);
    const wheel = addPart(group, new THREE.CylinderGeometry(0.085, 0.085, 0.032, 18), brassMat, -0.08, 1.17, -0.02);
    wheel.rotation.z = Math.PI / 2;
    addPart(group, new THREE.BoxGeometry(0.18, 0.06, 0.1), redMat, 0.12, 1.14, 0.08);
    addPart(group, new THREE.BoxGeometry(0.22, 0.025, 0.18), steelMat, 0.34, 0.975, 0.08);
  } else {
    // paint_mix: Tinting riser with 4 colorful pigment bottles + base white bucket + mixing tin
    addPart(group, new THREE.BoxGeometry(benchW - 0.14, 0.16, 0.18), darkSteelMat, 0, 1.04, -0.22);
    const bottleColors = [0xd6483e, 0xe2b338, 0x3b9a5c, 0x366ec2];
    bottleColors.forEach((col, i) => {
      const bMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.42 });
      addPart(group, new THREE.CylinderGeometry(0.038, 0.04, 0.2, 12), bMat, -0.3 + i * 0.2, 1.22, -0.22);
      addPart(group, new THREE.CylinderGeometry(0.018, 0.02, 0.04, 10), steelMat, -0.3 + i * 0.2, 1.34, -0.22);
    });
    // White base paint bucket
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xeee9dc, roughness: 0.55 });
    addPart(group, new THREE.CylinderGeometry(0.115, 0.1, 0.22, 16), whiteMat, -0.26, 1.07, 0.08);
    // Open metal mixing tin with sage green wet paint
    addPart(group, new THREE.CylinderGeometry(0.105, 0.095, 0.18, 16), steelMat, 0.16, 1.05, 0.06);
    const mixMat = new THREE.MeshStandardMaterial({ color: 0x76a882, roughness: 0.25 });
    addPart(group, new THREE.CylinderGeometry(0.095, 0.095, 0.016, 16), mixMat, 0.16, 1.142, 0.06);
    // Wooden stir paddle
    addPart(group, new THREE.BoxGeometry(0.024, 0.2, 0.01), woodMat, 0.2, 1.19, 0.06);
  }

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(benchW + 0.1, 1.45, benchD + 0.14),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitbox.position.set(0, 0.72, 0);
  group.add(hitbox);

  return { group, hitbox };
}

export function createParkBenchModel(): THREE.Group {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x87542c, roughness: 0.84 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x26292e, metalness: 0.6, roughness: 0.45 });

  [-0.75, 0.75].forEach((x) => {
    addPart(group, new THREE.BoxGeometry(0.08, 0.45, 0.5), ironMat, x, 0.225, 0);
    addPart(group, new THREE.BoxGeometry(0.06, 0.45, 0.07), ironMat, x, 0.65, -0.22);
  });
  addPart(group, new THREE.BoxGeometry(1.72, 0.06, 0.46), woodMat, 0, 0.46, 0.02);
  addPart(group, new THREE.BoxGeometry(1.72, 0.24, 0.05), woodMat, 0, 0.74, -0.2);

  return group;
}

export function createFountainModel(): THREE.Group {
  const group = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xa49b8c, roughness: 0.9 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x7c7468, roughness: 0.85 });
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x4b93ad, roughness: 0.18, metalness: 0.1 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xc9a34c, metalness: 0.85, roughness: 0.25 });

  // Stone base + octagonal trough + back pillar + brass spout
  addPart(group, new THREE.BoxGeometry(1.4, 0.24, 1.15), trimMat, 0, 0.12, 0);
  addPart(group, new THREE.BoxGeometry(1.16, 0.42, 0.76), stoneMat, 0, 0.45, 0.12);
  addPart(group, new THREE.BoxGeometry(0.96, 0.06, 0.56), waterMat, 0, 0.62, 0.12);
  addPart(group, new THREE.BoxGeometry(0.84, 1.48, 0.36), stoneMat, 0, 0.98, -0.28);
  addPart(group, new THREE.BoxGeometry(0.96, 0.16, 0.44), trimMat, 0, 1.76, -0.28);
  const tap = addPart(group, new THREE.CylinderGeometry(0.03, 0.03, 0.18, 10), brassMat, 0, 1.0, -0.04);
  tap.rotation.x = Math.PI / 2;

  return group;
}

export function createCafeTableModel(): THREE.Group {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x7a4b25, roughness: 0.8 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x2a2d30, metalness: 0.55, roughness: 0.5 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xa83614, roughness: 0.2 });

  // Table
  addPart(group, new THREE.CylinderGeometry(0.36, 0.36, 0.04, 14), woodMat, 0, 0.72, 0);
  addPart(group, new THREE.CylinderGeometry(0.035, 0.04, 0.7, 10), ironMat, 0, 0.35, 0);
  addPart(group, new THREE.CylinderGeometry(0.22, 0.24, 0.04, 12), ironMat, 0, 0.02, 0);

  // Two tea glasses on table
  addPart(group, new THREE.CylinderGeometry(0.026, 0.02, 0.07, 10), glassMat, -0.1, 0.775, 0.05);
  addPart(group, new THREE.CylinderGeometry(0.026, 0.02, 0.07, 10), glassMat, 0.12, 0.775, -0.04);

  // Two wooden stools
  [-0.56, 0.56].forEach((sx) => {
    addPart(group, new THREE.BoxGeometry(0.32, 0.04, 0.32), woodMat, sx, 0.44, 0);
    addPart(group, new THREE.BoxGeometry(0.28, 0.42, 0.28), ironMat, sx, 0.21, 0);
  });

  return group;
}

export function createRadioModel(): RadioRig {
  const group = new THREE.Group();
  const walnutMat = new THREE.MeshStandardMaterial({ color: 0x5c3419, roughness: 0.58 });
  const bezelMat = new THREE.MeshStandardMaterial({ color: 0xceb274, metalness: 0.72, roughness: 0.3 });
  const clothMat = new THREE.MeshStandardMaterial({ color: 0x3b2c1d, roughness: 0.92 });
  const dialMat = new THREE.MeshStandardMaterial({
    color: 0xffe49c,
    emissive: 0xffb347,
    emissiveIntensity: 0.15,
    roughness: 0.3,
  });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xc2c6c9, metalness: 0.85, roughness: 0.22 });

  // Walnut cabinet
  addPart(group, new THREE.BoxGeometry(0.32, 0.21, 0.16), walnutMat, 0, 0.105, 0);
  // Front brass trim frame
  addPart(group, new THREE.BoxGeometry(0.29, 0.175, 0.014), bezelMat, 0, 0.105, 0.078);
  // Speaker grille cloth (left/bottom)
  addPart(group, new THREE.BoxGeometry(0.17, 0.145, 0.018), clothMat, -0.045, 0.105, 0.08);
  // Illuminated frequency scale (right top)
  addPart(group, new THREE.BoxGeometry(0.085, 0.055, 0.018), dialMat, 0.085, 0.145, 0.08);
  // Two rotary tuning knobs
  const k1 = addPart(group, new THREE.CylinderGeometry(0.018, 0.018, 0.022, 12), bezelMat, 0.068, 0.07, 0.088);
  k1.rotation.x = Math.PI / 2;
  const k2 = addPart(group, new THREE.CylinderGeometry(0.018, 0.018, 0.022, 12), bezelMat, 0.112, 0.07, 0.088);
  k2.rotation.x = Math.PI / 2;
  // Telescopic chrome antenna
  const ant = addPart(group, new THREE.CylinderGeometry(0.004, 0.006, 0.28, 8), metalMat, -0.11, 0.34, -0.04);
  ant.rotation.z = 0.16;

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.34, 0.26),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitbox.position.set(0, 0.15, 0);
  group.add(hitbox);

  return { group, dialMat, hitbox };
}

export function createWallClockModel(faceTex: THREE.Texture): ClockRig {
  const group = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x4e2f19, roughness: 0.62 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xc9a34c, metalness: 0.85, roughness: 0.25 });
  const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.5 });
  const handMat = new THREE.MeshStandardMaterial({ color: 0x201812, roughness: 0.4 });

  const rim = addPart(group, new THREE.CylinderGeometry(0.26, 0.26, 0.05, 24), frameMat, 0, 0, 0);
  rim.rotation.x = Math.PI / 2;
  const face = addPart(group, new THREE.CircleGeometry(0.23, 24), faceMat, 0, 0, 0.027);
  face.castShadow = false;

  const hourPivot = new THREE.Group();
  hourPivot.position.set(0, 0, 0.032);
  addPart(hourPivot, new THREE.BoxGeometry(0.016, 0.11, 0.008), handMat, 0, 0.045, 0);
  group.add(hourPivot);

  const minutePivot = new THREE.Group();
  minutePivot.position.set(0, 0, 0.038);
  addPart(minutePivot, new THREE.BoxGeometry(0.011, 0.16, 0.008), handMat, 0, 0.068, 0);
  group.add(minutePivot);

  const cap = addPart(group, new THREE.CylinderGeometry(0.018, 0.018, 0.018, 12), brassMat, 0, 0, 0.042);
  cap.rotation.x = Math.PI / 2;

  return { group, hourPivot, minutePivot };
}

export function createCounterClutterGroup(): THREE.Group {
  const group = new THREE.Group();
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xd9ecee,
    transparent: true,
    opacity: 0.48,
    roughness: 0.12,
  });
  const lidMat = new THREE.MeshStandardMaterial({ color: 0x9c3b28, roughness: 0.55 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x8e959b, metalness: 0.8, roughness: 0.3 });
  const cupWoodMat = new THREE.MeshStandardMaterial({ color: 0x6b4324, roughness: 0.8 });
  const pencilRed = new THREE.MeshStandardMaterial({ color: 0xb83828, roughness: 0.7 });
  const pencilBlue = new THREE.MeshStandardMaterial({ color: 0x2b5f92, roughness: 0.7 });
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xf4ead2, roughness: 0.88 });

  // Glass jar of spare screws/nuts
  addPart(group, new THREE.CylinderGeometry(0.042, 0.042, 0.1, 14), glassMat, 0, 0.05, 0);
  addPart(group, new THREE.CylinderGeometry(0.044, 0.044, 0.016, 14), lidMat, 0, 0.105, 0);
  addPart(group, new THREE.CylinderGeometry(0.035, 0.035, 0.045, 10), metalMat, 0, 0.025, 0);

  // Wooden carpenter pencil holder
  addPart(group, new THREE.CylinderGeometry(0.034, 0.032, 0.085, 12), cupWoodMat, 0.13, 0.042, 0.04);
  const p1 = addPart(group, new THREE.CylinderGeometry(0.005, 0.005, 0.13, 6), pencilRed, 0.12, 0.09, 0.03);
  p1.rotation.z = 0.15;
  const p2 = addPart(group, new THREE.CylinderGeometry(0.005, 0.005, 0.12, 6), pencilBlue, 0.14, 0.088, 0.05);
  p2.rotation.z = -0.18;

  // Receipt spike with paper notes
  addPart(group, new THREE.CylinderGeometry(0.032, 0.036, 0.012, 12), metalMat, -0.13, 0.006, 0.05);
  addPart(group, new THREE.CylinderGeometry(0.003, 0.003, 0.13, 8), metalMat, -0.13, 0.07, 0.05);
  addPart(group, new THREE.BoxGeometry(0.055, 0.006, 0.055), paperMat, -0.13, 0.024, 0.05);
  const slip2 = addPart(group, new THREE.BoxGeometry(0.052, 0.005, 0.052), paperMat, -0.13, 0.036, 0.05);
  slip2.rotation.y = 0.4;

  return group;
}

export function createPottedPlantModel(): THREE.Group {
  const group = new THREE.Group();
  const potMat = new THREE.MeshStandardMaterial({ color: 0xb25834, roughness: 0.82 });
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x3b281a, roughness: 0.95 });
  const leafDark = new THREE.MeshStandardMaterial({ color: 0x396832, roughness: 0.78 });
  const leafLight = new THREE.MeshStandardMaterial({ color: 0x568b42, roughness: 0.75 });

  addPart(group, new THREE.CylinderGeometry(0.16, 0.12, 0.24, 14), potMat, 0, 0.12, 0);
  addPart(group, new THREE.CylinderGeometry(0.172, 0.16, 0.04, 14), potMat, 0, 0.23, 0);
  addPart(group, new THREE.CylinderGeometry(0.145, 0.145, 0.02, 12), soilMat, 0, 0.235, 0);

  [
    [0, 0.36, 0, 0.12, leafDark],
    [-0.08, 0.34, 0.06, 0.095, leafLight],
    [0.09, 0.35, -0.05, 0.095, leafLight],
    [0.02, 0.45, 0.03, 0.085, leafLight],
    [-0.04, 0.42, -0.06, 0.08, leafDark],
  ].forEach(([lx, ly, lz, rad, lmat]) => {
    addPart(
      group,
      new THREE.SphereGeometry(rad as number, 10, 8),
      lmat as THREE.Material,
      lx as number,
      ly as number,
      lz as number,
    );
  });

  return group;
}

export function createBulletinBoardModel(corkTex: THREE.Texture): BoardRig {
  const group = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x5c361a, roughness: 0.72 });
  const corkMat = new THREE.MeshStandardMaterial({ map: corkTex, roughness: 0.92 });
  const flyerCream = new THREE.MeshStandardMaterial({ color: 0xf5ecd4, roughness: 0.88 });
  const flyerYellow = new THREE.MeshStandardMaterial({ color: 0xf2d179, roughness: 0.85 });
  const flyerGreen = new THREE.MeshStandardMaterial({ color: 0xd4e8c9, roughness: 0.86 });
  const tackRed = new THREE.MeshStandardMaterial({ color: 0xb83828, metalness: 0.3, roughness: 0.4 });
  const tackGold = new THREE.MeshStandardMaterial({ color: 0xd9a952, metalness: 0.8, roughness: 0.25 });

  // Cork board backing & outer wooden frame
  addPart(group, new THREE.BoxGeometry(0.92, 0.66, 0.03), corkMat, 0, 0, 0);
  addPart(group, new THREE.BoxGeometry(0.98, 0.05, 0.05), frameMat, 0, 0.34, 0.006);
  addPart(group, new THREE.BoxGeometry(0.98, 0.05, 0.05), frameMat, 0, -0.34, 0.006);
  addPart(group, new THREE.BoxGeometry(0.05, 0.64, 0.05), frameMat, -0.465, 0, 0.006);
  addPart(group, new THREE.BoxGeometry(0.05, 0.64, 0.05), frameMat, 0.465, 0, 0.006);

  // Three pinned paper notices with slight tilt and colored thumbtacks
  const f1 = addPart(group, new THREE.BoxGeometry(0.24, 0.28, 0.008), flyerCream, -0.26, -0.05, 0.02);
  f1.rotation.z = 0.05;
  addPart(group, new THREE.SphereGeometry(0.015, 8, 8), tackRed, -0.26, 0.07, 0.028);

  const f2 = addPart(group, new THREE.BoxGeometry(0.26, 0.3, 0.008), flyerYellow, 0.01, -0.06, 0.021);
  f2.rotation.z = -0.04;
  addPart(group, new THREE.SphereGeometry(0.015, 8, 8), tackGold, 0.01, 0.07, 0.029);

  const f3 = addPart(group, new THREE.BoxGeometry(0.23, 0.26, 0.008), flyerGreen, 0.28, -0.04, 0.02);
  f3.rotation.z = 0.03;
  addPart(group, new THREE.SphereGeometry(0.015, 8, 8), tackRed, 0.28, 0.07, 0.028);

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(1.06, 0.78, 0.24),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitbox.position.set(0, 0, 0.05);
  group.add(hitbox);

  return { group, hitbox };
}





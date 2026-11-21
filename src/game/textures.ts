import * as THREE from 'three';
import { POSTER_THEMES, RUG_THEMES, SIGN_THEMES, WALL_THEMES } from './catalog';
import type { PosterId, RugThemeId, SignThemeId, WallThemeId } from './types';

function addNoise(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  count: number,
  alpha: number,
  rgb = '0,0,0',
): void {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = `rgba(${rgb},${Math.random() * alpha})`;
    ctx.fillRect(
      Math.random() * w,
      Math.random() * h,
      Math.random() * 4 + 1,
      Math.random() * 4 + 1,
    );
  }
}

export function createCanvasTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  maxAnisotropy = 4,
  rx = 1,
  ry = 1,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    draw(ctx, w, h);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(rx, ry);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.max(1, maxAnisotropy);
  return tex;
}

export function createWallTexture(
  wallTheme: WallThemeId,
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const theme = WALL_THEMES[wallTheme] ?? WALL_THEMES.classic;
  return createCanvasTexture(
    128,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = theme.topHex;
      ctx.fillRect(0, 0, w, h);
      const splitY = Math.floor(h * 0.54);
      ctx.fillStyle = theme.bottomHex;
      ctx.fillRect(0, splitY, w, h - splitY);

      // Vertical wainscoting paneling grooves on lower half
      ctx.fillStyle = 'rgba(0,0,0,0.09)';
      for (let px = 8; px < w; px += 16) {
        ctx.fillRect(px, splitY + 8, 2, h - splitY - 12);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      for (let px = 10; px < w; px += 16) {
        ctx.fillRect(px, splitY + 8, 1, h - splitY - 12);
      }

      // Chair rail molding stripe with top highlight and bottom shadow
      ctx.fillStyle = theme.stripeHex;
      ctx.fillRect(0, splitY - 3, w, 8);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(0, splitY - 3, w, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(0, splitY + 5, w, 3);

      addNoise(ctx, w, h, 850, 0.085);
    },
    maxAnisotropy,
  );
}

export function createRugTexture(
  rugTheme: RugThemeId,
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const t = RUG_THEMES[rugTheme] ?? RUG_THEMES.kilim;
  return createCanvasTexture(
    256,
    384,
    (ctx, w, h) => {
      ctx.fillStyle = t.primary;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = t.border;
      ctx.lineWidth = 10;
      ctx.strokeRect(14, 14, w - 28, h - 28);

      ctx.strokeStyle = t.accent;
      ctx.lineWidth = 4;
      ctx.strokeRect(28, 28, w - 56, h - 56);

      // Center geometric diamond motif
      ctx.fillStyle = t.accent;
      ctx.beginPath();
      ctx.moveTo(w / 2, 72);
      ctx.lineTo(w - 56, h / 2);
      ctx.lineTo(w / 2, h - 72);
      ctx.lineTo(56, h / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = t.border;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = t.border;
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2 - 36);
      ctx.lineTo(w / 2 + 28, h / 2);
      ctx.lineTo(w / 2, h / 2 + 36);
      ctx.lineTo(w / 2 - 28, h / 2);
      ctx.closePath();
      ctx.fill();

      addNoise(ctx, w, h, 900, 0.14);
    },
    maxAnisotropy,
  );
}

export function createShopSignboardTexture(
  shopName: string,
  signTheme: SignThemeId,
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const s = SIGN_THEMES[signTheme] ?? SIGN_THEMES.green;
  return createCanvasTexture(
    512,
    128,
    (ctx, w, h) => {
      ctx.fillStyle = s.bgHex;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = s.borderHex;
      ctx.lineWidth = 6;
      ctx.strokeRect(8, 8, w - 16, h - 16);

      ctx.fillStyle = s.textHex;
      const safeName = (shopName.trim() || 'Mahalle Nalburu').slice(0, 22);
      ctx.font = safeName.length > 16 ? 'bold 34px Georgia, serif' : 'bold 40px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(safeName.toUpperCase(), w / 2, 68);

      ctx.font = '18px Georgia, serif';
      ctx.fillStyle = s.borderHex;
      ctx.fillText('HIRDAVAT · BOYA · TESİSAT · ELEKTRİK', w / 2, 102);
    },
    maxAnisotropy,
  );
}

export function createPosterTexture(
  posterId: PosterId,
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const p = POSTER_THEMES[posterId];
  return createCanvasTexture(
    256,
    320,
    (ctx, w, h) => {
      ctx.fillStyle = p.bgHex;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = p.inkHex;
      ctx.lineWidth = 6;
      ctx.strokeRect(12, 12, w - 24, h - 24);
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, w - 40, h - 40);

      ctx.fillStyle = p.inkHex;
      ctx.textAlign = 'center';
      ctx.font = 'bold 20px Georgia, serif';
      const words = p.title.split(' ');
      let line = '';
      let y = 105;
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > w - 64) {
          ctx.fillText(line, w / 2, y);
          line = word;
          y += 30;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, w / 2, y);

      ctx.font = 'italic 16px Georgia, serif';
      ctx.fillText(p.subtitle.slice(0, 28), w / 2, h - 66);
      addNoise(ctx, w, h, 260, 0.08);
    },
    maxAnisotropy,
  );
}

export function createShopTextures(maxAnisotropy: number) {
  const wood = createCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = '#9c6c40';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 70; i++) {
        ctx.strokeStyle = `rgba(55,28,10,${0.07 + Math.random() * 0.16})`;
        ctx.beginPath();
        const y = Math.random() * h;
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(
          w * 0.3,
          y + Math.random() * 8 - 4,
          w * 0.6,
          y + Math.random() * 8 - 4,
          w,
          y + Math.random() * 5 - 2,
        );
        ctx.stroke();
      }
      addNoise(ctx, w, h, 350, 0.22);
    },
    maxAnisotropy,
  );

  const floor = createCanvasTexture(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = '#8a7a62';
      ctx.fillRect(0, 0, w, h);
      const s = w / 4;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          const l = 62 + Math.random() * 7;
          ctx.fillStyle = `hsl(36,22%,${l}%)`;
          ctx.fillRect(i * s + 3, j * s + 3, s - 6, s - 6);
        }
      }
      addNoise(ctx, w, h, 1800, 0.12);
      for (let k = 0; k < 40; k++) {
        ctx.fillStyle = 'rgba(70,50,30,0.06)';
        ctx.beginPath();
        ctx.arc(
          Math.random() * w,
          Math.random() * h,
          20 + Math.random() * 50,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    },
    maxAnisotropy,
    4,
    5,
  );

  const wall = createWallTexture('classic', maxAnisotropy);

  const ceiling = createCanvasTexture(
    64,
    64,
    (ctx, w, h) => {
      ctx.fillStyle = '#d8c8a0';
      ctx.fillRect(0, 0, w, h);
      addNoise(ctx, w, h, 200, 0.1);
    },
    maxAnisotropy,
    3,
    3,
  );

  const pegboard = createCanvasTexture(
    128,
    128,
    (ctx, w, h) => {
      ctx.fillStyle = '#b78a56';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(60,35,15,0.55)';
      for (let i = 4; i < w; i += 8) {
        for (let j = 4; j < h; j += 8) {
          ctx.beginPath();
          ctx.arc(i, j, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      addNoise(ctx, w, h, 200, 0.15);
    },
    maxAnisotropy,
    3,
    2,
  );

  const calendar = createCanvasTexture(
    128,
    160,
    (ctx, w, h) => {
      ctx.fillStyle = '#f4ecd8';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#b5402f';
      ctx.fillRect(0, 0, w, 46);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('NİSAN', w / 2, 32);
      ctx.fillStyle = '#3a2a18';
      ctx.font = 'bold 68px Georgia, serif';
      ctx.fillText('14', w / 2, 114);
      ctx.font = '16px Georgia, serif';
      ctx.fillText('2013', w / 2, 144);
    },
    maxAnisotropy,
  );

  const sunbeam = createCanvasTexture(
    64,
    128,
    (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, 'rgba(255,235,180,0)');
      g.addColorStop(0.5, 'rgba(255,235,180,0.9)');
      g.addColorStop(1, 'rgba(255,235,180,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      const v = ctx.createLinearGradient(0, 0, 0, h);
      v.addColorStop(0, 'rgba(0,0,0,0.2)');
      v.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, w, h);
    },
    maxAnisotropy,
  );

  return {
    wood,
    floor,
    wall,
    ceiling,
    pegboard,
    calendar,
    sunbeam,
  };
}

export function createSignTexture(
  title: string,
  maxAnisotropy: number,
): THREE.CanvasTexture {
  return createCanvasTexture(
    256,
    64,
    (ctx, w, h) => {
      ctx.fillStyle = '#2f4a36';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#d9b765';
      ctx.lineWidth = 3;
      ctx.strokeRect(5, 5, w - 10, h - 10);
      ctx.fillStyle = '#f0e0b0';
      ctx.font = 'bold 28px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, w / 2, 42);
    },
    maxAnisotropy,
  );
}

export function createLabelTexture(
  text: string,
  maxAnisotropy: number,
): THREE.CanvasTexture {
  return createCanvasTexture(
    512,
    44,
    (ctx, w, h) => {
      ctx.fillStyle = '#e9dcb8';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#8b6a3e';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, w - 4, h - 4);
      ctx.fillStyle = '#3a2a18';
      ctx.font = 'bold 25px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, w / 2, 31);
    },
    maxAnisotropy,
  );
}

export function createContactShadowTexture(
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const tex = createCanvasTexture(
    128,
    128,
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(14, 9, 5, 0.44)');
      g.addColorStop(0.55, 'rgba(14, 9, 5, 0.22)');
      g.addColorStop(1, 'rgba(14, 9, 5, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
    maxAnisotropy,
  );
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

export function createClockFaceTexture(
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const tex = createCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      const cx = w / 2;
      const cy = h / 2;
      ctx.fillStyle = '#f5ebd1';
      ctx.beginPath();
      ctx.arc(cx, cy, 122, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#4f351e';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, 114, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const r1 = i % 3 === 0 ? 86 : 95;
        const r2 = 106;
        ctx.strokeStyle = '#3b2615';
        ctx.lineWidth = i % 3 === 0 ? 4 : 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
        ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2);
        ctx.stroke();
      }

      ctx.fillStyle = '#3b2615';
      ctx.font = 'bold 24px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('12', cx, 48);
      ctx.fillText('3', w - 46, cy);
      ctx.fillText('6', cx, h - 46);
      ctx.fillText('9', 46, cy);

      ctx.fillStyle = '#8b5e2b';
      ctx.font = 'bold 12px Georgia, serif';
      ctx.fillText('NALBUR', cx, cy + 36);
    },
    maxAnisotropy,
  );
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

export function createLampHaloTexture(
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const tex = createCanvasTexture(
    128,
    128,
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(255, 224, 155, 0.42)');
      g.addColorStop(0.45, 'rgba(255, 200, 115, 0.14)');
      g.addColorStop(1, 'rgba(255, 190, 90, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
    maxAnisotropy,
  );
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

export function createCorkBoardTexture(
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const tex = createCanvasTexture(
    256,
    192,
    (ctx, w, h) => {
      ctx.fillStyle = '#9b6b3e';
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 420; i++) {
        const x = (i * 53) % w;
        const y = (i * 37) % h;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(65, 38, 18, 0.2)' : 'rgba(218, 174, 118, 0.22)';
        ctx.fillRect(x, y, 2 + (i % 3), 2);
      }

      ctx.fillStyle = '#2d1c10';
      ctx.fillRect(18, 10, w - 36, 26);
      ctx.strokeStyle = '#d9a952';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(18, 10, w - 36, 26);
      ctx.fillStyle = '#f4dfb0';
      ctx.font = 'bold 14px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('MAHALLE İLAN PANOSU', w / 2, 23);
    },
    maxAnisotropy,
  );
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}




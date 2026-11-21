import type { FC } from 'react';

interface StartOverlayProps {
  hasSavedProgress: boolean;
  onStart: () => void;
  onReset: () => void;
}

export const StartOverlay: FC<StartOverlayProps> = ({
  hasSavedProgress,
  onStart,
  onReset,
}) => {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-6"
      style={{
        background:
          'radial-gradient(ellipse at center, rgba(64, 42, 22, 0.90) 0%, rgba(18, 11, 6, 0.97) 100%)',
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#d9a952]/30 bg-[#23170d]/95 p-8 text-center shadow-2xl">
        <p className="text-xs font-medium tracking-wide text-[#d9a952]/80">
          Birinci Şahıs Nalbur Simülatörü
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold text-[#f3dfb0] text-balance sm:text-5xl">
          Mahalle Nalburu
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#e8d7b8]/90 sm:text-base">
          Dükkânın anahtarı artık sende. Kapıya dönük tezgâhının başına geç,
          müşterilerin istediği ürünleri getir, kasada poşetleyip para üstünü
          ver ve toptancıdan yeni mallar sipariş et.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 border-y border-[#d9a952]/15 py-4 text-left text-xs text-[#dfd0b4]/85">
          <div>
            <span className="font-semibold text-[#e8b45a]">WASD / Oklar</span> · Yürü (Shift: Koş)
          </div>
          <div>
            <span className="font-semibold text-[#e8b45a]">Tıkla veya E</span> · Al / Ver / Depo / Otur
          </div>
          <div>
            <span className="font-semibold text-[#e8b45a]">G / H / F / B / L / N</span> · Dükkân / Tezgâh / Yetenek / Toptancı / Defter / Pano
          </div>
          <div>
            <span className="font-semibold text-[#e8b45a]">R / C / Q / M / K</span> · Raf Sil / Çay / Geri / Radyo / Kapanış
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onStart}
            className="whitespace-nowrap rounded-lg border border-[#e8b45a] bg-[#e8b45a] px-7 py-3 text-sm font-semibold text-[#1f140b] transition-colors hover:bg-[#f0c575] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8b45a]"
          >
            {hasSavedProgress ? 'Dükkânı Aç (Devam Et)' : 'Dükkânı Aç'}
          </button>

          {hasSavedProgress && (
            <button
              type="button"
              onClick={onReset}
              className="whitespace-nowrap rounded-lg border border-[#d9a952]/30 px-5 py-3 text-sm font-medium text-[#e8d7b8] transition-colors hover:border-[#e8907a]/60 hover:text-[#e8907a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8b45a]"
            >
              Yeni Oyun Başlat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

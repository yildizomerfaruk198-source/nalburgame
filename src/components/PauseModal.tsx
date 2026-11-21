import type { FC } from 'react';
import type { GameSettings, LookPreference } from '../game/types';

interface PauseModalProps {
  settings: GameSettings;
  onResume: () => void;
  onSave: () => void;
  onReset: () => void;
  onSensitivityChange: (val: number) => void;
  onVolumeChange: (val: number) => void;
  onLookPreferenceChange: (pref: LookPreference) => void;
}

export const PauseModal: FC<PauseModalProps> = ({
  settings,
  onResume,
  onSave,
  onReset,
  onSensitivityChange,
  onVolumeChange,
  onLookPreferenceChange,
}) => {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onResume();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-title"
        className="w-full max-w-sm rounded-2xl border border-[#d9a952]/40 bg-[#22160d] p-6 text-[#f4ead5] shadow-2xl"
      >
        <h2 id="pause-title" className="font-display text-center text-2xl font-semibold text-[#e8b45a]">
          Duraklatıldı
        </h2>

        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="whitespace-nowrap rounded-lg border border-[#e8b45a] bg-[#e8b45a] px-5 py-2 text-sm font-semibold text-[#1f140b] transition-colors hover:bg-[#f0c575]"
          >
            Devam Et
          </button>
          <button
            type="button"
            onClick={onSave}
            className="whitespace-nowrap rounded-lg border border-[#d9a952]/40 px-4 py-2 text-sm font-medium text-[#e8b45a] transition-colors hover:bg-[#3a2716]"
          >
            Kaydet
          </button>
        </div>

        <div className="mt-6 space-y-4 border-t border-[#d9a952]/20 pt-5 text-sm">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs text-[#dfd0b4]/85">
              <span>Kamera Kontrol Modu</span>
            </div>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#160e08] p-1">
              <button
                type="button"
                onClick={() => onLookPreferenceChange('auto')}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  settings.lookPreference === 'auto'
                    ? 'bg-[#e8b45a] text-[#1f140b]'
                    : 'text-[#dfd0b4]/75 hover:text-[#f4ead5]'
                }`}
              >
                FPS Kilidi (Otomatik)
              </button>
              <button
                type="button"
                onClick={() => onLookPreferenceChange('drag')}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  settings.lookPreference === 'drag'
                    ? 'bg-[#e8b45a] text-[#1f140b]'
                    : 'text-[#dfd0b4]/75 hover:text-[#f4ead5]'
                }`}
              >
                Serbest İmleç
              </button>
            </div>
            <p className="mt-1.5 text-[11px] leading-snug text-[#dfd0b4]/60">
              Kısayollar: H Usta Tezgâhı · G Dükkân & Çırak · N İlan Panosu · R Raf Sil · C Çay · L Defter · F Yetenek · B Toptancı · M Radyo · K Kapanış · V Bakış
            </p>
          </div>

          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs text-[#dfd0b4]/85">
              <span>Fare Hassasiyeti</span>
              <span className="font-mono-num text-[#e8b45a]">{settings.sensitivity.toFixed(1)}×</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2"
              step="0.1"
              value={settings.sensitivity}
              onChange={(e) => onSensitivityChange(Number(e.target.value))}
              className="w-full accent-[#e8b45a]"
            />
          </label>

          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs text-[#dfd0b4]/85">
              <span>Ses Seviyesi</span>
              <span className="font-mono-num text-[#e8b45a]">{Math.round(settings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-full accent-[#e8b45a]"
            />
          </label>
        </div>

        <div className="mt-6 border-t border-[#d9a952]/20 pt-4 text-center">
          <button
            type="button"
            onClick={onReset}
            className="whitespace-nowrap rounded-lg border border-[#e8907a]/40 px-4 py-2 text-xs font-medium text-[#e8907a] transition-colors hover:bg-[#3a1d17]"
          >
            Yeni Oyun (Kaydı Sil)
          </button>
          <p className="mt-2 text-[11px] text-[#dfd0b4]/60">
            İlerleme tarayıcında otomatik olarak kaydedilir.
          </p>
        </div>
      </div>
    </div>
  );
};

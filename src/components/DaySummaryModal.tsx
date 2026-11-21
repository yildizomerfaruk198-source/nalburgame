import type { FC } from 'react';
import { SEASON_META, WEATHER_META } from '../game/catalog';
import type { DaySummaryData } from '../game/types';

interface DaySummaryModalProps {
  summary: DaySummaryData;
  onStartNextDay: () => void;
}

export const DaySummaryModal: FC<DaySummaryModalProps> = ({
  summary,
  onStartNextDay,
}) => {
  const netPositive = summary.netProfit >= 0;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/75 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-summary-title"
        className="w-full max-w-md rounded-2xl border border-[#d9a952]/45 bg-[#22160d] p-6 text-[#f4ead5] shadow-2xl"
      >
        <p className="text-xs font-medium text-[#e8b45a]">
          Gün {summary.day} Kapanış Raporu
          {summary.season && summary.weather
            ? ` · ${SEASON_META[summary.season].label} · ${WEATHER_META[summary.weather].label}`
            : ''}
        </p>
        <h2 id="day-summary-title" className="font-display mt-1 text-2xl font-semibold text-[#f3dfb0]">
          Kepenkler Kapandı
        </h2>

        <div className="mt-5 space-y-2.5 border-y border-[#d9a952]/20 py-4 text-sm">
          <div className="flex justify-between">
            <span className="text-[#dfd0b4]/80">Memnun Müşteri / Kaçan</span>
            <span className="font-mono-num">
              <strong className="text-[#9fd39a]">{summary.customersServed}</strong>
              <span className="mx-1.5 opacity-50">/</span>
              <span className={summary.customersLost > 0 ? 'text-[#e8907a]' : 'text-[#dfd0b4]/70'}>
                {summary.customersLost}
              </span>
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#dfd0b4]/80">Günlük Satış Cirosu</span>
            <span className="font-mono-num font-semibold text-[#9fd39a]">+{summary.revenue} ₺</span>
          </div>

          {summary.veresiyeCollected > 0 && (
            <div className="flex justify-between">
              <span className="text-[#dfd0b4]/80">Tahsil Edilen Veresiye</span>
              <span className="font-mono-num font-semibold text-[#9fd39a]">
                +{summary.veresiyeCollected} ₺
              </span>
            </div>
          )}

          {summary.veresiyeWritten > 0 && (
            <div className="flex justify-between">
              <span className="text-[#dfd0b4]/80">Deftere Yazılan Veresiye</span>
              <span className="font-mono-num text-[#e8b45a]">
                {summary.veresiyeWritten} ₺ (Vadeli)
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-[#dfd0b4]/80">Toptancı Siparişleri</span>
            <span className="font-mono-num text-[#e8907a]">−{summary.wholesaleSpent} ₺</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#dfd0b4]/80">Dükkân Kirası</span>
            <span className="font-mono-num text-[#e8907a]">−{summary.rentCost} ₺</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#dfd0b4]/80">Elektrik & Su Faturası</span>
            <span className="font-mono-num text-[#e8907a]">−{summary.utilityCost} ₺</span>
          </div>

          {summary.apprenticeWage > 0 && (
            <div className="flex justify-between">
              <span className="text-[#dfd0b4]/80">Çırak Maaşı (Yusuf)</span>
              <span className="font-mono-num text-[#e8907a]">−{summary.apprenticeWage} ₺</span>
            </div>
          )}

          <div className="flex justify-between border-t border-[#d9a952]/15 pt-2.5 text-base font-semibold">
            <span>Net Günlük Kâr</span>
            <span className={`font-mono-num ${netPositive ? 'text-[#9fd39a]' : 'text-[#e8907a]'}`}>
              {netPositive ? `+${summary.netProfit}` : summary.netProfit} ₺
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          <div className="rounded-xl border border-[#d9a952]/15 bg-[#180f09] p-2.5">
            <div className="text-[11px] text-[#dfd0b4]/65">Memnuniyet</div>
            <div className="font-mono-num mt-0.5 text-sm font-semibold text-[#e8b45a]">
              %{summary.satisfactionAvg}
            </div>
          </div>
          <div className="rounded-xl border border-[#d9a952]/15 bg-[#180f09] p-2.5">
            <div className="text-[11px] text-[#dfd0b4]/65">Temizlik</div>
            <div
              className={`font-mono-num mt-0.5 text-sm font-semibold ${
                summary.cleanlinessAvg >= 88
                  ? 'text-[#9fd39a]'
                  : summary.cleanlinessAvg >= 55
                    ? 'text-[#e8b45a]'
                    : 'text-[#e8907a]'
              }`}
            >
              %{summary.cleanlinessAvg}
            </div>
          </div>
          <div className="rounded-xl border border-[#d9a952]/15 bg-[#180f09] p-2.5">
            <div className="text-[11px] text-[#dfd0b4]/65">İtibar</div>
            <div className="font-mono-num mt-0.5 text-sm font-semibold text-[#9fd39a]">
              {summary.reputationAfter}{' '}
              <span className="text-[11px]">
                ({summary.reputationDelta >= 0 ? `+${summary.reputationDelta}` : summary.reputationDelta})
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-[#d9a952]/15 bg-[#180f09] p-2.5">
            <div className="text-[11px] text-[#dfd0b4]/65">Kasa</div>
            <div
              className={`font-mono-num mt-0.5 text-sm font-semibold ${
                summary.moneyAfter >= 0 ? 'text-[#f4ead5]' : 'text-[#e8907a]'
              }`}
            >
              {summary.moneyAfter} ₺
            </div>
          </div>
        </div>

        {summary.eventOutcomeText && (
          <p
            className={`mt-3 text-center text-xs font-medium ${
              (summary.eventDeltaMoney ?? 0) < 0 ? 'text-[#e8907a]' : 'text-[#9fd39a]'
            }`}
          >
            {summary.eventOutcomeText}
          </p>
        )}

        {(summary.contractsCompletedToday ?? 0) > 0 && (
          <p className="mt-2 text-center text-xs text-[#9fd39a]">
            Bugün {summary.contractsCompletedToday} toplu mahalle ihalesi teslim edildi.
          </p>
        )}

        {summary.pendingDeliveryCount > 0 && (
          <p className="mt-3 text-center text-xs text-[#9fd39a]">
            Yarın sabah kapında {summary.pendingDeliveryCount} adet ürün kolisi teslim edilecek.
          </p>
        )}

        {summary.readyToCollectCount > 0 && (
          <p className="mt-2 text-center text-xs text-[#e8b45a]">
            Veresiye defterinde {summary.readyToCollectCount} tahsilat bekliyor.
          </p>
        )}

        {summary.creditDebt > 0 && (
          <p className="mt-2 text-center text-xs text-[#e8907a]">
            Esnaf borcun: {summary.creditDebt} ₺ · Satışlarla kasanı toparlayabilirsin.
          </p>
        )}

        <button
          type="button"
          onClick={onStartNextDay}
          className="mt-6 w-full rounded-xl border border-[#e8b45a] bg-[#e8b45a] py-3 text-sm font-semibold text-[#1f140b] transition-colors hover:bg-[#f0c575]"
        >
          Yeni Güne Başla (Gün {summary.day + 1} · 08:00)
        </button>
      </div>
    </div>
  );
};

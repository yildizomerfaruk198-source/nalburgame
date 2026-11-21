import { useMemo, useState, type FC } from 'react';
import { Minus, Package, Plus, Tag, Truck, X, Zap } from 'lucide-react';
import {
  CATEGORIES,
  ITEM_KEY,
  MAX_CREDIT_DEBT,
  getBulkDiscountRate,
  getSuggestedPrice,
} from '../game/catalog';
import type { MarketItemState, OrderCartLine } from '../game/types';

interface WholesaleModalProps {
  money: number;
  categoryLevels: number[];
  ownedShelves: boolean[];
  market: MarketItemState[];
  customPrices: Record<string, number>;
  reserveStock: Record<string, number>;
  tierStockCounts: Record<string, number>;
  pendingOrders: Record<string, number>;
  onPlaceOrder: (lines: OrderCartLine[], urgentCourier: boolean) => boolean;
  onSetPrice: (cat: number, tier: number, price: number) => void;
  onRefillFromReserve: () => void;
  onClose: () => void;
}

export const WholesaleModal: FC<WholesaleModalProps> = ({
  money,
  categoryLevels,
  ownedShelves,
  market,
  customPrices,
  reserveStock,
  tierStockCounts,
  pendingOrders,
  onPlaceOrder,
  onSetPrice,
  onRefillFromReserve,
  onClose,
}) => {
  const [tab, setTab] = useState<'order' | 'pricing'>('order');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [urgentCourier, setUrgentCourier] = useState(false);

  const unlockedRows = useMemo(() => {
    const rows: Array<{
      cat: number;
      tier: number;
      key: string;
      categoryName: string;
      itemName: string;
      marketItem: MarketItemState;
      sellPrice: number;
      suggestedPrice: number;
      hasShelf: boolean;
      onShelf: number;
      reserve: number;
      pending: number;
    }> = [];

    for (let c = 0; c < CATEGORIES.length; c++) {
      const lv = categoryLevels[c] ?? 0;
      const hasShelf = ownedShelves[c] ?? false;
      for (let t = 1; t <= lv; t++) {
        const key = ITEM_KEY(c, t);
        const m = market.find((x) => x.cat === c && x.tier === t);
        if (!m) continue;
        const reserve = reserveStock[key] ?? 0;
        const totalStock = tierStockCounts[key] ?? 0;
        rows.push({
          cat: c,
          tier: t,
          key,
          categoryName: CATEGORIES[c].name,
          itemName: CATEGORIES[c].names[t - 1],
          marketItem: m,
          sellPrice: customPrices[key] ?? getSuggestedPrice(c, t),
          suggestedPrice: getSuggestedPrice(c, t),
          hasShelf,
          onShelf: hasShelf ? Math.max(0, totalStock - reserve) : 0,
          reserve,
          pending: pendingOrders[key] ?? 0,
        });
      }
    }
    return rows;
  }, [categoryLevels, ownedShelves, market, customPrices, reserveStock, tierStockCounts, pendingOrders]);

  const totalReserve = useMemo(
    () => Object.values(reserveStock).reduce((a, b) => a + b, 0),
    [reserveStock],
  );

  const cartSummary = useMemo(() => {
    let totalQty = 0;
    let subtotal = 0;
    const lines: OrderCartLine[] = [];

    for (const row of unlockedRows) {
      const qty = cart[row.key] ?? 0;
      if (qty > 0) {
        totalQty += qty;
        subtotal += row.marketItem.unitCost * qty;
        lines.push({ cat: row.cat, tier: row.tier, qty });
      }
    }

    const bulkRate = getBulkDiscountRate(totalQty);
    const afterBulk = Math.round(subtotal * (1 - bulkRate));
    const courierFee = urgentCourier ? Math.round(afterBulk * 0.25) : 0;
    const finalTotal = afterBulk + courierFee;
    const canAfford = money - finalTotal >= -MAX_CREDIT_DEBT;

    return {
      totalQty,
      subtotal,
      bulkRate,
      courierFee,
      finalTotal,
      lines,
      canAfford,
    };
  }, [cart, unlockedRows, urgentCourier, money]);

  const adjustQty = (key: string, delta: number) => {
    setCart((prev) => {
      const next = Math.max(0, Math.min(24, (prev[key] ?? 0) + delta));
      if (next === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: next };
    });
  };

  const handleSubmitOrder = () => {
    if (cartSummary.lines.length === 0) return;
    const ok = onPlaceOrder(cartSummary.lines, urgentCourier);
    if (ok) {
      setCart({});
    }
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wholesale-title"
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#d9a952]/40 bg-[#22160d] text-[#f4ead5] shadow-2xl"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d9a952]/20 px-6 py-4">
          <div>
            <h2 id="wholesale-title" className="font-display text-2xl font-semibold text-[#e8b45a]">
              Toptancı & Raf Fiyatları
            </h2>
            <p className="mt-0.5 text-xs text-[#dfd0b4]/75">
              Kasa: <span className="font-mono-num font-semibold text-[#e8b45a]">{money} ₺</span>
              <span className="mx-2 opacity-50">·</span>
              Esnaf Limiti: <span className="font-mono-num">−{MAX_CREDIT_DEBT} ₺</span>
              {totalReserve > 0 && (
                <>
                  <span className="mx-2 opacity-50">·</span>
                  Depo Yedeği: <span className="font-mono-num text-[#9fd39a]">{totalReserve} adet</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {totalReserve > 0 && (
              <button
                type="button"
                onClick={onRefillFromReserve}
                className="whitespace-nowrap rounded-lg border border-[#9fd39a]/50 bg-[#233220] px-3 py-2 text-xs font-medium text-[#b9e6b4] transition-colors hover:bg-[#2c3f28]"
              >
                Depodan Rafa Diz ({totalReserve})
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d9a952]/30 text-[#e8b45a] transition-colors hover:bg-[#3a2716]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Segmented Tabs */}
        <div className="flex items-center justify-between gap-4 border-b border-[#d9a952]/15 bg-[#1b110a] px-6 py-2.5">
          <div className="flex items-center gap-1 rounded-lg bg-[#130c07] p-1">
            <button
              type="button"
              onClick={() => setTab('order')}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                tab === 'order'
                  ? 'bg-[#e8b45a] text-[#1f140b]'
                  : 'text-[#dfd0b4]/75 hover:text-[#f4ead5]'
              }`}
            >
              <Truck className="h-3.5 w-3.5" />
              <span>Toptancı Siparişi</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('pricing')}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                tab === 'pricing'
                  ? 'bg-[#e8b45a] text-[#1f140b]'
                  : 'text-[#dfd0b4]/75 hover:text-[#f4ead5]'
              }`}
            >
              <Tag className="h-3.5 w-3.5" />
              <span>Raf Fiyatlarını Belirle</span>
            </button>
          </div>

          <div className="hidden text-xs text-[#dfd0b4]/70 sm:block">
            {tab === 'order'
              ? '4+ adet %10 · 8+ adet %15 toplu alım indirimi'
              : 'Uygun fiyat müşteriyi çeker · Yüksek fiyat kârı artırır'}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tab === 'order' ? (
            <div className="space-y-2.5">
              {unlockedRows.map((row) => {
                const { marketItem } = row;
                const isOut = marketItem.status === 'out_of_stock';
                const qty = cart[row.key] ?? 0;

                let marketNote = 'Normal piyasa';
                let marketTone = 'text-[#dfd0b4]/65';
                if (marketItem.status === 'discount') {
                  marketNote = 'Fırsat (−%20)';
                  marketTone = 'text-[#9fd39a]';
                } else if (marketItem.status === 'surge') {
                  marketNote = 'Zamlı (+%20)';
                  marketTone = 'text-[#e8907a]';
                } else if (isOut) {
                  marketNote = 'Stokta Yok';
                  marketTone = 'text-[#e8907a]';
                }

                return (
                  <div
                    key={row.key}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d9a952]/20 bg-[#2a1c11] px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-sm font-semibold capitalize text-[#f4ead5]">
                          {row.itemName}
                        </span>
                        <span className="text-xs text-[#dfd0b4]/60">
                          {row.categoryName}
                        </span>
                        <span className="text-xs text-[#dfd0b4]/45">·</span>
                        <span className={`text-xs font-medium ${marketTone}`}>
                          {marketNote}
                        </span>
                      </div>
                      <div className="font-mono-num mt-1 flex flex-wrap items-center gap-3 text-xs text-[#dfd0b4]/75">
                        <span>Alış: <strong className="text-[#e8b45a]">{marketItem.unitCost} ₺</strong></span>
                        <span>Satışın: {row.sellPrice} ₺</span>
                        {row.hasShelf ? (
                          <span className={row.onShelf > 0 ? 'text-[#9fd39a]' : 'text-[#e8907a]'}>
                            Rafta: {row.onShelf}/4
                          </span>
                        ) : (
                          <span className="text-[#e8b45a]">Raf Kurulmadı (G)</span>
                        )}
                        {row.reserve > 0 && <span className="text-[#9fd39a]">Depo: {row.reserve}</span>}
                        {row.pending > 0 && <span className="text-[#e8b45a]">Yolda: {row.pending}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isOut || qty === 0}
                        onClick={() => adjustQty(row.key, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d9a952]/30 bg-[#1c120b] text-[#f4ead5] transition-colors hover:bg-[#3a2716] disabled:opacity-35"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-mono-num w-8 text-center text-sm font-semibold">
                        {qty}
                      </span>
                      <button
                        type="button"
                        disabled={isOut}
                        onClick={() => adjustQty(row.key, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d9a952]/30 bg-[#1c120b] text-[#f4ead5] transition-colors hover:bg-[#3a2716] disabled:opacity-35"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isOut}
                        onClick={() => adjustQty(row.key, 4)}
                        className="font-mono-num whitespace-nowrap rounded-lg border border-[#d9a952]/30 px-2.5 py-1.5 text-xs font-medium text-[#e8b45a] transition-colors hover:bg-[#3a2716] disabled:opacity-35"
                      >
                        +4 Koli
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2.5">
              {unlockedRows.map((row) => {
                const ratio = row.sellPrice / row.suggestedPrice;
                let demandText = 'Dengeli talep';
                let demandColor = 'text-[#dfd0b4]/80';
                if (ratio <= 0.92) {
                  demandText = 'Yüksek talep · Hızlı itibar';
                  demandColor = 'text-[#9fd39a]';
                } else if (ratio >= 1.28) {
                  demandText = 'Pahalı · Müşteri vazgeçebilir';
                  demandColor = 'text-[#e8907a]';
                } else if (ratio > 1.1) {
                  demandText = 'Kârlı · Biraz yavaş talep';
                  demandColor = 'text-[#e8b45a]';
                }

                const minP = Math.max(3, Math.round(row.suggestedPrice * 0.65));
                const maxP = Math.round(row.suggestedPrice * 1.65);

                return (
                  <div
                    key={row.key}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d9a952]/20 bg-[#2a1c11] px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold capitalize">{row.itemName}</span>
                        <span className="text-xs text-[#dfd0b4]/60">
                          Önerilen: <span className="font-mono-num">{row.suggestedPrice} ₺</span>
                        </span>
                      </div>
                      <p className={`mt-0.5 text-xs ${demandColor}`}>{demandText}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={row.sellPrice <= minP}
                        onClick={() => onSetPrice(row.cat, row.tier, row.sellPrice - 2)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d9a952]/30 bg-[#1c120b] hover:bg-[#3a2716] disabled:opacity-35"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-mono-num w-16 text-center text-sm font-semibold text-[#e8b45a]">
                        {row.sellPrice} ₺
                      </span>
                      <button
                        type="button"
                        disabled={row.sellPrice >= maxP}
                        onClick={() => onSetPrice(row.cat, row.tier, row.sellPrice + 2)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d9a952]/30 bg-[#1c120b] hover:bg-[#3a2716] disabled:opacity-35"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetPrice(row.cat, row.tier, row.suggestedPrice)}
                        className="whitespace-nowrap rounded-lg border border-[#d9a952]/25 px-2.5 py-1.5 text-xs text-[#dfd0b4]/80 hover:bg-[#3a2716]"
                      >
                        Sıfırla
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Cart Checkout */}
        {tab === 'order' && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#d9a952]/20 bg-[#1b110a] px-6 py-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setUrgentCourier((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-medium transition-colors ${
                    urgentCourier
                      ? 'border-[#e8b45a] bg-[#4a3217] text-[#fff2d4]'
                      : 'border-[#d9a952]/25 bg-[#24180f] text-[#dfd0b4]/80 hover:text-[#f4ead5]'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 text-[#e8b45a]" />
                  <span>
                    {urgentCourier
                      ? 'Acil Motor Kurye (+%25 · Hemen Kapıda)'
                      : 'Ertesi Sabah Teslimat (Ücretsiz)'}
                  </span>
                </button>
              </div>
              {cartSummary.totalQty > 0 && (
                <p className="font-mono-num text-xs text-[#dfd0b4]/75">
                  {cartSummary.totalQty} ürün
                  {cartSummary.bulkRate > 0 && (
                    <span className="text-[#9fd39a]">
                      {' '}
                      · Toplu indirim −%{Math.round(cartSummary.bulkRate * 100)}
                    </span>
                  )}
                  {cartSummary.courierFee > 0 && (
                    <span className="text-[#e8b45a]">
                      {' '}
                      · Kurye +{cartSummary.courierFee} ₺
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] text-[#dfd0b4]/65">Sipariş Tutarı</div>
                <div className="font-mono-num text-lg font-semibold text-[#e8b45a]">
                  {cartSummary.finalTotal} ₺
                </div>
              </div>
              <button
                type="button"
                disabled={cartSummary.lines.length === 0 || !cartSummary.canAfford}
                onClick={handleSubmitOrder}
                className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-[#e8b45a] bg-[#e8b45a] px-5 py-2.5 text-sm font-semibold text-[#1f140b] transition-colors hover:bg-[#f0c575] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Package className="h-4 w-4" />
                <span>Sipariş Ver</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

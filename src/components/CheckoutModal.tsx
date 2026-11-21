import { useState, type FC } from 'react';
import { BookOpen, Check, Handshake, RotateCcw, ShoppingBag } from 'lucide-react';
import type { CheckoutSession } from '../game/types';

interface CheckoutModalProps {
  session: CheckoutSession;
  onPlaySound: (kind: 'bag' | 'coin' | 'nope') => void;
  onResolveHaggle: (agreedPrice: number) => void;
  onCancelHaggleWalkout: () => void;
  onCompleteCash: (bagged: boolean, givenChange: number) => void;
  onCompleteVeresiye: (bagged: boolean) => void;
}

const DENOMINATIONS = [1, 5, 10, 20, 50, 100] as const;

export const CheckoutModal: FC<CheckoutModalProps> = ({
  session,
  onPlaySound,
  onResolveHaggle,
  onCancelHaggleWalkout,
  onCompleteCash,
  onCompleteVeresiye,
}) => {
  const [bagged, setBagged] = useState(false);
  const [givenChange, setGivenChange] = useState(0);

  // Haggling state
  const [haggleRound, setHaggleRound] = useState(1);
  const [customerOffer, setCustomerOffer] = useState(session.initialOffer);
  const [haggleLine, setHaggleLine] = useState(
    `Usta bu ${session.itemName} için ${session.initialOffer} ₺ vereyim, anlaşalım.`,
  );

  const midOffer = Math.max(
    customerOffer + 1,
    Math.round((session.stickerPrice + customerOffer) / 2),
  );

  const handleAcceptCustomerOffer = () => {
    onPlaySound('coin');
    onResolveHaggle(customerOffer);
  };

  const handleProposeMiddle = () => {
    if (midOffer >= session.stickerPrice) {
      onPlaySound('coin');
      onResolveHaggle(session.stickerPrice);
      return;
    }

    // Higher chance to agree if offer is already close or round >= 2
    const ratio = midOffer / Math.max(1, session.stickerPrice);
    const acceptChance = haggleRound >= 2 ? 0.8 : ratio <= 0.9 ? 0.78 : 0.62;

    if (Math.random() < acceptChance) {
      onPlaySound('coin');
      onResolveHaggle(midOffer);
      return;
    }

    const nextOffer = Math.min(
      midOffer - 1,
      Math.max(customerOffer + 1, Math.round((customerOffer + midOffer) / 2)),
    );
    setCustomerOffer(nextOffer);
    setHaggleRound((r) => r + 1);
    onPlaySound('coin');
    setHaggleLine(
      haggleRound >= 2
        ? `Son sözüm ${nextOffer} ₺ usta, daha yukarısı çıkmaz.`
        : `Hadi hatırın için ${nextOffer} ₺ olsun, orta yolu bulalım.`,
    );
  };

  const handleInsistSticker = () => {
    const keepChance = session.personality === 'haggler' ? 0.55 : 0.8;
    if (Math.random() < keepChance) {
      onPlaySound('coin');
      onResolveHaggle(session.stickerPrice);
    } else if (haggleRound >= 2) {
      onCancelHaggleWalkout();
    } else {
      const bumped = Math.min(
        session.stickerPrice - 1,
        Math.max(customerOffer + 2, Math.round((customerOffer + session.stickerPrice) * 0.52)),
      );
      setCustomerOffer(bumped);
      setHaggleRound((r) => r + 1);
      onPlaySound('nope');
      setHaggleLine(`Etiket biraz sert geldi usta, ${bumped} ₺ dersen hemen alayım.`);
    }
  };

  // Phase 1: Haggling view
  if (session.wantsHaggle) {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/65 p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="haggle-title"
          className="w-full max-w-md rounded-2xl border border-[#d9a952]/45 bg-[#22160d] p-6 text-[#f4ead5] shadow-2xl"
        >
          <div className="flex items-baseline justify-between border-b border-[#d9a952]/20 pb-3">
            <div>
              <p className="text-xs text-[#dfd0b4]/70">
                {session.customerName} · {session.personalityLabel}
              </p>
              <h2 id="haggle-title" className="font-display text-2xl font-semibold text-[#e8b45a]">
                Pazarlık Masası
              </h2>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#dfd0b4]/70">Etiket Fiyatı</div>
              <div className="font-mono-num text-xl font-semibold text-[#f4ead5]">
                {session.stickerPrice} ₺
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-[#c8ab75]/45 bg-[#f6ecd4] px-4 py-3 text-[#2c1f12]">
            <div className="text-[11px] font-semibold text-[#7a582b]">
              Tur {haggleRound}/3 · {session.customerName}
            </div>
            <p className="font-display mt-1 text-base font-medium leading-snug">
              “{haggleLine}”
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 text-center">
            <div className="rounded-xl border border-[#d9a952]/20 bg-[#180f09] p-3">
              <div className="text-[11px] text-[#dfd0b4]/65">Müşteri Teklifi</div>
              <div className="font-mono-num mt-0.5 text-lg font-semibold text-[#e8b45a]">
                {customerOffer} ₺
              </div>
            </div>
            <div className="rounded-xl border border-[#d9a952]/20 bg-[#180f09] p-3">
              <div className="text-[11px] text-[#dfd0b4]/65">Orta Yol Önerisi</div>
              <div className="font-mono-num mt-0.5 text-lg font-semibold text-[#9fd39a]">
                {midOffer} ₺
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            <button
              type="button"
              onClick={handleAcceptCustomerOffer}
              className="flex w-full items-center justify-between rounded-xl border border-[#7bc47f]/60 bg-[#243221] px-4 py-3 text-sm font-semibold text-[#e7f3e4] transition-colors hover:bg-[#2e412a]"
            >
              <span className="flex items-center gap-2">
                <Handshake className="h-4 w-4 text-[#9fd39a]" />
                <span>Teklifi Kabul Et</span>
              </span>
              <span className="font-mono-num text-[#9fd39a]">{customerOffer} ₺</span>
            </button>

            {haggleRound < 3 && midOffer < session.stickerPrice && (
              <button
                type="button"
                onClick={handleProposeMiddle}
                className="flex w-full items-center justify-between rounded-xl border border-[#e8b45a] bg-[#4a3217] px-4 py-3 text-sm font-semibold text-[#fff2d4] transition-colors hover:bg-[#5c3f1d]"
              >
                <span>Orta Yol Öner</span>
                <span className="font-mono-num text-[#e8b45a]">{midOffer} ₺</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleInsistSticker}
              className="flex w-full items-center justify-between rounded-xl border border-[#d9a952]/30 bg-[#180f09] px-4 py-2.5 text-sm font-medium text-[#dfd0b4] transition-colors hover:border-[#e8b45a] hover:text-[#f4ead5]"
            >
              <span>Etiket Fiyatında Israr Et {haggleRound >= 2 ? '(Riskli)' : ''}</span>
              <span className="font-mono-num">{session.stickerPrice} ₺</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Phase 2: Bagging + Change or Veresiye
  const remaining = session.changeDue - givenChange;
  const isExact = remaining === 0;
  const isCashReady = bagged && isExact;

  const handleBag = () => {
    if (bagged) return;
    setBagged(true);
    onPlaySound('bag');
  };

  const handleAddBill = (amount: number) => {
    if (givenChange + amount > session.changeDue + 200) {
      onPlaySound('nope');
      return;
    }
    setGivenChange((prev) => prev + amount);
    onPlaySound('coin');
  };

  const handleResetChange = () => {
    setGivenChange(0);
    onPlaySound('coin');
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/65 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        className="w-full max-w-md rounded-2xl border border-[#d9a952]/45 bg-[#22160d] p-6 text-[#f4ead5] shadow-2xl"
      >
        <div className="flex items-baseline justify-between border-b border-[#d9a952]/20 pb-3">
          <div>
            <p className="text-xs text-[#dfd0b4]/70">
              {session.customerName} · {session.personalityLabel}
            </p>
            <h2 id="checkout-title" className="font-display text-2xl font-semibold text-[#e8b45a]">
              Kasa İşlemi
            </h2>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#dfd0b4]/70 capitalize">{session.itemName}</div>
            <div className="font-mono-num text-xl font-semibold text-[#9fd39a]">
              {session.sellPrice} ₺
            </div>
          </div>
        </div>

        {session.asksVeresiye && session.canOfferVeresiye && (
          <div className="mt-3 rounded-lg border border-[#d9a952]/35 bg-[#332213] px-3 py-2 text-xs text-[#f3dfb0]">
            <strong>{session.customerName}:</strong> “Usta bugün nakit çıkışmadı, istersen veresiye defterine yazabilir misin?”
          </div>
        )}

        {/* Step 1: Bagging */}
        <div className="mt-4">
          <div className="mb-2 text-xs font-medium text-[#dfd0b4]/80">1. Ürünü Poşetle</div>
          <button
            type="button"
            onClick={handleBag}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
              bagged
                ? 'border-[#7bc47f]/60 bg-[#243221] text-[#e7f3e4]'
                : 'border-[#e8b45a] bg-[#4a3217] text-[#fff2d4] hover:bg-[#5c3f1d]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <ShoppingBag className="h-4 w-4 text-[#e8b45a]" />
              <span>{bagged ? 'Ürün poşete kondu' : 'Nalbur poşetine koy'}</span>
            </span>
            {bagged && <Check className="h-4 w-4 text-[#9fd39a]" />}
          </button>
        </div>

        {/* Step 2: Change calculation */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-[#dfd0b4]/80">
            <span>2. Nakit Tahsilat & Para Üstü</span>
            <span className="font-mono-num">
              Müşteri Verdi: <strong className="text-[#f4ead5]">{session.paidAmount} ₺</strong>
            </span>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl border border-[#d9a952]/20 bg-[#180f09] p-3 text-center">
            <div>
              <div className="text-[11px] text-[#dfd0b4]/60">Gereken Üst</div>
              <div className="font-mono-num text-base font-semibold text-[#e8b45a]">
                {session.changeDue} ₺
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#dfd0b4]/60">Hazırlanan</div>
              <div className="font-mono-num text-base font-semibold text-[#f4ead5]">
                {givenChange} ₺
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#dfd0b4]/60">Durum</div>
              <div
                className={`font-mono-num text-base font-semibold ${
                  isExact
                    ? 'text-[#9fd39a]'
                    : remaining < 0
                      ? 'text-[#e8907a]'
                      : 'text-[#e8b45a]'
                }`}
              >
                {isExact ? 'Tam' : remaining > 0 ? `−${remaining} ₺` : `+${Math.abs(remaining)} ₺`}
              </div>
            </div>
          </div>

          {session.changeDue > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {DENOMINATIONS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddBill(val)}
                  className="font-mono-num rounded-lg border border-[#d9a952]/30 bg-[#322214] py-2 text-sm font-semibold text-[#f4ead5] transition-colors hover:border-[#e8b45a] hover:bg-[#49321c]"
                >
                  +{val} ₺
                </button>
              ))}
            </div>
          )}

          {givenChange > 0 && (
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleResetChange}
                className="flex items-center gap-1 text-xs text-[#dfd0b4]/70 hover:text-[#e8b45a]"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Sıfırla</span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            disabled={!isCashReady}
            onClick={() => onCompleteCash(bagged, givenChange)}
            className="w-full rounded-xl border border-[#e8b45a] bg-[#e8b45a] py-3 text-sm font-semibold text-[#1f140b] transition-colors hover:bg-[#f0c575] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isCashReady
              ? 'Nakit Al & Teslim Et'
              : !bagged
                ? 'Önce ürünü poşetle'
                : 'Para üstünü tamamla'}
          </button>

          {session.canOfferVeresiye && (
            <button
              type="button"
              disabled={!bagged}
              onClick={() => onCompleteVeresiye(bagged)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#d9a952]/40 bg-[#2e2013] py-2.5 text-xs font-semibold text-[#f3dfb0] transition-colors hover:border-[#e8b45a] hover:bg-[#3d2a18] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#e8b45a]" />
              <span>
                Veresiye Defterine Yaz ({session.sellPrice} ₺ · {session.trustLabel})
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

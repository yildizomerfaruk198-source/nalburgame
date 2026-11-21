import { useState, type FC } from 'react';
import {
  ArrowLeftRight,
  Brush,
  Check,
  Sparkles,
  Store,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  APPRENTICE_HIRE_COST,
  CATEGORIES,
  NAZAR_CHARM_COST,
  POSTER_THEMES,
  RUG_THEMES,
  SHELF_SLOTS,
  SIGN_THEMES,
  STREET_STALL_COST,
  WALL_THEMES,
  APPRENTICE_TASK_META,
} from '../game/catalog';
import type {
  ApprenticeState,
  ApprenticeTask,
  PosterId,
  RugThemeId,
  ShelfStatusInfo,
  ShopDecorState,
  SignThemeId,
  WallThemeId,
} from '../game/types';

interface ShopModalProps {
  money: number;
  expanded: boolean;
  categoryLevels: number[];
  ownedShelves: boolean[];
  shelfPlacements: number[];
  shelfStatuses: ShelfStatusInfo[];
  avgCleanliness: number;
  decor: ShopDecorState;
  streetStallUnlocked: boolean;
  streetStallCat: number;
  apprentice: ApprenticeState;
  onBuyShelf: (catIndex: number) => void;
  onMoveShelf: (catIndex: number, slotId: number) => void;
  onCleanShelf: (catIndex: number) => void;
  onCleanAllShelves: () => void;
  onUnlockStreetStall: () => void;
  onSetStreetStallCategory: (catIndex: number) => void;
  onSetShopName: (name: string) => void;
  onSelectSign: (id: SignThemeId) => void;
  onSelectWall: (id: WallThemeId) => void;
  onSelectRug: (id: RugThemeId) => void;
  onBuyPoster: (id: PosterId) => void;
  onBuyNazar: () => void;
  onHireApprentice: () => void;
  onSetApprenticeTask: (task: ApprenticeTask) => void;
  onClose: () => void;
}

export const ShopModal: FC<ShopModalProps> = ({
  money,
  expanded,
  categoryLevels,
  ownedShelves,
  shelfPlacements,
  shelfStatuses,
  avgCleanliness,
  decor,
  streetStallUnlocked,
  streetStallCat,
  apprentice,
  onBuyShelf,
  onMoveShelf,
  onCleanShelf,
  onCleanAllShelves,
  onUnlockStreetStall,
  onSetStreetStallCategory,
  onSetShopName,
  onSelectSign,
  onSelectWall,
  onSelectRug,
  onBuyPoster,
  onBuyNazar,
  onHireApprentice,
  onSetApprenticeTask,
  onClose,
}) => {
  const [tab, setTab] = useState<'layout' | 'decor' | 'apprentice'>('layout');

  const installedShelfStatuses = shelfStatuses.filter((s) => ownedShelves[s.catIndex]);
  const unboughtShelfIndices = CATEGORIES.map((_, idx) => idx).filter(
    (idx) => (categoryLevels[idx] ?? 0) > 0 && !ownedShelves[idx],
  );
  const dirtyShelvesCount = installedShelfStatuses.filter((s) => s.cleanliness < 98).length;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/65 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-modal-title"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#d9a952]/40 bg-[#22160d] text-[#f4ead5] shadow-2xl"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d9a952]/20 px-6 py-4">
          <div>
            <h2 id="shop-modal-title" className="font-display text-2xl font-semibold text-[#e8b45a]">
              Dükkân Yönetimi & Çırak
            </h2>
            <p className="mt-0.5 text-xs text-[#dfd0b4]/75">
              Rafları dilediğin duvara veya depoya taşı, dükkânı dekore et, sokak tezgâhı aç ve çırağına görev ver.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[11px] text-[#dfd0b4]/70">Kasa</div>
              <div
                className={`font-mono-num text-lg font-semibold ${
                  money >= 0 ? 'text-[#e8b45a]' : 'text-[#e8907a]'
                }`}
              >
                {money} ₺
              </div>
            </div>
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

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d9a952]/15 bg-[#1a1109] px-6 py-2.5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTab('layout')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                tab === 'layout'
                  ? 'bg-[#e8b45a] text-[#1f140b]'
                  : 'text-[#dfd0b4]/80 hover:bg-[#2c1d11] hover:text-[#f4ead5]'
              }`}
            >
              <Store className="h-3.5 w-3.5" />
              <span>Raflar & Sokak Tezgâhı</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('decor')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                tab === 'decor'
                  ? 'bg-[#e8b45a] text-[#1f140b]'
                  : 'text-[#dfd0b4]/80 hover:bg-[#2c1d11] hover:text-[#f4ead5]'
              }`}
            >
              <Brush className="h-3.5 w-3.5" />
              <span>Dekor & Tabela</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('apprentice')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                tab === 'apprentice'
                  ? 'bg-[#e8b45a] text-[#1f140b]'
                  : 'text-[#dfd0b4]/80 hover:bg-[#2c1d11] hover:text-[#f4ead5]'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>
                Çırak {apprentice.hired ? `(Sv.${apprentice.level})` : '(İşe Al)'}
              </span>
            </button>
          </div>

          <div className="text-xs text-[#dfd0b4]/75">
            Ortalama Temizlik:{' '}
            <strong
              className={`font-mono-num ${
                avgCleanliness >= 85
                  ? 'text-[#9fd39a]'
                  : avgCleanliness >= 55
                    ? 'text-[#e8b45a]'
                    : 'text-[#e8907a]'
              }`}
            >
              %{avgCleanliness}
            </strong>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'layout' && (
            <div className="space-y-6">
              {/* Cleanliness Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d9a952]/25 bg-[#191008] p-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#f3dfb0]">
                    <Sparkles className="h-4 w-4 text-[#e8b45a]" />
                    <span>Raf Düzeni ve Temizlik</span>
                  </div>
                  <p className="mt-1 text-xs text-[#dfd0b4]/75">
                    Gün içinde raflar tozlanır. Dükkândayken rafa bakıp <strong className="text-[#e8b45a]">R</strong> tuşuna basabilir
                    veya buradan temizleyebilirsin. Gün sonunda %88+ temizlik ekstra itibar kazandırır.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={dirtyShelvesCount === 0}
                  onClick={onCleanAllShelves}
                  className="shrink-0 whitespace-nowrap rounded-lg border border-[#e8b45a]/60 bg-[#3a2614] px-4 py-2 text-xs font-semibold text-[#f4ead5] transition-colors hover:bg-[#4e341c] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {dirtyShelvesCount > 0
                    ? `Tüm Rafları Sil (${dirtyShelvesCount})`
                    : 'Tüm Raflar Tertemiz'}
                </button>
              </div>

              {/* Empty Shelf Purchase Storefront */}
              {unboughtShelfIndices.length > 0 && (
                <div className="rounded-xl border border-[#e8b45a]/45 bg-[#291b0f] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-semibold tracking-wide text-[#e8b45a]">
                        BOŞ RAF MAĞAZASI ({unboughtShelfIndices.length} kategori raf bekliyor)
                      </h3>
                      <p className="mt-0.5 text-xs text-[#dfd0b4]/75">
                        Yeteneğini açtığın ürünler için önce boş raf ünitesi kurmalısın. Yeni raflar boş gelir; Toptancı (B) ile sipariş verip doldurursun.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {unboughtShelfIndices.map((catIdx) => {
                      const cat = CATEGORIES[catIdx];
                      const needsExpansion = cat.requiresExpansion && !expanded;
                      const canBuy = !needsExpansion && money >= cat.shelfCost;
                      return (
                        <div
                          key={cat.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-[#d9a952]/30 bg-[#1a1109] px-3.5 py-3"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-[#f4ead5]">
                              {cat.name} Rafı
                            </div>
                            <div className="mt-0.5 text-[11px] text-[#dfd0b4]/70">
                              {needsExpansion
                                ? 'Önce Yetenek Ağacından (F) dükkânı genişlet'
                                : 'Boş kurulur · Toptancıdan (B) stoklanır'}
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={!canBuy}
                            onClick={() => onBuyShelf(catIdx)}
                            className="shrink-0 whitespace-nowrap rounded-lg border border-[#e8b45a] bg-[#e8b45a] px-3.5 py-2 text-xs font-semibold text-[#1f140b] transition-colors hover:bg-[#f0c575] disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            Boş Raf Al ({cat.shelfCost} ₺)
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Shelf Placement List */}
              <div>
                <h3 className="text-xs font-semibold tracking-wide text-[#e8b45a]">
                  RAF YERLEŞİMİ ({expanded ? '10 Konum Açık · Depo Dâhil' : '4 Ana Konum · Genişlemeyle 10 Konum'})
                </h3>
                <div className="mt-3 space-y-3">
                  {installedShelfStatuses.map((shelf) => {
                    const currentSlot = SHELF_SLOTS[shelf.slotId];
                    return (
                      <div
                        key={shelf.catIndex}
                        className="rounded-xl border border-[#d9a952]/25 bg-[#1a1109] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-[#f4ead5]">
                              {shelf.name} Rafı
                            </div>
                            <div className="mt-0.5 text-xs text-[#dfd0b4]/70">
                              Konum: <span className="text-[#e8b45a]">{currentSlot?.label ?? '—'}</span>
                              <span className="mx-1.5 opacity-40">·</span>
                              Stok:{' '}
                              <span
                                className={`font-mono-num font-semibold ${
                                  shelf.stockedCount > 0 ? 'text-[#9fd39a]' : 'text-[#e8907a]'
                                }`}
                              >
                                {shelf.stockedCount}/{shelf.totalSlots}
                              </span>
                              <span className="mx-1.5 opacity-40">·</span>
                              Temizlik:{' '}
                              <span
                                className={`font-mono-num font-semibold ${
                                  shelf.cleanliness >= 85
                                    ? 'text-[#9fd39a]'
                                    : shelf.cleanliness >= 55
                                      ? 'text-[#e8b45a]'
                                      : 'text-[#e8907a]'
                                }`}
                              >
                                %{shelf.cleanliness}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {shelf.cleanliness < 99 && (
                              <button
                                type="button"
                                onClick={() => onCleanShelf(shelf.catIndex)}
                                className="rounded-lg border border-[#7bc47f]/50 bg-[#213320] px-3 py-1.5 text-xs font-medium text-[#d7efd4] transition-colors hover:bg-[#2c442b]"
                              >
                                Rafı Sil
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                          {SHELF_SLOTS.map((slot) => {
                            const isCurrent = shelf.slotId === slot.id;
                            const locked = slot.requiresExpansion && !expanded;
                            const occupantIdx = shelfPlacements.findIndex(
                              (sid, idx) =>
                                sid === slot.id &&
                                idx !== shelf.catIndex &&
                                (categoryLevels[idx] ?? 0) > 0 &&
                                ownedShelves[idx],
                            );
                            const occupantName =
                              occupantIdx >= 0 ? CATEGORIES[occupantIdx]?.name : null;

                            return (
                              <button
                                key={slot.id}
                                type="button"
                                disabled={isCurrent || locked}
                                onClick={() => onMoveShelf(shelf.catIndex, slot.id)}
                                className={`flex flex-col items-start rounded-lg border px-2.5 py-2 text-left text-[11px] transition-colors ${
                                  isCurrent
                                    ? 'border-[#7bc47f]/70 bg-[#233420] text-[#e7f3e4]'
                                    : locked
                                      ? 'cursor-not-allowed border-[#523d26]/40 bg-[#150d07] text-[#a79578]/45'
                                      : 'border-[#d9a952]/25 bg-[#24170c] text-[#dfd0b4] hover:border-[#e8b45a] hover:bg-[#332112]'
                                }`}
                              >
                                <span className="flex w-full items-center justify-between gap-1 font-medium">
                                  <span className="truncate">{slot.label}</span>
                                  {isCurrent ? (
                                    <Check className="h-3 w-3 shrink-0 text-[#9fd39a]" />
                                  ) : !locked && occupantName ? (
                                    <ArrowLeftRight className="h-3 w-3 shrink-0 text-[#e8b45a]" />
                                  ) : null}
                                </span>
                                <span className="mt-0.5 truncate text-[10px] opacity-70">
                                  {isCurrent
                                    ? 'Şu an burada'
                                    : locked
                                      ? 'Genişleme gerekir'
                                      : occupantName
                                        ? `Takas: ${occupantName}`
                                        : 'Boş yer'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Street Stall (Kapı Önü Tezgâhı) */}
              <div className="rounded-xl border border-[#d9a952]/30 bg-[#1a1109] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#f3dfb0]">
                      Kapı Önü Sokak Tezgâhı
                    </h3>
                    <p className="mt-0.5 text-xs text-[#dfd0b4]/75">
                      Kaldırımda ürün sergileyerek yoldan geçen müşteri trafiğini artırır ve seçtiğin kategoriye olan ilgiyi yükseltir.
                    </p>
                  </div>

                  {!streetStallUnlocked && (
                    <button
                      type="button"
                      disabled={money < STREET_STALL_COST}
                      onClick={onUnlockStreetStall}
                      className="shrink-0 whitespace-nowrap rounded-lg border border-[#e8b45a] bg-[#e8b45a] px-4 py-2 text-xs font-semibold text-[#1f140b] transition-colors hover:bg-[#f0c575] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Tezgâh Kur ({STREET_STALL_COST} ₺)
                    </button>
                  )}
                </div>

                {streetStallUnlocked && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {CATEGORIES.map((cat, idx) => {
                      const unlocked = (categoryLevels[idx] ?? 0) > 0 && ownedShelves[idx];
                      const active = streetStallCat === idx;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          disabled={!unlocked}
                          onClick={() => onSetStreetStallCategory(idx)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            active
                              ? 'border-[#e8b45a] bg-[#4b3116] text-[#fff2d4]'
                              : unlocked
                                ? 'border-[#d9a952]/25 bg-[#24170c] text-[#dfd0b4] hover:border-[#e8b45a]/60'
                                : 'cursor-not-allowed border-[#523d26]/40 bg-[#150d07] text-[#a79578]/40'
                          }`}
                        >
                          {cat.name}
                          {!unlocked && ' (Kilitli)'}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'decor' && (
            <div className="space-y-6">
              {/* Custom Shop Signboard Name */}
              <div className="rounded-xl border border-[#d9a952]/25 bg-[#1a1109] p-4">
                <label className="block">
                  <span className="text-xs font-semibold tracking-wide text-[#e8b45a]">
                    DÜKKÂN TABELA YAZISI
                  </span>
                  <p className="mt-0.5 text-xs text-[#dfd0b4]/70">
                    Kapının üzerindeki büyük tabelada canlı olarak güncellenir (en fazla 22 karakter).
                  </p>
                  <input
                    type="text"
                    maxLength={22}
                    value={decor.shopName}
                    onChange={(e) => onSetShopName(e.target.value)}
                    placeholder="Örn: Yıldız Nalburiye"
                    className="mt-2.5 w-full max-w-md rounded-lg border border-[#d9a952]/35 bg-[#120b06] px-3.5 py-2 text-sm text-[#f4ead5] outline-none focus:border-[#e8b45a]"
                  />
                </label>
              </div>

              {/* Sign Themes */}
              <div>
                <h3 className="text-xs font-semibold tracking-wide text-[#e8b45a]">TABELA TASARIMI</h3>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {(Object.keys(SIGN_THEMES) as SignThemeId[]).map((id) => {
                    const theme = SIGN_THEMES[id];
                    const owned = decor.unlockedSigns.includes(id);
                    const active = decor.signTheme === id;
                    const canAfford = money >= theme.cost;

                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={!owned && !canAfford}
                        onClick={() => onSelectSign(id)}
                        className={`flex flex-col justify-between rounded-xl border p-3 text-left transition-colors ${
                          active
                            ? 'border-[#7bc47f]/75 bg-[#233420]'
                            : owned || canAfford
                              ? 'border-[#d9a952]/25 bg-[#1a1109] hover:border-[#e8b45a]'
                              : 'cursor-not-allowed border-[#523d26]/40 bg-[#150d07] opacity-55'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-6 w-6 shrink-0 rounded-md border"
                            style={{ backgroundColor: theme.bgHex, borderColor: theme.borderHex }}
                          />
                          <span className="text-xs font-semibold text-[#f4ead5]">{theme.label}</span>
                        </div>
                        <div className="mt-2 text-[11px] font-medium text-[#e8b45a]">
                          {active ? 'Kullanımda' : owned ? 'Uygula' : `Satın Al · ${theme.cost} ₺`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wall Paint Themes */}
              <div>
                <h3 className="text-xs font-semibold tracking-wide text-[#e8b45a]">DUVAR BOYASI</h3>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {(Object.keys(WALL_THEMES) as WallThemeId[]).map((id) => {
                    const theme = WALL_THEMES[id];
                    const owned = decor.unlockedWalls.includes(id);
                    const active = decor.wallTheme === id;
                    const canAfford = money >= theme.cost;

                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={!owned && !canAfford}
                        onClick={() => onSelectWall(id)}
                        className={`flex flex-col justify-between rounded-xl border p-3 text-left transition-colors ${
                          active
                            ? 'border-[#7bc47f]/75 bg-[#233420]'
                            : owned || canAfford
                              ? 'border-[#d9a952]/25 bg-[#1a1109] hover:border-[#e8b45a]'
                              : 'cursor-not-allowed border-[#523d26]/40 bg-[#150d07] opacity-55'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-6 w-6 shrink-0 overflow-hidden rounded-md border border-[#d9a952]/40">
                            <span className="w-1/2" style={{ backgroundColor: theme.topHex }} />
                            <span className="w-1/2" style={{ backgroundColor: theme.bottomHex }} />
                          </span>
                          <span className="text-xs font-semibold text-[#f4ead5]">{theme.label}</span>
                        </div>
                        <div className="mt-2 text-[11px] font-medium text-[#e8b45a]">
                          {active ? 'Kullanımda' : owned ? 'Boya Uygula' : `Boya Al · ${theme.cost} ₺`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rug Themes */}
              <div>
                <h3 className="text-xs font-semibold tracking-wide text-[#e8b45a]">ZEMİN HALISI</h3>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {(Object.keys(RUG_THEMES) as RugThemeId[]).map((id) => {
                    const theme = RUG_THEMES[id];
                    const owned = decor.unlockedRugs.includes(id);
                    const active = decor.rugTheme === id;
                    const canAfford = money >= theme.cost;

                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={!owned && !canAfford}
                        onClick={() => onSelectRug(id)}
                        className={`flex flex-col justify-between rounded-xl border p-3 text-left transition-colors ${
                          active
                            ? 'border-[#7bc47f]/75 bg-[#233420]'
                            : owned || canAfford
                              ? 'border-[#d9a952]/25 bg-[#1a1109] hover:border-[#e8b45a]'
                              : 'cursor-not-allowed border-[#523d26]/40 bg-[#150d07] opacity-55'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-6 w-6 shrink-0 rounded-md border-2"
                            style={{ backgroundColor: theme.primary, borderColor: theme.border }}
                          />
                          <span className="text-xs font-semibold text-[#f4ead5]">{theme.label}</span>
                        </div>
                        <div className="mt-2 text-[11px] font-medium text-[#e8b45a]">
                          {active ? 'Serili' : owned ? 'Ser' : `Halı Al · ${theme.cost} ₺`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Posters & Nazar Charm */}
              <div>
                <h3 className="text-xs font-semibold tracking-wide text-[#e8b45a]">DUVAR AFİŞLERİ & SÜS</h3>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {(Object.keys(POSTER_THEMES) as PosterId[]).map((pid) => {
                    const p = POSTER_THEMES[pid];
                    const owned = decor.posters.includes(pid);
                    const canAfford = money >= p.cost;

                    return (
                      <button
                        key={pid}
                        type="button"
                        disabled={owned || !canAfford}
                        onClick={() => onBuyPoster(pid)}
                        className={`flex flex-col justify-between rounded-xl border p-3 text-left transition-colors ${
                          owned
                            ? 'border-[#7bc47f]/60 bg-[#233420]'
                            : canAfford
                              ? 'border-[#d9a952]/25 bg-[#1a1109] hover:border-[#e8b45a]'
                              : 'cursor-not-allowed border-[#523d26]/40 bg-[#150d07] opacity-55'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-[#f4ead5]">{p.label}</div>
                          <div className="mt-0.5 text-[11px] text-[#dfd0b4]/70">{p.title}</div>
                        </div>
                        <div className="mt-2 text-[11px] font-medium text-[#e8b45a]">
                          {owned ? 'Duvara Asıldı ✓' : `As · ${p.cost} ₺`}
                        </div>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={decor.nazarCharm || money < NAZAR_CHARM_COST}
                    onClick={onBuyNazar}
                    className={`flex flex-col justify-between rounded-xl border p-3 text-left transition-colors ${
                      decor.nazarCharm
                        ? 'border-[#7bc47f]/60 bg-[#233420]'
                        : money >= NAZAR_CHARM_COST
                          ? 'border-[#d9a952]/25 bg-[#1a1109] hover:border-[#e8b45a]'
                          : 'cursor-not-allowed border-[#523d26]/40 bg-[#150d07] opacity-55'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#f4ead5]">Giriş Nazar Boncuğu</div>
                      <div className="mt-0.5 text-[11px] text-[#dfd0b4]/70">
                        Kapı üstü süsü · +2 İtibar kazandırır
                      </div>
                    </div>
                    <div className="mt-2 text-[11px] font-medium text-[#e8b45a]">
                      {decor.nazarCharm ? 'Kapıda Asılı ✓' : `As · ${NAZAR_CHARM_COST} ₺`}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'apprentice' && (
            <div className="space-y-5">
              {!apprentice.hired ? (
                <div className="rounded-2xl border border-[#d9a952]/30 bg-[#1a1109] p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#e8b45a]">
                        <UserCheck className="h-4 w-4" />
                        <span>YENİ İŞ ARKADAŞI</span>
                      </div>
                      <h3 className="font-display mt-1 text-2xl font-semibold text-[#f3dfb0]">
                        Çırak Yusuf
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#dfd0b4]/85">
                        Mahallenin eli çabuk genci Yusuf dükkânda yükünü paylaşmaya hazır. Depodan
                        mal çıkarıp raflara dizebilir, tozlanan rafları silebilir veya sen mal
                        taşırken tezgâh başında müşterilere bakabilir.
                      </p>

                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div className="rounded-lg border border-[#d9a952]/15 bg-[#130c06] p-3 text-xs">
                          <div className="font-semibold text-[#e8b45a]">İşe Alım Ücreti</div>
                          <div className="font-mono-num mt-0.5 text-base font-semibold text-[#f4ead5]">
                            {APPRENTICE_HIRE_COST} ₺
                          </div>
                        </div>
                        <div className="rounded-lg border border-[#d9a952]/15 bg-[#130c06] p-3 text-xs">
                          <div className="font-semibold text-[#e8b45a]">Günlük Maaş</div>
                          <div className="font-mono-num mt-0.5 text-base font-semibold text-[#f4ead5]">
                            {apprentice.dailyWage} ₺ / gün
                          </div>
                        </div>
                        <div className="rounded-lg border border-[#d9a952]/15 bg-[#130c06] p-3 text-xs">
                          <div className="font-semibold text-[#e8b45a]">Gelişim</div>
                          <div className="mt-0.5 text-xs text-[#dfd0b4]/80">
                            Çalıştıkça seviye atlar ve hızlanır
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={money < APPRENTICE_HIRE_COST}
                      onClick={onHireApprentice}
                      className="shrink-0 whitespace-nowrap rounded-xl border border-[#e8b45a] bg-[#e8b45a] px-6 py-3 text-sm font-semibold text-[#1f140b] transition-colors hover:bg-[#f0c575] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Çırağı İşe Al ({APPRENTICE_HIRE_COST} ₺)
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Apprentice Stats */}
                  <div className="rounded-2xl border border-[#d9a952]/30 bg-[#1a1109] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="font-display text-xl font-semibold text-[#f3dfb0]">
                          Çırak {apprentice.name} · Seviye {apprentice.level}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#dfd0b4]/75">
                          Günlük maaş gün sonu kapanışta kasadan düşülür. Seviye arttıkça Yusuf daha hızlı yürür ve işi daha çabuk bitirir.
                        </p>
                      </div>

                      <div className="flex items-center gap-5 text-right text-xs">
                        <div>
                          <div className="text-[#dfd0b4]/65">Tamamlanan İş</div>
                          <div className="font-mono-num text-base font-semibold text-[#9fd39a]">
                            {apprentice.tasksDone}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#dfd0b4]/65">Günlük Maaş</div>
                          <div className="font-mono-num text-base font-semibold text-[#e8b45a]">
                            {apprentice.dailyWage} ₺
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-[11px] text-[#dfd0b4]/75">
                        <span>Tecrübe Puanı</span>
                        <span className="font-mono-num">
                          {apprentice.level >= 5
                            ? 'Usta Çırak (Maksimum Seviye)'
                            : `${apprentice.xp} / ${apprentice.nextXp} XP`}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#120b06]">
                        <div
                          className="h-full bg-[#9fd39a] transition-all"
                          style={{
                            width:
                              apprentice.level >= 5
                                ? '100%'
                                : `${Math.min(100, Math.round((apprentice.xp / apprentice.nextXp) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Apprentice Task Assignment */}
                  <div>
                    <h4 className="text-xs font-semibold tracking-wide text-[#e8b45a]">
                      AKTİF GÖREV ATAMASI
                    </h4>
                    <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {(Object.keys(APPRENTICE_TASK_META) as ApprenticeTask[]).map((taskId) => {
                        const meta = APPRENTICE_TASK_META[taskId];
                        const active = apprentice.task === taskId;
                        return (
                          <button
                            key={taskId}
                            type="button"
                            onClick={() => onSetApprenticeTask(taskId)}
                            className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-left transition-colors ${
                              active
                                ? 'border-[#7bc47f]/75 bg-[#233420]'
                                : 'border-[#d9a952]/25 bg-[#1a1109] hover:border-[#e8b45a]'
                            }`}
                          >
                            <div>
                              <div className="text-sm font-semibold text-[#f4ead5]">
                                {meta.label}
                              </div>
                              <div className="mt-1 text-xs leading-relaxed text-[#dfd0b4]/75">
                                {meta.desc}
                              </div>
                            </div>
                            {active && <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#9fd39a]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-[#d9a952]/20 bg-[#1a1109] px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="whitespace-nowrap rounded-lg border border-[#e8b45a] px-5 py-2 text-sm font-medium text-[#e8b45a] transition-colors hover:bg-[#3a2716]"
          >
            Kapat (G)
          </button>
        </div>
      </div>
    </div>
  );
};

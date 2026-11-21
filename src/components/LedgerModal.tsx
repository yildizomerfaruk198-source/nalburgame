import type { FC } from 'react';
import { BookOpen, CheckCircle2, Clock, Trash2, X } from 'lucide-react';
import type { VeresiyeEntry } from '../game/types';

interface LedgerModalProps {
  day: number;
  entries: VeresiyeEntry[];
  openTotal: number;
  onCollect: (id: number) => void;
  onWriteOff: (id: number) => void;
  onClose: () => void;
}

export const LedgerModal: FC<LedgerModalProps> = ({
  day,
  entries,
  openTotal,
  onCollect,
  onWriteOff,
  onClose,
}) => {
  const readyEntries = entries.filter((e) => e.status === 'ready_to_collect');
  const openEntries = entries.filter((e) => e.status === 'open');
  const closedEntries = entries.filter(
    (e) => e.status === 'paid' || e.status === 'defaulted',
  );

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
        aria-labelledby="ledger-title"
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-[#d9a952]/40 bg-[#22160d] p-6 text-[#f4ead5] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#d9a952]/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d9a952]/30 bg-[#322112]">
              <BookOpen className="h-5 w-5 text-[#e8b45a]" />
            </div>
            <div>
              <h2 id="ledger-title" className="font-display text-2xl font-semibold text-[#e8b45a]">
                Veresiye Defteri
              </h2>
              <p className="text-xs text-[#dfd0b4]/75">
                Bugün: Gün {day} · Açık Alacaklar:{' '}
                <strong className="font-mono-num text-[#e8b45a]">{openTotal} ₺</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="rounded-lg border border-[#d9a952]/30 p-2 text-[#dfd0b4] transition-colors hover:bg-[#3a2716] hover:text-[#e8b45a]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 flex-1 space-y-5 overflow-y-auto pr-1">
          {entries.length === 0 ? (
            <div className="rounded-xl border border-[#d9a952]/15 bg-[#180f09] px-5 py-8 text-center">
              <p className="text-sm font-medium text-[#f3dfb0]">
                Defter şimdilik tertemiz.
              </p>
              <p className="mt-1.5 text-xs text-[#dfd0b4]/70">
                Kasada güvendiğin komşu ve ustalara “Veresiye Defterine Yaz” diyerek itibar kazanabilir, vadesi geldiğinde buradan tahsilat yapabilirsin.
              </p>
            </div>
          ) : (
            <>
              {/* Ready to collect */}
              {readyEntries.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold tracking-wide text-[#9fd39a]">
                    Tahsilata Hazır Ödemeler ({readyEntries.length})
                  </h3>
                  <div className="space-y-2">
                    {readyEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#7bc47f]/45 bg-[#202d1d] px-4 py-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-[#f4ead5]">
                            <span>{entry.customerName}</span>
                            <span className="text-xs font-normal text-[#9fd39a]">
                              ({entry.trustLabel})
                            </span>
                          </div>
                          <div className="mt-0.5 text-xs text-[#dfd0b4]/75">
                            {entry.itemName} · Gün {entry.dayWritten} tarihinde yazıldı
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="font-mono-num text-base font-bold text-[#9fd39a]">
                            {entry.amount} ₺
                          </span>
                          <button
                            type="button"
                            onClick={() => onCollect(entry.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-[#7bc47f] bg-[#4b854f] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#5c9f61]"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Tahsil Et</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Open / Pending due date */}
              {openEntries.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold tracking-wide text-[#e8b45a]">
                    Vadesi Bekleyenler ({openEntries.length})
                  </h3>
                  <div className="space-y-2">
                    {openEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d9a952]/20 bg-[#1a110a] px-4 py-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium text-[#f4ead5]">
                            <span>{entry.customerName}</span>
                            <span className="text-xs text-[#dfd0b4]/65">
                              · {entry.trustLabel}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[#dfd0b4]/70">
                            <Clock className="h-3 w-3 text-[#e8b45a]" />
                            <span>
                              {entry.itemName} · Beklenen tahsilat: Gün {entry.dueDay}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono-num text-base font-semibold text-[#e8b45a]">
                            {entry.amount} ₺
                          </span>
                          <button
                            type="button"
                            onClick={() => onWriteOff(entry.id)}
                            title="Borcu sil"
                            className="rounded-lg border border-[#d9a952]/20 p-1.5 text-[#dfd0b4]/50 transition-colors hover:border-[#e8907a]/50 hover:text-[#e8907a]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Closed history */}
              {closedEntries.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold tracking-wide text-[#dfd0b4]/60">
                    Kapanan Kayıtlar ({closedEntries.length})
                  </h3>
                  <div className="space-y-1.5">
                    {closedEntries.slice(0, 10).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between rounded-lg border border-[#d9a952]/10 bg-[#160e08] px-3.5 py-2 text-xs text-[#dfd0b4]/65"
                      >
                        <span>
                          {entry.customerName} · {entry.itemName} (Gün {entry.dayWritten})
                        </span>
                        <span
                          className={`font-mono-num font-medium ${
                            entry.status === 'paid' ? 'text-[#9fd39a]' : 'text-[#e8907a]'
                          }`}
                        >
                          {entry.status === 'paid' ? `Ödendi (${entry.amount} ₺)` : `Silindi (${entry.amount} ₺)`}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        <div className="mt-4 border-t border-[#d9a952]/20 pt-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#e8b45a] bg-[#e8b45a] px-5 py-2 text-xs font-semibold text-[#1f140b] transition-colors hover:bg-[#f0c575]"
          >
            Defteri Kapat (L / Esc)
          </button>
        </div>
      </div>
    </div>
  );
};

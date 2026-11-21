import { useState, type FC } from 'react';
import {
  Award,
  Check,
  ClipboardList,
  Newspaper,
  PackageCheck,
  Trophy,
  X,
} from 'lucide-react';
import { CATEGORIES, ITEM_KEY } from '../game/catalog';
import type {
  BulkContract,
  MilestoneGoalId,
  MilestoneGoalInfo,
  NeighborhoodEvent,
} from '../game/types';

interface BulletinBoardModalProps {
  day: number;
  money: number;
  points: number;
  reputation: number;
  dailyEvent: NeighborhoodEvent;
  contracts: BulkContract[];
  milestones: MilestoneGoalInfo[];
  tierStockCounts: Record<string, number>;
  cleanStreak: number;
  contractsDone: number;
  onAcceptContract: (id: number) => void;
  onDeliverContract: (id: number) => void;
  onClaimMilestone: (id: MilestoneGoalId) => void;
  onClose: () => void;
}

export const BulletinBoardModal: FC<BulletinBoardModalProps> = ({
  day,
  money,
  points,
  reputation,
  dailyEvent,
  contracts,
  milestones,
  tierStockCounts,
  cleanStreak,
  contractsDone,
  onAcceptContract,
  onDeliverContract,
  onClaimMilestone,
  onClose,
}) => {
  const [tab, setTab] = useState<'contracts' | 'milestones'>('contracts');

  const openContracts = contracts.filter(
    (c) => c.status === 'accepted' || c.status === 'available',
  );
  const completedContracts = contracts
    .filter((c) => c.status === 'completed')
    .slice(-4)
    .reverse();

  const claimedCount = milestones.filter((m) => m.claimed).length;
  const claimableCount = milestones.filter((m) => m.completed && !m.claimed).length;

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
        aria-labelledby="board-modal-title"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#d9a952]/40 bg-[#22160d] text-[#f4ead5] shadow-2xl"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d9a952]/20 px-6 py-4">
          <div>
            <h2
              id="board-modal-title"
              className="font-display text-2xl font-semibold text-[#e8b45a]"
            >
              Mahalle İlan Panosu & Esnaf Hedefleri
            </h2>
            <p className="mt-0.5 text-xs text-[#dfd0b4]/75">
              Günlük mahalle bültenini takip et, toplu müteahhit ihalelerini teslim et ve ustalık ödüllerini topla.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[11px] text-[#dfd0b4]/70">Kasa · Puan · İtibar</div>
              <div className="font-mono-num text-sm font-semibold text-[#e8b45a]">
                {money} ₺ · {points} P · {reputation} İtibar
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

        {/* Daily Neighborhood Bulletin Banner */}
        <div className="border-b border-[#d9a952]/15 bg-[#1b120b] px-6 py-3.5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#d9a952]/30 bg-[#2e1e11] text-[#e8b45a]">
                <Newspaper className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-wide text-[#d9a952]/85">
                  Gün {day} Mahalle Bülteni
                </div>
                <div className="text-sm font-semibold text-[#f3dfb0]">
                  {dailyEvent.title}
                </div>
                <p className="mt-0.5 text-xs text-[#dfd0b4]/80">{dailyEvent.summary}</p>
              </div>
            </div>
            <div className="rounded-lg border border-[#d9a952]/25 bg-[#25180e] px-3 py-1.5 text-xs font-medium text-[#9fd39a]">
              {dailyEvent.effectLabel}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d9a952]/15 bg-[#181009] px-6 py-2.5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTab('contracts')}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                tab === 'contracts'
                  ? 'bg-[#e8b45a] text-[#1f140b]'
                  : 'text-[#dfd0b4]/80 hover:bg-[#2c1d11] hover:text-[#f4ead5]'
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              <span>Toplu İhaleler ({openContracts.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('milestones')}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                tab === 'milestones'
                  ? 'bg-[#e8b45a] text-[#1f140b]'
                  : 'text-[#dfd0b4]/80 hover:bg-[#2c1d11] hover:text-[#f4ead5]'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>
                Esnaf Hedefleri ({claimedCount}/{milestones.length})
                {claimableCount > 0 ? ` · ${claimableCount} Ödül Hazır` : ''}
              </span>
            </button>
          </div>
          <div className="text-xs text-[#dfd0b4]/70">
            Teslim Edilen İhale:{' '}
            <strong className="font-mono-num text-[#e8b45a]">{contractsDone}</strong>
            <span className="mx-1.5 opacity-40">·</span>
            Temizlik Serisi:{' '}
            <strong className="font-mono-num text-[#9fd39a]">{cleanStreak} gün</strong>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'contracts' && (
            <div className="space-y-5">
              {openContracts.length === 0 ? (
                <div className="rounded-xl border border-[#d9a952]/20 bg-[#191008] p-6 text-center text-sm text-[#dfd0b4]/75">
                  Yeni ihale açılabilmesi için yetenek ağacından en az 2 ürün çeşidin açık olmalıdır.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {openContracts.map((contract) => {
                    const daysLeft = Math.max(0, contract.dueDay - day);
                    const allReady = contract.lines.every((line) => {
                      const have = tierStockCounts[ITEM_KEY(line.cat, line.tier)] ?? 0;
                      return have >= line.qty;
                    });

                    return (
                      <div
                        key={contract.id}
                        className={`flex flex-col justify-between rounded-xl border p-4 ${
                          contract.status === 'accepted'
                            ? 'border-[#7bc47f]/45 bg-[#1b2419]'
                            : 'border-[#d9a952]/25 bg-[#191008]'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-[11px] font-medium text-[#d9a952]/85">
                                {contract.issuer} · {contract.issuerRole}
                              </div>
                              <h3 className="mt-0.5 text-base font-semibold text-[#f3dfb0]">
                                {contract.title}
                              </h3>
                            </div>
                            <span className="font-mono-num shrink-0 text-xs font-semibold text-[#e8b45a]">
                              {daysLeft === 0 ? 'Son Gün!' : `${daysLeft} gün kaldı`}
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs leading-relaxed text-[#dfd0b4]/75">
                            {contract.description}
                          </p>

                          <div className="mt-3 space-y-1.5 border-t border-[#d9a952]/15 pt-3">
                            {contract.lines.map((line, idx) => {
                              const key = ITEM_KEY(line.cat, line.tier);
                              const have = tierStockCounts[key] ?? 0;
                              const enough = have >= line.qty;
                              const name = CATEGORIES[line.cat]?.names[line.tier - 1] ?? 'Ürün';
                              return (
                                <div
                                  key={`${key}_${idx}`}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <span className="capitalize text-[#f4ead5]">
                                    {line.qty}× {name}
                                  </span>
                                  <span
                                    className={`font-mono-num font-semibold ${
                                      enough ? 'text-[#9fd39a]' : 'text-[#e8907a]'
                                    }`}
                                  >
                                    Stok: {have}/{line.qty}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#d9a952]/15 pt-3">
                          <div className="font-mono-num text-xs font-semibold text-[#9fd39a]">
                            +{contract.rewardMoney} ₺ · +{contract.rewardPoints} P · +{contract.rewardRep} İtibar
                          </div>
                          <div className="flex items-center gap-2">
                            {contract.status === 'available' && (
                              <button
                                type="button"
                                onClick={() => onAcceptContract(contract.id)}
                                className="whitespace-nowrap rounded-lg border border-[#d9a952]/40 bg-[#2f1f12] px-3 py-1.5 text-xs font-semibold text-[#e8b45a] transition-colors hover:bg-[#412b19]"
                              >
                                İhaleyi Al
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={!allReady}
                              onClick={() => onDeliverContract(contract.id)}
                              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#e8b45a] bg-[#e8b45a] px-3.5 py-1.5 text-xs font-semibold text-[#1f140b] transition-colors hover:bg-[#f0c575] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <PackageCheck className="h-3.5 w-3.5" />
                              <span>{allReady ? 'Teslim Et' : 'Stok Eksik'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-[#dfd0b4]/65">
                İpucu: Toplu teslimatlar önce depo rezervinizden, yetmezse raflardaki ürünlerden düşülür ve perakende fiyatın +%38 üzerinde kazanç sağlar.
              </p>

              {completedContracts.length > 0 && (
                <div className="border-t border-[#d9a952]/15 pt-4">
                  <div className="text-xs font-semibold text-[#dfd0b4]/75">
                    Son Tamamlanan İhaleler
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {completedContracts.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between text-xs text-[#dfd0b4]/70"
                      >
                        <span>
                          {c.title} ({c.issuer})
                        </span>
                        <span className="font-mono-num text-[#9fd39a]">
                          +{c.rewardMoney} ₺ · Teslim Edildi
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'milestones' && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {milestones.map((goal) => {
                const pct = Math.round((goal.progress / Math.max(1, goal.target)) * 100);
                const readyToClaim = goal.completed && !goal.claimed;
                return (
                  <div
                    key={goal.id}
                    className={`flex flex-col justify-between rounded-xl border p-4 ${
                      goal.claimed
                        ? 'border-[#7bc47f]/45 bg-[#1b2719]'
                        : readyToClaim
                          ? 'border-[#e8b45a] bg-[#2e2012]'
                          : 'border-[#d9a952]/20 bg-[#191008]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Award
                            className={`h-4 w-4 shrink-0 ${
                              goal.claimed || readyToClaim
                                ? 'text-[#9fd39a]'
                                : 'text-[#e8b45a]'
                            }`}
                          />
                          <h3 className="text-sm font-semibold text-[#f3dfb0]">
                            {goal.title}
                          </h3>
                        </div>
                        <span className="font-mono-num shrink-0 text-xs font-semibold text-[#e8b45a]">
                          {goal.progress}/{goal.target}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-[#dfd0b4]/75">{goal.desc}</p>

                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#2c1e12]">
                        <div
                          className={`h-full transition-all ${
                            goal.claimed || readyToClaim ? 'bg-[#7bc47f]' : 'bg-[#e8b45a]'
                          }`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 pt-1">
                      <span className="text-xs font-medium text-[#9fd39a]">
                        Ödül: {goal.rewardText}
                      </span>
                      {goal.claimed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#9fd39a]">
                          <Check className="h-3.5 w-3.5" />
                          <span>Alındı</span>
                        </span>
                      ) : readyToClaim ? (
                        <button
                          type="button"
                          onClick={() => onClaimMilestone(goal.id)}
                          className="whitespace-nowrap rounded-lg border border-[#e8b45a] bg-[#e8b45a] px-3.5 py-1.5 text-xs font-semibold text-[#1f140b] transition-colors hover:bg-[#f0c575]"
                        >
                          Ödülü Al
                        </button>
                      ) : (
                        <span className="text-xs text-[#dfd0b4]/55">Devam Ediyor</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-[#d9a952]/20 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="whitespace-nowrap rounded-lg border border-[#e8b45a] px-5 py-2 text-sm font-medium text-[#e8b45a] transition-colors hover:bg-[#3a2716]"
          >
            Kapat (N)
          </button>
        </div>
      </div>
    </div>
  );
};

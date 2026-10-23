import React from 'react';
import { Package, Coins, Heart, Lightbulb, Shield, Sparkles, Eye, Plus, X } from 'lucide-react';
import { PlayerStats, PlayerItems } from '../types/game';
import { SHOP_ITEMS } from '../data/gameData';
import { soundManager } from '../audio/soundManager';

interface InventoryModalProps {
  stats: PlayerStats;
  onUseItem: (itemKey: keyof PlayerItems) => void;
  onBuyItem: (itemKey: keyof PlayerItems, cost: number) => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  stats,
  onUseItem,
  onBuyItem,
  onClose,
}) => {
  const getItemIcon = (name: string) => {
    switch (name) {
      case 'lightbulb':
        return <Lightbulb className="w-5 h-5 text-amber-400" />;
      case 'heart':
        return <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-cyan-400" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
      case 'eye':
        return <Eye className="w-5 h-5 text-sky-400" />;
      default:
        return <Package className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-indigo-500/40 rounded-3xl shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                INVENTARIS & LABORATORIUM SUPLAI 3D
              </h3>
              <p className="text-xs text-slate-400">Gunakan dan beli perlengkapan riset genetika</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Status Bar */}
        <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>
              Koin DNA: <strong className="text-emerald-300 font-mono text-sm">{stats.coins}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>
              HP:{' '}
              <strong className="text-rose-300 font-mono">
                {stats.hp} / {stats.maxHp}
              </strong>
            </span>
          </div>
        </div>

        {/* Item List */}
        <div className="flex flex-col gap-2.5 flex-1">
          {SHOP_ITEMS.map((item) => {
            const count = stats.items[item.key] || 0;
            const canAfford = stats.coins >= item.cost;
            const canUseDirectly = item.usableDirectly && count > 0 && stats.hp < stats.maxHp;

            return (
              <div
                key={item.key}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700 shrink-0">
                    {getItemIcon(item.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-100">{item.name}</span>
                      <span className="text-[10px] font-mono font-bold bg-sky-950 text-sky-300 px-2 py-0.5 rounded-lg border border-sky-800">
                        Dimiliki: {count}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end shrink-0">
                  {item.usableDirectly && (
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onUseItem(item.key);
                      }}
                      disabled={!canUseDirectly}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Pakai (Pulihkan HP)
                    </button>
                  )}

                  <button
                    onClick={() => {
                      soundManager.playPowerUp();
                      onBuyItem(item.key, item.cost);
                    }}
                    disabled={!canAfford}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Beli ({item.cost} Koin)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

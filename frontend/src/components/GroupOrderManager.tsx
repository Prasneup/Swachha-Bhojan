'use client';

import React, { useState } from 'react';
import { Users, Check, UserPlus, LogOut, ArrowRight, Share2 } from 'lucide-react';
import { GroupSession, GroupCartItem } from '../types/food';

interface GroupOrderManagerProps {
  currentSession: GroupSession | null;
  currentUser: string | null;
  groupCart: GroupCartItem[];
  onStartSession: (hostName: string) => void;
  onJoinSession: (code: string, name: string) => void;
  onLeaveSession: () => void;
  onAddParticipant: (name: string) => void;
  onRemoveParticipant: (name: string) => void;
  onSetSplitMethod: (method: 'HOST_PAYS' | 'EQUAL_SPLIT') => void;
  onSwitchUser: (name: string) => void;
}

export const GroupOrderManager: React.FC<GroupOrderManagerProps> = ({
  currentSession,
  currentUser,
  groupCart,
  onStartSession,
  onJoinSession,
  onLeaveSession,
  onAddParticipant,
  onRemoveParticipant,
  onSetSplitMethod,
  onSwitchUser,
}) => {
  const [hostInput, setHostInput] = useState('');
  const [codeInput, setCodeInput] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('groupSession') || '';
    }
    return '';
  });
  const [joinNameInput, setJoinNameInput] = useState('');
  const [newParticipantInput, setNewParticipantInput] = useState('');
  const [copied, setCopied] = useState(false);

  // Group Calculations
  const subtotals = React.useMemo(() => {
    const map: Record<string, number> = {};
    if (currentSession) {
      currentSession.participants.forEach(p => {
        map[p] = 0;
      });
    }
    groupCart.forEach(item => {
      map[item.participant] = (map[item.participant] || 0) + item.menuItem.price * item.quantity;
    });
    return map;
  }, [currentSession, groupCart]);

  const grandTotal = React.useMemo(() => {
    return groupCart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  }, [groupCart]);

  const splitAmount = React.useMemo(() => {
    if (!currentSession || currentSession.participants.length === 0) return 0;
    return grandTotal / currentSession.participants.length;
  }, [currentSession, grandTotal]);

  const handleCopyLink = () => {
    if (!currentSession) return;
    const url = `${window.location.origin}${window.location.pathname}?groupSession=${currentSession.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostInput.trim()) return;
    onStartSession(hostInput.trim());
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim() || !joinNameInput.trim()) return;
    onJoinSession(codeInput.trim(), joinNameInput.trim());
  };

  const handleAddNewParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantInput.trim()) return;
    onAddParticipant(newParticipantInput.trim());
    setNewParticipantInput('');
  };

  if (!currentSession) {
    return (
      <div className="bg-stone-900 border border-stone-850 p-6 md:p-8 rounded-[40px] shadow-xl w-full scroll-reveal">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase block mb-0.5">
              Social Dining
            </span>
            <h3 className="text-base font-extrabold text-stone-100 uppercase tracking-wider">
              Group Ordering & Bill Split
            </h3>
          </div>
        </div>
        <p className="text-xs text-stone-400 leading-relaxed mb-6">
          Order together with friends! Sync baskets across screens and split your bills instantly via simple peer-to-peer calculations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-850">
          {/* Create Session */}
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">
              Start a New Session
            </h4>
            <input
              type="text"
              placeholder="Your Name (Host)"
              value={hostInput}
              onChange={(e) => setHostInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-850 text-xs font-semibold text-stone-300 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-[10px] uppercase tracking-wider cursor-pointer shadow-md shadow-amber-500/10 transition-all flex items-center justify-center gap-1"
            >
              Host Group Session <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Join Session */}
          <form onSubmit={handleJoin} className="flex flex-col gap-3 border-t md:border-t-0 md:border-l border-stone-850 pt-4 md:pt-0 md:pl-6">
            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">
              Join Existing Session
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Code"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                className="w-24 px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-850 text-xs font-semibold text-stone-300 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <input
                type="text"
                placeholder="Your Name"
                value={joinNameInput}
                onChange={(e) => setJoinNameInput(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-850 text-xs font-semibold text-stone-300 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-300 border border-stone-800 font-black text-[10px] uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1"
            >
              Join Session <UserPlus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 border border-stone-850 p-6 md:p-8 rounded-[40px] shadow-xl w-full scroll-reveal">
      {/* Active Session Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-stone-850 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-emerald-600/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">
                Active Group Order
              </span>
              <span className="bg-stone-950 border border-stone-800 px-2 py-0.5 rounded text-[10px] font-black text-amber-500 tracking-wider">
                CODE: {currentSession.id}
              </span>
            </div>
            <span className="text-xs text-stone-400 font-semibold block mt-0.5">
              Ordering as: <strong className="text-stone-100">{currentUser}</strong> (Host: {currentSession.hostName})
            </span>
          </div>
        </div>

        {/* Share & Leave Controls */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopyLink}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-950 border border-stone-850 text-stone-450 hover:text-stone-200 text-[10px] font-black uppercase cursor-pointer transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" /> Share Link
              </>
            )}
          </button>
          <button
            onClick={onLeaveSession}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-500 text-[10px] font-black uppercase cursor-pointer hover:bg-rose-950/45 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Close Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Switch Participant Selection */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">
            1. Select active Ordering Tab
          </h4>
          <div className="flex flex-col gap-1.5 bg-stone-950/50 p-2.5 rounded-2xl border border-stone-850/60 max-h-48 overflow-y-auto no-scrollbar">
            {currentSession.participants.map((name) => {
              const isMe = name === currentUser;
              const hasOrdered = (subtotals[name] || 0) > 0;
              return (
                <div
                  key={name}
                  className={`w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl text-xs transition-all ${
                    isMe
                      ? 'bg-amber-500 text-stone-950 font-black'
                      : 'bg-stone-900/60 text-stone-400'
                  }`}
                >
                  <button
                    onClick={() => onSwitchUser(name)}
                    className="flex-1 text-left truncate cursor-pointer font-bold"
                  >
                    {name} {name === currentSession.hostName ? '(Host)' : ''}
                  </button>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold ${isMe ? 'text-stone-950' : 'text-stone-500'}`}>
                      {hasOrdered ? `Rs. ${subtotals[name]}` : 'Empty'}
                    </span>
                    {name !== currentSession.hostName && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove ${name} from this session?`)) {
                            onRemoveParticipant(name);
                          }
                        }}
                        className={`w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors text-[9px] font-bold cursor-pointer ${
                          isMe ? 'text-stone-950 hover:text-stone-800' : 'text-stone-500 hover:text-stone-300'
                        }`}
                        title="Remove participant"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add participant on behalf */}
          <form onSubmit={handleAddNewParticipant} className="flex gap-1.5 mt-1.5">
            <input
              type="text"
              placeholder="Add Participant Name"
              value={newParticipantInput}
              onChange={(e) => setNewParticipantInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-stone-950 border border-stone-850 text-xs font-semibold text-stone-300 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 hover:text-stone-100 flex items-center justify-center cursor-pointer transition-colors"
            >
              +
            </button>
          </form>
        </div>

        {/* Running Subtotals & Breakdown */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">
            2. Basket Itemization Breakdown
          </h4>
          <div className="bg-stone-950/30 border border-stone-850/50 p-4 rounded-2xl flex-1 flex flex-col justify-between min-h-[170px]">
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1 no-scrollbar">
              {groupCart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-[10.5px] border-b border-stone-850/30 pb-1.5 last:border-b-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] bg-stone-900 text-stone-500 px-1.5 py-0.5 rounded mr-1.5 font-bold uppercase tracking-wider truncate">
                      {item.participant}
                    </span>
                    <span className="font-extrabold text-stone-300 truncate">{item.menuItem.name}</span>
                    {item.spiceLevel && <span className="text-[8.5px] text-rose-500 ml-1.5">🌶️ {item.spiceLevel}</span>}
                  </div>
                  <span className="text-stone-400 font-bold shrink-0 ml-2">
                    {item.quantity}x • Rs. {item.menuItem.price * item.quantity}
                  </span>
                </div>
              ))}
              {groupCart.length === 0 && (
                <p className="text-stone-500 text-xs text-center py-6">No items added to group basket yet.</p>
              )}
            </div>

            <div className="border-t border-stone-850/50 pt-3 flex justify-between items-center mt-3">
              <span className="text-[10px] text-stone-400 font-black uppercase tracking-wider">Group Subtotal</span>
              <span className="text-sm font-black text-amber-500">Rs. {grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Bill Splitting calculations */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">
            3. Choose Bill Split Method
          </h4>
          <div className="bg-stone-950/30 border border-stone-850/50 p-4 rounded-2xl flex-1 flex flex-col justify-between gap-4">
            <div className="grid grid-cols-2 gap-2 bg-stone-950 p-0.5 rounded-xl border border-stone-850/50 text-[10px] font-black uppercase">
              <button
                onClick={() => onSetSplitMethod('HOST_PAYS')}
                className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentSession.splitMethod === 'HOST_PAYS'
                    ? 'bg-amber-500 text-stone-950'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Host Pays All
              </button>
              <button
                onClick={() => onSetSplitMethod('EQUAL_SPLIT')}
                className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentSession.splitMethod === 'EQUAL_SPLIT'
                    ? 'bg-amber-500 text-stone-950'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Split Equally
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-1.5 text-center">
              {currentSession.splitMethod === 'HOST_PAYS' ? (
                <>
                  <span className="text-[9px] text-stone-500 uppercase tracking-widest font-black block">Single Payer Mode</span>
                  <span className="text-xl font-black text-stone-100">{currentSession.hostName} pays:</span>
                  <strong className="text-xl font-black text-emerald-500">Rs. {grandTotal}</strong>
                </>
              ) : (
                <>
                  <span className="text-[9px] text-stone-500 uppercase tracking-widest font-black block">Equal division split ({currentSession.participants.length} shares)</span>
                  <span className="text-xl font-black text-stone-100">Each participant owes:</span>
                  <strong className="text-xl font-black text-emerald-500">Rs. {splitAmount.toFixed(2)}</strong>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

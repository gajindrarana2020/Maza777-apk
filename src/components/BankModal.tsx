import React, { useState } from 'react';
import { X, Landmark, Smartphone, CheckCircle2, ShieldCheck, User, Hash } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';

const POPULAR_BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Punjab National Bank',
  'Kotak Mahindra Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'IndusInd Bank',
];

export const BankModal: React.FC = () => {
  const { showBankModal, closeBankModal, addBankCard, bankCards, showToast } = useApp();
  const [modalTab, setModalTab] = useState<'bank' | 'upi'>('bank');

  // Bank fields
  const [realName, setRealName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('State Bank of India');
  const [ifscCode, setIfscCode] = useState('');

  // UPI fields
  const [upiRealName, setUpiRealName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiPhone, setUpiPhone] = useState('');

  if (!showBankModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();

    if (bankCards.length >= 5) {
      showToast('Limit reached: Maximum 5 accounts allowed per user.', 'error');
      return;
    }

    if (modalTab === 'bank') {
      if (!realName.trim()) {
        showToast('Please enter account holder name', 'error');
        return;
      }
      if (!accountNumber.trim() || accountNumber.length < 8) {
        showToast('Please enter a valid bank account number (at least 8 digits)', 'error');
        return;
      }
      if (!ifscCode.trim() || ifscCode.length < 6) {
        showToast('Please enter bank IFSC code (e.g. SBIN0001234)', 'error');
        return;
      }

      addBankCard({
        type: 'bank',
        realName: realName.trim(),
        bankName: bankName,
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
      });
    } else {
      if (!upiRealName.trim()) {
        showToast('Please enter UPI registered name', 'error');
        return;
      }
      if (!upiId.trim() || !upiId.includes('@')) {
        showToast('Please enter a valid UPI ID (e.g. name@paytm)', 'error');
        return;
      }

      addBankCard({
        type: 'upi',
        realName: upiRealName.trim(),
        bankName: 'UPI Direct',
        accountNumber: upiId.trim(),
        upiId: upiId.trim(),
        phone: upiPhone.trim(),
      });
    }
  };

  return (
    <div
      id="bankModal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={closeBankModal}
    >
      <div
        id="bankModal-container"
        className="bg-[#181920] border border-amber-500/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              {modalTab === 'bank' ? <Landmark className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">Add Payout Account</h3>
                <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded">
                  {bankCards.length}/5 Used
                </span>
              </div>
              <p className="text-xs text-zinc-400">Add up to 5 unique Bank / UPI accounts</p>
            </div>
          </div>
          <button
            onClick={closeBankModal}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center hover:bg-zinc-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Account limit banner */}
        <div className="px-4 pt-3 pb-0">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-[11px] text-amber-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Account Security & Uniqueness Policy:</p>
              <p className="text-zinc-400 text-[10px] mt-0.5">
                You can add up to 5 different accounts. Once saved, no other user can use the same bank account or UPI ID.
              </p>
            </div>
          </div>
        </div>

        {/* Tab selection */}
        <div className="p-3 pb-0">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#121318] rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setModalTab('bank')}
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                modalTab === 'bank' ? 'bg-amber-400 text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Bank Account</span>
            </button>
            <button
              type="button"
              onClick={() => setModalTab('upi')}
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                modalTab === 'upi' ? 'bg-amber-400 text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>UPI ID</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5">
          {modalTab === 'bank' ? (
            <>
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Account Holder Real Name</label>
                <input
                  type="text"
                  required
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-[#14151b] border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Select Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-[#14151b] border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                >
                  {POPULAR_BANKS.map((b) => (
                    <option key={b} value={b} className="bg-zinc-900 text-white">
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Bank Account Number</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 50100492819284"
                  className="w-full bg-[#14151b] border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">IFSC Code</label>
                <input
                  type="text"
                  required
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN0004921"
                  maxLength={11}
                  className="w-full bg-[#14151b] border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono uppercase outline-none"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">UPI Holder Real Name</label>
                <input
                  type="text"
                  required
                  value={upiRealName}
                  onChange={(e) => setUpiRealName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-[#14151b] border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">UPI ID (VPA)</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                  placeholder="e.g. 9876543210@paytm / name@oksbi"
                  className="w-full bg-[#14151b] border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-amber-300 font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Mobile / WhatsApp Number (Optional)</label>
                <input
                  type="text"
                  value={upiPhone}
                  onChange={(e) => setUpiPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-[#14151b] border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-2 text-zinc-400 text-xs bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>256-bit encrypted verification for 100% secure payouts.</span>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={closeBankModal}
              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-extrabold text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Save {modalTab === 'bank' ? 'Bank Card' : 'UPI ID'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ArrowLeft, Save, User, MessageSquare, Phone, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';

export const ProfileEditScreen: React.FC = () => {
  const { user, updateProfile, navigateTo } = useApp();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [facebook, setFacebook] = useState(user?.facebook || '');
  const [telegram, setTelegram] = useState(user?.telegram || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();

    updateProfile({
      displayName: displayName.trim(),
      whatsapp: whatsapp.trim(),
      facebook: facebook.trim(),
      telegram: telegram.trim(),
    });

    navigateTo('profile');
  };

  return (
    <div id="profileEditScreen" className="max-w-xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigateTo('profile')}
          className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-black text-white">Edit Profile</h2>
          <p className="text-xs text-zinc-400">Update personal information & social channels</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-[#181920] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-400" /> Display Name
          </label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Golden Winner"
            className="w-full bg-[#14151b] border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1.5 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Number
          </label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full bg-[#14151b] border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-400" /> Facebook Account / Link
          </label>
          <input
            type="text"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="facebook.com/username"
            className="w-full bg-[#14151b] border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1.5 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" /> Telegram Account
          </label>
          <input
            type="text"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
            placeholder="@username"
            className="w-full bg-[#14151b] border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={() => navigateTo('profile')}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-2 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

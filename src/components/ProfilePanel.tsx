import React, { useEffect } from 'react';
import { User, Lock, Save } from 'lucide-react';

export const ProfilePanel = ({ state, actions }: any) => {
  const { currentUser, profileForm } = state;
  const { setProfileForm, handleProfileUpdate } = actions;

  useEffect(() => {
      if (currentUser) {
          setProfileForm({
              name: currentUser.name || '',
              username: currentUser.username || '',
              password: ''
          });
      }
  }, [currentUser.id]); // Only re-run if the active user changes

  const isStudent = currentUser.role === 'student';

  return (
    <div className={`mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 ${isStudent ? 'max-w-md py-20' : 'max-w-2xl py-8'}`}>
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden text-center p-12">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-100 shadow-inner">
            <User className="text-blue-600" size={40} />
        </div>
        
        <h2 className="text-2xl font-black text-blue-900 mb-10 tracking-tight">Kişisel Bilgilerim</h2>
        
        <div className="space-y-6 text-left">
            <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2 px-1">AD SOYAD</label>
                <input 
                    type="text" 
                    value={profileForm.name} 
                    onChange={e=>setProfileForm({...profileForm, name:e.target.value})} 
                    className="w-full bg-transparent outline-none font-black text-gray-800 text-base px-1"
                />
            </div>
            <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2 px-1">KULLANICI ADI</label>
                <input 
                    type="text" 
                    value={profileForm.username} 
                    onChange={e=>setProfileForm({...profileForm, username:e.target.value})} 
                    className="w-full bg-transparent outline-none font-black text-gray-800 text-base px-1"
                />
            </div>
            <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2 px-1">ŞİFRE</label>
                <input 
                    type="password" 
                    value={profileForm.password} 
                    onChange={e=>setProfileForm({...profileForm, password:e.target.value})} 
                    placeholder="••••"
                    className="w-full bg-transparent outline-none font-black text-gray-800 text-base px-1 placeholder:text-gray-900"
                />
            </div>
        </div>

        <div className="mt-12">
            <button 
                onClick={handleProfileUpdate} 
                className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 text-sm"
            >
                <Save size={18}/> Değişiklikleri Kaydet
            </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Cloud, AlertTriangle, X } from 'lucide-react';

export const Toast = ({ message, type, onClose }: any) => {
  if (!message) return null;
  const typeStyles: any = {
    success: 'bg-white border-green-500 text-green-700',
    error: 'bg-white border-red-500 text-red-700',
    info: 'bg-white border-blue-500 text-blue-700',
    warning: 'bg-white border-orange-500 text-orange-700'
  };
  return (
    <div className={`fixed bottom-6 right-6 border-l-4 ${typeStyles[type] || 'bg-white border-gray-500 text-gray-700'} shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-5 py-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-right-8 duration-300 z-[100] min-w-[300px]`}>
      {type === 'success' && <CheckCircle size={20} className="text-green-500" />}
      {type === 'error' && <AlertCircle size={20} className="text-red-500" />}
      {type === 'info' && <Cloud size={20} className="text-blue-500" />}
      {type === 'warning' && <AlertTriangle size={20} className="text-orange-500" />}
      <span className="font-medium text-sm flex-1">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
        <X size={16} />
      </button>
    </div>
  );
};

export const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4 text-red-500">
          <AlertTriangle size={24} />
          <h3 className="font-bold text-lg text-gray-900">Emin misiniz?</h3>
        </div>
        <p className="text-gray-600 mb-8 text-sm leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-5 py-2.5 text-gray-500 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors">İptal</button>
          <button onClick={() => { onConfirm(); onCancel(); }} className="px-5 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-red-200">Evet, Sil</button>
        </div>
      </div>
    </div>
  );
};

export const PromptModal = ({ isOpen, message, defaultValue, onConfirm, onCancel }: any) => {
  const [val, setVal] = useState('');
  useEffect(() => { if(isOpen) setVal(defaultValue); }, [isOpen, defaultValue]);
  if (!isOpen) return null;
  return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-200">
          <h3 className="font-bold text-lg text-gray-900 mb-4">{message}</h3>
          <input type="text" autoFocus value={val} onChange={e=>setVal(e.target.value)} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl mb-8 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm" onKeyDown={e=>{if(e.key==='Enter') {onConfirm(val); onCancel();}}}/>
          <div className="flex justify-end gap-3">
            <button onClick={onCancel} className="px-5 py-2.5 text-gray-500 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors">İptal</button>
            <button onClick={() => { onConfirm(val); onCancel(); }} className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-200">Kaydet</button>
          </div>
        </div>
      </div>
  );
};

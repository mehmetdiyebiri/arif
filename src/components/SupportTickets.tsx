import React from 'react';
import { ArrowLeft, MessageSquare, School, User, Activity, Plus, Send, CheckCircle, Clock } from 'lucide-react';

export const SupportTickets = ({ state, actions, isSuperAdmin }: any) => {
  const { tickets, activeSchoolId, supportView, selectedTicket, ticketForm, ticketReply, currentUser } = state;
  const { setSupportView, setSelectedTicket, setTicketForm, handleCreateTicket, setTicketReply, handleReplyTicket, handleCloseTicket, requestConfirm } = actions;

  const displayedTickets = isSuperAdmin ? tickets : tickets.filter((t: any) => t.schoolId === activeSchoolId);
  
  if (supportView === 'new' && !isSuperAdmin) {
      return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <button onClick={()=>setSupportView('list')} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors bg-white px-5 py-2.5 rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50"><ArrowLeft size={18}/> Taleplere Dön</button>
              <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                          <MessageSquare className="text-blue-600" size={24}/>
                      </div>
                      <div>
                          <h3 className="font-black text-2xl text-blue-900">Yeni Destek Talebi</h3>
                          <p className="text-sm text-gray-400 font-medium">Sorununuzu detaylıca açıklayarak bize iletin.</p>
                      </div>
                  </div>
                  <div className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Konu Başlığı</label>
                          <input 
                            value={ticketForm.subject} 
                            onChange={e=>setTicketForm({...ticketForm, subject:e.target.value})} 
                            className="w-full bg-gray-50/50 border border-gray-100 px-6 py-4 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" 
                            placeholder="Örn: Sınıf listesi güncellenmiyor..." 
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Mesajınız</label>
                          <textarea 
                            value={ticketForm.message} 
                            onChange={e=>setTicketForm({...ticketForm, message:e.target.value})} 
                            className="w-full bg-gray-50/50 border border-gray-100 px-6 py-4 rounded-2xl h-48 text-sm font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none leading-relaxed" 
                            placeholder="Talebinizi buraya yazın..." 
                          />
                      </div>
                      <button 
                        onClick={handleCreateTicket} 
                        className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 w-full md:w-auto flex items-center justify-center gap-2"
                      >
                        Talebi Gönder <Send size={18}/>
                      </button>
                  </div>
              </div>
          </div>
      )
  }

  if (supportView === 'detail' && selectedTicket) {
      const ticket = displayedTickets.find((t: any) => t.id === selectedTicket);
      if(!ticket) return null;
      return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <button onClick={()=>setSupportView('list')} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors bg-white px-5 py-2.5 rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50"><ArrowLeft size={18}/> Taleplere Dön</button>
                  <div className="flex gap-3 items-center">
                      {ticket.status !== 'closed' && (
                          <button 
                            onClick={() => handleCloseTicket(ticket.id)} 
                            className="bg-white text-gray-500 hover:text-red-600 px-5 py-2.5 rounded-2xl text-sm font-bold border border-gray-100 shadow-sm transition-all hover:bg-red-50"
                          >
                            Talebi Kapat
                          </button>
                      )}
                      <span className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest border ${
                        ticket.status === 'closed' ? 'bg-gray-50 text-gray-400 border-gray-100' : 
                        ticket.status === 'answered' ? 'bg-green-50 text-green-600 border-green-100' : 
                        'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                          {ticket.status === 'closed' ? 'KAPALI' : ticket.status === 'answered' ? 'YANITLANDI' : 'AÇIK / BEKLİYOR'}
                      </span>
                  </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-[40px] shadow-sm overflow-hidden flex flex-col h-[700px]">
                  <div className="p-10 border-b border-gray-50 bg-white">
                      <h3 className="font-black text-2xl text-blue-900 mb-3">{ticket.subject}</h3>
                      <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex flex-wrap gap-6">
                          <span className="flex items-center gap-2"><School size={14} className="text-blue-400"/> {ticket.schoolName}</span>
                          <span className="flex items-center gap-2"><User size={14} className="text-blue-400"/> {ticket.senderName}</span>
                          <span className="flex items-center gap-2"><Clock size={14} className="text-blue-400"/> {new Date(ticket.createdAt).toLocaleString('tr-TR')}</span>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-gray-50/30">
                      {ticket.messages.map((m: any) => {
                          const isMe = isSuperAdmin ? m.senderRole === 'superadmin' : m.senderRole !== 'superadmin';
                          return (
                              <div key={m.id} className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                                  <div className={`p-6 rounded-[32px] text-sm font-bold ${
                                    isMe 
                                        ? 'bg-blue-600 text-white rounded-tr-none shadow-xl shadow-blue-100' 
                                        : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-none'
                                  }`}>
                                      <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {m.senderName} ({m.senderRole === 'superadmin' ? 'SİSTEM YÖNETİCİSİ' : 'OKUL YÖNETİCİSİ'})
                                      </div>
                                      <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                                  </div>
                                  <div className="text-[10px] text-gray-400 mt-2 font-black uppercase tracking-widest ml-1 mr-1">{new Date(m.date).toLocaleString('tr-TR')}</div>
                              </div>
                          )
                      })}
                  </div>
                  {ticket.status !== 'closed' && (
                      <div className="p-8 bg-white border-t border-gray-50 flex gap-4 items-end">
                          <textarea 
                            value={ticketReply} 
                            onChange={e=>setTicketReply(e.target.value)} 
                            placeholder="Yanıtınızı yazın..." 
                            className="flex-1 bg-gray-50/50 border border-gray-100 px-6 py-4 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none h-16" 
                          />
                          <button 
                            onClick={()=>handleReplyTicket(ticket.id)} 
                            className="bg-blue-600 text-white px-8 h-16 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-2"
                          >
                            <Send size={18}/> Gönder
                          </button>
                      </div>
                  )}
                  {ticket.status === 'closed' && (
                      <div className="p-8 bg-gray-50 border-t border-gray-100 text-center text-xs font-black text-gray-400 uppercase tracking-widest">
                        Bu destek talebi kapatılmıştır.
                      </div>
                  )}
              </div>
          </div>
      )
  }

  // List View
  return (
      <div className="animate-in fade-in duration-500 space-y-8">
          {!isSuperAdmin && (
              <div className="flex justify-end">
                  <button 
                    onClick={()=>setSupportView('new')} 
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-2"
                  >
                    <Plus size={20}/> Yeni Talep Oluştur
                  </button>
              </div>
          )}
          
          <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 bg-white">
                   <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest flex items-center gap-3">
                     <MessageSquare size={20} className="text-blue-600"/> 
                     {isSuperAdmin ? 'TÜM DESTEK TALEPLERİ' : 'DESTEK TALEPLERİNİZ'}
                   </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <tr>
                            {isSuperAdmin && <th className="px-8 py-5">OKUL</th>}
                            <th className="px-8 py-5">GÖNDEREN</th>
                            <th className="px-8 py-5">KONU BAŞLIĞI</th>
                            <th className="px-8 py-5">DURUM</th>
                            <th className="px-8 py-5">SON İŞLEM</th>
                            <th className="px-8 py-5 text-right">İŞLEM</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {displayedTickets.length === 0 ? (
                            <tr>
                                <td colSpan={isSuperAdmin ? 6 : 5} className="p-20 text-center text-gray-400 font-bold bg-gray-50/20">
                                    <MessageSquare size={48} className="mx-auto mb-4 opacity-10"/>
                                    Herhangi bir destek talebi bulunmuyor.
                                </td>
                            </tr>
                        ) : (
                            displayedTickets.map((t: any) => (
                                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                                    {isSuperAdmin && <td className="px-8 py-5 font-bold text-gray-900">{t.schoolName}</td>}
                                    <td className="px-8 py-5 text-gray-500 font-bold">{t.senderName}</td>
                                    <td className="px-8 py-5 font-black text-blue-900">{t.subject}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                            t.status === 'closed' ? 'bg-gray-50 text-gray-400 border-gray-100' : 
                                            t.status === 'answered' ? 'bg-green-50 text-green-600 border-green-100' : 
                                            'bg-orange-50 text-orange-600 border-orange-100'
                                        }`}>
                                            {t.status === 'closed' ? 'KAPALI' : t.status === 'answered' ? 'YANITLANDI' : 'AÇIK'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-gray-400 text-[11px] font-bold uppercase tracking-tight">
                                        {new Date(t.updatedAt).toLocaleString('tr-TR', {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'})}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button 
                                            onClick={()=>{setSelectedTicket(t.id); setSupportView('detail');}} 
                                            className="text-blue-600 font-black text-[11px] uppercase tracking-widest bg-blue-50 border border-blue-100 px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-all shadow-sm"
                                        >
                                            Görüntüle
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
              </div>
          </div>
      </div>
  )
};

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AlertCircle, FileText, CheckCircle, Clock, Shield, Search } from 'lucide-react';

export const AuditLogsPanel = ({ activeSchoolId }: { activeSchoolId: string }) => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!activeSchoolId) return;
        
        const colName = `audit_logs_${activeSchoolId}`;
        const q = query(collection(db, colName), orderBy('timestamp', 'desc'), limit(100));
        
        const unsubscribe = onSnapshot(q, (snap) => {
            const logsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLogs(logsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching audit logs", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [activeSchoolId]);

    const filteredLogs = logs.filter(log => 
        log.actor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target?.resourceName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getActionColor = (action: string) => {
        if (action.includes('DELETE')) return 'bg-red-50 text-red-600 border-red-100';
        if (action.includes('UPDATE')) return 'bg-orange-50 text-orange-600 border-orange-100';
        if (action.includes('ADD') || action.includes('CREATE')) return 'bg-green-50 text-green-600 border-green-100';
        if (action.includes('LOGIN')) return 'bg-blue-50 text-blue-600 border-blue-100';
        return 'bg-gray-50 text-gray-600 border-gray-100';
    };

    const getSeverityColor = (severity: string) => {
        switch(severity) {
            case 'critical': return 'text-red-600 bg-red-100 px-2 py-0.5 rounded-md';
            case 'high': return 'text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md';
            case 'medium': return 'text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md';
            default: return 'text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md';
        }
    };

    return (
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm animate-in fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                        <Shield className="text-blue-600" size={28}/> 
                        Sistem Logları (Audit Trails)
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm font-medium">Son 100 işlem kaydı listelenmektedir. Kritik tüm eylemler sistem tarafından damgalanır.</p>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100 w-64">
                    <Search className="text-gray-400" size={18}/>
                    <input 
                        type="text" 
                        placeholder="Kullanıcı, Eylem veya Hedef..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-transparent outline-none w-full text-sm font-semibold"
                    />
                </div>
            </div>

            {loading ? (
                <div className="p-10 text-center text-gray-400 font-bold">Yükleniyor...</div>
            ) : filteredLogs.length === 0 ? (
                <div className="p-16 text-center text-gray-400 font-bold bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
                    Log kaydı bulunamadı.
                </div>
            ) : (
                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#FBFBFC] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="p-4">Tarih</th>
                                <th className="p-4">İşlemi Yapan</th>
                                <th className="p-4">Eylem</th>
                                <th className="p-4">Hedef</th>
                                <th className="p-4">Detay / Neden</th>
                                <th className="p-4">Önem derecesi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 whitespace-nowrap text-xs font-semibold text-gray-500">
                                        {new Date(log.timestamp).toLocaleString('tr-TR')}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{log.actor?.name}</div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">{log.actor?.role} • {log.actor?.ipAddress}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {log.target?.resourceName ? (
                                            <div>
                                                <div className="font-bold text-gray-700">{log.target.resourceName}</div>
                                                <div className="text-[10px] text-gray-400">{log.target.resourceType}</div>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="p-4 max-w-xs truncate text-xs text-gray-500 font-medium" title={log.changes?.reason || JSON.stringify(log.changes)}>
                                        {log.changes?.reason || (log.changes ? 'Sistem Değişikliği' : '-')}
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-[10px] uppercase font-black uppercase tracking-widest ${getSeverityColor(log.severity)}`}>
                                            {log.severity || 'LOW'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

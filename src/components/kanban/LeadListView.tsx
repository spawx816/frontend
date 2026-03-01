import { useMemo } from 'react';
import { type Lead, type Pipeline } from '../../types/index.ts';
import { Mail, Phone, MapPin, Clock, BadgeCheck, Users, Search, Activity } from 'lucide-react';
import { EmptyState } from '../shared/EmptyState.tsx';

interface LeadListViewProps {
    leads: Lead[];
    pipeline: Pipeline | null;
    isLoading: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filterSource: string;
    onLeadClick: (lead: Lead) => void;
    onAddLead: () => void;
    onToggleView: () => void;
}

export function LeadListView({
    leads,
    pipeline,
    isLoading,
    searchQuery,
    onSearchChange,
    filterSource,
    onLeadClick,
    onAddLead,
    onToggleView
}: LeadListViewProps) {

    const filteredLeads = useMemo(() => {
        if (!leads || !Array.isArray(leads)) return [];
        return leads.filter(lead => {
            const matchesSearch =
                `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.phone?.includes(searchQuery);

            const matchesSource = filterSource === 'ALL' || lead.source === filterSource;

            return matchesSearch && matchesSource;
        });
    }, [leads, searchQuery, filterSource]);

    const getStageName = (stageId: string) => {
        return pipeline?.stages?.find(s => s.id === stageId)?.name || 'Desconocido';
    };

    const getStageColor = (stageId: string) => {
        return pipeline?.stages?.find(s => s.id === stageId)?.color || 'bg-slate-800';
    };

    return (
        <div className="flex flex-col h-full bg-[#0f172a] text-slate-200">
            {/* Header */}
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 bg-[#0f172a]/80 backdrop-blur-sm sticky top-0 z-10 w-full">
                <div className="flex items-center space-x-4">
                    <div className="bg-blue-600 p-1.5 rounded-lg shrink-0">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold text-white tracking-tight uppercase">
                            Admisiones
                        </h1>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-slate-800 w-fit">
                            Lista Simple
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={onToggleView}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all hidden md:flex"
                    >
                        Ver Tablero
                    </button>

                    <div className="relative hidden md:block">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar prospecto..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all w-48 lg:w-72 text-white"
                        />
                    </div>

                    <div className="h-6 w-[1px] bg-slate-800 hidden md:block" />

                    <button
                        onClick={onAddLead}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/40 active:scale-95 whitespace-nowrap"
                    >
                        + Nuevo Prospecto
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-x-auto overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800">
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden text-xs">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 space-y-4">
                            <div className="relative">
                                <div className="w-12 h-12 border-4 border-blue-500/20 rounded-full animate-ping absolute"></div>
                                <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] animate-pulse">Cargando Prospectos...</p>
                        </div>
                    ) : filteredLeads.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-300 min-w-[900px]">
                                <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                                    <tr>
                                        <th className="px-4 md:px-6 py-4">Prospecto</th>
                                        <th className="px-4 md:px-6 py-4">Contacto</th>
                                        <th className="px-4 md:px-6 py-4">Dirección</th>
                                        <th className="px-4 md:px-6 py-4">Estado (Etapa)</th>
                                        <th className="px-4 md:px-6 py-4">Acciones</th>
                                        <th className="px-4 md:px-6 py-4 text-right">Creado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {filteredLeads.map((lead) => (
                                        <tr
                                            key={lead.id}
                                            className="hover:bg-slate-800/30 transition-colors group"
                                        >
                                            <td className="px-4 md:px-6 py-4 cursor-pointer" onClick={() => onLeadClick(lead)}>
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold border border-blue-800 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        {lead.first_name[0]}{lead.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-medium truncate max-w-[150px] md:max-w-none group-hover:text-blue-400 transition-colors">
                                                            {lead.first_name} {lead.last_name}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                                                            Fuente: <span className="text-blue-400/80">{lead.source || 'Desconocida'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-xs">
                                                        <Mail className="w-3 h-3 mr-2 text-slate-500 shrink-0" />
                                                        <span className="truncate max-w-[150px]">{lead.email || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center text-xs">
                                                        <Phone className="w-3 h-3 mr-2 text-slate-500 shrink-0" />
                                                        <span>{lead.phone || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-4">
                                                <div className="flex items-start text-xs text-slate-400">
                                                    <MapPin className="w-3 h-3 mr-2 mt-0.5 text-slate-500 shrink-0" />
                                                    <span className="truncate max-w-[200px] block whitespace-break-spaces leading-tight">{lead.address || <span className="italic text-slate-600">Sin especificar</span>}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-4">
                                                <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${getStageColor(lead.stage_id)} text-white/90 shadow-sm whitespace-nowrap`}>
                                                    {getStageName(lead.stage_id)}
                                                </span>
                                            </td>
                                            <td className="px-4 md:px-6 py-4">
                                                <button
                                                    onClick={() => onLeadClick(lead)}
                                                    className="flex items-center text-blue-400 hover:text-blue-300 text-[10px] font-black underline underline-offset-4 tracking-tight uppercase transition-all"
                                                >
                                                    <BadgeCheck className="w-3.5 h-3.5 mr-1" />
                                                    Abrir Perfil
                                                </button>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 text-slate-500 text-[10px] whitespace-nowrap text-right font-mono uppercase">
                                                <div className="flex items-center justify-end">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {new Date(lead.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState
                            icon={Users}
                            title="No hay prospectos"
                            description={searchQuery ? "Ningún prospecto coincide con la búsqueda." : "Aún no tienes prospectos registrados en el sistema."}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}

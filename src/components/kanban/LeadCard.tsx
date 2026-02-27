import { Draggable } from '@hello-pangea/dnd';
import type { Lead } from '../../types/index.ts';
import { Phone, Mail, Clock, UserPlus, Loader2, Star, Tag as TagIcon, FileText } from 'lucide-react';
import { useConvertLead } from '../../hooks/useLeads.ts';
import { toast } from 'react-hot-toast';

interface LeadCardProps {
    lead: Lead;
    index: number;
    onClick?: (lead: Lead) => void;
}

export function LeadCard({ lead, index, onClick }: LeadCardProps) {
    const convertLead = useConvertLead();

    const handleConvert = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`¿Convertir a ${lead.first_name} ${lead.last_name} en estudiante?`)) {
            try {
                await convertLead.mutateAsync(lead.id);
                toast.success('¡Convertido con éxito!');
            } catch (err) {
                toast.error('Error al convertir lead');
            }
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        if (score >= 40) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    };

    return (
        <Draggable draggableId={lead.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onClick?.(lead)}
                    className={`bg-slate-900 group p-4 rounded-xl border border-slate-800 shadow-sm mb-3 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-pointer ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500 scale-[1.02]' : ''
                        }`}
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                            <h3 className="text-white font-bold text-sm group-hover:text-blue-400 transition-colors">
                                {lead.first_name} {lead.last_name}
                            </h3>
                            {lead.score > 0 && (
                                <div className={`flex items-center mt-1 px-1.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-tighter w-fit ${getScoreColor(lead.score)}`}>
                                    <Star className="w-2 h-2 mr-1 fill-current" />
                                    {lead.score} pts
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleConvert}
                            disabled={convertLead.isPending}
                            className="text-slate-600 hover:text-emerald-500 transition-all p-1.5 hover:bg-emerald-500/10 rounded-lg opacity-0 group-hover:opacity-100"
                            title="Convertir a Estudiante"
                        >
                            {convertLead.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <UserPlus className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    <div className="space-y-2">
                        {(lead.email || lead.phone) && (
                            <div className="grid grid-cols-1 gap-1">
                                {lead.email && (
                                    <div className="flex items-center text-[11px] text-slate-400">
                                        <Mail className="w-3 h-3 mr-2 text-slate-600" />
                                        <span className="truncate">{lead.email}</span>
                                    </div>
                                )}
                                {lead.phone && (
                                    <div className="flex items-center text-[11px] text-slate-400">
                                        <Phone className="w-3 h-3 mr-2 text-slate-600" />
                                        <span>{lead.phone}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {lead.tags && lead.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {lead.tags.slice(0, 3).map((tag, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] rounded-md border border-slate-700 flex items-center">
                                        <TagIcon className="w-2 h-2 mr-1 opacity-50" />
                                        {tag}
                                    </span>
                                ))}
                                {lead.tags.length > 3 && (
                                    <span className="text-[9px] text-slate-500 font-bold">+{lead.tags.length - 3}</span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1 opacity-50" />
                            {new Date(lead.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                        </div>
                        <div className="flex items-center space-x-2">
                            {lead.notes && (
                                <FileText className="w-3 h-3 text-amber-500/50" />
                            )}
                            {lead.source && (
                                <span className="bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-400 border border-blue-500/20 text-[9px]">
                                    {lead.source}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
}

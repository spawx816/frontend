import { Droppable } from '@hello-pangea/dnd';
import type { Lead, Stage } from '../../types/index.ts';
import { LeadCard } from './LeadCard';
import { Plus, Settings2 } from 'lucide-react';

interface KanbanColumnProps {
    stage: Stage;
    leads: Lead[];
    onLeadClick?: (lead: Lead) => void;
    onAddLead?: (stageId: string) => void;
    onEditStage?: (stage: Stage) => void;
}

export function KanbanColumn({ stage, leads, onLeadClick, onAddLead, onEditStage }: KanbanColumnProps) {
    return (
        <div className="flex-shrink-0 w-80 bg-slate-950/40 rounded-2xl flex flex-col max-h-full border border-slate-800/60 backdrop-blur-sm">
            <div className="p-4 flex justify-between items-center bg-slate-900/50 rounded-t-2xl border-b border-slate-800/50">
                <div className="flex items-center space-x-3">
                    <div
                        className="w-1.5 h-6 rounded-full"
                        style={{ backgroundColor: stage.color }}
                    />
                    <div className="flex flex-col">
                        <h2 className="text-white font-black text-[11px] uppercase tracking-widest">
                            {stage.name}
                        </h2>
                        <span className="text-slate-500 text-[9px] font-bold uppercase tracking-tighter">
                            {leads.length} Prospectos
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => onAddLead?.(stage.id)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onEditStage?.(stage)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all group"
                    >
                        <Settings2 className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>
            </div>

            <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-3 flex-1 overflow-y-auto transition-all scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent ${snapshot.isDraggingOver ? 'bg-blue-500/5' : ''
                            }`}
                    >
                        {leads.map((lead, index) => (
                            <LeadCard
                                key={lead.id}
                                lead={lead}
                                index={index}
                                onClick={onLeadClick}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}

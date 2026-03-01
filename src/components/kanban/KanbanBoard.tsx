import { useState, useMemo } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { usePipelines, usePipeline, useLeads, useMoveLead } from '../../hooks/useLeads.ts';
import { KanbanColumn } from './KanbanColumn.tsx';
import { Search, Activity, ListTodo } from 'lucide-react';
import { CreateLeadModal } from './CreateLeadModal.tsx';
import { LeadDetailsModal } from './LeadDetailsModal.tsx';
import { EditStageModal } from './EditStageModal.tsx';
import { LeadListView } from './LeadListView.tsx';
import type { Lead, Stage } from '../../types/index.ts';

export function KanbanBoard() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSource, setFilterSource] = useState('ALL');
    const [createInStageId, setCreateInStageId] = useState<string | null>(null);
    const [editingStage, setEditingStage] = useState<Stage | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

    const { data: pipelines, isLoading: isLoadingPipelines } = usePipelines();
    const activePipelineId = pipelines?.[0]?.id;
    const { data: pipeline, isLoading: isLoadingPipeline } = usePipeline(activePipelineId);
    const { data: leads, isLoading: isLoadingLeads } = useLeads(activePipelineId);
    const moveLead = useMoveLead();

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

    const sources = useMemo(() => {
        if (!leads || !Array.isArray(leads)) return [];
        const uniqueSources = Array.from(new Set(leads.map(l => l.source).filter(Boolean)));
        return uniqueSources as string[];
    }, [leads]);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;
        moveLead.mutate({ leadId: draggableId, stageId: destination.droppableId });
    };

    if (isLoadingPipelines || isLoadingPipeline || isLoadingLeads) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0f172a]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const firstStageId = pipeline?.stages?.[0]?.id;

    const handleOpenCreateInStage = (stageId: string) => {
        setCreateInStageId(stageId);
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setCreateInStageId(null);
    };

    return (
        <div className="flex flex-col h-full bg-[#0f172a] text-slate-200">
            {isCreateModalOpen && activePipelineId && (createInStageId || firstStageId) && (
                <CreateLeadModal
                    pipelineId={activePipelineId}
                    stageId={createInStageId || firstStageId!}
                    onClose={handleCloseCreateModal}
                />
            )}

            <LeadDetailsModal
                lead={selectedLead}
                isOpen={!!selectedLead}
                onClose={() => setSelectedLead(null)}
            />

            {editingStage && (
                <EditStageModal
                    stage={editingStage}
                    onClose={() => setEditingStage(null)}
                />
            )}

            {viewMode === 'list' ? (
                <LeadListView
                    leads={leads || []}
                    pipeline={pipeline || null}
                    isLoading={isLoadingLeads}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    filterSource={filterSource}
                    onLeadClick={setSelectedLead}
                    onAddLead={() => setIsCreateModalOpen(true)}
                    onToggleView={() => setViewMode('kanban')}
                />
            ) : (
                <div className="flex flex-col h-full">
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
                                    {pipeline?.name || 'Cargando...'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setViewMode('list')}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all hidden md:flex items-center gap-2"
                            >
                                <ListTodo className="w-4 h-4" />
                                Ver Lista Simple
                            </button>

                            <div className="relative hidden md:block">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all w-48 lg:w-72 text-white"
                                />
                            </div>

                            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                                <button
                                    onClick={() => setFilterSource('ALL')}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${filterSource === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Todos
                                </button>
                                {sources.map(source => (
                                    <button
                                        key={source}
                                        onClick={() => setFilterSource(source || 'ALL')}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${filterSource === source ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {source}
                                    </button>
                                ))}
                            </div>

                            <div className="h-6 w-[1px] bg-slate-800" />

                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/40 active:scale-95 whitespace-nowrap"
                            >
                                + Nuevo Prospecto
                            </button>
                        </div>
                    </header>

                    {/* Kanban Container */}
                    <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 scrollbar-thin scrollbar-thumb-slate-800">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="flex h-full space-x-6">
                                {pipeline?.stages?.map((stage) => (
                                    <KanbanColumn
                                        key={stage.id}
                                        stage={stage}
                                        leads={filteredLeads?.filter((l) => l.stage_id === stage.id) || []}
                                        onLeadClick={setSelectedLead}
                                        onAddLead={handleOpenCreateInStage}
                                        onEditStage={setEditingStage}
                                    />
                                ))}
                            </div>
                        </DragDropContext>
                    </main>
                </div>
            )}
        </div>
    );
}

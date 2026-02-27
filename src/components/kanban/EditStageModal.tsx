import { useState } from 'react';
import { X, Trash2, CheckCircle2 } from 'lucide-react';
import { useUpdateStage, useDeleteStage } from '../../hooks/useLeads.ts';
import { toast } from 'react-hot-toast';
import type { Stage } from '../../types/index.ts';

interface EditStageModalProps {
    stage: Stage;
    onClose: () => void;
}

export function EditStageModal({ stage, onClose }: EditStageModalProps) {
    const [name, setName] = useState(stage.name);
    const [color, setColor] = useState(stage.color || '#3b82f6');
    const [isWon, setIsWon] = useState(stage.is_won || false);
    const [isLost, setIsLost] = useState(stage.is_lost || false);

    const updateMutation = useUpdateStage();
    const deleteMutation = useDeleteStage();

    const handleUpdate = async () => {
        try {
            await updateMutation.mutateAsync({
                id: stage.id,
                data: { name, color, is_won: isWon, is_lost: isLost }
            });
            toast.success('Etapa actualizada');
            onClose();
        } catch (error) {
            toast.error('Error al actualizar la etapa');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de eliminar esta etapa? Los prospectos en ella podrían quedar huérfanos.')) return;
        try {
            await deleteMutation.mutateAsync(stage.id);
            toast.success('Etapa eliminada');
            onClose();
        } catch (error) {
            toast.error('Error al eliminar la etapa');
        }
    };

    const colors = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6', '#64748b'
    ];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 w-full max-w-sm rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h2 className="text-lg font-bold text-white tracking-tight">Configurar Etapa</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nombre de la Etapa</label>
                        <input
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Color Identificador</label>
                        <div className="flex flex-wrap gap-2 pt-1 px-1">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Atributos Especiales</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => { setIsWon(!isWon); if (!isWon) setIsLost(false); }}
                                className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${isWon ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60'}`}
                            >
                                <CheckCircle2 className="w-5 h-5 mb-1" />
                                <span className="text-[10px] font-bold uppercase">Éxito (Ganado)</span>
                            </button>
                            <button
                                onClick={() => { setIsLost(!isLost); if (!isLost) setIsWon(false); }}
                                className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${isLost ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60'}`}
                            >
                                <X className="w-5 h-5 mb-1" />
                                <span className="text-[10px] font-bold uppercase">Abandono (Perdido)</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex flex-col space-y-3">
                    <button
                        onClick={handleUpdate}
                        disabled={updateMutation.isPending}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-900/20"
                    >
                        {updateMutation.isPending ? 'Guardando...' : 'Actualizar Configuración'}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center space-x-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar Etapa</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

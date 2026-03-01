import { useState, useEffect, useRef } from 'react';
import type { Lead, LeadAttachment, ChatConversation, ChatMessage } from '../../types/index.ts';
import { X, User, Mail, Phone, Tag as TagIcon, Star, FileText, Send, Calendar, Zap, Paperclip, Upload, Trash2, Download, MessageSquare, Smartphone, Instagram, MapPin } from 'lucide-react';
import { useUpdateLead, useLeadAttachments, useUploadAttachment, useDeleteAttachment } from '../../hooks/useLeads.ts';
import { toast } from 'react-hot-toast';
import apiClient from '../../lib/api-client';
import { ChatWindow } from '../chat/ChatWindow';
import { io } from 'socket.io-client';

interface LeadDetailsModalProps {
    lead: Lead | null;
    isOpen: boolean;
    onClose: () => void;
}

export function LeadDetailsModal({ lead, isOpen, onClose }: LeadDetailsModalProps) {
    const updateLead = useUpdateLead();
    const { data: attachments, isLoading: isLoadingAttachments } = useLeadAttachments(lead?.id);
    const uploadAttachment = useUploadAttachment();
    const deleteAttachment = useDeleteAttachment();

    const [activeTab, setActiveTab] = useState<'info' | 'docs' | 'chat'>('info');
    const [formData, setFormData] = useState<Partial<Lead>>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        score: 0,
        tags: [],
        notes: '',
        source: '',
        campaign: ''
    });
    const [tagInput, setTagInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Chat states
    const [conversation, setConversation] = useState<ChatConversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
        if (lead) {
            setFormData({
                first_name: lead.first_name || '',
                last_name: lead.last_name || '',
                email: lead.email || '',
                phone: lead.phone || '',
                address: lead.address || '',
                score: lead.score || 0,
                tags: lead.tags || [],
                notes: lead.notes || '',
                source: lead.source || '',
                campaign: lead.campaign || ''
            });

            // Fetch conversation for this lead
            fetchConversation(lead.id);
        }
    }, [lead]);

    useEffect(() => {
        if (activeTab === 'chat' && conversation) {
            fetchMessages(conversation.id);

            // Setup socket
            const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');

            newSocket.on('connect', () => {
                console.log('Socket connected!', newSocket.id);
            });
            newSocket.on('new_message', (msg: ChatMessage) => {
                if (msg.conversation_id === conversation.id) {
                    setMessages(prev => [...prev, msg]);
                }
            });

            return () => {
                newSocket.close();
            };
        }
    }, [activeTab, conversation]);

    const fetchConversation = async (leadId: string) => {
        try {
            const { data } = await apiClient.get(`/integrations/conversations/by-lead/${leadId}`);
            setConversation(data);
        } catch (err) {
            console.error('Error fetching conversation', err);
        }
    };

    const fetchMessages = async (convId: string) => {
        try {
            const { data } = await apiClient.get(`/integrations/conversations/${convId}/messages`);
            setMessages(data);
        } catch (err) {
            console.error('Error fetching messages', err);
        }
    };

    const handleSendMessage = async (content: string) => {
        if (!conversation) return;
        try {
            await apiClient.post(`/integrations/conversations/${conversation.id}/reply`, {
                content,
                userId: '15474f88-466d-495c-9c90-09b69b52a784' // System Admin ID
            });
        } catch (err) {
            toast.error('Error al enviar mensaje');
        }
    };

    if (!isOpen || !lead) return null;

    const handleStartChat = async (source: 'whatsapp' | 'instagram') => {
        try {
            const { data } = await apiClient.post('/integrations/conversations/start', {
                leadId: lead.id,
                source
            });
            setConversation(data);
            toast.success(`Conversación de ${source} iniciada`);
            fetchConversation(lead.id);
        } catch (err) {
            toast.error('Error al iniciar conversación');
        }
    };

    const handleSave = async () => {
        try {
            await updateLead.mutateAsync({
                id: lead.id,
                data: {
                    firstName: formData.first_name,
                    lastName: formData.last_name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    score: formData.score,
                    tags: formData.tags,
                    notes: formData.notes,
                    campaign: formData.campaign
                } as any
            });
            toast.success('Información actualizada');
            onClose();
        } catch (err) {
            toast.error('Error al actualizar');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await uploadAttachment.mutateAsync({ leadId: lead.id, file });
            toast.success('Archivo subido');
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            toast.error('Error al subir archivo');
        }
    };

    const handleDeleteAttachment = async (attachmentId: string) => {
        if (!window.confirm('¿Eliminar este documento?')) return;
        try {
            await deleteAttachment.mutateAsync({ attachmentId, leadId: lead.id });
            toast.success('Archivo eliminado');
        } catch (err) {
            toast.error('Error al eliminar');
        }
    };

    const handleDownload = async (attachment: LeadAttachment) => {
        try {
            const response = await apiClient.get(`/leads/attachments/download/${attachment.filename}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', attachment.original_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error('Error al descargar');
        }
    };

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const newTags = [...(formData.tags || [])];
            if (!newTags.includes(tagInput.trim())) {
                newTags.push(tagInput.trim());
                setFormData({ ...formData, tags: newTags });
            }
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData({
            ...formData,
            tags: formData.tags?.filter(t => t !== tag)
        });
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-slate-900 w-full max-w-4xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Tabs Navigation */}
                <div className="flex px-6 border-b border-slate-800 bg-slate-900/30">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'info' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        Información
                    </button>
                    <button
                        onClick={() => setActiveTab('docs')}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'docs' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        Documentos ({attachments?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center ${activeTab === 'chat' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        <MessageSquare className="w-3 h-3 mr-2" />
                        Chat {conversation && <span className="ml-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800">
                    {activeTab === 'chat' ? (
                        <div className="h-[500px]">
                            {conversation ? (
                                <ChatWindow
                                    messages={messages}
                                    onSendMessage={handleSendMessage}
                                    source={conversation.source}
                                    name={`${lead.first_name} ${lead.last_name}`}
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-950/20 rounded-3xl border border-dashed border-slate-800">
                                    <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mb-6">
                                        <MessageSquare className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-black text-white tracking-tight mb-2">Comienza a Chatear</h3>
                                    <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-8">
                                        Este lead aún no ha tenido contacto. Selecciona un canal para iniciar la gestión.
                                    </p>
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={() => handleStartChat('whatsapp')}
                                            className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20"
                                        >
                                            <Smartphone className="w-5 h-5" />
                                            <span>WhatsApp</span>
                                        </button>
                                        <button
                                            onClick={() => handleStartChat('instagram')}
                                            className="flex items-center space-x-2 px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-pink-900/20"
                                        >
                                            <Instagram className="w-5 h-5" />
                                            <span>Instagram</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'docs' ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center">
                                    <Paperclip className="w-3 h-3 mr-2" /> Documentos del Expediente
                                </h3>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadAttachment.isPending}
                                    className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all flex items-center shadow-lg shadow-blue-900/20"
                                >
                                    <Upload className="w-3.5 h-3.5 mr-2" /> {uploadAttachment.isPending ? 'Subiendo...' : 'Subir Archivo'}
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isLoadingAttachments ? (
                                    [1, 2].map(i => <div key={i} className="h-20 bg-slate-950 animate-pulse rounded-2xl" />)
                                ) : attachments?.length === 0 ? (
                                    <div className="col-span-2 text-center p-12 bg-slate-950/20 border border-dashed border-slate-800 rounded-3xl">
                                        <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">No hay documentos cargados</p>
                                    </div>
                                ) : (
                                    attachments?.map((attachment) => (
                                        <div key={attachment.id} className="group flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all">
                                            <div className="flex items-center min-w-0 mr-4">
                                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center mr-4 shrink-0">
                                                    <FileText className="w-5 h-5 text-slate-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-200 truncate leading-tight mb-1">
                                                        {attachment.original_name}
                                                    </p>
                                                    <p className="text-[10px] font-medium text-slate-600 uppercase tracking-tighter">
                                                        {formatBytes(attachment.size || 0)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleDownload(attachment)}
                                                    className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAttachment(attachment.id)}
                                                    className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Info Columns */}
                            <div className="lg:col-span-2 space-y-8">
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center">
                                            <User className="w-3 h-3 mr-2" /> Información Básica
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 font-bold ml-1 uppercase">Nombres</label>
                                                <input
                                                    type="text"
                                                    value={formData.first_name}
                                                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-white font-medium"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 font-bold ml-1 uppercase">Apellidos</label>
                                                <input
                                                    type="text"
                                                    value={formData.last_name}
                                                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-white font-medium"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-1 mt-4">
                                                <label className="text-[10px] text-slate-500 font-bold ml-1 uppercase">Puntuación (0-100)</label>
                                                <div className="relative">
                                                    <Star className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${formData.score && formData.score > 50 ? 'text-amber-500' : 'text-slate-600'}`} />
                                                    <input
                                                        type="number"
                                                        value={formData.score}
                                                        onChange={e => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-white font-bold"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center">
                                            <Send className="w-3 h-3 mr-2" /> Contacto
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 font-bold ml-1 uppercase">Email</label>
                                                <div className="relative">
                                                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 font-bold ml-1 uppercase">Teléfono</label>
                                                <div className="relative">
                                                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                                    <input
                                                        type="text"
                                                        value={formData.phone}
                                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-white font-mono"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 font-bold ml-1 uppercase">Dirección</label>
                                                <div className="relative">
                                                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                                    <input
                                                        type="text"
                                                        value={formData.address}
                                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center">
                                        <FileText className="w-3 h-3 mr-2" /> Notas y Seguimiento
                                    </h3>
                                    <textarea
                                        value={formData.notes || ''}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Añade detalles sobre las llamadas, intereses específicos o cualquier información relevante..."
                                        className="w-full h-48 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all resize-none font-medium leading-relaxed"
                                    />
                                </section>
                            </div>

                            {/* Sidebar: Tags */}
                            <div className="space-y-8">
                                <section className="space-y-4">
                                    <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center">
                                        <TagIcon className="w-3 h-3 mr-2" /> Etiquetas de Segmentación
                                    </h3>
                                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {formData.tags?.map((tag, i) => (
                                                <span key={i} className="group flex items-center px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-lg border border-blue-500/20 uppercase tracking-tight">
                                                    {tag}
                                                    <button onClick={() => removeTag(tag)} className="ml-2 text-blue-500/50 hover:text-rose-500 transition-colors">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Escribe y presiona Enter..."
                                            value={tagInput}
                                            onChange={e => setTagInput(e.target.value)}
                                            onKeyDown={addTag}
                                            className="w-full bg-transparent text-sm text-white placeholder-slate-700 outline-none font-bold"
                                        />
                                    </div>
                                    <p className="text-[9px] text-slate-600 font-medium px-2 leading-tight">
                                        Usa etiquetas para clasificar prospectos (ej: 'URGENTE', 'MODULO-A', 'BECA').
                                    </p>
                                </section>

                                <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Zap className="w-5 h-5 text-blue-500" />
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest">Resumen</h4>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">Source</span>
                                            <span className="text-xs font-bold text-blue-400">{lead.source}</span>
                                        </div>
                                        <div className="h-px bg-slate-800 w-full" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">Interés</span>
                                            <span className="text-xs font-bold text-slate-300">Programa Estándar</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 flex justify-between items-center bg-slate-900/50 shrink-0">
                    <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        <Calendar className="w-3 h-3 mr-2" /> Registrado: {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-3">
                        <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={updateLead.isPending}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-xl text-sm font-black transition-all shadow-lg shadow-blue-900/40 active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                        >
                            {updateLead.isPending ? 'Guardando...' : 'Guardar Prospecto'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

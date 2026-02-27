import { useState } from 'react';
import { usePortalAuth, usePortalData } from '../hooks/usePortal.tsx';
import { Layout, Receipt, GraduationCap, LogOut, Clock, Calendar, Trophy, TrendingUp, UserCheck, X } from 'lucide-react';
import { StudentExams } from '../components/exams/StudentExams';

type ViewMode = 'DASHBOARD' | 'EXAMS';

export function PortalMain() {
    const { student, logout } = usePortalAuth();
    const { profile, invoices, academic, attendance, grades } = usePortalData(student?.id);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('DASHBOARD');

    if (profile.isLoading || academic.isLoading) return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-blue-500 font-black animate-pulse uppercase tracking-[0.3em]">
            <GraduationCap className="w-12 h-12 mb-4 animate-bounce" />
            Optimizando tu portal...
        </div>
    );

    const gradesByModule = (grades.data || []).reduce((acc: any, g: any) => {
        const moduleName = g.module_name || 'General / Otros';
        if (!acc[moduleName]) acc[moduleName] = { grades: [], teacher: '' };
        acc[moduleName].grades.push(g);
        if (g.teacher_first_name && !acc[moduleName].teacher) {
            acc[moduleName].teacher = `${g.teacher_first_name} ${g.teacher_last_name}`;
        }
        return acc;
    }, {});

    const avgGrade = grades.data?.length
        ? (grades.data.reduce((acc: number, g: any) => acc + Number(g.value), 0) / grades.data.length).toFixed(1)
        : '0.0';

    const attendanceRecords = attendance.data || [];
    const presentCount = attendanceRecords.filter((a: any) => a.status === 'PRESENT').length;
    const lateCount = attendanceRecords.filter((a: any) => a.status === 'LATE').length;
    const attendancePct = attendanceRecords.length
        ? Math.round(((presentCount + (lateCount * 0.5)) / attendanceRecords.length) * 100)
        : 100;

    const pendingInvoices = invoices.data?.filter((inv: any) => inv.status !== 'PAID') || [];
    const totalPending = pendingInvoices.reduce((acc: number, inv: any) => acc + Number(inv.total_amount), 0);

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 pb-12">
            <nav className="border-b border-slate-800 bg-[#0f172a]/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-black text-base tracking-tight">EduCRM <span className="text-blue-500 italic">Portal</span></h2>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="flex items-center bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 mr-4">
                            <button
                                onClick={() => setViewMode('DASHBOARD')}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'DASHBOARD' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Mi Progreso
                            </button>
                            <button
                                onClick={() => setViewMode('EXAMS')}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'EXAMS' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Exámenes
                            </button>
                        </div>

                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-xs font-bold text-white leading-none">{student?.first_name} {student?.last_name}</span>
                            <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Mat: {student?.matricula}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2.5 bg-slate-800 text-slate-400 hover:text-rose-500 rounded-xl transition-all border border-slate-700/50"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {viewMode === 'DASHBOARD' ? (
                    <>
                        {/* Section: Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden group">
                                <Trophy className="absolute -right-4 -bottom-4 w-24 h-24 text-amber-500/5 -rotate-12 group-hover:scale-110 transition-transform" />
                                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Promedio General</p>
                                <h3 className="text-3xl font-black text-white">{avgGrade}</h3>
                                <div className="mt-2 flex items-center text-[10px] text-emerald-500 font-bold">
                                    <TrendingUp className="w-3 h-3 mr-1" /> Escalable 5.0
                                </div>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden group">
                                <UserCheck className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-500/5 -rotate-12 group-hover:scale-110 transition-transform" />
                                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Asistencia</p>
                                <h3 className="text-3xl font-black text-white">{attendancePct}%</h3>
                                <div className="mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                    {presentCount} De {attendanceRecords.length} Clases
                                </div>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden group">
                                <Layout className="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-500/5 -rotate-12 group-hover:scale-110 transition-transform" />
                                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Estatus Académico</p>
                                <h3 className="text-xl font-black text-white h-[36px] flex items-center">ACTIVO</h3>
                                <div className="mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                    {academic.data?.[0]?.program_name || 'Sin programas'}
                                </div>
                            </div>
                            <div className="bg-emerald-600/5 border border-emerald-600/20 p-6 rounded-[2rem] relative overflow-hidden group">
                                <Receipt className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-500/10 -rotate-12 group-hover:scale-110 transition-transform" />
                                <p className="text-[9px] font-black uppercase text-emerald-500 tracking-widest mb-1">Balance Pendiente</p>
                                <h3 className="text-3xl font-black text-white">${totalPending.toLocaleString()}</h3>
                                <div className="mt-2 text-[10px] text-emerald-400 font-bold uppercase tracking-tight">
                                    {pendingInvoices.length} Facturas Por Pagar
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Column: Academics (2/3) */}
                            <div className="lg:col-span-8 space-y-8">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase text-white tracking-[0.2em] flex items-center">
                                        <Trophy className="w-4 h-4 mr-2 text-amber-500" />
                                        Calificaciones por Módulo
                                    </h3>

                                    {Object.entries(gradesByModule).map(([moduleName, data]: [string, any]) => {
                                        const moduleAvg = (data.grades.reduce((acc: number, g: any) => acc + Number(g.value), 0) / data.grades.length).toFixed(1);
                                        return (
                                            <div key={moduleName} className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                                                <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-sm font-black text-white uppercase tracking-wider">{moduleName}</h4>
                                                        {data.teacher && (
                                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1 flex items-center">
                                                                <UserCheck className="w-3 h-3 mr-1 text-indigo-500" /> Docente: {data.teacher}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Promedio Módulo</p>
                                                        <span className={`text-xl font-black ${Number(moduleAvg) >= 3 ? 'text-emerald-500' : 'text-rose-500'}`}>{moduleAvg}</span>
                                                    </div>
                                                </div>
                                                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {data.grades.map((grade: any) => (
                                                        <div key={grade.id} className="bg-slate-950/50 border border-slate-800/50 p-4 rounded-2xl flex items-center justify-between">
                                                            <div>
                                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{grade.grade_type_name}</p>
                                                                <p className="text-[8px] text-slate-600 font-mono mt-0.5">{new Date(grade.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                            <span className={`text-lg font-black ${Number(grade.value) >= 3 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                                {Number(grade.value).toFixed(1)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {Object.keys(gradesByModule).length === 0 && (
                                        <div className="p-12 text-center bg-slate-900/20 rounded-[2.5rem] border border-dashed border-slate-800 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
                                            Esperando el primer reporte de calificaciones...
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-sm font-black uppercase text-white tracking-[0.2em] mb-6 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                                        Historial de Asistencia
                                    </h3>
                                    <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                                        <div className="divide-y divide-slate-800/50">
                                            {attendance.data?.map((row: any) => (
                                                <div key={row.id} className="p-6 flex items-center justify-between hover:bg-slate-800/20 transition-all">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-indigo-500 border border-slate-800">
                                                            <Clock className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                                                {new Date(row.date).toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' })}
                                                            </p>
                                                            <p className="text-sm font-bold text-white">{row.module_name || 'Clase Académica'}</p>
                                                            {row.teacher_first_name && (
                                                                <p className="text-[8px] text-indigo-400 font-bold uppercase mt-0.5">Prof. {row.teacher_first_name} {row.teacher_last_name}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${row.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                            row.status === 'LATE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                                'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                            }`}>
                                                            {row.status === 'PRESENT' ? 'Presente' : row.status === 'LATE' ? 'Tarde' : 'Ausente'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {attendance.data?.length === 0 && (
                                                <div className="p-12 text-center text-slate-600 text-[10px] uppercase font-black tracking-widest">
                                                    Sin registros de asistencia
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Billing & Programs (1/3) */}
                            <div className="lg:col-span-4 space-y-8">
                                <div>
                                    <h3 className="text-sm font-black uppercase text-white tracking-[0.2em] mb-6 flex items-center">
                                        <Receipt className="w-4 h-4 mr-2 text-emerald-500" />
                                        Estado de Cuenta
                                    </h3>
                                    <div className="space-y-4">
                                        {invoices.data?.slice(0, 4).map((invoice: any) => (
                                            <div key={invoice.id} className="bg-slate-950 border border-slate-800 p-5 rounded-3xl group hover:border-emerald-500/30 transition-all">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-[9px] font-mono text-slate-600 uppercase">Factura #{invoice.invoice_number}</p>
                                                    <div className={`w-2 h-2 rounded-full ${invoice.status === 'PAID' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} />
                                                </div>
                                                <div className="flex items-end justify-between">
                                                    <div>
                                                        <p className="text-lg font-black text-white">${Number(invoice.total_amount).toLocaleString()}</p>
                                                        <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Vence: {new Date(invoice.due_date || invoice.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedInvoice(invoice)}
                                                        className="p-2 bg-slate-900 rounded-xl text-slate-600 hover:text-white transition-colors"
                                                    >
                                                        <Receipt className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border border-blue-500/20 p-8 rounded-[2.5rem] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                                        <GraduationCap className="w-20 h-20 text-white" />
                                    </div>
                                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">Mesa de Ayuda</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed mb-6">¿Tienes dudas sobre tus notas o asistencia modular? Contacta a coordinación académica.</p>
                                    <button className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 hover:text-white transition-all">
                                        Solicitar Soporte
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <StudentExams studentId={student?.id} cohortId={academic.data?.[0]?.cohort_id} />
                )}
            </main>

            {/* Invoice Detail Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">Detalle de Cobro</h2>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Factura #{selectedInvoice.invoice_number}</p>
                            </div>
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                {selectedInvoice.items?.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-tight">{item.item_name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold mt-1">Cantidad: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-white">${Number(item.unit_price * item.quantity).toLocaleString()}</p>
                                            <p className="text-[9px] text-slate-600 font-bold">Unidad: ${Number(item.unit_price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado del Pago</p>
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${selectedInvoice.status === 'PAID' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedInvoice.status === 'PAID' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {selectedInvoice.status === 'PAID' ? 'Pagado' : 'Pendiente de Pago'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Facturado</p>
                                    <p className="text-3xl font-black text-white">${Number(selectedInvoice.total_amount).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl text-[10px] text-blue-400 leading-relaxed font-bold">
                                <p className="flex items-center uppercase tracking-widest mb-1">
                                    <Receipt className="w-3 h-3 mr-2" /> Nota Administrativa
                                </p>
                                Si tienes dudas sobre los conceptos cobrados, por favor contacta al departamento de tesorería institucional mencionando tu número de factura.
                            </div>
                        </div>

                        <div className="p-8 bg-slate-950/50 border-t border-slate-800 text-center">
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Entendido, cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

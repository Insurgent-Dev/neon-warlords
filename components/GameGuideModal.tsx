import { X, BookOpen } from 'lucide-react';

interface GameGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GameGuideModal = ({ isOpen, onClose }: GameGuideModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl max-h-[80vh] bg-slate-900 border-2 border-cyan-500/50 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <BookOpen className="text-cyan-400" size={24} />
                        <h2 className="text-2xl font-orbitron font-bold text-white tracking-wider">คู่มือการเล่น (Game Guide)</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans text-slate-300">

                    <section>
                        <h3 className="text-lg font-bold text-cyan-400 mb-2 font-orbitron">1. เป้าหมาย (Objective)</h3>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><span className="text-white">ทำลายกองทัพศัตรู (สีแดง)</span> ให้หมดสิ้น</li>
                            <li>รักษาฐานที่มั่นและบริหารทรัพยากร (Credits)</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-amber-400 mb-2 font-orbitron">2. การควบคุม (Controls)</h3>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong className="text-white">การเคลื่อนที่:</strong> คลิกที่ยูนิตของคุณ (สีฟ้า) &rarr; คลิกที่ช่อง Hex สีเขียว</li>
                            <li><strong className="text-white">การโจมตี:</strong> คลิกที่ยูนิตของคุณ &rarr; คลิกที่ยูนิตศัตรู (เป้าเล็งสีแดง)</li>
                            <li><strong className="text-white">การสร้างยูนิต:</strong> เลือกประเภทหุ่นรบด้านขวา &rarr; คลิกวางในพื้นที่สีฟ้าด้านล่าง</li>
                            <li><strong className="text-white">มุมมอง:</strong> คลิกเจ้าที่พื้นหลังแล้วลากเพื่อเลื่อนแผนที่ (Pan)</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-emerald-400 mb-2 font-orbitron">3. ทรัพยากร (Resources)</h3>
                        <p className="mb-2">คุณจะได้รับ <span className="text-amber-400 font-bold">+50 Credits</span> ทุกครั้งที่จบเทิร์น</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-800 rounded border border-slate-700">
                                <div className="font-bold text-white mb-1">🟡 Credits (¥)</div>
                                <div className="text-xs">ใช้สำหรับสร้างกองกำลังใหม่</div>
                            </div>
                            <div className="p-3 bg-slate-800 rounded border border-slate-700">
                                <div className="font-bold text-white mb-1">🟢 Data (TB)</div>
                                <div className="text-xs">ใช้สำหรับสกิลพิเศษ (ในอนาคต)</div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-purple-400 mb-2 font-orbitron">4. ข้อมูลยูนิต (Units Intel)</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-16 font-bold text-cyan-300">Ronin</div>
                                <div className="text-sm">หุ่นรบพื้นฐาน ราคาประหยัด (50¥) เดินได้สมดุล</div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-16 font-bold text-purple-300">Netrunner</div>
                                <div className="text-sm">สายซัพพอร์ต ราคาปานกลาง (75¥) พลังโจมตีต่ำ</div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-16 font-bold text-orange-300">Mech</div>
                                <div className="text-sm">รถถังเดินได้ ราคาแพง (150¥) อึด ถึก ทน แต่เดินช้า</div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-16 font-bold text-green-300">Sniper</div>
                                <div className="text-sm">พลซุ่มยิง (100¥) ระยะยิงไกล 3 ช่อง ระวังตัวบาง</div>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded transition-colors"
                    >
                        เข้าใจแล้ว Close
                    </button>
                </div>

            </div>
        </div>
    );
};

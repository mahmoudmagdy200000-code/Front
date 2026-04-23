import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui';

const ConnectionStringArchitectPage: React.FC = () => {
    const [server, setServer] = useState('localhost');
    const [database, setDatabase] = useState('NexaDB');
    const [userId, setUserId] = useState('root');
    const [password, setPassword] = useState('');
    const [port, setPort] = useState<number | string>(3306);
    const [sslMode, setSslMode] = useState('None');
    const [showPassword, setShowPassword] = useState(false);

    const [localConnection, setLocalConnection] = useState('');
    const [remoteConnection, setRemoteConnection] = useState('');

    useEffect(() => {
        // Generate strings
        const p = port ? `Port=${port};` : '';
        const ssl = sslMode !== 'None' ? `SslMode=${sslMode};` : '';
        const base = `Server=${server};Database=${database};Uid=${userId};Pwd=${password};${p}${ssl}`;
        
        // For standard local/internal hosting usually doesn't need much special compared to remote, 
        // but maybe remote has specific requirements or we just show the same format for them to copy into the right environment.
        setLocalConnection(base);
        setRemoteConnection(base); // Could add specific remote flags if needed, but standard format is same. 
        // We'll format it as appsettings.json
    }, [server, database, userId, password, port, sslMode]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('تم النسخ بنجاح'); // Copied successfully
    };

    const getAppsettingsJson = (connString: string) => {
        return `{
  "ConnectionStrings": {
    "DefaultConnection": "${connString}"
  }
}`;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-3">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                        أداة تصميم نص الاتصال (Connection String) وتشخيص الخطأ 500
                    </h1>
                    <p className="text-slate-500 font-medium">
                        أداة مخصصة لمطوري ASP.NET Core لبناء نص اتصال MySQL متوافق مع بيئات الاستضافة وتجاوز أخطاء بدء التشغيل.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column (Inputs) */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="border-t-4 border-t-indigo-600 shadow-xl shadow-indigo-100/50">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                إعدادات قاعدة البيانات
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">الخادم (Server / Hostname)</label>
                                    <input 
                                        type="text" 
                                        className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-left font-mono" 
                                        value={server} 
                                        onChange={e => setServer(e.target.value)} 
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">اسم القاعدة (Database Name)</label>
                                    <input 
                                        type="text" 
                                        className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-left font-mono" 
                                        value={database} 
                                        onChange={e => setDatabase(e.target.value)} 
                                        dir="ltr"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">المستخدم (User ID)</label>
                                        <input 
                                            type="text" 
                                            className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-left font-mono" 
                                            value={userId} 
                                            onChange={e => setUserId(e.target.value)} 
                                            dir="ltr"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">كلمة المرور (Password)</label>
                                        <div className="relative">
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-left font-mono pr-10" 
                                                value={password} 
                                                onChange={e => setPassword(e.target.value)} 
                                                dir="ltr"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600"
                                            >
                                                {showPassword ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29"></path></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">المنفذ (Port)</label>
                                        <input 
                                            type="number" 
                                            className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-left font-mono" 
                                            value={port} 
                                            onChange={e => setPort(e.target.value)} 
                                            dir="ltr"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">تشفير (SSL Mode)</label>
                                        <select 
                                            className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-left font-mono" 
                                            value={sslMode} 
                                            onChange={e => setSslMode(e.target.value)}
                                            dir="ltr"
                                        >
                                            <option value="None">None</option>
                                            <option value="Required">Required</option>
                                            <option value="Preferred">Preferred</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column (Outputs) */}
                    <div className="lg:col-span-7 space-y-6">
                        <Card className="border-t-4 border-t-emerald-500 shadow-xl shadow-emerald-100/50">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                نص الاتصال (Connection Strings)
                            </h2>

                            <div className="space-y-6">
                                {/* Local Connection */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                            الاتصال الداخلي (Local/Internal)
                                        </h3>
                                        <button 
                                            onClick={() => copyToClipboard(getAppsettingsJson(localConnection))}
                                            className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                            نسخ
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500">يُستخدم عند رفع التطبيق على نفس الخادم أو الخادم المحلي (localhost).</p>
                                    <div className="bg-[#1e1e1e] rounded-xl p-4 overflow-x-auto" dir="ltr">
                                        <pre className="text-sm font-mono text-emerald-400">
                                            {getAppsettingsJson(localConnection)}
                                        </pre>
                                    </div>
                                </div>

                                {/* Remote Connection */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                            الاتصال الخارجي (Remote Connection)
                                        </h3>
                                        <button 
                                            onClick={() => copyToClipboard(getAppsettingsJson(remoteConnection))}
                                            className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                            نسخ
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500">يُستخدم للاتصال من خادم خارجي (مثل اتصال تطبيق Vercel بقاعدة بيانات MonsterASP).</p>
                                    <div className="bg-[#1e1e1e] rounded-xl p-4 overflow-x-auto" dir="ltr">
                                        <pre className="text-sm font-mono text-purple-400">
                                            {getAppsettingsJson(remoteConnection)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Diagnostic Checklist */}
                <Card className="border-t-4 border-t-rose-500 shadow-xl shadow-rose-100/50">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center shrink-0 text-rose-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">تشخيص الخطأ 500 وقواعد Clean Architecture</h2>
                            <p className="text-slate-500 text-sm mt-1">
                                اتبع هذه القواعد الأساسية عند نشر تطبيقات ASP.NET Core على بيئات الإنتاج (Production Environments) لمنع أخطاء التوقف عن العمل (Crash) ومشكلات الاتصال بقواعد البيانات.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Rule 1 */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-md font-mono">Rule 1</span>
                                إيقاف التهجير التلقائي (MigrateAsync)
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                قم بإزالة أو إيقاف السطر <code className="bg-slate-200 text-rose-600 px-1 py-0.5 rounded text-xs font-mono" dir="ltr">await context.Database.MigrateAsync();</code> من ملف <code className="bg-slate-200 px-1 py-0.5 rounded text-xs font-mono" dir="ltr">Program.cs</code> أثناء التشغيل في بيئة الاستضافة المشتركة. التهجير التلقائي قد يؤدي إلى <span className="font-bold text-slate-800">Timeout Exception</span> وسقوط التطبيق كلياً بالخطأ 500.
                            </p>
                        </div>

                        {/* Rule 2 */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-md font-mono">Rule 2</span>
                                استخدام كشف الإصدار (AutoDetect)
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                تأكد من استخدام <code className="bg-slate-200 text-indigo-600 px-1 py-0.5 rounded text-xs font-mono" dir="ltr">ServerVersion.AutoDetect(connectionString)</code> بشكل آمن عند تسجيل سياق قاعدة البيانات (DbContext) في مكتبة <code className="bg-slate-200 px-1 py-0.5 rounded text-xs font-mono" dir="ltr">Pomelo.EntityFrameworkCore.MySql</code> لتجنب مشاكل توافقية الإصدارات.
                            </p>
                        </div>

                        {/* Rule 3 */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-md font-mono">Rule 3</span>
                                التحقق من مساحة الاستضافة (Quota)
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                تأكد من أن مساحة قاعدة البيانات المتاحة على لوحة تحكم الاستضافة ليست <span className="font-bold">0 MB</span>. مساحة التخزين الممتلئة أو غير المفعلة تمنع Entity Framework من إنشاء الجداول، مما يؤدي لخطأ رفض الاتصال.
                            </p>
                        </div>

                        {/* Rule 4 */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-md font-mono">Rule 4</span>
                                صلاحيات الجدار الناري (Firewall / Remote Access)
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                في حال كان تطبيقك مستضافاً خارجياً (مثال: Vercel) وقاعدة البيانات على (MonsterASP)، يجب إضافة عنوان IP الخاص بالخادم الخارجي في قسم <span className="font-bold">Remote MySQL Access</span> أو السماح لجميع الاتصالات <code className="bg-slate-200 px-1 py-0.5 rounded text-xs font-mono" dir="ltr">%</code> إن كان ذلك ضرورياً.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ConnectionStringArchitectPage;

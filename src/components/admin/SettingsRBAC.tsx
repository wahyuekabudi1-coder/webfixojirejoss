import React, { useState } from 'react';
import { 
  Shield, Key, Mail, Building, Percent, Save, RefreshCw, 
  Check, ToggleLeft, ToggleRight, ShieldAlert, FileText 
} from 'lucide-react';

interface RolePermissions {
  role: string;
  department: string;
  permissions: {
    manageBookings: boolean;
    manageTours: boolean;
    manageFleet: boolean;
    manageFinance: boolean;
    manageSettings: boolean;
    manageCMS: boolean;
  };
}

export default function SettingsRBAC({
  triggerNotification
}: {
  triggerNotification: (title: string, msg: string, type: 'success' | 'warning' | 'info') => void;
}) {
  const [activeTab, setActiveTab] = useState<'settings' | 'rbac'>('settings');

  // Global system configs state
  const [configs, setConfigs] = useState({
    companyName: 'PT Sawajaya Trans',
    taxRate: 11, // 11% PPN
    currencySymbol: 'IDR',
    whatsappContact: '+6281233445566',
    smtpHost: 'smtp.sawajayatrans.co.id',
    smtpUser: 'operations@sawajayatrans.co.id',
    artoPayPublicKey: 'pk_live_smartjourney_configured',
    artoPaySecretKey: '••••••••••••••••••••'
  });

  // Roles permission matrix state
  const [roles, setRoles] = useState<RolePermissions[]>([
    {
      role: 'Super Administrator',
      department: 'Executive HQ',
      permissions: { manageBookings: true, manageTours: true, manageFleet: true, manageFinance: true, manageSettings: true, manageCMS: true }
    },
    {
      role: 'Operations Manager',
      department: 'Logistics Fleet',
      permissions: { manageBookings: true, manageTours: true, manageFleet: true, manageFinance: false, manageSettings: false, manageCMS: false }
    },
    {
      role: 'Finance Officer',
      department: 'Finance & Tax',
      permissions: { manageBookings: false, manageTours: false, manageFleet: false, manageFinance: true, manageSettings: false, manageCMS: false }
    },
    {
      role: 'Customer Service Support',
      department: 'Guest Relations',
      permissions: { manageBookings: true, manageTours: false, manageFleet: false, manageFinance: false, manageSettings: false, manageCMS: false }
    },
    {
      role: 'Marketing Executive',
      department: 'Growth Content',
      permissions: { manageBookings: false, manageTours: true, manageFleet: false, manageFinance: false, manageSettings: false, manageCMS: true }
    }
  ]);

  // Save configurations
  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    triggerNotification('Settings Saved', 'System configuration parameters updated successfully', 'success');
  };

  // Toggle permission
  const togglePermission = (roleIndex: number, permissionKey: keyof RolePermissions['permissions']) => {
    const updated = [...roles];
    updated[roleIndex].permissions[permissionKey] = !updated[roleIndex].permissions[permissionKey];
    setRoles(updated);
    triggerNotification('RBAC Modified', `Updated access permissions for role ${roles[roleIndex].role}`, 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in text-neutral-100">
      
      {/* Sub Tabs Toggle bar */}
      <div className="flex border-b border-neutral-800 gap-6">
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 font-extrabold text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'settings' ? 'text-amber-500 border-b-2 border-amber-500 font-black' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Building className="h-4 w-4" />
          <span>Konfigurasi Sistem Global</span>
        </button>
        <button
          onClick={() => setActiveTab('rbac')}
          className={`pb-3 font-extrabold text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'rbac' ? 'text-amber-500 border-b-2 border-amber-500 font-black' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Role-Based Access Control (RBAC)</span>
        </button>
      </div>

      {/* 1. CONFIGURATIONS SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveConfigs} className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-2xl space-y-6">
            
            {/* Meta Company info */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-amber-500 tracking-wider uppercase font-mono flex items-center gap-2">
                <Building className="h-4 w-4 text-amber-500" />
                <span>Identitas Perusahaan &amp; Pajak</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Nama Legal Perusahaan</label>
                  <input
                    type="text"
                    required
                    value={configs.companyName}
                    onChange={(e) => setConfigs({ ...configs, companyName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Tarif PPN Lokal (%)</label>
                  <input
                    type="number"
                    required
                    value={configs.taxRate}
                    onChange={(e) => setConfigs({ ...configs, taxRate: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">No WhatsApp Hotline</label>
                  <input
                    type="text"
                    required
                    value={configs.whatsappContact}
                    onChange={(e) => setConfigs({ ...configs, whatsappContact: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Email server configs */}
            <div className="space-y-4 border-t border-slate-200 pt-5">
              <h4 className="text-xs font-black text-amber-600 tracking-wider uppercase font-mono flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-600" />
                <span>Konfigurasi SMTP Mail Server (Notification Center)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">SMTP Relay Host</label>
                  <input
                    type="text"
                    required
                    value={configs.smtpHost}
                    onChange={(e) => setConfigs({ ...configs, smtpHost: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-slate-900 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">SMTP Username (Sender)</label>
                  <input
                    type="text"
                    required
                    value={configs.smtpUser}
                    onChange={(e) => setConfigs({ ...configs, smtpUser: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* API gateway configs */}
            <div className="space-y-4 border-t border-slate-200 pt-5">
              <h4 className="text-xs font-black text-amber-600 tracking-wider uppercase font-mono flex items-center gap-2">
                <Key className="h-4 w-4 text-amber-600" />
                <span>Kredensial Gateway ArtoPay (ArtoPay Production &amp; Sandbox Keys)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">ArtoPay Public Key</label>
                  <input
                    type="text"
                    required
                    value={configs.artoPayPublicKey}
                    onChange={(e) => setConfigs({ ...configs, artoPayPublicKey: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-slate-900 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">ArtoPay Secret Key</label>
                  <input
                    type="password"
                    required
                    value={configs.artoPaySecretKey}
                    onChange={(e) => setConfigs({ ...configs, artoPaySecretKey: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg transition-all transform active:scale-95 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Parameter Sistem</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. RBAC ACCESS MATRIX */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between gap-2">
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-neutral-300">Situs Hak Akses Departemen Perusahaan</h4>
              <p className="text-[11px] text-neutral-500">Sesuaikan batas otoritas tindakan staf administrasi secara rinci. Cegah kebocoran mutasi data.</p>
            </div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Jabatan Staf (Role Profile)</th>
                  <th className="py-4 px-6">Departemen</th>
                  <th className="py-4 px-6 text-center">Kelola Booking</th>
                  <th className="py-4 px-6 text-center">Kelola Tur</th>
                  <th className="py-4 px-6 text-center">Kelola Armada</th>
                  <th className="py-4 px-6 text-center">Akses Keuangan</th>
                  <th className="py-4 px-6 text-center">Akses Sistem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850 text-xs font-semibold text-neutral-300">
                {roles.map((r, roleIdx) => (
                  <tr key={r.role} className="hover:bg-neutral-900/10 transition-all">
                    <td className="py-4 px-6 font-extrabold text-neutral-200">
                      {r.role}
                    </td>
                    <td className="py-4 px-6 font-mono text-neutral-500">{r.department}</td>
                    
                    <td className="py-4 px-6 text-center">
                      <button 
                        type="button"
                        onClick={() => togglePermission(roleIdx, 'manageBookings')}
                        className={`text-xs focus:outline-none transition-transform active:scale-90 cursor-pointer`}
                      >
                        {r.permissions.manageBookings ? (
                          <Check className="h-5 w-5 text-emerald-400 mx-auto bg-emerald-500/10 rounded p-0.5" />
                        ) : (
                          <span className="text-neutral-600 block text-center font-bold">—</span>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <button 
                        type="button"
                        onClick={() => togglePermission(roleIdx, 'manageTours')}
                        className={`text-xs focus:outline-none transition-transform active:scale-90 cursor-pointer`}
                      >
                        {r.permissions.manageTours ? (
                          <Check className="h-5 w-5 text-emerald-400 mx-auto bg-emerald-500/10 rounded p-0.5" />
                        ) : (
                          <span className="text-neutral-600 block text-center font-bold">—</span>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <button 
                        type="button"
                        onClick={() => togglePermission(roleIdx, 'manageFleet')}
                        className={`text-xs focus:outline-none transition-transform active:scale-90 cursor-pointer`}
                      >
                        {r.permissions.manageFleet ? (
                          <Check className="h-5 w-5 text-emerald-400 mx-auto bg-emerald-500/10 rounded p-0.5" />
                        ) : (
                          <span className="text-neutral-600 block text-center font-bold">—</span>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <button 
                        type="button"
                        onClick={() => togglePermission(roleIdx, 'manageFinance')}
                        className={`text-xs focus:outline-none transition-transform active:scale-90 cursor-pointer`}
                      >
                        {r.permissions.manageFinance ? (
                          <Check className="h-5 w-5 text-emerald-400 mx-auto bg-emerald-500/10 rounded p-0.5" />
                        ) : (
                          <span className="text-neutral-600 block text-center font-bold">—</span>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <button 
                        type="button"
                        onClick={() => togglePermission(roleIdx, 'manageSettings')}
                        className={`text-xs focus:outline-none transition-transform active:scale-90 cursor-pointer`}
                      >
                        {r.permissions.manageSettings ? (
                          <Check className="h-5 w-5 text-emerald-400 mx-auto bg-emerald-500/10 rounded p-0.5" />
                        ) : (
                          <span className="text-neutral-600 block text-center font-bold">—</span>
                        )}
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

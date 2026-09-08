import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Handshake, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft,
  X,
  Save,
  CheckCircle2
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { OFFICIAL_PARTNERS, PartnerApp, PARTNERS_DATA_VERSION } from '../data/partnersData';

export default function PartnershipsView() {
  const { setPage } = useApp();
  const [partners, setPartners] = useState<PartnerApp[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  
  // UI States
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Notification Toast Helper
  const triggerNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load partners on mount - upgrade if using old unsplash placeholders or outdated schema
  useEffect(() => {
    const version = localStorage.getItem('smartjourney_partners_version');
    const stored = localStorage.getItem('smartjourney_partners');
    
    if (stored && version === PARTNERS_DATA_VERSION) {
      try {
        const parsed: PartnerApp[] = JSON.parse(stored);
        const hasOutdatedLogos = parsed.some(p => p.logoUrl && (p.logoUrl.includes('images.unsplash.com') || p.id === 'pegipegi'));
        if (hasOutdatedLogos || parsed.length === 0) {
          setPartners(OFFICIAL_PARTNERS);
          localStorage.setItem('smartjourney_partners', JSON.stringify(OFFICIAL_PARTNERS));
          localStorage.setItem('smartjourney_partners_version', PARTNERS_DATA_VERSION);
        } else {
          setPartners(parsed);
        }
      } catch (e) {
        console.error('Failed to parse partners', e);
        setPartners(OFFICIAL_PARTNERS);
        localStorage.setItem('smartjourney_partners', JSON.stringify(OFFICIAL_PARTNERS));
        localStorage.setItem('smartjourney_partners_version', PARTNERS_DATA_VERSION);
      }
    } else {
      setPartners(OFFICIAL_PARTNERS);
      localStorage.setItem('smartjourney_partners', JSON.stringify(OFFICIAL_PARTNERS));
      localStorage.setItem('smartjourney_partners_version', PARTNERS_DATA_VERSION);
    }
  }, []);

  // Restore Official 2026 Partners
  const restoreOfficialPartners = () => {
    if (confirm('Reset to official 2026 partner platforms and logos?')) {
      setPartners(OFFICIAL_PARTNERS);
      localStorage.setItem('smartjourney_partners', JSON.stringify(OFFICIAL_PARTNERS));
      localStorage.setItem('smartjourney_partners_version', PARTNERS_DATA_VERSION);
      triggerNotification('Restored to official 2026 partner platforms.');
    }
  };

  // Save to LocalStorage
  const savePartners = (updated: PartnerApp[]) => {
    setPartners(updated);
    localStorage.setItem('smartjourney_partners', JSON.stringify(updated));
  };

  // Handle Logo Upload via File Picker
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormLogoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset Form
  const resetForm = () => {
    setFormName('');
    setFormUrl('');
    setFormLogoUrl('');
    setIsEditing(false);
    setEditingId(null);
    setShowModal(false);
  };

  // Add or Update Partner
  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUrl.trim() || !formLogoUrl.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const partnerData: PartnerApp = {
      id: isEditing && editingId ? editingId : `partner-${Date.now()}`,
      name: formName.trim(),
      url: formUrl.trim().startsWith('http') ? formUrl.trim() : `https://${formUrl.trim()}`,
      logoUrl: formLogoUrl.trim()
    };

    let updatedPartners: PartnerApp[] = [];
    if (isEditing && editingId) {
      updatedPartners = partners.map(p => p.id === editingId ? partnerData : p);
      triggerNotification('Partner details successfully updated!');
    } else {
      updatedPartners = [...partners, partnerData];
      triggerNotification('New partner logo successfully added!');
    }

    savePartners(updatedPartners);
    resetForm();
  };

  // Start Edit
  const startEdit = (partner: PartnerApp) => {
    setIsEditing(true);
    setEditingId(partner.id);
    setFormName(partner.name);
    setFormUrl(partner.url);
    setFormLogoUrl(partner.logoUrl);
    setShowModal(true);
  };

  // Delete Partner
  const handleDeletePartner = (id: string) => {
    if (confirm('Are you sure you want to remove this partner?')) {
      const updated = partners.filter(p => p.id !== id);
      savePartners(updated);
      triggerNotification('Partner successfully removed.');
    }
  };

  return (
    <div className="bg-[#f8faf9] min-h-screen text-neutral-900 pb-24 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'B2B Partnerships & Affiliates' }]} />
      </div>

      {/* Hero Header Section */}
      <section className="relative overflow-hidden pt-8 pb-14 bg-gradient-to-b from-emerald-950 via-[#132c25] to-[#1a3830] text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 px-4 py-1.5 rounded-full text-amber-400 text-xs font-bold font-mono tracking-wider uppercase">
            <Handshake className="h-4 w-4" />
            <span>Digital Ecosystem &amp; Strategic Alliances</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Our Collaborators &amp; Partners
          </h1>
          
          <p className="text-neutral-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            SmartJourney operates in synergy with leading international travel networks, global booking systems, and premier luxury hotel groups across East Java &amp; Bali.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-10">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/30 flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Modal for Add / Edit Partner */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-scale-up">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                    <Handshake className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-neutral-900">
                      {isEditing ? 'Modify Partner Platform' : 'Add New Partner Platform'}
                    </h3>
                    <p className="text-xs text-neutral-500 font-medium">Manage corporate affiliations &amp; booking channels</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSavePartner} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                    <span>Partner / Platform Name</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Traveloka, Booking.com, Marriott"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                    <span>Platform Website URL</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://www.example.com"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                  />
                </div>

                {/* Logo Image URL & Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-700 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>Logo Image URL or Upload PNG</span>
                      <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">Transparent PNG Recommended</span>
                  </label>
                  
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formLogoUrl}
                      onChange={(e) => setFormLogoUrl(e.target.value)}
                      placeholder="https://.../logo.png"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-mono text-[11px]"
                    />
                    <label className="shrink-0 px-3 py-2.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-700 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors">
                      <span>Browse...</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Logo Preview */}
                  {formLogoUrl && (
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
                      <div className="w-16 h-12 bg-white rounded-lg border border-neutral-200 p-1 flex items-center justify-center overflow-hidden">
                        <img 
                          src={formLogoUrl} 
                          alt="Logo Preview" 
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as any).src = 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=150&q=80';
                          }}
                        />
                      </div>
                      <div className="text-[11px] text-neutral-500 overflow-hidden text-ellipsis whitespace-nowrap">
                        Logo preview ready
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isEditing ? 'Save Changes' : 'Add Platform'}</span>
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* Clean, Premium Partner Grid - Simple Layout containing only Logos */}
        <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                <span>Verified Partner Platforms (2026)</span>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold">
                  {partners.length} Active
                </span>
              </h2>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                Official integrations & booking systems synced with SmartJourney
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={restoreOfficialPartners}
                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset to official 2026 partner list and vector logos"
              >
                <span>Reset 2026 Logos</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Platform</span>
              </button>
            </div>
          </div>

          {partners.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Handshake className="h-12 w-12 text-neutral-300 mx-auto" />
              <h3 className="text-lg font-bold text-neutral-400">No partner logos registered yet</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">Collaborating partner platforms and verified booking channels.</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="mt-2 inline-flex items-center gap-1.5 bg-amber-500 text-neutral-950 px-4 py-2 rounded-xl text-xs font-bold"
              >
                <Plus className="h-4 w-4" />
                <span>Add First Partner</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="group relative bg-neutral-50/70 hover:bg-white border border-neutral-200 hover:border-amber-400/60 rounded-2xl h-32 flex flex-col items-center justify-between p-3.5 transition-all duration-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5"
                >
                  {/* Action Buttons for quick edit / delete on hover */}
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-neutral-200 shadow-sm z-10">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); startEdit(partner); }}
                      title="Edit Logo"
                      className="p-1 hover:bg-amber-50 text-neutral-600 hover:text-amber-600 rounded transition-colors cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeletePartner(partner.id); }}
                      title="Delete Logo"
                      className="p-1 hover:bg-red-50 text-neutral-600 hover:text-red-600 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Partner Clickable Link & Logo */}
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex-1 flex items-center justify-center cursor-pointer p-1"
                  >
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      className="max-h-12 max-w-[90%] object-contain group-hover:scale-105 transition-all duration-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as any).src = 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=150&q=80';
                      }}
                    />
                  </a>
                  
                  {/* Subtle Label and Category on Bottom */}
                  <div className="w-full text-center mt-1 border-t border-neutral-100/80 pt-1">
                    <span className="text-[11px] font-bold text-neutral-700 group-hover:text-amber-600 transition-colors block truncate">
                      {partner.name}
                    </span>
                    {partner.category && (
                      <span className="text-[9px] text-neutral-400 block truncate font-medium">
                        {partner.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back to Home CTA */}
        <div className="text-center pt-4">
          <button
            onClick={() => setPage('home')}
            className="text-xs font-bold text-neutral-500 hover:text-amber-600 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Main Homepage</span>
          </button>
        </div>

      </div>
    </div>
  );
}

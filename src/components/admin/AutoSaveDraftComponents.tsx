import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CheckCircle2, 
  Save, 
  AlertCircle, 
  Wifi, 
  WifiOff, 
  History, 
  RotateCcw, 
  Trash2, 
  Sparkles,
  Info
} from 'lucide-react';
import { 
  DraftType, 
  AdminDraft, 
  saveDraft, 
  getDraft, 
  clearDraft, 
  formatDraftTime, 
  getIsOnline,
  syncAllLocalDraftsToServer
} from '../../utils/adminDraftStorage';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'offline_saved' | 'error';

export interface UseAutoSaveDraftOptions<T> {
  type: DraftType;
  subType: string;
  targetId?: string; // 'new' or specific id
  title: string;
  data: T;
  meta?: Record<string, any>;
  isEditing?: boolean;
  enabled?: boolean;
  debounceMs?: number;
  onRecover?: (draft: AdminDraft<T>) => void;
  // Deep comparison or baseline data to avoid saving completely empty initial forms
  hasUnsavedContent?: boolean;
}

export function useAutoSaveDraft<T>({
  type,
  subType,
  targetId = 'new',
  title,
  data,
  meta,
  isEditing = false,
  enabled = true,
  debounceMs = 750,
  onRecover,
  hasUnsavedContent = true
}: UseAutoSaveDraftOptions<T>) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(getIsOnline());
  const [detectedDraft, setDetectedDraft] = useState<AdminDraft<T> | null>(null);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState<boolean>(false);
  const [hasRestoredOrDismissed, setHasRestoredOrDismissed] = useState<boolean>(false);

  const timerRef = useRef<any>(null);
  const latestDataRef = useRef<{ data: T; meta?: Record<string, any>; title: string }>({ data, meta, title });
  latestDataRef.current = { data, meta, title };

  // 1. Initial check for existing draft upon mounting or targetId change
  useEffect(() => {
    if (!enabled) {
      setDetectedDraft(null);
      setShowRecoveryBanner(false);
      return;
    }

    const existing = getDraft<T>(type, targetId, subType);
    if (existing && existing.data) {
      setDetectedDraft(existing);
      // Only show recovery banner if user hasn't restored or dismissed yet in this session
      setShowRecoveryBanner(true);
    } else {
      setDetectedDraft(null);
      setShowRecoveryBanner(false);
    }
    setHasRestoredOrDismissed(false);
  }, [type, subType, targetId, enabled]);

  // 2. Perform immediate save helper
  const performSave = useCallback(() => {
    if (!enabled || !hasUnsavedContent) return;

    setSaveStatus('saving');
    const cur = latestDataRef.current;
    const result = saveDraft<T>(
      type,
      targetId,
      subType,
      cur.title || title,
      cur.data,
      cur.meta,
      isEditing
    );

    if (result.success) {
      setSaveStatus(result.isOnline ? 'saved' : 'offline_saved');
      setLastSaved(new Date());
    } else {
      setSaveStatus('error');
    }
  }, [enabled, hasUnsavedContent, type, targetId, subType, title, isEditing]);

  // 3. Listen to network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncAllLocalDraftsToServer().catch(() => {});
      // If we have unsaved content, trigger a save to mark it as online
      if (enabled && hasUnsavedContent) {
        performSave();
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      // If we have unsaved content, save it locally immediately
      if (enabled && hasUnsavedContent) {
        performSave();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enabled, hasUnsavedContent, performSave]);

  // 4. Debounced auto-save on data or meta change
  useEffect(() => {
    if (!enabled || !hasUnsavedContent) return;

    // Clear previous pending debounce timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setSaveStatus('saving');

    timerRef.current = setTimeout(() => {
      performSave();
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, meta, enabled, hasUnsavedContent, debounceMs, performSave]);

  // 5. Save immediately before tab close, accidental reload or crash (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (enabled && hasUnsavedContent) {
        const cur = latestDataRef.current;
        saveDraft<T>(
          type,
          targetId,
          subType,
          cur.title || title,
          cur.data,
          cur.meta,
          isEditing
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, hasUnsavedContent, type, targetId, subType, title, isEditing]);

  // Actions
  const handleRecover = () => {
    if (detectedDraft && onRecover) {
      onRecover(detectedDraft);
      setSaveStatus('saved');
      setLastSaved(new Date(detectedDraft.savedAtTimestamp));
    }
    setShowRecoveryBanner(false);
    setHasRestoredOrDismissed(true);
  };

  const handleDismiss = () => {
    setShowRecoveryBanner(false);
    setHasRestoredOrDismissed(true);
  };

  const handleDiscard = () => {
    clearDraft(type, targetId, subType);
    setDetectedDraft(null);
    setShowRecoveryBanner(false);
    setHasRestoredOrDismissed(true);
    setSaveStatus('idle');
    setLastSaved(null);
  };

  const clearCurrentDraft = () => {
    clearDraft(type, targetId, subType);
    setDetectedDraft(null);
    setShowRecoveryBanner(false);
    setSaveStatus('idle');
    setLastSaved(null);
  };

  return {
    saveStatus,
    lastSaved,
    isOnline,
    detectedDraft,
    showRecoveryBanner,
    hasRestoredOrDismissed,
    handleRecover,
    handleDismiss,
    handleDiscard,
    performSave,
    clearCurrentDraft
  };
}

/**
 * Status indicator badge for form headers / footers
 */
export function AutoSaveStatusBadge({
  status,
  lastSaved,
  isOnline,
  onManualSave,
  className = ''
}: {
  status: SaveStatus;
  lastSaved: Date | null;
  isOnline: boolean;
  onManualSave?: () => void;
  className?: string;
}) {
  const formatTime = (d: Date | null) => {
    if (!d) return '';
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <div className={`inline-flex items-center gap-2 text-xs font-mono select-none ${className}`}>
      {status === 'saving' && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 font-bold animate-pulse">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping shrink-0" />
          <span>● Menyimpan...</span>
        </span>
      )}

      {status === 'saved' && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>✓ Tersimpan otomatis {lastSaved ? `(${formatTime(lastSaved)})` : ''}</span>
        </span>
      )}

      {status === 'offline_saved' && (
        <span 
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 font-semibold"
          title="Koneksi terputus. Data disimpan aman di memori lokal perangkat admin."
        >
          <WifiOff className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span>💾 Tersimpan lokal (Offline {lastSaved ? `• ${formatTime(lastSaved)}` : ''})</span>
        </span>
      )}

      {status === 'error' && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 font-bold">
          <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
          <span>⚠ Gagal menyimpan</span>
        </span>
      )}

      {status === 'idle' && lastSaved && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800/60 border border-neutral-700 text-neutral-400 text-[11px]">
          <History className="h-3 w-3 text-neutral-400 shrink-0" />
          <span>Draft: {formatTime(lastSaved)}</span>
        </span>
      )}

      {onManualSave && (
        <button
          type="button"
          onClick={onManualSave}
          title="Simpan draft ke memori sekarang"
          className="p-1 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
        >
          <Save className="h-3 w-3" />
          <span className="hidden sm:inline">Simpan Draft</span>
        </button>
      )}
    </div>
  );
}

/**
 * Prominent, elegant recovery banner when admin returns with an uncommitted draft
 */
export function DraftRecoveryBanner({
  draft,
  onRecover,
  onDiscard,
  typeLabel = 'Paket Tour'
}: {
  draft: AdminDraft<any> | null;
  onRecover: () => void;
  onDiscard: () => void;
  typeLabel?: string;
}) {
  if (!draft) return null;

  return (
    <div 
      id="admin-draft-recovery-banner"
      className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-600/15 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-lg animate-fade-in text-left mb-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
            <History className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider font-mono text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                Draft sebelumnya ditemukan
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                {formatDraftTime(draft.savedAtTimestamp || draft.savedAt)}
              </span>
            </div>
            <h4 className="text-sm font-bold text-neutral-100">
              Draft {typeLabel}: <span className="text-amber-300 font-mono">"{draft.title || draft.targetId}"</span>
            </h4>
            <p className="text-xs text-amber-250 font-medium">
              Anda memiliki draft yang belum selesai. Pulihkan draft ini?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <button
            type="button"
            id="btn-discard-draft"
            onClick={onDiscard}
            className="px-3.5 py-2 rounded-xl border border-neutral-750 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Trash2 className="h-3.5 w-3.5 text-neutral-400" />
            <span>Mulai Baru</span>
          </button>
          <button
            type="button"
            id="btn-recover-draft"
            onClick={onRecover}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-md font-mono"
          >
            <RotateCcw className="h-3.5 w-3.5 text-neutral-950" />
            <span>Pulihkan Draft</span>
          </button>
        </div>
      </div>
    </div>
  );
}

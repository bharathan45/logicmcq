import { useEffect, useRef, useState, useCallback } from 'react';
import { ViolationRecord, ViolationType, AdminSettings, TeamInfo } from '../types/exam';

interface UseAntiCheatingProps {
  isActive: boolean;
  team: TeamInfo | null;
  adminSettings: AdminSettings;
  onViolationOccurred?: (record: ViolationRecord) => void;
  onLockTriggered: (violations: ViolationRecord[], reason: string) => void;
}

export function useAntiCheating({
  isActive,
  team,
  adminSettings,
  onViolationOccurred,
  onLockTriggered,
}: UseAntiCheatingProps) {
  const [violations, setViolations] = useState<ViolationRecord[]>([]);
  const [currentWarning, setCurrentWarning] = useState<ViolationRecord | null>(null);
  const [isWarningOverlayOpen, setIsWarningOverlayOpen] = useState(false);
  const [isFullscreenExitWarning, setIsFullscreenExitWarning] = useState(false);

  // Debounce rapid multiple triggers within 1.5 seconds
  const lastViolationTimeRef = useRef<number>(0);
  const isLockedRef = useRef<boolean>(false);
  const violationsRef = useRef<ViolationRecord[]>([]);

  violationsRef.current = violations;

  const triggerViolation = useCallback(
    async (type: ViolationType, message: string, isFullscreenExit = false) => {
      if (!isActive || isLockedRef.current || !adminSettings.strictModeEnabled) return;

      const now = Date.now();
      // Debounce window blur + visibilitychange firing at identical millisecond
      if (now - lastViolationTimeRef.current < 1200) {
        return;
      }
      lastViolationTimeRef.current = now;

      const newViolationNumber = violationsRef.current.length + 1;
      const isCritical = newViolationNumber >= adminSettings.maxViolations;

      const newRecord: ViolationRecord = {
        id: `v_${now}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp: now,
        type,
        message,
        violationNumber: newViolationNumber,
        severity: isCritical ? 'critical' : 'warning',
      };

      const updatedViolations = [...violationsRef.current, newRecord];
      setViolations(updatedViolations);
      setCurrentWarning(newRecord);
      setIsFullscreenExitWarning(isFullscreenExit);
      setIsWarningOverlayOpen(true);

      if (onViolationOccurred) {
        onViolationOccurred(newRecord);
      }

      // Sync with server-side security store
      try {
        await fetch('/api/exam/violation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamName: team?.teamName,
            type,
            message,
          }),
        });
      } catch (err) {
        console.warn('Server violation sync error:', err);
      }

      // Check if threshold reached
      if (isCritical && adminSettings.autoSubmitOnMaxViolations) {
        isLockedRef.current = true;
        setIsWarningOverlayOpen(false);
        const lockReason = `Maximum violation limit reached (${adminSettings.maxViolations} strikes) due to: ${message}`;
        onLockTriggered(updatedViolations, lockReason);
      }
    },
    [isActive, adminSettings, onViolationOccurred, onLockTriggered, team]
  );

  // Fullscreen Request Helper
  const requestFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        }
      }
      setIsWarningOverlayOpen(false);
      setIsFullscreenExitWarning(false);
    } catch (err) {
      console.warn('Fullscreen request failed or was user denied:', err);
    }
  }, []);

  // Exit fullscreen detection
  useEffect(() => {
    if (!isActive || !adminSettings.strictModeEnabled || !adminSettings.fullscreenRequired) return;

    const handleFullscreenChange = () => {
      const isFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isFullscreen && !isLockedRef.current) {
        triggerViolation(
          'FULLSCREEN_EXIT',
          'Exam full-screen mode was exited. Full-screen view is strictly mandatory.',
          true
        );
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isActive, adminSettings, triggerViolation]);

  // Tab Switching & Page Visibility API
  useEffect(() => {
    if (!isActive || !adminSettings.strictModeEnabled || !adminSettings.tabSwitchDetection) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !isLockedRef.current) {
        triggerViolation(
          'TAB_SWITCH',
          'Tab switch or browser minimization detected. Leaving the active test window is forbidden.'
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, adminSettings, triggerViolation]);

  // Window Blur (Detects external apps, other monitors, search, AI tools)
  useEffect(() => {
    if (!isActive || !adminSettings.strictModeEnabled || !adminSettings.tabSwitchDetection) return;

    const handleWindowBlur = () => {
      if (!isLockedRef.current) {
        triggerViolation(
          'WINDOW_BLUR',
          'Exam window lost focus. External applications, browser windows, or tools are restricted.'
        );
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isActive, adminSettings, triggerViolation]);

  // Keyboard Shortcuts Restrictions
  useEffect(() => {
    if (!isActive || !adminSettings.strictModeEnabled || !adminSettings.keyboardShortcutsBlocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Detect DevTools F12
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation('DEVTOOLS_SHORTCUT', 'Developer Tools shortcut (F12) was blocked.');
        return;
      }

      // Detect Ctrl/Cmd + Shift + I / J / C (DevTools inspector)
      if (isCtrlOrCmd && e.shiftKey && ['i', 'j', 'c'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation('DEVTOOLS_SHORTCUT', 'Developer inspection shortcut was blocked.');
        return;
      }

      // Block Ctrl/Cmd + C, V, X, A, P, S, U
      if (isCtrlOrCmd && ['c', 'v', 'x', 'a', 'p', 's', 'u'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation(
          'RESTRICTED_KEY',
          `Restricted keyboard shortcut (Ctrl/Cmd + ${key.toUpperCase()}) was blocked.`
        );
        return;
      }

      // Detect Alt+Tab or Alt+F4 where detectable
      if (e.altKey && (key === 'tab' || key === 'f4')) {
        triggerViolation('RESTRICTED_KEY', 'Application switching shortcut was detected.');
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [isActive, adminSettings, triggerViolation]);

  // Copy / Paste / Cut / Context Menu Restrictions
  useEffect(() => {
    if (!isActive || !adminSettings.strictModeEnabled) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      if (adminSettings.copyPasteBlocked) {
        triggerViolation('CONTEXT_MENU', 'Right-click context menu is disabled inside the examination environment.');
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (adminSettings.copyPasteBlocked) {
        e.preventDefault();
        triggerViolation('COPY_PASTE', 'Copying question content or choices is strictly prohibited.');
      }
    };

    const handleCut = (e: ClipboardEvent) => {
      if (adminSettings.copyPasteBlocked) {
        e.preventDefault();
        triggerViolation('COPY_PASTE', 'Cut clipboard action is disabled in examination mode.');
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (adminSettings.copyPasteBlocked) {
        e.preventDefault();
        triggerViolation('COPY_PASTE', 'Pasting external content into the exam is prohibited.');
      }
    };

    const handleSelectStart = (e: Event) => {
      if (adminSettings.copyPasteBlocked) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, [isActive, adminSettings, triggerViolation]);

  const acknowledgeWarning = useCallback(() => {
    setIsWarningOverlayOpen(false);
  }, []);

  const resetViolations = useCallback(() => {
    setViolations([]);
    isLockedRef.current = false;
    setIsWarningOverlayOpen(false);
  }, []);

  return {
    violations,
    violationCount: violations.length,
    currentWarning,
    isWarningOverlayOpen,
    isFullscreenExitWarning,
    isLocked: isLockedRef.current,
    requestFullscreen,
    acknowledgeWarning,
    resetViolations,
  };
}

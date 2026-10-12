import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DGMS_SAFETY_TIPS, DGMSSafetyTip } from '../data/dgmsSafetyTips';
import {
  HardHat,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  CheckCircle2,
  FileText,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const SafetyBriefingWidget: React.FC = () => {
  const { currentUser, setActiveTab } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedShift, setSelectedShift] = useState<'Shift A' | 'Shift B' | 'Shift C'>('Shift A');
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});
  const [acknowledgedTips, setAcknowledgedTips] = useState<Record<string, { officer: string; timestamp: string }>>({});
  const [showFullGuideline, setShowFullGuideline] = useState(false);
  const [copiedSlip, setCopiedSlip] = useState(false);

  const currentTip: DGMSSafetyTip = DGMS_SAFETY_TIPS[currentIndex];

  // Auto-rotation effect
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DGMS_SAFETY_TIPS.length);
      setCheckedActions({});
      setShowFullGuideline(false);
    }, 10000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % DGMS_SAFETY_TIPS.length);
    setCheckedActions({});
    setShowFullGuideline(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + DGMS_SAFETY_TIPS.length) % DGMS_SAFETY_TIPS.length);
    setCheckedActions({});
    setShowFullGuideline(false);
  };

  const toggleAction = (actionIdx: number) => {
    const key = `${currentTip.id}-${actionIdx}`;
    setCheckedActions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAcknowledge = () => {
    const now = new Date();
    const timeStr = `${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${now.toLocaleDateString()}`;
    setAcknowledgedTips((prev) => ({
      ...prev,
      [currentTip.id]: {
        officer: `${currentUser.name} (${currentUser.role})`,
        timestamp: timeStr,
      },
    }));
  };

  const isAcknowledged = !!acknowledgedTips[currentTip.id];

  const handleCopyBriefingSlip = () => {
    const slipText = `NMDC LIMITED - DONIMALAI COMPLEX
DAILY STATUTORY SAFETY BRIEFING (${selectedShift})
Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
Topic: ${currentTip.title}
Reference: ${currentTip.circularRef} · ${currentTip.regRef}
Key Directive: ${currentTip.tipSummary}
Action Items:
${currentTip.actionItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}
Mandatory PPE: ${currentTip.mandatoryPPE.join(', ')}
Acknowledged By: ${currentUser.name} (${currentUser.role})
DGMS Compliance Verification`;

    navigator.clipboard?.writeText(slipText);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2500);
  };

  const handleAdoptForTBT = () => {
    // Switch to Safety module and prompt user
    setActiveTab('safety');
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs transition-all">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
            <HardHat className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                DAILY STATUTORY SAFETY BRIEFING
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                DGMS MANDATE
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
              <span>Donimalai Iron Ore Mine</span>
              <span>·</span>
              <span>Daily Pre-Shift Tooling</span>
              <span>·</span>
              <span className="text-slate-600 font-medium">Rotating Circular Focus</span>
            </div>
          </div>
        </div>

        {/* Shift Selector & Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Shift Segmented Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-xs">
            {(['Shift A', 'Shift B', 'Shift C'] as const).map((shift) => (
              <button
                key={shift}
                onClick={() => setSelectedShift(shift)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                  selectedShift === shift
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {shift}
              </button>
            ))}
          </div>

          {/* Carousel Navigation (Prev / Next / Play-Pause) */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={handlePrev}
              title="Previous safety tip"
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause auto-rotation' : 'Resume auto-rotation'}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-600" /> : <Play className="w-3.5 h-3.5 text-slate-700" />}
            </button>
            <button
              onClick={handleNext}
              title="Next safety tip"
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono font-semibold text-slate-500 px-1 border-l border-slate-200">
              {currentIndex + 1}/{DGMS_SAFETY_TIPS.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tip Body */}
      <div className="mt-3.5 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Tip Title, Statutory Authority & Directive */}
        <div className="lg:col-span-7 space-y-2.5">
          {/* Statutory References (Unboxed Metadata) */}
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
              {currentTip.circularRef}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-600 font-medium">{currentTip.regRef}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 font-semibold">{currentTip.category}</span>
          </div>

          {/* Heading */}
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
            {currentTip.title}
          </h3>

          {/* Core Tip Callout */}
          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/90 text-xs text-amber-950 leading-relaxed">
            <div className="font-bold text-amber-900 mb-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Mandatory Shift Precaution:</span>
            </div>
            <p>{currentTip.tipSummary}</p>
          </div>

          {/* Detailed Context (Expandable) */}
          <div className="text-xs text-slate-600 leading-relaxed">
            {showFullGuideline ? (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 animate-in fade-in duration-200">
                <div className="font-bold text-slate-800 text-[11px] uppercase">
                  DGMS Statutory Rationale & Mine Application:
                </div>
                <p>{currentTip.detailedGuideline}</p>
                <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-200/80">
                  Target Field Area: <strong className="text-slate-700">{currentTip.shiftFocus}</strong>
                </div>
              </div>
            ) : (
              <p className="line-clamp-2 text-slate-500">
                {currentTip.detailedGuideline}
              </p>
            )}
            <button
              onClick={() => setShowFullGuideline(!showFullGuideline)}
              className="mt-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 underline cursor-pointer"
            >
              {showFullGuideline ? 'Collapse statutory details' : 'Read full DGMS circular guideline & technical context →'}
            </button>
          </div>
        </div>

        {/* Right Column: Pre-Shift Action Items Checklist & PPE */}
        <div className="lg:col-span-5 bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Shift Verification Checklist
              </span>
              <span className="text-[10px] text-slate-500">Tick to verify on site</span>
            </div>

            <div className="space-y-1.5 mt-2">
              {currentTip.actionItems.map((item, idx) => {
                const isChecked = !!checkedActions[`${currentTip.id}-${idx}`];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleAction(idx)}
                    className={`w-full text-left p-1.5 rounded-lg text-xs flex items-start gap-2 transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-white hover:bg-slate-100/80 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border text-[10px] ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && '✓'}
                    </span>
                    <span className={`text-[11px] leading-tight ${isChecked ? 'line-through text-emerald-800 font-medium' : ''}`}>
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Mandatory PPE Strip */}
            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px]">
              <span className="text-slate-500 font-semibold block mb-1">Mandatory PPE for this task:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {currentTip.mandatoryPPE.map((ppe, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded shadow-2xs"
                  >
                    {ppe}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Acknowledgement Status Indicator */}
          {isAcknowledged && (
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Shift Briefing Acknowledged
              </span>
              <span className="text-[10px] text-emerald-700 font-mono">
                {acknowledgedTips[currentTip.id]?.timestamp.split('·')[0]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Actions & Dot Indicators */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        {/* Navigation Indicator Dots */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500 font-medium mr-1 hidden sm:inline">Topics:</span>
          {DGMS_SAFETY_TIPS.map((tip, idx) => (
            <button
              key={tip.id}
              onClick={() => {
                setCurrentIndex(idx);
                setCheckedActions({});
                setShowFullGuideline(false);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'w-6 bg-amber-500'
                  : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
              title={`${tip.category}: ${tip.title}`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Copy Briefing Slip */}
          <button
            onClick={handleCopyBriefingSlip}
            className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Copy formatted briefing slip for shift logbook"
          >
            {copiedSlip ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedSlip ? 'Slip Copied!' : 'Copy Slip'}</span>
          </button>

          {/* Adopt for Toolbox Talk (TBT) */}
          <button
            onClick={handleAdoptForTBT}
            className="px-2.5 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg border border-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Open Safety Toolbox Talks to log shift attendance"
          >
            <FileText className="w-3.5 h-3.5 text-amber-700" />
            <span>Adopt in TBT</span>
          </button>

          {/* Formal Shift Acknowledge Button */}
          {!isAcknowledged ? (
            <button
              onClick={handleAcknowledge}
              className="px-3.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Acknowledge Briefing</span>
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Logged by {currentUser.name.split(' ')[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

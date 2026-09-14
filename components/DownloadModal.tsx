"use client";

import React, { useEffect, useState, useRef } from "react";
import { CheckCircle2, Download, FileSpreadsheet, X } from "lucide-react";
import { MicrosoftExcel } from "./MicrosoftExcel";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string;
  recordCount: number;
  onExecuteDownload: () => void;
}

export function DownloadModal({
  isOpen,
  onClose,
  filename,
  recordCount,
  onExecuteDownload,
}: DownloadModalProps) {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Extracting attendance records...");
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setIsCompleted(false);
      setStatusMessage("Extracting attendance records...");
      hasTriggeredRef.current = false;
      return;
    }

    // Step-by-step progress animation
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 12;

      if (currentProgress < 35) {
        setStatusMessage("Extracting attendance records & user credentials...");
      } else if (currentProgress < 75) {
        setStatusMessage("Generating styled Microsoft Excel worksheet...");
      } else if (currentProgress < 98) {
        setStatusMessage("Finalizing .xlsx spreadsheet packaging...");
      }

      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setProgress(100);
        setIsCompleted(true);
        setStatusMessage("Download complete! File saved.");

        // Trigger real file download once 100% is reached
        if (!hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          onExecuteDownload();
        }
      } else {
        setProgress(currentProgress);
      }
    }, 140);

    return () => clearInterval(interval);
  }, [isOpen, onExecuteDownload]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={isCompleted ? onClose : undefined}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#0c1f3d] border-2 border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col items-center text-center">
          {/* Animated Icon Avatar */}
          <div className="relative mb-5">
            {!isCompleted ? (
              <div className="relative w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-600/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <MicrosoftExcel className="w-10 h-10 animate-bounce" />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#107C41] text-white flex items-center justify-center shadow-sm">
                  <Download className="w-3.5 h-3.5 animate-pulse" />
                </span>
              </div>
            ) : (
              <div className="relative w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-scaleUp">
                <MicrosoftExcel className="w-11 h-11 drop-shadow-md" />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#107C41] text-white flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>
            )}
          </div>

          {/* Title & Status */}
          <h2 className="text-xl font-heading font-extrabold text-[#092B5A] dark:text-white tracking-tight">
            {isCompleted ? "Spreadsheet Downloaded!" : "Exporting to Excel..."}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 font-medium min-h-[20px] transition-all">
            {statusMessage}
          </p>

          {/* Animated Progress Bar */}
          <div className="w-full mt-6 mb-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Progress</span>
              <span className="text-[#107C41] dark:text-emerald-400 font-mono">
                {progress}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#107C41] via-[#138889] to-[#107C41] transition-all duration-200 ease-out shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* File & Records Detail Card */}
          <div className="w-full mt-2 p-3.5 bg-slate-50 dark:bg-[#06101e] border border-slate-200 dark:border-slate-800 rounded-2xl text-left">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 text-[#107C41] dark:text-emerald-400 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Target File
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {recordCount} {recordCount === 1 ? "record" : "records"}
                  </span>
                </div>
                <p className="text-xs font-mono font-semibold text-[#092B5A] dark:text-slate-200 truncate mt-0.5">
                  {filename}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="w-full mt-6">
            {isCompleted ? (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-5 btn-tactile-excel rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Done</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";

interface QrScannerProps {
  onScan: (code: string) => void;
}

export default function QrScanner({ onScan }: QrScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<unknown>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");

  const startScanner = async () => {
    if (!containerRef.current) return;
    setError("");

    try {
      // Dynamic import — html5-qrcode uses browser APIs
      const { Html5Qrcode } = await import("html5-qrcode");

      const scannerId = "qr-reader-" + Date.now();
      containerRef.current.id = scannerId;

      containerRef.current.classList.remove("hidden");
      containerRef.current.classList.add("block");

      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          // Brief pause after successful scan
          scanner.pause();
          setTimeout(() => {
            try { scanner.resume(); } catch { /* scanner may have been stopped */ }
          }, 2000);
        },
        () => { /* ignore scan failures */ }
      );

      setActive(true);
    } catch (err) {
      if (containerRef.current) {
        containerRef.current.classList.add("hidden");
        containerRef.current.classList.remove("block");
      }
      setActive(false);
      const msg = err instanceof Error ? err.message : "Camera access denied";
      setError(msg.includes("NotAllowed") ? "Camera permission denied. Please allow camera access." : msg);
    }
  };

  const stopScanner = async () => {
    try {
      const scanner = scannerRef.current as { stop: () => Promise<void>; clear: () => void } | null;
      if (scanner) {
        await scanner.stop();
        scanner.clear();
      }
    } catch { /* ignore */ }
    if (containerRef.current) {
      containerRef.current.classList.add("hidden");
      containerRef.current.classList.remove("block");
    }
    scannerRef.current = null;
    setActive(false);
  };

  useEffect(() => {
    return () => { stopScanner(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {!active ? (
        <button
          onClick={startScanner}
          className="flex items-center justify-center gap-2 px-5 py-4 rounded-xl transition-colors hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] bg-[#fbeed4] dark:bg-[#111a34] border-2 border-dashed border-[#867bba] dark:border-[#2a2660]"
          style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px" }}
        >
          <Camera className="w-5 h-5 text-[#2d3895]" strokeWidth={1.5} />
          <span className="text-[#3c58a7] dark:text-[#b3c2ff]">Open Camera Scanner</span>
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px" }}>
              📷 Scanning... point at a QR code
            </span>
            <button
              onClick={stopScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660]"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "11px" }}
            >
              <CameraOff className="w-3.5 h-3.5 text-[#3c58a7] dark:text-[#b3c2ff]" strokeWidth={1.5} />
              <span className="text-[#3c58a7] dark:text-[#b3c2ff]">Stop</span>
            </button>
          </div>
        </div>
      )}

      {/* Camera viewfinder */}
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden hidden"
        style={{ minHeight: "300px", background: "#000" }}
      />

      {error && (
        <div className="px-3 py-2 rounded-lg text-sm bg-[#fbeed4] dark:bg-[#111a34] border border-red-400/30"
          style={{ fontFamily: "var(--font-body)", color: "#d33" }}>
          {error}
        </div>
      )}
    </div>
  );
}

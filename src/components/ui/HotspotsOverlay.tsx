import React from "react";

export interface Hotspot {
  id: string;
  label: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
}

interface HotspotsOverlayProps {
  hotspots: Hotspot[];
}

export const HotspotsOverlay: React.FC<HotspotsOverlayProps> = ({
  hotspots,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {hotspots.map((spot) => {
        return (
          <div
            key={spot.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
          >
            <div className="px-3 py-2 rounded-xl bg-white/95 border border-slate-200 shadow-xl backdrop-blur-md text-xs text-slate-900 font-bold z-30 animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap">
              {spot.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};


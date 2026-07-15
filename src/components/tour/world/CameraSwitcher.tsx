import { Camera, Plane, Car, ArrowLeftRight, Eye } from "lucide-react";
import type { CameraMode } from "./TourWorld";

const OPTIONS: Array<{ mode: CameraMode; label: string; icon: React.ReactNode }> = [
  { mode: "chase", label: "3ª Pessoa", icon: <Car className="h-4 w-4" /> },
  { mode: "drone", label: "Drone", icon: <Plane className="h-4 w-4" /> },
  { mode: "hood", label: "Capô", icon: <Camera className="h-4 w-4" /> },
  { mode: "side", label: "Lateral", icon: <ArrowLeftRight className="h-4 w-4" /> },
  { mode: "aerial", label: "Aérea", icon: <Eye className="h-4 w-4" /> },
];

export function CameraSwitcher({
  mode,
  onChange,
}: {
  mode: CameraMode;
  onChange: (m: CameraMode) => void;
}) {
  return (
    <div className="pointer-events-auto absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
      <div className="flex gap-1 rounded-full border border-white/10 bg-black/70 p-1 backdrop-blur-md">
        {OPTIONS.map((o) => (
          <button
            key={o.mode}
            onClick={() => onChange(o.mode)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
              mode === o.mode
                ? "bg-brand text-brand-foreground"
                : "text-white/70 hover:text-white"
            }`}
            title={o.label}
          >
            {o.icon}
            <span className="hidden sm:inline">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

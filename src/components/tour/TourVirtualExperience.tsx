import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IntroScreen } from "./IntroScreen";
import { VehicleSelect } from "./VehicleSelect";
import { TrailSelect } from "./TrailSelect";
import { CinematicLoader } from "./CinematicLoader";
import { TourScene } from "./TourScene";
import { EndScreen } from "./EndScreen";
import type { TourVehicle, Trail } from "./tour-data";

type Stage = "intro" | "vehicle" | "trail" | "loading" | "scene" | "end";

export function TourVirtualExperience() {
  const [stage, setStage] = useState<Stage>("intro");
  const [vehicle, setVehicle] = useState<TourVehicle | null>(null);
  const [trail, setTrail] = useState<Trail | null>(null);

  const restart = () => {
    setVehicle(null);
    setTrail(null);
    setStage("vehicle");
  };

  return (
    <div className="relative min-h-dvh">
      <AnimatePresence mode="wait">
        {stage === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <IntroScreen onStart={() => setStage("vehicle")} />
          </motion.div>
        )}
        {stage === "vehicle" && (
          <motion.div
            key="vehicle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <VehicleSelect
              onSelect={(v) => {
                setVehicle(v);
                setStage("trail");
              }}
            />
          </motion.div>
        )}
        {stage === "trail" && (
          <motion.div
            key="trail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <TrailSelect
              onBack={() => setStage("vehicle")}
              onSelect={(t) => {
                setTrail(t);
                setStage("loading");
              }}
            />
          </motion.div>
        )}
        {stage === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CinematicLoader onReady={() => setStage("scene")} />
          </motion.div>
        )}
        {stage === "scene" && vehicle && trail && (
          <motion.div
            key="scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <TourScene vehicle={vehicle} trail={trail} onFinish={() => setStage("end")} />
          </motion.div>
        )}
        {stage === "end" && trail && (
          <motion.div
            key="end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <EndScreen trail={trail} onRestart={restart} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

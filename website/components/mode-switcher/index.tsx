import * as React from "react";
import styles from "./mode-switcher.module.scss";
import { motion } from "framer-motion";

export type Mode = "single" | "range" | "multiple";

type TMode = {
  mode: Mode;
  setMode: Function;
};

const ModeContext = React.createContext<TMode>({} as TMode);
const MODES = ["single", "range", "multiple"];

const ModeSwitcher = () => {
  const { mode, setMode } = React.useContext(ModeContext);
  const ref = React.useRef<HTMLButtonElement | null>(null);

  return (
    <div className={styles.switcher}>
      {MODES.map((key) => {
        const isActive = key === mode;

        return (
          <button
            className="relative"
            ref={ref}
            key={key}
            data-selected={Boolean(isActive)}
            onClick={() => setMode(key as Mode)}
          >
            {key}
            {isActive && (
              <motion.div
                layoutId="activeTheme"
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 27,
                  mass: 1,
                }}
                className={`${styles.activeTheme} ${styles.activeTheme1}`}
              />
            )}
            {isActive && (
              <motion.div
                layoutId="aaa"
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 27,
                  mass: 1,
                }}
                className={`${styles.switcherLight}`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ModeSwitcher;
export { ModeContext };

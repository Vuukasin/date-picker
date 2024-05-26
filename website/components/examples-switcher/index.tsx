import * as React from "react";
import styles from "./examples-switcher.module.scss";
import { motion } from "framer-motion";

// export type Example = 0 | 1 | 2;

type TExamples = {
  example: number;
  setExample: Function;
};

const ExamplesContext = React.createContext<TExamples>(undefined as any);
const EXAMPLES = ["Months Dropdown", "Popover", "Composable"];

const ExamplesSwitcher = () => {
  const { example, setExample } = React.useContext(ExamplesContext);
  const ref = React.useRef<HTMLButtonElement | null>(null);

  return (
    <div className={styles.switcher}>
      {EXAMPLES.map((key, idx) => {
        const isActive = idx === example;

        return (
          <button
            className="relative whitespace-nowrap"
            ref={ref}
            key={key}
            data-selected={Boolean(isActive)}
            onClick={() => setExample(idx)}
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

export default ExamplesSwitcher;
export { ExamplesContext };

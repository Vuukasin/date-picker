import React from "react";
import copy from "copy-to-clipboard";
import { Highlight } from "prism-react-renderer";
import styles from "./code.module.scss";
import CopyIcon from "../icons/Copy";

const theme = {
  plain: {
    color: "rgb(227,228,232)",
    lineHeight: "1.35",
    fontSize: 12,
    letterSpacing: "0.022em",
    fontFamily: "ui, monospace",
  },
  styles: [
    {
      types: ["comment"],
      style: {
        color: "hsl(0, 0%, 43.9%)",
      },
    },
    {
      types: ["atrule", "keyword", "attr-name", "selector", "punctuation", "operator"],
      style: {
        color: "rgba(255,255,255,0.48)",
      },
    },
    {
      types: ["class-name", "function", "tag"],
      style: {
        // color: "rgba(255,255,255)",
        color: "rgb(227,228,232)",
      },
    },
  ],
};

const Code = ({ children }: { children: string }) => {
  return (
    <Highlight theme={theme} code={children} language="tsx">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <div className={`${styles.root}`}>
          <pre style={style} className={className}>
            <button aria-label="Copy Code" onClick={() => copy(children)}>
              <CopyIcon />
            </button>

            <div className={styles.shine} />
            {tokens.map((line, i) => (
              <div style={{ overflowX: "hidden" }} key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        </div>
      )}
    </Highlight>
  );
};

export default Code;

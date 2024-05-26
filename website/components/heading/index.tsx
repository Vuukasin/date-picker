import type { HTMLAttributes } from "react";
import styles from "./index.module.scss";

type HeadingProps = HTMLAttributes<HTMLHeadElement> & {
  type: "heading" | "subheading";
};

const Heading = ({ type, ...etc }: HeadingProps) => {
  return (
    <div className={styles.wrapper} {...etc}>
      <span className={styles.light} />
      {type === "heading" ? <h1 {...etc} className={styles.heading} /> : <h2 {...etc} className={styles.subheading} />}
    </div>
  );
};

export default Heading;

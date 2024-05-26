import React from "react";
import * as Popover from "@radix-ui/react-popover";
import styles from "./index.module.scss";
import InfoIcon from "../icons/Info";

type PopoverProps = {
  children: React.ReactNode;
};

const PopoverInfo = ({ children }: PopoverProps) => (
  <Popover.Root>
    <Popover.Trigger asChild>
      <button className={styles.iconButton} aria-label="Info">
        <InfoIcon />
      </button>
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content className={styles.popoverContent} sideOffset={5}>
        {children}
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
);

export default PopoverInfo;

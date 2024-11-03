"use client";

import * as React from "react";
import Badge from "@/components/badge";
import CopyIcon from "@/components/icons/Copy";
import Link from "next/link";
import GitHubIcon from "@/components/icons/GitHub";
import { DatePicker } from "chrono-select";
import ModeSwitcher, { ModeContext } from "@/components/mode-switcher";
import { Mode as TMode } from "@/components/mode-switcher";
import Heading from "@/components/heading";
import Separator from "@/components/separator";
import styles from "../styles/index.module.scss";
import { cn } from "@/utils/cn";
import dynamic from "next/dynamic";
import packageJSON from "../../chrono-select/package.json";
import datePickerStyles from "../styles/date-picker.module.scss";
import copy from "copy-to-clipboard";

const APIReference = dynamic(() => import("@/sections/ApiReference"), { ssr: true });
const Parts = dynamic(() => import("@/sections/Parts"), { ssr: true });
const Styling = dynamic(() => import("@/sections/Styling"), { ssr: true });

const Page = () => {
  const ref = React.useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = React.useState<TMode>("single");

  const changeMode = (m: TMode) => {
    setSingleSelected(undefined);
    setMultipleSelected([]);
    setRangeSelected([]);
    setMode(m);
  };

  React.useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, [mode]);

  const [singleSelected, setSingleSelected] = React.useState<Date>();
  const [rangeSelected, setRangeSelected] = React.useState<Date[]>([]);
  const [multipleSelected, setMultipleSelected] = React.useState<Date[]>([]);

  return (
    <main>
      <section className="flex flex-col items-start w-full h-fit max-w-[640px]">
        <div className="flex justify-between w-full items-end">
          <Heading type="heading">Date Picker</Heading>
          <div className="relative">
            <div className="light2" />
            <Badge>v{packageJSON.version}</Badge>
          </div>
        </div>
        <span className="text-[#a0a0a0] text-[1rem] pt-4">
          Fast, unstyled, keyboard accessible date picker for React.
        </span>

        <div className="flex flex-col gap-4 sm:flex-row mt-8 justify-between items-center w-full">
          <Link href="https://github.com/vuukasin/chrono-select" className="flex items-center gap-2">
            <GitHubIcon />
            <span className="text-[rgba(227,228,230)] text-[0.875rem]">vuukasin/chrono-select</span>
          </Link>

          <button
            onClick={() => copy("npm install chrono-select")}
            className="bg-[rgba(29,31,36)] text-[0.875rem] text-[#a0a0a0] p-[0px_8px_0px_16px] cursor-copy font-[500] gap-4 flex items-center h-10 rounded-full will-change-transform duration-150"
          >
            npm install {"chrono-select"}
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#2e2e2e]">
              <CopyIcon />
            </span>
          </button>
        </div>
      </section>

      <section className={datePickerStyles.mainDP}>
        {mode === "single" && (
          <DatePicker
            ref={ref}
            key="single"
            weekdays="short"
            fixedWeeks
            lastMonthControl
            selected={singleSelected}
            onSelectedChange={(date) => {
              if (new Intl.DateTimeFormat().format(singleSelected) === new Intl.DateTimeFormat().format(date)) {
                setSingleSelected(undefined);
              } else {
                setSingleSelected(date);
              }
            }}
            mode="single"
            headingFormat="MMMM YYYY"
            monthCount={2}
            moveFocusBehavior="change"
            startOfWeek={1}
          >
            <DatePicker.MonthsWrapper />
          </DatePicker>
        )}
        {mode === "range" && (
          <DatePicker
            ref={ref}
            key="range"
            weekdays="short"
            fixedWeeks
            lastMonthControl
            selected={rangeSelected}
            onSelectedChange={(date) => {
              setRangeSelected((prev) => {
                const index = prev.findIndex(
                  (d) => new Intl.DateTimeFormat().format(d) === new Intl.DateTimeFormat().format(date),
                );
                return index === -1
                  ? prev.length === 1
                    ? [...prev, date].sort((a, b) => a.getTime() - b.getTime())
                    : [date]
                  : prev.filter((_, idx) => idx !== index);
              });
            }}
            mode="range"
            headingFormat="MMMM YYYY"
            monthCount={2}
            moveFocusBehavior="change"
            startOfWeek={1}
          >
            <DatePicker.MonthsWrapper />
          </DatePicker>
        )}
        {mode === "multiple" && (
          <DatePicker
            ref={ref}
            key="multiple"
            weekdays="short"
            fixedWeeks
            lastMonthControl
            selected={multipleSelected}
            onSelectedChange={(date) => {
              const index = multipleSelected?.findIndex(
                (d) => new Intl.DateTimeFormat("en-US").format(d) === new Intl.DateTimeFormat("en-US").format(date),
              );

              console.info(date);
              if (index === -1) {
                setMultipleSelected([...(multipleSelected || []), date]);
              } else {
                setMultipleSelected((prev) => prev?.filter((d, idx) => idx !== index));
              }
            }}
            mode="multiple"
            headingFormat="MMMM YYYY"
            monthCount={2}
            moveFocusBehavior="change"
            startOfWeek={1}
          >
            <DatePicker.MonthsWrapper />
          </DatePicker>
        )}
      </section>

      <ModeContext.Provider value={{ mode, setMode: changeMode }}>
        <ModeSwitcher />
      </ModeContext.Provider>

      <Separator />

      <section className={cn("gap-10", styles.introduction)}>
        <Heading type="subheading">Introduction</Heading>
        <div className={styles.textBox}>
          <p className={styles.text}>
            The Date Picker is designed with a focus on both simplicity and flexibility. It is delivered unstyled to
            allow for extensive customization and supports full keyboard accessibility. Additionally, it is lightweight,
            with a{/* gzipped */}
            size of only 14kb and does not rely on any external dependencies.
          </p>

          <p className={styles.text}>
            Component requires the <span className="text-white">selected</span> and{" "}
            <span className="text-white">onSelectedChange</span> properties to function. The type of the{" "}
            <span className="text-white">selected</span> property is determined by the{" "}
            <span className="text-white">mode</span> property, which defaults to 'single'. In 'range' mode, it is
            necessary to manage an array containing no more than two values.
          </p>

          <p className={styles.text}>
            The Date Picker is fully customizable, enabling you to build your components from scratch. For further
            details please visit{" "}
            <Link href="/examples" className="text-white underline underline-offset-2">
              examples
            </Link>{" "}
            page.
          </p>
        </div>
      </section>

      <APIReference />
      <Parts />
      <Styling />
    </main>
  );
};

export default Page;

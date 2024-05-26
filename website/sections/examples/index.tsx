"use client";

import Heading from "@/components/heading";
import WithMonthsDropdown from "./WithMonthsDropdown";
import Separator from "@/components/separator";
import "./index.scss";
import DatePickerPopover from "./InPopover";
import React from "react";
import { cn } from "@/utils/cn";
import Link from "next/link";
import layoutStyles from "./layout.module.scss";
import DoubleArrowLeftIcon from "@/components/icons/DoubleArrowLeft";
import Composable from "./Composable";
import ExamplesSwitcher, { ExamplesContext } from "@/components/examples-switcher";
import useMediaQuery from "@/utils/useMediaQuery";

const Examples = ({ exampleIdx }: { exampleIdx: number }) => {
  const [example, setExample] = React.useState<number>(exampleIdx || 0);
  const { isMobile, isTablet } = useMediaQuery();

  return (
    <div className={layoutStyles.mainGrid}>
      <Link
        href="/"
        className="!col-start-1 gap-1 top-[120px] flex items-center lg:sticky italic text-[rgba(255,255,255,0.533)] left-6"
      >
        <DoubleArrowLeftIcon />
        Index
      </Link>
      <div className="lg:flex hidden">
        <Heading type="subheading">
          {example === 0 && "Months Dropdown"}
          {example === 1 && "Inside Popover"}
          {example === 2 && "Composable"}
        </Heading>
      </div>
      <div className="lg:hidden flex w-full">
        <ExamplesContext.Provider value={{ example, setExample }}>
          <ExamplesSwitcher />
        </ExamplesContext.Provider>
      </div>
      {/* <div className="!col-start-1 gap-1 flex items-center sticky text-[rgba(255,255,255,0.533)] left-6"></div> */}
      <div className="lg:py-6 py-2">
        <Separator />
      </div>

      <div className="!col-start-1 row-start-2  lg:flex hidden sticky text-[rgba(255,255,255,0.533)] top-[calc(120px+27px+88px)] left-6">
        <div className="flex flex-col gap-2 h-fit">
          <button onClick={() => setExample(0)} className={cn("text-start text-[1rem]", example === 0 && "text-white")}>
            Months Dropdown
          </button>
          <button onClick={() => setExample(1)} className={cn("text-start text-[1rem]", example === 1 && "text-white")}>
            Inside popover
          </button>
          <button onClick={() => setExample(2)} className={cn("text-start text-[1rem]", example === 2 && "text-white")}>
            Composable
          </button>
        </div>
      </div>

      <div className="max-w-[640px] flex flex-col">
        {example === 0 && <WithMonthsDropdown monthCount={isTablet || isMobile ? 1 : 2} />}
        {example === 1 && <DatePickerPopover />}
        {example === 2 && <Composable />}
      </div>
    </div>
  );
};

export default Examples;

// Here are some examples of how you can use the date picker. Please pay attention to the useStore and useDatePicker hooks, those are the key to the date picker's functionality.

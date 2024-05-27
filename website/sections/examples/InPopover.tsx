import * as React from "react";
import * as PopoverPimitives from "@radix-ui/react-popover";
import { DatePicker } from "date-picker";
import { toast } from "sonner";
import CalendarIcon from "@/components/icons/Calendar";
import { MonthsDropdown } from "./WithMonthsDropdown";
import Code from "@/components/code";
import ChevronLeft from "@/components/icons/ChevronLeft";
import ChevronRight from "@/components/icons/ChevronRight";

const DatePickerPopover = () => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = React.useState<Date>();
  const [open, setOpen] = React.useState(false);

  function focusOnClose(event: Event) {
    event.preventDefault();
    ref.current?.focus({ preventScroll: true });
  }

  return (
    <div className="flex flex-col gap-20 items-center w-full py-12">
      <PopoverPimitives.Root open={open} onOpenChange={setOpen}>
        <PopoverPimitives.Trigger asChild>
          <button className="text-white text-[0.8125rem] bg-[rgba(0,0,0,0.45)] px-4 py-2 w-fit rounded focus:border-red-500 flex gap-2 items-center">
            <span>{selected ? selected.toDateString() : "Select date"}</span>
            <CalendarIcon />
          </button>
        </PopoverPimitives.Trigger>
        <PopoverPimitives.Portal>
          <PopoverPimitives.Content sideOffset={2} className="oneMonth content">
            <DatePicker
              ref={ref}
              fixedWeeks
              selected={selected}
              onSelectedChange={(date) => {
                if (new Intl.DateTimeFormat().format(date) !== new Intl.DateTimeFormat().format(selected)) {
                  toast("Selected date: " + date);
                  setSelected(date);
                } else {
                  setSelected(undefined);
                }
                setOpen(false);
              }}
            >
              <div className="flex justify-between items-center">
                <MonthsDropdown focusOnClose={focusOnClose} />
                <div className="flex gap-1 items-center">
                  <DatePicker.PrevMonthTrigger>
                    <ChevronLeft />
                  </DatePicker.PrevMonthTrigger>
                  <DatePicker.NextMonthTrigger>
                    <ChevronRight />
                  </DatePicker.NextMonthTrigger>
                </div>
              </div>
              <DatePicker.MonthsWrapper />
            </DatePicker>
          </PopoverPimitives.Content>
        </PopoverPimitives.Portal>
      </PopoverPimitives.Root>

      <div className="w-full relative">
        <div className="code-light" />
        <Code>{codeBlock}</Code>
      </div>
    </div>
  );
};

const codeBlock = `
import * as Popover from "@radix-ui/react-popover";
import MonthsDropdown from "./MonthsDropdown"
import { DatePicker } from "date-picker";
import * as React from "react";

const DatePickerPopover = () => {

  const ref = React.useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = React.useState<Date>();
  const [open, setOpen] = React.useState(false);

  function focusOnClose(event: Event) {
    event.preventDefault();
    ref.current?.focus();
  }
  
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>Open</Popover.Trigger>

      <Popover.Content>
        <DatePicker
          ref={ref}
          selected={selected}
          onSelectedChange={(date) => {
            toast("Selected date: " + date);
            setSelected(date);
            setOpen(false);
          }}
        >
          {/* You can remove months dropdown  */}
          <MonthsDropdown focusOnClose={focusOnClose} /> 
          <DatePicker.MonthsWrapper />
        </DatePicker>
      </Popover.Content>
    </Popover.Root>
  )
}
  `;

export default DatePickerPopover;

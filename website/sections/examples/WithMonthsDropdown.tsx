import * as DropdownPrimitives from "@radix-ui/react-dropdown-menu";
import {
  DatePicker,
  useStore,
  useDatePicker,
  useDatePickerContext,
  createMonthProps,
  MonthProps,
  generateDays,
  createDayProps,
} from "date-picker";
import ChevronDownIcon from "@/components/icons/ChevronDown";
import * as React from "react";
import { cn } from "@/utils/cn";
import Code from "@/components/code";
import dpStyles from "@/styles/date-picker.module.scss";

const months = "January_February_March_April_May_June_July_August_September_October_November_December".split("_");

const MonthsDropdown = ({ focusOnClose }: { focusOnClose?: (event: Event) => void }) => {
  const displayedMonth = useDatePicker((state) => state.month);
  const displayedYear = useDatePicker((state) => state.year);
  const store = useStore();

  function onSelect(month: number) {
    store.setState("month", month);
    store.setState("focused", "first");
  }

  function arrowStopPropagation(event: React.KeyboardEvent) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.stopPropagation();
    }
  }

  return (
    <DropdownPrimitives.Root>
      <DropdownPrimitives.Trigger
        tabIndex={0}
        onKeyDown={arrowStopPropagation}
        className="text-white px-1 w-fit focus:outline-white rounded-sm focus-within:outline-none ring-0 flex gap-1 items-center"
      >
        <span className="text-[0.875rem] text-white">{`${months[displayedMonth]} ${displayedYear}`}</span>
        <ChevronDownIcon className="fill-white" />
      </DropdownPrimitives.Trigger>
      <DropdownPrimitives.Portal>
        <DropdownPrimitives.Content
          side="left"
          sideOffset={18}
          align="start"
          onKeyDown={arrowStopPropagation}
          defaultChecked={true}
          className="rounded-md content"
          onCloseAutoFocus={focusOnClose}
        >
          {months.map((monthName, idx) => (
            <DropdownPrimitives.Item
              key={idx}
              className={cn(
                "z-10 outline-none relative text-[rgb(93,94,97)] focus:after:content-[''] focus:after:rounded-md focus:text-white focus:after:bg-[rgb(100,102,216)] focus:after:absolute focus:after:left-0 focus:after:top-0 focus:after:h-full focus:after:w-[2px] text-[0.8125rem]  bg-[rgba(0,0,0,0.45)] backdrop-blur-[10px] px-2 py-1",
                displayedMonth === idx && "text-white",
              )}
              onSelect={() => {
                if (displayedMonth === idx) return;
                onSelect(idx);
              }}
            >
              {monthName}
            </DropdownPrimitives.Item>
          ))}
        </DropdownPrimitives.Content>
      </DropdownPrimitives.Portal>
    </DropdownPrimitives.Root>
  );
};

const WithMonthsDropdown = ({ monthCount }: { monthCount?: number }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = React.useState<Date[]>([]);

  // Focus the date picker on mount
  React.useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, [ref.current]);

  // Radix by default returns focus to the trigger when the dropdown closes, so we need to override that behavior
  // to focus the date picker instead
  function focusOnClose(event: Event) {
    event.preventDefault();
    ref.current?.focus({ preventScroll: true });
  }

  return (
    <div className="flex w-full flex-col gap-20 justify-center items-center">
      <div className={dpStyles.mainDP}>
        <DatePicker
          className="max-h-[356px] overflow-y-hidden"
          weekdays="short"
          monthCount={monthCount || 2}
          tabIndex={0}
          mode="range"
          ref={ref}
          fixedWeeks
          selected={selected}
          onSelectedChange={(date) => {
            if (selected.length === 0) {
              setSelected([date]);
              return;
            }

            if (selected.length === 1) {
              if (new Intl.DateTimeFormat().format(selected[0]) === new Intl.DateTimeFormat().format(date)) {
                setSelected([]);
                return;
              }

              setSelected([selected[0], date].sort((a, b) => a.getTime() - b.getTime()));

              return;
            }

            if (selected.length === 2) {
              setSelected([date]);
            }
          }}
        >
          <MonthsWrapper focusOnClose={focusOnClose} />
        </DatePicker>
      </div>

      <div className="w-full relative">
        <div className="code-light" />
        <Code>{codeBlock}</Code>
      </div>
    </div>
  );
};

type TMonthProps = MonthProps & { focusOnClose: (event: Event) => void };

const Month = React.forwardRef<HTMLDivElement, TMonthProps>((props, forwardedRef) => {
  const { month, year, focusOnClose, ...etc } = props;
  const firstRenderedMonth = useDatePicker((state) => state.month);
  const firstRenderedYear = useDatePicker((state) => state.year);
  const id = React.useId();

  const { startOfWeek, minDate, maxDate, fixedWeeks } = useDatePickerContext();
  const days = React.useMemo(() => generateDays(month, year, startOfWeek, fixedWeeks), [month, year]);

  return (
    <div id={id} ref={forwardedRef} date-picker-month="" {...etc}>
      {firstRenderedMonth === month && firstRenderedYear === year ? (
        <MonthsDropdown focusOnClose={focusOnClose} />
      ) : (
        <span className="text-[0.875rem] text-white">{`${months[month]} ${year}`}</span>
      )}
      <DatePicker.WeekdaysHeading short />
      <div date-picker-month-days="" className="flex flex-col gap-2">
        {days.map((day, idx) => {
          const { value, disabled } = createDayProps(year, month, day, idx, minDate, maxDate);
          return (
            <DatePicker.Day value={value} disabled={disabled} key={idx}>
              {day}
            </DatePicker.Day>
          );
        })}
      </div>
    </div>
  );
});

const MonthsWrapper = ({ focusOnClose }: { focusOnClose: (event: Event) => void }) => {
  const context = useDatePickerContext();
  const m = useDatePicker((state) => state.month);
  const y = useDatePicker((state) => state.year);

  return (
    <div ref={context.monthsWrapperRef as React.RefObject<HTMLDivElement>} date-picker-months-wrapper="">
      {Array.from({ length: context.monthCount || 4 }).map((_, idx) => {
        const { month, year } = createMonthProps(m, y, idx);
        return <Month focusOnClose={focusOnClose} key={idx} month={month} year={year} />;
      })}
    </div>
  );
};

const codeBlock = `
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import * as React from "react";
import { DatePicker, useDatePicker, useStore } from "date-picker";

const months = "January_February_March_April_May_June_July_August_September_October_November_December".split("_");

const MonthsDropdown = ({ focusOnClose }: { focusOnClose?: (event: Event) => void }) => {
    const month = useDatePicker((state) => state.month);
    const store = useStore();

    function onSelect(month: number) {
        store.setState("month", month);
        store.setState("focused", "first");
    };

    return (
        <Dropdown.Root>
            <Dropdown.Trigger asChild >
                <button>{months[month]}</button>
            </Dropdown.Trigger>
            <Dropdown.Portal>
                <Dropdown.Content onCloseAutoFocus={focusOnClose}>
                    {months.map((monthName, idx) => (
                        <Dropdown.Item key={monthName}  onSelect={() => onSelect(idx)}>
                            {monthName}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Content>
            </Dropdown.Portal>
        </Dropdown.Root>
    );
};

const DatePickerDemo = () => {
    const ref = React.useRef<HTMLDivElement | null>(null);   

    function focusOnClose(event: Event) {
      event.preventDefault();
      ref.current?.focus({ preventScroll: true });
    }

    return (
        <DatePicker ref={ref} onSelectedChange={(date) => console.info(date)}>
            <MonthsDropdown focusOnClose={focusOnClose} />
            <DatePicker.MonthsWrapper />
        </DatePicker>
    );
};
  `;

export default WithMonthsDropdown;
export { MonthsDropdown };

const asd =
  "focus:after:content-[''] focus:text-white focus:after:bg-[rgb(100,102,216)] focus:after:absolute focus:after:left-0 focus:after:top-0 focus:after:h-full focus:after:w-[2px]";

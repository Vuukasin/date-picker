import Code from "@/components/code";
import styles from "@/styles/index.module.scss";

const Composable = () => {
  return (
    <div className="flex flex-col gap-20 max-w-[640px]">
      <div className="flex flex-col gap-4">
        <p className={styles.text}>
          You can create your own components for date picker. Hooks and context provided by the date picker can be used
          to create your own custom components. This can be useful if you want to change the rendering of the each
          component. For example, you can create a custom month component that renders the days in a different way.
        </p>

        <p className={styles.text}>
          Important thing to note is that you need to use the data-attributes in the components you create. Date picker
          uses these attributes to manage the focus and keyboard navigation.
        </p>
      </div>

      <div className="w-full relative">
        <div className="code-light" />
        <Code>{codeBlock}</Code>
      </div>
    </div>
  );
};

const codeBlock = `
import { 
    DatePicker,
    useDatePicker,
    useDatePickerContext,
    createMonthProps,
    generateDays,
    createDayProps,
} from "chrono-select";
import type { MonthProps } from "chrono-select";
import * as React from "react";

const Month = React.forwardRef<HTMLDivElement, MonthProps>((props, forwardedRef) => {
  const { month, year, ...etc } = props;
  const id = React.useId();

  const { startOfWeek, minDate, maxDate, fixedWeeks } = useDatePickerContext();
  const days = useMemo(() => generateDays(month, year, startOfWeek, fixedWeeks), [month, year]);

  return (
    <div id={id} ref={forwardedRef} date-picker-months-wrapper="" {...etc}>
        <div date-picker-month-days="">
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


const MonthsWrapper = () => {
    const context = useDatePickerContext();
    const m = useDatePicker((state) => state.month);
    const y = useDatePicker((state) => state.year);

    return (
        <div ref={context.monthsWrapperRef} date-picker-months-wrapper="">
            {Array.from({ lenght: context.monthCount }).map((_, i) => {
                const { month, year } = createMonthProps(m, y, i);
                return <Month key={i} month={month} year={year} />
            })}
        </div>
    );
};


const DatePickerDemo = () => {
    return (
        <DatePicker mode="single" fixedWeeks>
            <MonthsWrapper />
        </DatePicker>
    );
};
`;

export default Composable;

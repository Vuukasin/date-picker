import * as React from "react";

type State = {
  focused: string;
  month: number;
  year: number;
  selected: Map<string, Date>;
};

type Store = {
  subscibe: (callback: () => void) => () => void;
  snapshot: () => State;
  setState: <K extends keyof State>(key: K, value: State[K], opts?: any) => void;
  emit: () => void;
};

type Children = { children?: React.ReactNode };
type DivProps = React.ComponentPropsWithoutRef<"div">;

const StoreContext = React.createContext<Store>(undefined as any);
const useStore = () => React.useContext(StoreContext);

type Context = {
  mode?: "single" | "range" | "multiple";
  monthCount?: number;
  startOfWeek?: number;
  monthsWrapperRef: React.RefObject<HTMLDivElement | null>;
  lastMonthControl?: boolean;
  weekdays?: "short" | "long";
  maxDate?: Date;
  minDate?: Date;
  headingFormat?: MonthYearFormat;
  fixedWeeks?: boolean;
  selected?: Date | Date[];
  onSelectedChange?: (value: Date) => void;
};

const DatePickerContext = React.createContext<Context>(undefined as any);
const useDatePickerContext = () => React.useContext(DatePickerContext);

/* -------------------------------------------------------------------------------------------------
 * DatePicker
 * -----------------------------------------------------------------------------------------------*/

type SingleModeProps = {
  mode?: "single";
  selected?: Date;
  onSelectedChange?: (value: Date) => void;
};

type MultipleModeProps = {
  mode?: "multiple";
  selected?: Date[];
  onSelectedChange?: (value: Date) => void;
};

type RangeModeProps = {
  mode?: "range";
  selected?: Date[];
  onSelectedChange?: (value: Date) => void;
};

type DatePickerProps = Children &
  DivProps & {
    startOfWeek?: number;
    minDate?: Date;
    maxDate?: Date;
    monthCount?: number;
    moveFocusBehavior?: "loop" | "change" | "none";
    lastMonthControl?: boolean;
    weekdays?: "short" | "long";
    headingFormat?: MonthYearFormat;
    fixedWeeks?: boolean;
    initialFocus?: Date;
  } & (SingleModeProps | RangeModeProps | MultipleModeProps);

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>((props, forwardedRef) => {
  const {
    mode = "single",
    moveFocusBehavior = "change",
    startOfWeek = 1,
    monthCount = 1,
    maxDate,
    minDate,
    lastMonthControl,
    weekdays,
    headingFormat,
    fixedWeeks,
    selected,
    onSelectedChange,
    initialFocus,
    ...etc
  } = props;

  const state = useLazyRef<State>(() => createInitialState(selected, initialFocus));

  const listeners = useLazyRef<Set<() => void>>(() => new Set());
  const schedule = useScheduleLayoutEffect();

  const monthsWrapperRef = React.useRef<HTMLDivElement | null>();

  React.useEffect(() => {
    if (!selected) store.setState("selected", new Map());
    else if (Array.isArray(selected)) {
      store.setState("selected", new Map(selected.map((date) => [toDateString(date), date])), { isProp: true });
    } else if (selected instanceof Date) {
      store.setState("selected", new Map([[toDateString(selected), selected]]), { isProp: true });
    }
  }, [selected]);

  const store: Store = React.useMemo(
    () => ({
      subscibe: (cb) => {
        listeners.current.add(cb);
        return () => listeners.current.delete(cb);
      },
      snapshot: () => state.current,
      setState: (key, value, opts) => {
        if (Object.is(state.current[key], value)) return;
        if (key === "focused" && typeof value === "string") {
          if (value !== "first" && value !== "last") {
            state.current.focused = value;
          }

          if (value === "first") {
            schedule(1, focusFirst);
          }
          if (value === "last") {
            schedule(1, focusLast);
          }
        }

        if (key === "selected" && value instanceof Map) {
          state.current.selected = value;
        }

        if (key === "month" && typeof value === "number") {
          if (value > 11) {
            // if max date is already in view, we should not update date picker
            if (shouldPreventViewUpdate(monthsWrapperRef, opts?.forward, minDate, maxDate)) return;

            // update month and year, % will give us the month index 14 & 2 => 2
            state.current.month = value % 12;
            state.current.year = state.current.year + Math.floor(value / 12);

            // YEAR REPAINT
            if (opts?.change === 1) {
              schedule(1, focusFirst); // DONE
            } else if (opts?.change === 7) {
              const currentFocusedDate = new Date(state.current.focused);

              const newDate = new Date(
                currentFocusedDate.getTime() +
                  7 * 24 * 60 * 60 * 1000 -
                  currentFocusedDate.getTimezoneOffset() * 60 * 1000,
              );
              const newValue = toDateString(newDate);

              const disabled = isRangeDisable(newValue, minDate, maxDate);

              schedule(1, () => (disabled ? focusLast() : updateFocused(newValue)));
            } else if (opts?.change === "cmd-next") {
              const newDate = new Date(state.current.focused);
              newDate.setMonth(newDate.getMonth() + 1);

              if (newDate.getMonth() !== state.current.month) {
                schedule(1, focusLastInFirstMonth);
              } else {
                const newValue = toDateString(newDate);

                const disabled = isRangeDisable(newValue, minDate, maxDate);

                schedule(1, () => (disabled ? focusLast() : updateFocused(newValue)));
              }
            }
          } else if (value < 0) {
            // If min date is already in view, we should not update state
            if (shouldPreventViewUpdate(monthsWrapperRef, opts?.forward, minDate, maxDate)) return;

            state.current.month = 12 - Math.abs(value);
            state.current.year = state.current.year - 1;

            if (opts?.change === -1) {
              schedule(4, focusLast);
            } else if (opts?.change === -7) {
              const currentFocusedDate = new Date(state.current.focused);

              const newDate = new Date(
                currentFocusedDate.getTime() -
                  7 * 24 * 60 * 60 * 1000 -
                  currentFocusedDate.getTimezoneOffset() * 60 * 1000,
              );
              const newValue = toDateString(newDate);

              const disabled = isRangeDisable(newValue, minDate, maxDate);

              schedule(1, () => (disabled ? focusFirst() : updateFocused(newValue)));
            } else if (opts?.change === "cmd-prev") {
              const newDate = new Date(state.current.focused);
              newDate.setMonth(newDate.getMonth() - 1);

              if (newDate.getMonth() !== (state.current.month + monthCount - 1) % 12) {
                schedule(1, focusLast);
              } else if (minDate && newDate.getTime() < minDate?.getTime()) {
                schedule(1, focusFirst);
              } else {
                const newValue = toDateString(newDate);

                const disabled = isRangeDisable(newValue, minDate, maxDate);

                schedule(1, () => (disabled ? focusFirst() : updateFocused(newValue)));
              }
            }
          } else {
            if (shouldPreventViewUpdate(monthsWrapperRef, opts?.forward, minDate, maxDate)) return;

            state.current.month = value;

            if (opts?.change === 1) {
              schedule(1, focusFirst);
            } else if (opts?.change === -1) {
              schedule(4, focusLast);
            } else if (opts?.change === 7) {
              const currentFocusedDate = new Date(state.current.focused);

              // It's important to calculate the new date in the same timezone as the current focused date
              // because the .getTime() method returns the number of milliseconds since January 1, 1970, 00:00:00 UTC
              const newDate = new Date(
                currentFocusedDate.getTime() +
                  7 * 24 * 60 * 60 * 1000 -
                  currentFocusedDate.getTimezoneOffset() * 60 * 1000,
              );
              const newValue = toDateString(newDate);

              const disabled = isRangeDisable(newValue, minDate, maxDate);

              schedule(1, () => (disabled ? focusLast() : updateFocused(newValue)));
            } else if (opts?.change === -7) {
              const currentFocusedDate = new Date(state.current.focused);

              const newDate = new Date(
                currentFocusedDate.getTime() -
                  7 * 24 * 60 * 60 * 1000 -
                  currentFocusedDate.getTimezoneOffset() * 60 * 1000,
              );
              const newValue = toDateString(newDate);

              const disabled = isRangeDisable(newValue, minDate, maxDate);

              schedule(1, () => (disabled ? focusFirst() : updateFocused(newValue)));
            } else if (opts?.change === "cmd-prev") {
              const newDate = new Date(state.current.focused);
              newDate.setMonth(newDate.getMonth() - 1);

              if (newDate.getMonth() !== value + monthCount - 1) {
                schedule(1, focusLast);
              } else if (minDate && newDate.getTime() < minDate?.getTime()) {
                schedule(1, focusFirst);
              } else {
                const newValue = toDateString(newDate);

                const disabled = isRangeDisable(newValue, minDate, maxDate);

                schedule(1, () => (disabled ? focusFirst() : updateFocused(newValue)));
              }
            } else if (opts?.change === "cmd-next") {
              const newDate = new Date(state.current.focused);
              newDate.setMonth(newDate.getMonth() + 1);

              if (newDate.getMonth() !== state.current.month) {
                schedule(1, focusLastInFirstMonth);
              } else {
                const newValue = toDateString(newDate);

                const disabled = isRangeDisable(newValue, minDate, maxDate);

                schedule(1, () => (disabled ? focusLast() : updateFocused(newValue)));
              }
            }
          }
        }

        store.emit();
      },
      emit: () => {
        listeners.current.forEach((l) => l());
      },
    }),
    [mode],
  );

  const context: Context = React.useMemo(
    () => ({
      onSelectedChange,
      selected,
      //
      lastMonthControl,
      headingFormat,
      startOfWeek,
      monthCount,
      fixedWeeks,
      weekdays,
      mode,
      //
      minDate,
      maxDate,
      //
      monthsWrapperRef,
    }),
    [
      minDate,
      maxDate,
      mode,
      monthCount,
      fixedWeeks,
      weekdays,
      lastMonthControl,
      headingFormat,
      selected,
      onSelectedChange,
    ],
  );

  const handleKeyDown = composeEventHandlers(props.onKeyDown, (event: React.KeyboardEvent) => {
    if (!monthsWrapperRef.current || event.defaultPrevented) return;
    const intent = MAP_KEY_TO_FOCUS_INTENT[event.key];
    switch (intent) {
      case "prev":
        event.preventDefault();
        if (event.metaKey) {
          focusSameDayInPrevMonth();
          break;
        }
        focusPrev();
        break;
      case "next":
        event.preventDefault();
        if (event.metaKey) {
          focusSameDayInNextMonth();
          break;
        }
        focusNext();
        break;

      case "prev-week":
        event.preventDefault();
        focusSameDayInPrevWeek();
        break;
      case "next-week":
        event.preventDefault();
        focusSameDayInNextWeek();
        break;
      case "submit":
        event.preventDefault();
        onSelectedChange?.(new Date(state.current.focused));
    }
  });

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0} ref={forwardedRef} {...etc} date-picker-root="">
      <StoreContext.Provider value={store}>
        <DatePickerContext.Provider value={context}>
          {props.children ? props.children : <MonthsWrapper />}
        </DatePickerContext.Provider>
      </StoreContext.Provider>
    </div>
  );

  function updateFocused(value: string) {
    store.setState("focused", value);
  }

  function focusFirst() {
    const value = getFirst(monthsWrapperRef).getAttribute(VALUE_ATTR);
    updateFocused(value);
  }

  function focusLast() {
    return updateFocusedToIndex(getValidDays(monthsWrapperRef).length - 1);
  }

  function focusLastInFirstMonth() {
    const firstMonthDays = monthsWrapperRef.current
      ?.querySelectorAll(MONTH_SELECTOR)?.[0]
      ?.querySelectorAll(VALID_DAY_SELECTOR);
    const value = firstMonthDays?.[firstMonthDays.length - 1]?.getAttribute(VALUE_ATTR);
    if (value) updateFocused(value);
  }

  function updateFocusedToIndex(index: number) {
    const days = getValidDays(monthsWrapperRef);
    const value = days[index]?.getAttribute(VALUE_ATTR);
    if (value) updateFocused(value);
  }

  function focusSameDayInNextMonth() {
    const currenFocusedMonth = getFocusedMonth(monthsWrapperRef);
    const nextMonth = currenFocusedMonth?.nextElementSibling;

    // if next month is not in view, we should re-render date picker and update month(s)
    if (!nextMonth) {
      if (moveFocusBehavior !== "change") return;
      store.setState("month", state.current.month + monthCount, { change: "cmd-next", forward: true });
      return;
    }

    const index = new Date(state.current.focused).getDate() - 1;
    const nextMonthDays = nextMonth.querySelectorAll(VALID_DAY_SELECTOR);
    let newFocusedEl = nextMonthDays[index] || null;
    // should test edge cases with min/max dates
    for (let i = 1; !newFocusedEl; i++) {
      newFocusedEl = nextMonthDays[index - i];
      if (i > 27) break;
    }

    if (!newFocusedEl) {
      schedule(3, focusLast);
      return;
    }

    updateFocused(newFocusedEl.getAttribute(VALUE_ATTR));
  }

  function focusSameDayInPrevMonth() {
    const currenFocusedMonth = getFocusedMonth(monthsWrapperRef);
    const prevMonth = currenFocusedMonth?.previousElementSibling;

    // if prev month is not in view, we should re-render date picker and update month(s)
    if (!prevMonth) {
      if (moveFocusBehavior !== "change") return;
      store.setState("month", state.current.month - monthCount, { change: "cmd-prev", forward: false });
      return;
    }

    const focusedDate = new Date(state.current.focused).getDate();
    const prevMonthDays = prevMonth.querySelectorAll(VALID_DAY_SELECTOR);

    let newFocusedEl: Element | null;
    // should test edge cases with min/max dates
    for (let i = 1; !newFocusedEl; i++) {
      newFocusedEl = prevMonthDays[focusedDate - i];
      if (i > 27) break;
    }

    if (!newFocusedEl) {
      schedule(3, focusFirst);
      return;
    }

    updateFocused(newFocusedEl.getAttribute(VALUE_ATTR));
  }

  function focusSameDayInPrevWeek() {
    const index = getCurrentIndex(monthsWrapperRef, state.current.focused);
    const newValue = getValidDays(monthsWrapperRef)[index - 7]?.getAttribute(VALUE_ATTR);

    if (!newValue) {
      if (moveFocusBehavior !== "change") return;
      store.setState("month", state.current.month - monthCount, { change: -7, forward: false });
      return;
    }
    updateFocused(newValue);
  }

  function focusSameDayInNextWeek() {
    const index = getCurrentIndex(monthsWrapperRef, state.current.focused);
    const newValue = getValidDays(monthsWrapperRef)[index + 7]?.getAttribute(VALUE_ATTR);
    if (!newValue) {
      if (moveFocusBehavior !== "change") return;
      store.setState("month", state.current.month + monthCount, { change: 7, forward: true });
      return;
    }
    updateFocused(newValue);
  }

  function focusPrev() {
    const index = getCurrentIndex(monthsWrapperRef, state.current.focused);
    const newValue = getValidDays(monthsWrapperRef)[index - 1]?.getAttribute(VALUE_ATTR);
    if (!newValue) {
      if (moveFocusBehavior === "none") return;
      else if (moveFocusBehavior === "loop") {
        focusLast();
      } else {
        store.setState("month", state.current.month - monthCount, { change: -1, forward: false });
      }
      return;
    }
    updateFocused(newValue);
  }

  function focusNext() {
    const index = getCurrentIndex(monthsWrapperRef, state.current.focused);
    const newValue = getValidDays(monthsWrapperRef)[index + 1]?.getAttribute(VALUE_ATTR);
    if (!newValue) {
      if (moveFocusBehavior === "none") return;
      else if (moveFocusBehavior === "loop") {
        focusFirst();
      } else {
        store.setState("month", state.current.month + monthCount, { change: 1, forward: true });
      }
      return;
    }
    updateFocused(newValue);
  }
});

DatePicker.displayName = "DatePicker";

/* -------------------------------------------------------------------------------------------------
 * MonthsWrapper
 * -----------------------------------------------------------------------------------------------*/

const MonthsWrapper = React.forwardRef<HTMLDivElement, DivProps>((props, forwardedRef) => {
  const context = useDatePickerContext();
  const m = useDatePicker((state) => state.month);
  const y = useDatePicker((state) => state.year);

  return (
    <div ref={mergeRefs([context.monthsWrapperRef, forwardedRef])} date-picker-months-wrapper="" {...props}>
      {Array.from({ length: context.monthCount }).map((_, i) => {
        const { month, year } = createMonthProps(m, y, i);
        return <Month key={i} month={month} year={year} lastInView={i === context.monthCount - 1} />;
      })}
    </div>
  );
});
MonthsWrapper.displayName = "MonthsWrapper";

/* -------------------------------------------------------------------------------------------------
 * Month
 * -----------------------------------------------------------------------------------------------*/

type MonthProps = {
  month: number;
  year: number;
  lastInView?: boolean;
};

const Month = React.forwardRef<HTMLDivElement, MonthProps>((props, forwardedRef) => {
  const { month, year, lastInView, ...etc } = props;

  const id = React.useId();
  const ref = React.useRef<HTMLDivElement | null>(null);

  const { startOfWeek, minDate, maxDate, weekdays, headingFormat, fixedWeeks, lastMonthControl } =
    useDatePickerContext();

  const days = React.useMemo(() => generateDays(month, year, startOfWeek, fixedWeeks), [month, year]);

  return (
    <div id={id} date-picker-month="" ref={mergeRefs([ref, forwardedRef])} {...etc}>
      {(headingFormat || lastMonthControl) && (
        <div date-picker-heading="">
          {headingFormat && <span date-picker-date-heading="">{formatMonthYear(month, year, headingFormat)}</span>}

          {lastInView && lastMonthControl && (
            <div date-picker-control-buttons="">
              <PrevMonthTrigger>{"<"}</PrevMonthTrigger>
              <NextMonthTrigger>{">"}</NextMonthTrigger>
            </div>
          )}
        </div>
      )}

      {weekdays && <WeekdaysHeading short={weekdays === "short"} />}
      <div date-picker-month-days="" role="presentation">
        {days.map((day, idx) => {
          const { value, disabled } = createDayProps(year, month, day, idx, minDate, maxDate);
          return (
            <Day value={value} disabled={disabled} key={idx}>
              {day}
            </Day>
          );
        })}
      </div>
    </div>
  );
});

Month.displayName = "Month";

/* ------------------------------------------------------------------------------------------------
 * Day
 * -----------------------------------------------------------------------------------------------*/

type DayProps = Children &
  Omit<DivProps, "disabled" | "onSelect" | "value"> & {
    disabled?: boolean;
    onSelect?: () => void;
    value?: string; // date string value
  };

const Day = React.forwardRef<HTMLDivElement, DayProps>((props, forwardedRef) => {
  const { children, disabled, value: _, onSelect: __, ...etc } = props;
  const id = React.useId();
  const ref = React.useRef<HTMLDivElement | null>(null);

  const value = useValue(ref, [props.value, props.children]);
  const { mode, onSelectedChange } = useDatePickerContext();
  const store = useStore();
  const focused = useDatePicker((state) => state.focused && state.focused === value.current && !props.disabled);
  const isCurrentDate = React.useMemo(() => props.value === toDateString(new Date()), [props.value]);

  const isWeekend = React.useMemo(() => {
    const date = new Date(props.value);
    return date.getDay() === 0 || date.getDay() === 6;
  }, [props.value]);

  const isSelected = useDatePicker((state) => {
    if (props.disabled || state.selected.size < 1) return;
    if (mode === "single") {
      return value.current === state.selected.keys().next().value;
    }

    if (mode === "range") {
      if (state.selected.size === 1) {
        return state.selected.has(value.current);
      }

      if (state.selected.size === 2) {
        const datesArr = Array.from(state.selected.entries());
        const startDate = datesArr[0][1];
        const endDate = datesArr[1][1];
        const startDateString = datesArr[0][0];
        const endDateString = datesArr[1][0];

        if (value.current === startDateString || value.current === endDateString) {
          return true;
        }

        return (
          startDate.getTime() <= new Date(value.current).getTime() &&
          endDate.getTime() >= new Date(value.current).getTime()
        );
      }
    }
    if (mode === "multiple") {
      return state.selected.has(value.current);
    }
  });

  const inRange = useDatePicker((state) => {
    if (mode !== "range" || props.disabled) return;
    const selectedArr = Array.from(state.selected.values());
    const [start, end] = selectedArr;
    if (!start && !end) return;

    const focusedDate = new Date(state.focused);
    const currentDate = new Date(value.current);

    if (state.selected.size === 1) {
      if (state.focused === toDateString(start)) return;
      if (state.focused && state.focused === value.current) return true;
      if (focusedDate.getTime() < start.getTime()) {
        return focusedDate.getTime() <= currentDate.getTime() && start.getTime() >= currentDate.getTime();
      }

      if (focusedDate.getTime() > start.getTime()) {
        return focusedDate.getTime() >= currentDate.getTime() && start.getTime() <= currentDate.getTime();
      }
    }
  });

  function focus() {
    store.setState("focused", value.current);
  }

  function onSelect() {
    onSelectedChange(new Date(value.current));
    focus();
  }

  React.useEffect(() => {
    const element = ref.current;
    if (!element || disabled) return;
    element.addEventListener(SELECT_EVENT, onSelect);
    return () => element.removeEventListener(SELECT_EVENT, onSelect);
  }, [ref, disabled, onSelect]);

  return (
    <div
      ref={mergeRefs([ref, forwardedRef])}
      date-picker-day=""
      id={id}
      aria-disabled={Boolean(disabled)}
      data-disabled={Boolean(disabled)}
      data-focused={Boolean(focused)}
      //
      data-today={Boolean(isCurrentDate)}
      data-selected={Boolean(isSelected)}
      data-range={Boolean(inRange)}
      data-weekend={Boolean(isWeekend)}
      //
      onPointerMove={disabled ? undefined : focus}
      onClick={disabled ? undefined : composeEventHandlers(props.onClick, onSelect)}
      {...etc}
    >
      {children}
    </div>
  );
});

Day.displayName = "Day";

/* -------------------------------------------------------------------------------------------------
 * Button navigation
 * -----------------------------------------------------------------------------------------------*/

type TriggerElement = React.ElementRef<"button">;
type ButtonProps = React.ComponentPropsWithRef<"button">;
interface MonthChangeTriggerProps extends ButtonProps {}

const NextMonthTrigger = React.forwardRef<TriggerElement, MonthChangeTriggerProps>((props, forwardedRef) => {
  const { maxDate, monthCount, monthsWrapperRef } = useDatePickerContext();
  const { month, year } = useDatePicker((state) => state);
  const store = useStore();

  const ref = React.useRef<HTMLButtonElement | null>(null);
  const monthsInView = Array.from({ length: monthCount }).map((_, i) => {
    return month + i + 1 > 11 ? `${(month + i + 1) % 12}/${year + 1}` : `${month + i + 1}/${year}`;
  });

  const disabled = React.useMemo(
    () =>
      maxDate ? monthsInView.some((month) => month === `${maxDate.getMonth() + 1}/${maxDate.getFullYear()}`) : false,
    [maxDate, month, year],
  );

  const { ...etc } = props;

  return (
    <button
      date-picker-next-month-control=""
      aria-disabled={Boolean(disabled)}
      data-disabled={Boolean(disabled)}
      tabIndex={-1}
      ref={mergeRefs([ref, forwardedRef])}
      {...etc}
      onPointerDown={(event) => {
        event.preventDefault();
        if (!disabled && event.button === 0 && event.ctrlKey === false) {
          store.setState("month", month + 1, { forward: true });
        }
      }}
    />
  );
});

NextMonthTrigger.displayName = "NextMonthTrigger";

const PrevMonthTrigger = React.forwardRef<TriggerElement, MonthChangeTriggerProps>((props, forwardedRef) => {
  const { minDate, monthCount } = useDatePickerContext();
  const { month, year } = useDatePicker((state) => state);
  const store = useStore();
  const ref = React.useRef<HTMLButtonElement | null>(null);

  const monthsInView = Array.from({ length: monthCount }).map((_, i) => {
    return month + i + 1 > 11 ? `${(month + i + 1) % 12}/${year + 1}` : `${month + i + 1}/${year}`;
  });

  const disabled = React.useMemo(
    () =>
      minDate ? monthsInView.some((month) => month === `${minDate.getMonth() + 1}/${minDate.getFullYear()}`) : false,
    [minDate, month, year],
  );
  const { ...etc } = props;

  return (
    <button
      date-picker-prev-month-control=""
      aria-disabled={Boolean(disabled)}
      data-disabled={Boolean(disabled)}
      ref={mergeRefs([ref, forwardedRef])}
      tabIndex={-1}
      {...etc}
      onPointerDown={(event) => {
        event.preventDefault();
        if (!disabled && event.button === 0 && event.ctrlKey === false) {
          store.setState("month", month - 1, { forward: false });
        }
      }}
    />
  );
});

PrevMonthTrigger.displayName = "PrevMonthTrigger";

/* -------------------------------------------------------------------------------------------------
 * Weekdays heading
 * -----------------------------------------------------------------------------------------------*/
type WeekdaysHeadingProps = { short?: boolean };

const WeekdaysHeading = React.forwardRef<HTMLDivElement, WeekdaysHeadingProps>((props, forwardedRef) => {
  const startOfWeek = useDatePickerContext().startOfWeek;
  const { short } = props;

  const weekdays = React.useMemo(() => generateWeekdays(startOfWeek, short), [startOfWeek, short]);
  return (
    <div date-picker-weekdays="">
      {weekdays.map((day, idx) => (
        <div key={idx} date-picker-weekday="">
          {day}
        </div>
      ))}
    </div>
  );
});

function useAsRef<T>(data: T) {
  const ref = React.useRef<T>(data);

  useLayoutEffect(() => {
    ref.current = data;
  });

  return ref;
}
/* ---------------------------------------------------------------------------------------------- */

const VALUE_ATTR = `data-value`;
const MONTH_SELECTOR = `[date-picker-month=""]`;
const DAY_SELECTOR = `[date-picker-day=""]`;
const VALID_DAY_SELECTOR = `${DAY_SELECTOR}:not([aria-disabled="true"])`;
const SELECT_EVENT = `day-select`;

type FocusIntent = "prev" | "next" | "prev-week" | "next-week" | "submit";

// prettier-ignore
const MAP_KEY_TO_FOCUS_INTENT: Record<string, FocusIntent> = {
    ArrowLeft: "prev", ArrowUp: "prev-week",
    ArrowRight: "next", ArrowDown: "next-week",
    Enter: "submit", " ": "submit" // <- Space
}

function getfocused(containerRef: React.MutableRefObject<HTMLDivElement | null>) {
  if (!containerRef) return;
  return containerRef.current.querySelector(`${DAY_SELECTOR}[data-focused="true"]`);
}

function getFirst(containerRef: React.MutableRefObject<HTMLDivElement | null>) {
  if (!containerRef.current) return;
  const focusableDays = getValidDays(containerRef);
  return focusableDays[0];
}

function getFocusedMonth(containerRef: React.MutableRefObject<HTMLDivElement | null>) {
  const day = getfocused(containerRef);
  return day?.closest(MONTH_SELECTOR);
}

function getCurrentIndex(containerRef: React.MutableRefObject<HTMLDivElement | null>, value: string) {
  if (!containerRef.current) return;
  const days = getValidDays(containerRef);
  return days.findIndex((day) => day.getAttribute(VALUE_ATTR) === value);
}

function getValidDays(containerRef: React.MutableRefObject<HTMLDivElement | null>) {
  if (!containerRef.current) return [];
  return Array.from(containerRef.current.querySelectorAll(VALID_DAY_SELECTOR));
}

function isDateInCurrentView(containerRef: React.MutableRefObject<HTMLDivElement | null>, date: Date) {
  const value = toDateString(date);
  const allDays = containerRef.current?.querySelectorAll(DAY_SELECTOR);
  return Array.from(allDays || []).some((day) => day?.getAttribute(VALUE_ATTR) === value);
}

function shouldPreventViewUpdate(
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  forward: boolean,
  minDate?: Date,
  maxDate?: Date,
) {
  if (!minDate && !maxDate) return false;
  if (forward && !maxDate) return false;
  if (!forward && !minDate) return false;

  if (!forward && isDateInCurrentView(containerRef, minDate)) return true;
  if (forward && isDateInCurrentView(containerRef, maxDate)) return true;

  return false;
}

function toDateString(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/* ---------------------------------------------------------------------------------------------- */

function createInitialState(selected?: Date | Date[], initialFocus?: Date) {
  return {
    selected: Array.isArray(selected)
      ? new Map(selected?.map((date) => [toDateString(date), date]))
      : selected
        ? new Map([[toDateString(selected), selected]])
        : new Map(),
    focused: toDateString(initialFocus || new Date()),
    month: initialFocus?.getMonth() || new Date().getMonth(),
    year: initialFocus?.getFullYear() || new Date().getFullYear(),
  };
}

/* ---------------------------------------------------------------------------------------------- */

type MonthFormat = "M" | "MM" | "MMM" | "MMMM";
type YearFormat = "YY" | "YYYY";
type Separator = "-" | "/" | " | " | " ";

type MonthYearFormat = `${MonthFormat}${Separator}${YearFormat}`;

/* ---------------------------------------------------------------------------------------------- */

function useDatePicker<T = any>(selector: (state: State) => T) {
  const store = useStore();
  const cb = () => selector(store.snapshot());
  return React.useSyncExternalStore(store.subscibe, cb, cb);
}

function formatMonthYear(month: number, year: number, format: MonthYearFormat) {
  const parts = format.split(/(-|\/|\ \| | )/);
  const monthFormat = parts[0] as MonthFormat;
  const separator = parts[1] as Separator;
  const yearFormat = parts[2] as YearFormat;

  let finalMonth: string, finalYear: string;

  switch (monthFormat) {
    case "M":
      finalMonth = String(month + 1);
      break;
    case "MM":
      finalMonth = String(month + 1).padStart(2, "0");
      break;
    case "MMM":
      finalMonth = getMonthName(month, true);
      break;
    case "MMMM":
      finalMonth = getMonthName(month);
      break;
  }

  switch (yearFormat) {
    case "YY":
      finalYear = String(year).slice(2);
      break;
    case "YYYY":
      finalYear = String(year);
      break;
  }

  return `${finalMonth}${separator}${finalYear}`;
}

function useValue(
  ref: React.RefObject<HTMLElement>,
  deps: (string | React.ReactNode | React.RefObject<HTMLElement>)[],
) {
  const valueRef = React.useRef<string>();

  useLayoutEffect(() => {
    const value = (() => {
      for (const part of deps) {
        if (typeof part === "string") {
          return part.trim().toLowerCase();
        }

        if (typeof part === "object" && "current" in part) {
          if (part.current) {
            return part.current.textContent.trim().toLowerCase();
          }

          return valueRef.current;
        }
      }
    })();

    ref.current?.setAttribute(VALUE_ATTR, value || "");
    valueRef.current = value;
  });

  return valueRef;
}

function createDayProps(year: number, month: number, day: number, index: number, minDate?: Date, maxDate?: Date) {
  // Day is disabled if differcene bettwen value and index is greater then 7, this will mark days from prev and next month (wrapped days)
  const wrapped = Boolean(Math.abs(index - day) > 7);
  const _month = wrapped ? (day > 15 ? month - 1 : month + 1) : month;
  const value = toDateString(new Date(year, _month, day));
  // when day is `wrapped` always return true, otherwise check if date is out of min/max range
  return {
    value,
    disabled: wrapped ? true : isRangeDisable(value, minDate, maxDate),
  };
}

function isRangeDisable(value: string, minDate?: Date, maxDate?: Date) {
  if (!minDate && !maxDate) return false;
  const date = new Date(value);

  const minDateString = toDateString(minDate);
  const maxDateString = toDateString(maxDate);

  if (minDate && date.getTime() < minDate.getTime() && minDateString !== value) return true;
  if (maxDate && date.getTime() > maxDate.getTime() && maxDateString !== value) return true;

  return false;
}

function createMonthProps(month: number, year: number, index: number) {
  return month + index > 11
    ? { year: year + Math.floor((month + index) / 12), month: (month + index) % 12 }
    : { year, month: month + index };
}

type MonthDayMap = Record<number, (year?: number) => number[]>;

const MONTH_DAY_MAP: MonthDayMap = {
  0: () => Array.from({ length: 31 }).map((_, i) => i + 1),
  1: (year?: number) => Array.from({ length: isLeapYear(year) ? 29 : 28 }).map((_, i) => i + 1),
  2: () => Array.from({ length: 31 }).map((_, i) => i + 1),
  3: () => Array.from({ length: 30 }).map((_, i) => i + 1),
  4: () => Array.from({ length: 31 }).map((_, i) => i + 1),
  5: () => Array.from({ length: 30 }).map((_, i) => i + 1),
  6: () => Array.from({ length: 31 }).map((_, i) => i + 1),
  7: () => Array.from({ length: 31 }).map((_, i) => i + 1),
  8: () => Array.from({ length: 30 }).map((_, i) => i + 1),
  9: () => Array.from({ length: 31 }).map((_, i) => i + 1),
  10: () => Array.from({ length: 30 }).map((_, i) => i + 1),
  11: () => Array.from({ length: 31 }).map((_, i) => i + 1),
};

function isLeapYear(year?: number) {
  if (!year) return;
  return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
}

const weekdays = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_");
const months = "January_February_March_April_May_June_July_August_September_October_November_December".split("_");

const getMonthName = (month: number, short?: boolean) => {
  return short ? months[month].slice(0, 3) : months[month];
};

function generateWeekdays(startOfWeek: number, short?: boolean) {
  const days = [...weekdays.slice(startOfWeek), ...weekdays.slice(0, startOfWeek)];
  return days.map((day) => (short ? day.slice(0, 2) : day));
}

function generateDays(month: number, year: number, startOfWeek: number = 1, fixedWeeks?: boolean) {
  const days = MONTH_DAY_MAP[month](year);

  const prevMonthLastDayy = new Date(year, month, 0).getDate();
  const firstWeekdayOfCurrentMonth = new Date(year, month, 1).getDay() || 7;

  const diff = firstWeekdayOfCurrentMonth - startOfWeek;

  // unshift previous month days
  for (let i = 0; i < (diff < 0 ? diff + 7 : diff); i++) {
    days.unshift(prevMonthLastDayy - i);
  }
  // apply rest from next month
  const restCount = fixedWeeks ? 42 - days.length : 7 - (days.length % 7 || 7);
  return [...days, ...Array.from({ length: restCount }).map((_, i) => i + 1)];
}

const useLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T>();

  if (ref.current === undefined) {
    ref.current = fn();
  }

  return ref as React.MutableRefObject<T>;
}

// https://github.com/pacocoursey/cmdk/blob/main/cmdk/src/index.tsx#L1055
// Copyright (c) 2022 Paco Coursey
const useScheduleLayoutEffect = () => {
  const [s, ss] = React.useState<object>();
  const fns = useLazyRef(() => new Map<string | number, () => void>());

  useLayoutEffect(() => {
    fns.current.forEach((f) => f());
    fns.current = new Map();
  }, [s]);

  return (id: string | number, cb: () => void) => {
    fns.current.set(id, cb);
    ss({});
  };
};

// https://github.com/gregberge/react-merge-refs
// Copyright (c) 2020 Greg Bergé
function mergeRefs<T = any>(refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}

// https://github.com/radix-ui/primitives/blob/main/packages/core/primitive/src/primitive.tsx
// Copyright (c) 2022 WorkOS
function composeEventHandlers<E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {},
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event);

    if (checkForDefaultPrevented === false || !(event as unknown as Event).defaultPrevented) {
      return ourEventHandler?.(event);
    }
  };
}

const pkg = Object.assign(DatePicker, {
  Day,
  NextMonthTrigger,
  PrevMonthTrigger,
  MonthsWrapper,
  Month,
  WeekdaysHeading,
});

export type { MonthProps };

export {
  createMonthProps,
  createDayProps,
  generateWeekdays,
  generateDays,
  pkg as DatePicker,
  useStore,
  useDatePicker,
  useDatePickerContext,
};

import styles from "./codeblock.module.scss";
import Code from "../code";

function Codeblock() {
  const code = `
 <DatePicker ref={ref} weekdays weekdaysShort fixedWeeks mode="single" headingFormat="MMMM YYYY" monthCount={2}
      wrapMonths
      moveFocusBehavior="change"
      startOfWeek={1}
    >
      <DatePicker.MonthsWrapper />
    </DatePicker>`;

  return (
    <div className={styles.codeBlock}>
      <Code>{code}</Code>
    </div>
  );
}

export default Codeblock;

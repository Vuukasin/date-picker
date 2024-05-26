import Heading from "@/components/heading";
import styles from "../styles/index.module.scss";
import Separator from "@/components/separator";
import Code from "@/components/code";
import Link from "next/link";

const weekdaysCssExample = `
[date-picker-month-days] {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}
`;

const Styling = () => {
  return (
    <section className="w-full flex flex-col gap-3 max-w-[640px] relative h-fit">
      <Heading type="subheading">Styling</Heading>

      <div className="h-6"></div>

      <p className={styles.text}>
        When creating custom components for your date picker, such as this{" "}
        <Link href="/examples?i=2" className="text-white underline underline-offset-2">
          example
        </Link>
        , you can apply styles using classNames. Alternativly, styles can be applied by targeting the data attributes.
      </p>

      <Separator />

      <div className="flex flex-col gap-6">
        <p className={styles.text}>
          <span className={styles.propertie}>[date-picker-root]</span> - The root element of the date picker.
        </p>

        <p className={styles.text}>
          <span className={styles.propertie}>[date-picker-months-wrapper]</span>- Used to style the months wrapper, and
          customize the layout of the months.
        </p>

        <p className={styles.text}>
          <span className={styles.propertie}>[date-picker-month-days]</span>- Used to create a custom layout for the
          days of the month. Most of the time, you will use the grid layout to create a week view.
        </p>

        <div className="h-4" />

        <div className="relative">
          <div className="code-light" />
          <Code>{weekdaysCssExample}</Code>
        </div>

        <div className="h-4" />

        <p className={styles.text}>
          <span className={styles.propertie}>[date-picker-day]</span>- Used to style the day element. You can use this
          in combination with the data-attributes like <span className={styles.propertie}>[data-focused="true"]</span>
          {", "}
          <span className={styles.propertie}>[data-selected="true"]</span>
          {", "}
          <span className={styles.propertie}>[data-range="true"]</span>
          {", "}
          <span className={styles.propertie}>[data-weekend="true"]</span>
          {" and "}
          <span className={styles.propertie}>[data-disabled="true"]</span>{" "}
        </p>

        <p className={styles.text}>
          <span className={styles.propertie}>[date-picker-control-buttons]</span>- Use to style the control buttons of
          the date picker, when control buttons are added via property{" "}
          <span className="text-white">lastMonthControl</span>.
        </p>

        <p className={styles.text}>
          <span className={styles.propertie}>[date-picker-prev-month-control]</span>
          {" and "} <span className={styles.propertie}>[date-picker-next-month-control]</span> are used to style the
          prev/next month triggers, <span className={styles.propertie}>[data-disabled="true"]</span> is also available.
        </p>
      </div>
    </section>
  );
};

export default Styling;

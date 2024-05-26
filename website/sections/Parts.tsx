import Heading from "@/components/heading";
import styles from "../styles/index.module.scss";
import Separator from "@/components/separator";
import { cn } from "@/utils/cn";

const Parts = () => {
  return (
    <section className={cn("gap-3", styles.introduction)}>
      <Heading type="subheading">Parts</Heading>

      <div className="h-6"></div>

      <p className={styles.text}>
        All parts forward props, including <span>ref</span>, to an appropriate element. Each part has a specific
        data-attribute (starting with date-picker) that can be used for styling.
      </p>

      <div className="h-6"></div>

      <p className={styles.text}>
        <span className="text-white">DatePicker.Root</span>{" "}
        <span className={styles.dateAttribute}>[date-picker-root]</span>
      </p>
      <Separator />

      <p className={styles.text}>
        DatePicker.Root provides a context wrapper for the date picker. Root accepts all the mentioned properties from
        API references and forwards them to the appropriate elements.
      </p>

      <div className="h-6"></div>

      <p className={styles.text}>
        <span className="text-white">DatePicker.MonthsWrapper</span>{" "}
        <span className={styles.dateAttribute}>[date-picker-months-wrapper]</span>
      </p>
      <Separator />

      <p className={styles.text}>
        The DatePicker.MonthsWrapper component is specifically designed for displaying months within the user interface.
        It is distinctively separated as an individual component to enhance compatibility and ease of layout
        arrangements with built-in components or additional custom components.
      </p>

      <div className="h-6"></div>

      <p className={styles.text}>
        <span className="text-white">DatePicker.PrevMonthTrigger</span>{" "}
        <span className={styles.dateAttribute}>[date-picker-prev-month-control]</span>
      </p>
      <Separator />

      <p className={styles.text}>
        PrevMonthTrigger is a control component that modifies the displayed month(s) by shifting it back by one month.
      </p>

      <div className="h-6"></div>

      <p className={styles.text}>
        <span className="text-white">DatePicker.NextMonthTrigger</span>{" "}
        <span className={styles.dateAttribute}>[date-picker-next-month-control]</span>
      </p>
      <Separator />

      <p className={styles.text}>
        NextMonthTrigger is a control component that modifies the displayed month(s), moving it foward by one month.
        Buttons will be disabled in case the rendered month(s) have reached min/max date. If you want to allow changing
        the month(s) beyond the min/max date, you should create your own control buttons with{" "}
        <span className="text-white">useStore</span> hook.
      </p>

      <div className="h-6"></div>
    </section>
  );
};

export default Parts;

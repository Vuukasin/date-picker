import Heading from "@/components/heading";
import styles from "../styles/index.module.scss";
import Separator from "@/components/separator";
import PopoverInfo from "@/components/popover";

const APIReference = () => {
  return (
    <section className="w-full flex flex-col gap-3 max-w-[640px] relative h-fit">
      <Heading type="subheading">API Reference</Heading>

      <div className="h-6"></div>

      <div className={styles.row}>
        <div className={styles.cellName}>
          <span className={styles.propertie}>mode</span>
        </div>
        <div className={styles.cellValue}>
          <span className={styles.text}>single | range | multiple</span>
        </div>
        <div className={styles.cellDefault}>
          <span className={styles.text}>single</span>
        </div>
      </div>

      <Separator />

      <div className={styles.row}>
        <div className={styles.cellName}>
          <span className={styles.propertie}>moveFocusBehavior</span>
        </div>
        <div className={styles.cellValue}>
          <span className={styles.text}>change | loop | none</span>
          <PopoverInfo>
            <div className="flex flex-col gap-2">
              <p>This property dictates how the focus behaves when a user is navigating using the keyboard.</p>
              <p>
                <span className="text-white">change</span> transitions the focus to the subsequent month.
              </p>
              <p>
                <span className="text-white">loop</span> cycles the focus back to the first or last visible day of the
                date picker when the boundary is reached.
              </p>
              <p>
                <span className="text-white">none</span> does not alter the focus upon reaching the boundary.
              </p>
            </div>
          </PopoverInfo>
        </div>
        <div className={styles.cellDefault}>
          <span className={styles.text}>change</span>
        </div>
      </div>

      <Separator />

      <div className={styles.row}>
        <div className={styles.cellName}>
          <span className={styles.propertie}>startOfWeek</span>
        </div>
        <div className={styles.cellValue}>
          <span className={styles.text}>number</span>
          <PopoverInfo>
            <p>Represents the starting day of the week and can be number from 0 to 6, where 1 represents Monday.</p>
          </PopoverInfo>
        </div>
        <div className={styles.cellDefault}>
          <span className={styles.text}>1</span>
        </div>
      </div>

      <Separator />

      <div className={styles.row}>
        <div className={styles.cellName}>
          <span className={styles.propertie}>fixedWeeks</span>
        </div>
        <div className={styles.cellValue}>
          <span className={styles.text}>boolean</span>
          <PopoverInfo>
            <p>
              When set to <span className="text-[rgba(227,228,230)]">true</span>, the date picker will render 6 weeks
              consistently
            </p>
          </PopoverInfo>
        </div>
        <div className={styles.cellDefault}>
          <span className={styles.text}>false</span>
        </div>
      </div>

      <Separator />

      <div className={styles.row}>
        <div className={styles.cellName}>
          <span className={styles.propertie}>monthCount</span>
        </div>
        <div className={styles.cellValue}>
          <span className={styles.text}>number</span>
          <PopoverInfo>
            <p>
              Represents the total number of months that will be displayed in the Date Picker. It's advised to keep
              within a range of 1 to 12 months for optimal functionality.
            </p>
          </PopoverInfo>
        </div>
        <div className={styles.cellDefault}>
          <span className={styles.text}>1</span>
        </div>
      </div>

      <Separator />

      <div className={styles.row}>
        <div className={styles.cellName}>
          <span className={styles.propertie}>minDate</span>
        </div>
        <div className={styles.cellValue}>
          <span className={styles.text}>Date</span>
        </div>
        <div className={styles.cellDefault}>
          <span className={styles.text}>--</span>
        </div>
      </div>

      <Separator />

      <div className={styles.row}>
        <div className={styles.cellName}>
          <span className={styles.propertie}>maxDate</span>
        </div>
        <div className={styles.cellValue}>
          <span className={styles.text}>Date</span>
        </div>
        <div className={styles.cellDefault}>
          <span className={styles.text}>--</span>
        </div>
      </div>

      <Separator />

      <div className={styles.row}>
        <div className={styles.cellName}>
          <span className={styles.propertie}>weekdays</span>
        </div>
        <div className={styles.cellValue}>
          <span className={styles.text}>short | long</span>
          <PopoverInfo>
            <p>
              Property dictates the display style of the weekdays row in the date picker. If property is not provided,
              the weekdays row will not be rendered in the date picker.
            </p>
          </PopoverInfo>
        </div>
        <div className={styles.cellDefault}>
          <span className={styles.text}>--</span>
        </div>
      </div>

      <Separator />

      <div className={styles.row}>
        <div className={styles.cellName}>
          <span className={styles.propertie}>headingFormat</span>
        </div>
        <div className={styles.cellValue}>
          <span className={styles.text}>string</span>
        </div>
        <div className={styles.cellDefault}>
          <span className={styles.text}>MMMM YYYY</span>
        </div>
      </div>

      <Separator />

      <div className={styles.row}>
        <div className={styles.cellName}>
          <span className={styles.propertie}>lastMonthControl</span>
        </div>
        <div className={styles.cellValue}>
          <span className={styles.text}>boolean</span>
          <PopoverInfo>
            <p>
              Specifies whether the previous/next month buttons should be displayed on the last visible month of the
              date picker.
            </p>
          </PopoverInfo>
        </div>
        <div className={styles.cellDefault}>
          <span className={styles.text}>false</span>
        </div>
      </div>
      <Separator />

      <div className={styles.row}>
        <div className={styles.cellName}>
          <span className={styles.propertie}>selected</span>
        </div>
        <div className={styles.cellValue}>
          <span className={styles.text}>Date | Date[]</span>
        </div>
        <div className={styles.cellDefault}>
          <span className={styles.text}>--</span>
        </div>
      </div>

      <Separator />

      <div className={styles.row}>
        <div className={styles.cellName}>
          <span className={styles.propertie}>onSelectedChange</span>
        </div>
        <div className={styles.cellValue}>
          <span className={styles.text}>function</span>
          <PopoverInfo>
            <p>{"(date: Date) => void"}</p>
          </PopoverInfo>
        </div>
        <div className={styles.cellDefault}>
          <span className={styles.text}>--</span>
        </div>
      </div>

      <Separator />

      <div className={styles.row}>
        <div className={styles.cellName}>
          <span className={styles.propertie}>initialFocus</span>
        </div>
        <div className={styles.cellValue}>
          <span className={styles.text}>Date</span>
          <PopoverInfo>
            <p>
              The date picker focuses on the current date by default. By specifying{" "}
              <span className="text-white">initialFocus</span>, this property not only sets the focus but also
              determines which month(s) should initially be rendered.
            </p>
          </PopoverInfo>
        </div>
        <div className={styles.cellDefault}>
          <span className={styles.text}>--</span>
        </div>
      </div>
    </section>
  );
};

export default APIReference;

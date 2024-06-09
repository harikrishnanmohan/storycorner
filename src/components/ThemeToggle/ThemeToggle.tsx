import "./ThemeToggle.scss";

const ThemeToggle = ({ toggleFun }: { toggleFun: () => void }) => {
  return (
    <div className="themeToggle">
      <input
        type="checkbox"
        className="themeToggle_input"
        id="switchInput"
        onChange={toggleFun}
      />
      <label htmlFor="switchInput" className="themeToggle_label"></label>
    </div>
  );
};

export default ThemeToggle;

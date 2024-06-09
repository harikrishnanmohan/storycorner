import { ReactNode } from "react";
import "./Button.scss";

const Button = ({
  children,
  addClass = "",
  type,
  handleFunction,
}: {
  children: ReactNode;
  addClass?: string;
  type: "button" | "submit" | "reset" | undefined;
  handleFunction?: () => void;
}) => {
  return (
    <button
      className={`button ${addClass}`}
      type={type ? type : "button"}
      onClick={handleFunction}
    >
      {children}
    </button>
  );
};

export default Button;

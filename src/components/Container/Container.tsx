import { ReactNode } from "react";
import "./Container.scss";

const Container = ({
  children,
  addClass = "",
}: {
  children: ReactNode;
  addClass: string;
}) => {
  return <div className={`container ${addClass}`}>{children}</div>;
};

export default Container;

import { ReactNode, useContext, useEffect, useRef } from "react";
import "./Modal.scss";
import { createPortal } from "react-dom";
import { ThemeContext } from "../../context/theam-context";
import { FontContext } from "../../context/Font-context";

const Modal = ({
  children,
  open,
  addClass = "",
}: {
  children: ReactNode;
  open: boolean;
  addClass?: string;
}) => {
  const themeCtx = useContext(ThemeContext);
  const fontCtx = useContext(FontContext);

  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const modal = dialogRef.current;
    if (open) {
      modal?.showModal();
    }
    return () => modal?.close();
  }, [open]);
  return createPortal(
    <dialog
      className={`modal modal__${
        themeCtx?.theme === "dark" ? "dark" : "light"
      } app__${
        fontCtx?.font === "Kalam" ? "handWriting" : "typeWriting"
      } ${addClass}`}
      ref={dialogRef}
      onClick={() => console.log("clicked")}
    >
      {children}
    </dialog>,
    document.getElementById("modal") as HTMLElement
  );
};

export default Modal;

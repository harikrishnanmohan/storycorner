import { ChangeEvent, forwardRef } from "react";
import "./TextArea.scss";

interface TextAreaProps {
  placeholder?: string;
  handlerFunctionOnChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  addClass?: string;
  rows?: number;
  value?: string;
  required?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      placeholder,
      rows = 0,
      addClass,
      value,
      required,
      handlerFunctionOnChange,
    },
    ref
  ) => {
    return (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        placeholder={placeholder}
        rows={rows}
        className={`textarea ${addClass}`}
        value={value}
        required={required}
        onChange={handlerFunctionOnChange}
      />
    );
  }
);

export default TextArea;

import { ReactNode, ChangeEvent, forwardRef } from "react";
import "./Input.scss";

interface InputProps {
  placeholder?: string;
  handlerFunctionOnChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  handlerFunctionOnClick?: () => void;
  addClass?: string;
  title?: string;
  value?: string | string[];
  icon?: ReactNode;
  file?: boolean;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      placeholder,
      handlerFunctionOnChange,
      handlerFunctionOnClick,
      addClass,
      value,
      icon,
      file,
      required,
      title,
    },
    ref
  ) => {
    return (
      <>
        {file ? (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type="file"
            className={`input ${addClass}`}
            placeholder={placeholder}
            onClick={handlerFunctionOnClick}
            onChange={handlerFunctionOnChange}
            accept="image/png, image/jpeg"
            required={required}
            title={title}
          />
        ) : (
          <>
            {icon}
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              type="text"
              className={`input ${addClass}`}
              placeholder={placeholder}
              onClick={handlerFunctionOnClick}
              onChange={handlerFunctionOnChange}
              value={value}
              required={required}
              title={title}
            />
          </>
        )}
      </>
    );
  }
);

export default Input;

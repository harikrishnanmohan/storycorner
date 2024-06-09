import { ReactNode, createContext, useState } from "react";

interface FontContextType {
  font: string;
  toggleFont: () => void;
}

export const FontContext = createContext<FontContextType | undefined>(
  undefined
);

const FontContextProvider = ({ children }: { children: ReactNode }) => {
  const [font, setFont] = useState("Kalam");
  const toggleFont = () => {
    setFont((prevState) => (prevState === "Open Sans" ? "Kalam" : "Open Sans"));
  };

  return (
    <FontContext.Provider value={{ font, toggleFont }}>
      {children}
    </FontContext.Provider>
  );
};

export default FontContextProvider;

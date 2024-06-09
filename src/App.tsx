import Header from "./components/Header/Header";

import "./style/typography.scss";
import "./App.scss";

import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "./context/theam-context";
import { Outlet } from "react-router-dom";
import { FontContext } from "./context/Font-context";
import Footer from "./components/Footer/Footer";
import Button from "./atom/Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";

function App() {
  const themeCtx = useContext(ThemeContext);
  const fontCtx = useContext(FontContext);
  const [isGoTopVisible, setIsGoTopVisible] = useState<boolean>(false);

  const controlGoTopButton = () => {
    if (typeof window !== "undefined") {
      if (window.scrollY > 100) {
        setIsGoTopVisible(true);
      } else {
        setIsGoTopVisible(false);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlGoTopButton);

      return () => {
        window.removeEventListener("scroll", controlGoTopButton);
      };
    }
  }, []);

  return (
    <div
      className={`app app${
        themeCtx?.theme === "light" ? "__light" : "__dark"
      } app__${fontCtx?.font === "Kalam" ? "handWriting" : "typeWriting"}`}
    >
      <Header />
      <Outlet />
      <Button
        type="button"
        handleFunction={() => window.scroll(0, 0)}
        addClass={`app__top ${isGoTopVisible ? "visible" : ""}`}
      >
        <FontAwesomeIcon icon={faArrowUp} title="Go top" />
      </Button>
      <Footer />
    </div>
  );
}

export default App;

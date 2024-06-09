import { useContext, useEffect, useState } from "react";
import { faSignOut, faFont } from "@fortawesome/free-solid-svg-icons";

import "./Header.scss";

import { ThemeContext } from "../../context/theam-context";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { UserContext } from "../../context/User-context";
import { FontContext } from "../../context/Font-context";

const Header = () => {
  const themeCtx = useContext(ThemeContext);
  const fontCtx = useContext(FontContext);
  const userCtx = useContext(UserContext);
  const navigate = useNavigate();

  const [isVisible, setIsVisible] = useState(true);
  const [currentScrollY, setCurrentScrollY] = useState(0);

  const changeTheme = () => {
    themeCtx?.toggleTheme();
  };

  const onLogOut = () => {
    userCtx?.logout();
  };

  const onChangeFont = () => {
    fontCtx?.toggleFont();
  };

  useEffect(() => {
    const controllHeader = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > currentScrollY && currentScrollY > 200)
          setIsVisible(false);
        else setIsVisible(true);
        setCurrentScrollY(window.scrollY);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controllHeader);

      return () => window.removeEventListener("scroll", controllHeader);
    }
  }, [currentScrollY]);

  return (
    <div
      className={`header ${isVisible ? " header-visible" : "header-hidden"}`}
    >
      <h2 className="header__title" onClick={() => navigate("/storycorner")}>
        Story Corner
      </h2>
      <div className="header__action">
        <FontAwesomeIcon
          icon={faFont}
          onClick={onChangeFont}
          className="header__action_font"
          title="Change font"
        />
        <ThemeToggle toggleFun={changeTheme} />
        {userCtx?.user && (
          <FontAwesomeIcon
            icon={faSignOut}
            onClick={onLogOut}
            title="Log out"
          />
        )}
      </div>
    </div>
  );
};

export default Header;

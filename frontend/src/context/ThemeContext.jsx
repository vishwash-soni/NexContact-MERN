import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// Controls light/dark mode by toggling a "dark" class on <body>,
// which the CSS variables in index.css react to.
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const changeTheme = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

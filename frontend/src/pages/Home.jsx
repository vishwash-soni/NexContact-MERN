import { Link } from "react-router-dom";
import "../styles/Home.css";
import { useTheme } from "../context/ThemeContext";

// Public landing page.
function Home() {
  const { darkMode, changeTheme } = useTheme();

  return (
    <>
      <header>
        <nav>
          <img src="/logo.png" alt="NexContact logo" />

          <div className="nav-actions">
            <button className="theme-btn" onClick={changeTheme} title="Toggle theme">
              {darkMode ? "☀️" : "🌙"}
            </button>

            <Link to="/login">
              <button className="get-started">Get Started</button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <div className="background-circle circle-one"></div>
        <div className="background-circle circle-two"></div>

        <div className="leftside">
          <span className="badge">📇 Simple Contact Management</span>

          <h1>
            Your Contacts.
            <br />
            <span>In One Place.</span>
          </h1>

          <h2>Smart Contact Management for a More Connected You.</h2>

          <p>
            Keep all your important contacts organized, accessible, and easy
            to manage — all in one simple place.
          </p>
        </div>

        <div className="rightside">
          <img src="/rightside.png" alt="Contact management" />
        </div>
      </main>
    </>
  );
}

export default Home;

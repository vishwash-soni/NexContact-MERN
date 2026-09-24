import { useEffect, useState } from "react";
import { FiLogOut, FiMoon, FiSun, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import ContactCard from "../components/ContactCard";
import "../styles/Contacts.css";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(document.body.classList.contains("dark"));

  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.name;

  // Fetch every contact belonging to the logged-in user.
  const getContacts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/mydata/getmycontact");
      setContacts(response.data.allContact);
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search contacts by name/email; falls back to the full list when empty.
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!search.trim()) {
      getContacts();
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(
        `/mydata/searchcontact?search=${search.trim()}`
      );
      setContacts(response.data.allContact || response.data || []);
    } catch (error) {
      console.error("Error searching contacts:", error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAll = () => {
    setSearch("");
    getContacts();
  };

  useEffect(() => {
    getContacts();
  }, []);

  const handleThemeToggle = () => {
    document.body.classList.toggle("dark");
    setIsDark((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {});
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleAdd = () => {
    navigate("/add-contact", { state: { update: false } });
  };

  // Removes a contact from the list after it's deleted on the server.
  const handleContactDeleted = (id) => {
    setContacts((prev) => prev.filter((contact) => contact._id !== id));
  };

  return (
    <div className="contacts-page">
      {/* Header */}
      <header className="contacts-header">
        <div className="contacts-welcome">
          <p>Welcome back</p>
          <h1>{userName}</h1>
        </div>

        <div className="contacts-header-actions">
          <button
            type="button"
            className="header-icon-button"
            onClick={handleThemeToggle}
            title="Toggle theme"
          >
            {isDark ? <FiSun /> : <FiMoon />}
          </button>

          <button type="button" className="logout-button" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Search */}
      <section className="contacts-search-section">
        <form className="contacts-search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <FiSearch />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button type="submit" className="search-button">
            Search
          </button>

          <button type="button" className="search-button" onClick={handleShowAll}>
            Show All Contacts
          </button>

          <button type="button" className="search-button" onClick={handleAdd}>
            Add Contact
          </button>
        </form>
      </section>

      {/* Contacts */}
      <main className="contacts-content">
        {loading ? (
          <div className="no-contacts">
            <FiSearch />
            <h3>Loading contacts...</h3>
          </div>
        ) : contacts.length > 0 ? (
          <>
            <div className="contacts-title-row">
              <div>
                <h2>{search.trim() ? "Search Results" : "Your Contacts"}</h2>
                <p>
                  {contacts.length} {contacts.length === 1 ? "contact" : "contacts"}
                </p>
              </div>
            </div>

            <div className="contacts-grid">
              {contacts.map((data) => (
                <ContactCard
                  key={data._id}
                  contact={data}
                  onDelete={handleContactDeleted}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="no-contacts">
            <FiSearch />
            <h3>Zero contacts found</h3>
            <p>
              {search.trim()
                ? "Try searching with a different name or email."
                : "Please add a contact to get started."}
            </p>

            {search.trim() && (
              <button type="button" className="search-button" onClick={handleShowAll}>
                Show All Contacts
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Contacts;

import { useNavigate, useLocation } from "react-router-dom";
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiFileText,
  FiCalendar,
} from "react-icons/fi";
import "../styles/ContactDetails.css";

// Shows the full details of a contact passed via navigation state.
function ContactDetails() {
  const location = useLocation();
  const contact = location.state?.contact;
  const navigate = useNavigate();

  return (
    <div className="contact-details-page">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        <FiArrowLeft />
        <span>Back</span>
      </button>

      {/* Contact Card */}
      <div className="contact-details-card">
        {/* Avatar */}
        <div className="details-avatar-section">
          <img
            src={contact?.imageUrl || "/default_avatar.png"}
            alt={contact?.name}
            className="details-avatar"
          />
        </div>

        {/* Name */}
        <h1 className="details-name">{contact?.name}</h1>
        <p className="details-email">{contact?.email}</p>

        {/* Contact Information */}
        <div className="details-info">
          <div className="details-row">
            <div className="details-icon">
              <FiPhone />
            </div>
            <div>
              <span className="details-label">Phone</span>
              <p>{contact?.phone || "Not available"}</p>
            </div>
          </div>

          <div className="details-row">
            <div className="details-icon">
              <FiMail />
            </div>
            <div>
              <span className="details-label">Email</span>
              <p>{contact?.email || "Not available"}</p>
            </div>
          </div>

          {/* Notes */}
          <div className="details-row notes-row">
            <div className="details-icon">
              <FiFileText />
            </div>
            <div>
              <span className="details-label">Notes</span>
              <p>{contact?.notes || "No notes available"}</p>
            </div>
          </div>

          {/* Created At */}
          <div className="details-row">
            <div className="details-icon">
              <FiCalendar />
            </div>
            <div>
              <span className="details-label">Created</span>
              <p>
                {contact?.createdAt
                  ? new Date(contact.createdAt).toLocaleString()
                  : "Not available"}
              </p>
            </div>
          </div>

          {/* Updated At */}
          <div className="details-row">
            <div className="details-icon">
              <FiCalendar />
            </div>
            <div>
              <span className="details-label">Last Updated</span>
              <p>
                {contact?.updatedAt
                  ? new Date(contact.updatedAt).toLocaleString()
                  : "Not available"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactDetails;

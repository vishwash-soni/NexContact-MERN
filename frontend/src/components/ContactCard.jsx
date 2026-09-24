import { useState } from "react";
import { FiEdit2, FiTrash2, FiPhone, FiMail, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "../styles/ContactCard.css";
import api from "../api/axios";

function ContactCard({ contact, onDelete }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleViewDetails = () => {
    navigate("/view", { state: { contact } });
  };

  const handleEdit = () => {
    navigate(`/update/${contact._id}`, { state: { update: contact } });
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${contact.name}? This can't be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/mydata/deletemycontact/${contact._id}`);
      onDelete?.(contact._id);
    } catch (error) {
      console.error("Error deleting contact:", error);
      setDeleting(false);
    }
  };

  return (
    <div className="contact-card">
      {/* Contact Image */}
      <div className="contact-image-section">
        <img
          src={contact.imageUrl || "/default_avatar.png"}
          alt={contact.name}
          className="contact-image"
        />
      </div>

      {/* Contact Information */}
      <div className="contact-info">
        <h3 className="contact-name">{contact.name}</h3>

        <div className="contact-detail">
          <FiPhone />
          <span>{contact.phone}</span>
        </div>

        <div className="contact-detail">
          <FiMail />
          <span>{contact.email}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="contact-actions">
        <button
          type="button"
          className="view-button"
          onClick={handleViewDetails}
          title="View contact details"
        >
          <FiEye />
          <span>View</span>
        </button>

        <button
          type="button"
          className="edit-button"
          onClick={handleEdit}
          title="Edit contact"
        >
          <FiEdit2 />
          <span>Edit</span>
        </button>

        <button
          type="button"
          className="delete-button"
          onClick={handleDelete}
          disabled={deleting}
          title="Delete contact"
        >
          <FiTrash2 />
          <span>{deleting ? "Deleting..." : "Delete"}</span>
        </button>
      </div>
    </div>
  );
}

export default ContactCard;

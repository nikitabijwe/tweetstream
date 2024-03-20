import React, { useState } from "react";
import parseISO from "date-fns/parseISO";
import formatDistance from "date-fns/formatDistance";
import "./comment.css";

function formatDate(dateStr) {
  if (dateStr) {
    const created_at = parseISO(dateStr);
    return formatDistance(created_at, new Date(), { addSuffix: true });
  }
}

const Comment = ({ comment, isActiveUser, handleDelete, handleEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(comment.message);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    handleEdit(comment.id, editedMessage);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedMessage(comment.message);
  };

  const handleChange = (event) => {
    setEditedMessage(event.target.value);
  };

  return (
    <div className="Comment">
      <div className="Comment-header">
        <div className="Comment-avatar">
          <img src={comment?.author?.avatar} alt="avatar" />
        </div>
        <span className="Comment-author">
          {isActiveUser ? "You" : comment.name}
        </span>
        <span className="Comment-time">{formatDate(comment.created_at)}</span>
        {!isEditing && (
          <span className="Comment-edit" onClick={handleEditClick}>
            Edit
          </span>
        )}
        {!isEditing && (
          <span
            className="Comment-delete"
            onClick={() => handleDelete(comment?.id)}
          >
            Delete
          </span>
        )}
        {isEditing && (
          <>
            <span className="Comment-save" onClick={handleSaveClick}>
              Save
            </span>
            <span className="Comment-cancel" onClick={handleCancelClick}>
              Cancel
            </span>
          </>
        )}
      </div>
      <div className="Comment-body">
        {isEditing ? (
          <textarea value={editedMessage} onChange={handleChange} />
        ) : (
          comment.message
        )}
      </div>
    </div>
  );
};

export default Comment;

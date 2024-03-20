import { useEffect, useState } from "react";
import "./Header.css";
import Notification from "../../img/notification.svg";
import CloseIcon from "../../img/close.svg";

const Header = ({ users, selectedUserId, setSelectedUserId, socket }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on("getNotification", (data) => {
        setNotifications((prev) => [...prev, data]);
      });
    }
    return () => {
      if (socket) {
        socket.off("getNotification");
      }
    };
  }, [socket]);

  const displayNotification = ({ senderName }) => {
    return (
      <span className="notification">
        <strong>{senderName.name}</strong> commented on your post.
      </span>
    );
  };

  const handleRead = () => {
    setNotifications([]);
    setOpen(false);
  };

  return (
    <header className="Header" key={selectedUserId}>
      <div className="Header-user">
        <div className="icons">
          <div className="icon" onClick={() => setOpen(!open)}>
            <img src={Notification} className="iconImg" alt="" />
            {notifications.length > 0 && (
              <div className="counter">{notifications.length}</div>
            )}
          </div>
        </div>
        {open && notifications.length > 0 && (
          <div className="modal">
            <div className="modal-content">
              <h3>Notifications</h3>
              <img
                src={CloseIcon}
                alt="Close"
                className="close-icon"
                onClick={() => setOpen(false)}
              />
              <div className="notifications">
                {notifications.map((n, index) => displayNotification(n, index))}
              </div>
              <button className="nButton" onClick={handleRead}>
                Mark as read
              </button>
            </div>
          </div>
        )}
        <select
          value={selectedUserId}
          onChange={(e) => {
            setSelectedUserId(e.target.value);
          }}
        >
          <option>Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
};

export default Header;

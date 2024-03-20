import { useEffect, useState } from "react";
import "./App.css";
import CommentList from "./components/commentList/commentList";
import Header from "./components/header/Header";
import io from "socket.io-client";

function App() {
  const [currentUser, setCurrentUser] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [socket, setSocket] = useState(null);
  const HOST_URL = "http://localhost:4000";

  async function fetchUsers() {
    const getUsersUrl = `${HOST_URL}/getUsers`;
    const result = await fetch(getUsersUrl);
    const users = await result.json();
    setUsers(users);
  }

  useEffect(() => {
    const SOCKET_URL = "http://localhost:1300";
    setSocket(io(SOCKET_URL));
    fetchUsers();
  }, []);

  const defineUser = (selectedUserId) => {
    const parsedUserId = parseInt(selectedUserId, 10);

    setSelectedUserId(parsedUserId);
    const activeUser = users.find(
      (user) => user.id === parsedUserId
    );
    if (activeUser) setCurrentUser(activeUser);
  };

  return (
    <div className="App">
      <div className="Container">
        <Header
          users={users}
          selectedUserId={selectedUserId}
          setSelectedUserId={defineUser}
          socket={socket}
        />
        <CommentList
          socket={socket}
          selectedUserId={selectedUserId}
          currentUser={currentUser}
          users={users}
        />
      </div>
    </div>
  );
}

export default App;

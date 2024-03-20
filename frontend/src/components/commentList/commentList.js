import { useEffect, useState, useRef } from "react";
import Comment from "../comment/comment";
import "./commentList.css";

const Comments = ({ socket, selectedUserId, currentUser, users }) => {
  const [comments, setComments] = useState([]);
  const [newcommentid, setNewCommentId] = useState(null);

  const [input, setInput] = useState("");
  const commentsEndRef = useRef(null);

  const handleNotification = () => {
    socket.emit("sendNotification", {
      senderName: currentUser,
    });
  };

  async function sendComment() {
    if (input.trim() !== "") {
      const result = await fetch("http://localhost:4000/createComment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: currentUser.name, message: input, authorId: selectedUserId }),
      });
      const comment = await result.json();
      setNewCommentId(comment.id);
      handleNotification();
      return comment;
    }
    return null;
  }

  async function getComment(comment) {
    if (comment) {
      const result = await fetch("http://localhost:4000/getComment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: comment }),
      });
      try {

        const newcomment = await result.json() || [];
        if (newcomment) {
          const commentWithAuthor = getCommentWithAuthor(newcomment);
          setComments((comments) => [...comments, commentWithAuthor]);
        }
      } catch (error) {
        console.error("Failed to parse JSON:", error);
      }
    }
  }

  useEffect(() => {
    sendComment();
    if (newcommentid)
      getComment(newcommentid);
  }, [users, newcommentid]);

  function finduserById(userId) {
    if (users)
      return users.find((user) => user.id === userId);
  };

  function getCommentWithAuthor(comment) {
    const author = finduserById(comment.authorId);
    return {
      ...comment,
      author,
    };
  };

  async function fetchComments() {
    const result = await fetch("http://localhost:4000/getComments");
    const comments = await result.json();
    return comments;
  }

  useEffect(() => {
    fetchComments().then((comments) => {
      if (comments) {
        const commentsWithAuthor = comments.map(comment => getCommentWithAuthor(comment));
        setComments(commentsWithAuthor);
      }
    });
  }, [users]);

  useEffect(() => {
    const commentsList = commentsEndRef.current;
    if (commentsList) {
      commentsList.scrollTop = commentsList.scrollHeight;
    }
  }, [comments]);

  useEffect(() => {
    if (socket) {
      socket.on("new-comment", (comment) => {
        if (comment.authorId !== selectedUserId) {
          if (comment) {
            const commentWithAuthor = getCommentWithAuthor(comment);
            setComments((comments) => [...comments, commentWithAuthor]);
          }
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("new-comment");
      }
    };
  }, [socket, users, setNewCommentId, selectedUserId]);

  return (
    <div className="Comments">
      <h3 className="Comments-title">
        {comments.length === 1 ? `1 comment` : `${comments.length} comments`}
      </h3>

      <div className="Comments-list" ref={commentsEndRef}>
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            isActiveUser={selectedUserId === comment.authorId}
          />
        ))}
      </div>
      <div className="Comments-box">
        <form
          className=""
          onSubmit={(e) => {
            e.preventDefault();
            sendComment(input);
            setInput("");
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            name="body"
            className="Comments-box__input"
          />
          <button
            type="submit"
            disabled={selectedUserId === ""}
            className="Comments-box__btn"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Comments;

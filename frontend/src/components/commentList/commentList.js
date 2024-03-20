import { useEffect, useState, useRef, useCallback } from "react";
import Comment from "../comment/comment";
import "./commentList.css";

const HOST_URL = "http://localhost:4000";

const CommentList = ({ socket, selectedUserId, currentUser, users }) => {
  const [comments, setComments] = useState([]);
  const [newcommentid, setNewCommentId] = useState(null);

  const [input, setInput] = useState("");
  const commentsEndRef = useRef(null);

  const handleNotification = useCallback(() => {
    socket.emit("sendNotification", {
      senderName: currentUser,
    });
  }, [socket, currentUser]);

  const sendComment = useCallback(async () => {
    if (input.trim() !== "") {
      const URL = `${HOST_URL}/createComment`;
      const result = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentUser.name,
          message: input,
          authorId: selectedUserId,
        }),
      });
      const comment = await result.json();
      setNewCommentId(comment.id);
      handleNotification();
      return comment;
    }
    return null;
  }, [
    input,
    currentUser.name,
    selectedUserId,
    setNewCommentId,
    handleNotification,
  ]);

  const finduserById = useCallback(
    (userId) => {
      if (users) return users.find((user) => user.id === userId);
    },
    [users]
  );

  const getCommentWithAuthor = useCallback(
    (comment) => {
      const author = finduserById(comment.authorId);
      return {
        ...comment,
        author,
      };
    },
    [finduserById]
  );

  const getComment = useCallback(
    async (commentId) => {
      if (commentId) {
        const url = `${HOST_URL}/getComment?id=${commentId}`;
        const result = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        try {
          const newcomment = (await result.json()) || [];
          if (newcomment) {
            const commentWithAuthor = getCommentWithAuthor(newcomment);
            setComments((comments) => [...comments, commentWithAuthor]);
          }
        } catch (error) {
          console.error("Failed to parse JSON:", error);
        }
      }
    },
    [getCommentWithAuthor, setComments]
  );

  useEffect(() => {
    sendComment();
    if (newcommentid) getComment(newcommentid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getComment, newcommentid]);

  async function fetchComments() {
    const getCommentsUrl = `${HOST_URL}/getComments`;

    const result = await fetch(getCommentsUrl);
    const comments = await result.json();
    return comments;
  }

  useEffect(() => {
    fetchComments().then((comments) => {
      if (comments) {
        const commentsWithAuthor = comments.map((comment) =>
          getCommentWithAuthor(comment)
        );
        setComments(commentsWithAuthor);
      }
    });
  }, [getCommentWithAuthor, users]);

  useEffect(() => {
    const commentsList = commentsEndRef.current;
    if (commentsList) {
      commentsList.scrollTop = commentsList.scrollHeight;
    }
  }, [comments]);

  const handleDelete = async (commentId) => {
    console.log(commentId, "commentIdxds");

    const url = `${HOST_URL}/deleteComment?id=${commentId}`;
    await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const updatedComments = comments.filter(
      (comment) => comment.id !== commentId
    );
    setComments(updatedComments);
  };

  const handleEdit = async (commentId, editedMessage) => {
    console.log(commentId, "commentIdxds", editedMessage);
    const timestamp = new Date().toISOString(); // Get the current timestamp

    const URL = `${HOST_URL}/updateComment`;
    await fetch(URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: commentId,
        message: editedMessage,
      }),
    });

    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return { ...comment, message: editedMessage, created_at: timestamp };
      }
      return comment;
    });
    setComments(updatedComments);
  };

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
  }, [socket, users, setNewCommentId, selectedUserId, getCommentWithAuthor]);

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
            handleDelete={handleDelete}
            handleEdit={handleEdit}
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

export default CommentList;

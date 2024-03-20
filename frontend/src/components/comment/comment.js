import parseISO from "date-fns/parseISO";
import formatDistance from "date-fns/formatDistance";
import "./comment.css";

function formatDate(dateStr) {
  if (dateStr) {
    const created_at = (parseISO(dateStr));
    return formatDistance(created_at, new Date(), { addSuffix: true });
  }
}

const Comment = ({ comment, isActiveUser }) => (
  <div className="Comment">
    <div className="Comment-header">
      <div className="Comment-avatar">
        <img src={comment?.author?.avatar} alt="avatar" />
      </div>
      <span className="Comment-author">
        {isActiveUser ? "You" : comment.name}
      </span>
      <span className="Comment-time">{formatDate(comment.created_at)}</span>
    </div>

    <div className="Comment-body">{comment.message}</div>
  </div>
);

export default Comment;

import React from "react";

function Message({ id, text, user, timestamp, admin, deleteMessage }) {
  return (
    <div className="message">
      <p className="message-text">{text}</p>
      <div className="message-info">
        <span>Posted by: {user}&nbsp;</span>
        <span>- {timestamp}</span>
        {admin ? (
          <button onClick={() => deleteMessage(id)}>Delete</button>
        ) : null}
      </div>
    </div>
  );
}

export default Message;

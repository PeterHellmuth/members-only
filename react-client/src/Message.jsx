import React from "react";

function Message({ id, text, user, timestamp, admin, deleteMessage }) {
  return (
    <div className="message">
      <p>{text}</p>
      <span>Posted by: {user}</span>
      <span>{timestamp}</span>
      {admin ? <button onClick={() => deleteMessage(id)}>Delete</button> : null}
    </div>
  );
}

export default Message;

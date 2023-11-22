import React from "react";

function PostMessage({ postMessage, errors }) {
  return (
    <form method="POST" action="" className="message-form">
      <label htmlFor="message">Post Message: </label>
      <input
        type="textfield"
        name="message"
        id="message"
        placeholder="Message text"
        defaultValue=""
        required
      />
      <span className="error-message">
        {errors.message ? errors.message : ""}
      </span>
      <button type="submit" onClick={(e) => postMessage(e)}>
        Submit
      </button>
      <span className="error-message">
        {errors.submit ? errors.submit : ""}
      </span>
    </form>
  );
}

export default PostMessage;

import React from "react";

function Login({ loginUser, errors }) {
  return (
    <form method="POST" action="" className="login-form">
      <label htmlFor="username">Username: </label>
      <input
        type="text"
        name="username"
        id="username"
        placeholder="Your username"
        defaultValue=""
        required
      />
      <span className="error-message">
        {errors.username ? errors.username : ""}
      </span>
      <label htmlFor="password">Password: </label>
      <input
        type="password"
        name="password"
        id="password"
        placeholder="Your password"
        defaultValue=""
        required
      />
      <span className="error-message">
        {errors.password ? errors.password : ""}
      </span>
      <button
        className="item-button"
        type="submit"
        onClick={(e) => loginUser(e)}
      >
        Submit
      </button>
      <span className="error-message">
        {errors.submit ? errors.submit : ""}
      </span>
    </form>
  );
}

export default Login;

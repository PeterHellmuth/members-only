import React from "react";

function SignUp({ addUser, errors }) {
  return (
    <form method="POST" action="" className="sign-up-form">
      <label htmlFor="firstName">First Name: </label>
      <input
        type="text"
        name="firstName"
        id="firstName"
        placeholder="Your first name"
        defaultValue=""
        required
      />
      <span className="error-message">
        {errors.firstName ? errors.firstName : ""}
      </span>
      <label htmlFor="lastName">Last Name: </label>
      <input
        type="text"
        name="lastName"
        id="lastName"
        placeholder="Your last name"
        defaultValue=""
        required
      />
      <span className="error-message">
        {errors.lastName ? errors.lastName : ""}
      </span>
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
      <button className="item-button" type="submit" onClick={(e) => addUser(e)}>
        Submit
      </button>
      <span className="error-message">
        {errors.submit ? errors.submit : ""}
      </span>
    </form>
  );
}

export default SignUp;

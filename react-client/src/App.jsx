import { useState, useEffect } from "react";
import SignUp from "./SignUp";
import Login from "./Login";
import PostMessage from "./PostMessage";
import Message from "./Message";
import "./App.css";

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

const port = normalizePort(process.env.PORT || "3000"); //deployed
const SERVER_URL = "https://members-only-ph.fly.dev"; //deployed
//const SERVER_URL = "http://localhost:" + "3000"; //dev test

function App() {
  //const [response, setResponse] = useState("");
  const [errors, setErrors] = useState([]);
  const [currentPage, setCurrentPage] = useState("login");
  const [user, setUser] = useState({
    auth: false,
    name: "",
    member: false,
    admin: false,
  });
  const [token, setToken] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let loadToken = localStorage.getItem("jwtToken");
    setToken(loadToken);
    if (loadToken) {
      authenticate(loadToken);
      getMessages(loadToken);
    } else {
      getMessages(null);
    }
  }, []);

  const deleteMessage = (id) => {
    let fetchUrl = "";
    let data = null;
    fetchUrl = `${SERVER_URL}/messages/${id}`;

    fetch(fetchUrl, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        if (res.ok) {
          getMessages(token);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getMessages = (authToken = token) => {
    let fetchUrl = "";
    let data = null;
    fetchUrl = `${SERVER_URL}/messages`;

    fetch(fetchUrl, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + authToken,
      },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
      })
      .then((data) => {
        setMessages(data.reverse());
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const changeMemberStatus = (e, type) => {
    e.preventDefault();
    let fetchUrl = "";
    let data = JSON.stringify({
      secretcode: e.target.parentNode.secretcode.value,
    });
    fetchUrl = `${SERVER_URL}/users/${type}`;

    fetch(fetchUrl, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: data,
    }).then((res) => {
      if (!res.ok) {
        if (res.status === 400) {
          return res
            .json()
            .then((err) => {
              const errorMessages = {};
              err.forEach((error) => {
                errorMessages[error.path] = error.msg;
              });
              setErrors(errorMessages);
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          setErrors({
            secretcode: "Wrong password.",
          });
        }
      } else {
        return res
          .json()
          .then((data) => {
            setToken(data.token);
            localStorage.setItem("jwtToken", data.token);
            setUser({
              auth: true,
              name: data.username,
              member: data.member,
              admin: data.admin,
            });
            setErrors([]);
            getMessages(data.token);
          })

          .catch((err) => {
            console.log(err);
          });
      }
    });
  };

  const logoutUser = () => {
    let fetchUrl = "";
    let data = null;
    fetchUrl = `${SERVER_URL}/users/logout`;

    fetch(fetchUrl, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        if (res.ok) {
          setToken(null);
          setUser({ auth: false, name: "" });
          localStorage.removeItem("jwtToken");
          getMessages(null);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const authenticate = (authToken) => {
    let fetchUrl = "";
    let data = null;
    fetchUrl = `${SERVER_URL}/users/authenticate`;

    fetch(fetchUrl, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + authToken,
      },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
      })
      .then((data) => {
        setUser({
          auth: true,
          name: data.username,
          member: data.member,
          admin: data.admin,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const postMessage = (e) => {
    e.preventDefault();
    let fetchUrl = "";
    let data = null;
    fetchUrl = `${SERVER_URL}/messages`;
    data = JSON.stringify({
      message: e.target.parentNode.message.value,
    });

    fetch(fetchUrl, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: data,
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 400) {
            return res.json().then((err) => {
              const errorMessages = {};
              err.forEach((error) => {
                errorMessages[error.path] = error.msg;
              });
              setErrors(errorMessages);
            });
          }
        } else {
          getMessages(token);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const loginUser = (e) => {
    e.preventDefault();
    let fetchUrl = "";
    let data = null;
    fetchUrl = `${SERVER_URL}/users/login`;
    data = JSON.stringify({
      username: e.target.parentNode.username.value,
      password: e.target.parentNode.password.value,
    });

    fetch(fetchUrl, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: data,
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 400) {
            setErrors({
              submit: "Username or password are incorrect.",
            });
          }
        } else {
          return res
            .json()
            .then((data) => {
              setToken(data.token);
              localStorage.setItem("jwtToken", data.token);
              setUser({
                auth: true,
                name: data.username,
                member: data.member,
                admin: data.admin,
              });
              setErrors([]);
              getMessages(data.token);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const addUser = (e) => {
    e.preventDefault();
    let fetchUrl = "";
    let data = null;
    fetchUrl = `${SERVER_URL}/users/`;
    data = JSON.stringify({
      firstName: e.target.parentNode.firstName.value,
      lastName: e.target.parentNode.lastName.value,
      username: e.target.parentNode.username.value,
      password: e.target.parentNode.password.value,
    });

    fetch(fetchUrl, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: data,
    })
      .then((res) => {
        if (res.status === 409) {
          setErrors({
            submit:
              "Username already exists. Please choose a new username or log in.",
          });
        }
        if (res.status === 400) {
          return res.json().then((err) => {
            const errorMessages = {};
            err.forEach((error) => {
              errorMessages[error.path] = error.msg;
            });
            setErrors(errorMessages);
          });
        }
        return res.json();
      })
      .then((data) => {
        //save token from new user
        setToken(data.token);
        localStorage.setItem("jwtToken", data.token);
        setUser({
          auth: true,
          name: data.username,
          member: data.member,
          admin: data.admin,
        });
        setErrors([]);
        setCurrentPage("login");
        getMessages(data.token);
      })
      .catch((err) => console.log(err));
  };

  if (currentPage === "login") {
    return (
      <div className="main-container">
        <h1>Members Only Club</h1>
        {user.auth ? (
          <div className="user-panel">
            <span>
              You are logged in as {user.name}.
              {user.admin
                ? " You are an administrator."
                : user.member
                  ? " You are a club member."
                  : null}
              <button type="button" onClick={logoutUser}>
                Logout
              </button>
            </span>

            <div className="user-forms">
              {user.member ? null : (
                <form method="POST" action="" className="club-form">
                  <label htmlFor="secretcode">Secret Code (1234): </label>
                  <input
                    type="text"
                    name="secretcode"
                    placeholder="Secret Code"
                    defaultValue=""
                    required
                  />
                  <span className="error-message">
                    {errors.secretcode ? errors.secretcode : ""}
                  </span>

                  <button
                    type="submit"
                    onClick={(e) => changeMemberStatus(e, "member")}
                  >
                    Join the club
                  </button>
                  <span className="error-message">
                    {errors.submit ? errors.submit : ""}
                  </span>
                </form>
              )}
              {user.admin ? null : (
                <form method="POST" action="" className="admin-form">
                  <label htmlFor="secretcode">
                    Admin Password (no hint!):{" "}
                  </label>
                  <input
                    type="password"
                    name="secretcode"
                    placeholder="Secret Code"
                    defaultValue=""
                    required
                  />
                  <span className="error-message">
                    {errors.secretcode ? errors.secretcode : ""}
                  </span>
                  <button
                    type="submit"
                    onClick={(e) => changeMemberStatus(e, "admin")}
                  >
                    Become Admin
                  </button>
                </form>
              )}
            </div>
            <PostMessage postMessage={postMessage} errors={errors} />
          </div>
        ) : (
          <div className="login-container">
            <Login
              loginUser={loginUser}
              errors={errors}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
        <div className="message-container">
          {messages
            ? messages.map((message) => {
                return (
                  <Message
                    key={message._id}
                    id={message._id}
                    text={message.text}
                    user={message.user}
                    timestamp={message.timestamp_formatted}
                    admin={user.admin}
                    deleteMessage={deleteMessage}
                  />
                );
              })
            : null}
        </div>
      </div>
    );
  } else if (currentPage === "signup") {
    return (
      <div className="main-container">
        <h1>Members Only Club</h1>
        <SignUp
          addUser={addUser}
          errors={errors}
          setCurrentPage={setCurrentPage}
        />
      </div>
    );
  }
}

export default App;

import { useState, useEffect } from "react";
import SignUp from "./SignUp";
import Login from "./Login";
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
const SERVER_URL = "http://express-react-template.fly.dev"; //deployed
//const SERVER_URL = "http://localhost:" + "3000"; //dev test

function App() {
  //const [response, setResponse] = useState("");
  const [errors, setErrors] = useState([]);
  const [currentPage, setCurrentPage] = useState("login");
  const [user, setUser] = useState({ auth: false, name: "" });
  const [token, setToken] = useState(null);

  useEffect(() => {
    let loadToken = localStorage.getItem("jwtToken");
    setToken(loadToken);
    if (loadToken) {
      authenticate(loadToken);
    }
  }, []);

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
      .then((res) => {
        setUser({ auth: true, name: res.username });
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
          console.log("HTTP error " + res.status);
        }
        return res.json();
      })
      .then((data) => {
        setToken(data.token);
        localStorage.setItem("jwtToken", data.token);
        setUser({ auth: true, name: data.username });
        setErrors([]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const addUser = (e) => {
    e.preventDefault();
    let fetchUrl = "";
    let data = null;
    fetchUrl = `${SERVER_URL}/users/create`;
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
        setUser({ auth: true, name: data.username });
        setErrors([]);
        setCurrentPage("login");
      })
      .catch((err) => console.log(err));
  };

  if (currentPage === "login") {
    if (user.auth) {
      return (
        <div>
          You are logged in as {user.name}
          <button type="button" onClick={logoutUser}>
            Logout
          </button>
        </div>
      );
    } else {
      return (
        <div>
          <Login loginUser={loginUser} errors={errors} />
          <button type="button" onClick={() => setCurrentPage("signup")}>
            Create Account
          </button>
        </div>
      );
    }
  } else if (currentPage === "signup") {
    return <SignUp addUser={addUser} errors={errors} />;
  }
}

export default App;

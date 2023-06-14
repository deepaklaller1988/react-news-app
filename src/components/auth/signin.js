import React, { useState, useEffect } from "react";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function SignIn() {
    const [data, setData] = useState({
        email: "",
        password: "",
      });
      const [error, setError] = useState("");
      const navigate = useNavigate();
    
      useEffect(() => {
        const auth = localStorage.getItem("token");
        if (auth) {
          navigate("/home");
        }
      }, []);
    
      const handleChange = ({ currentTarget: input }) => {
        setData({ ...data, [input.name]: input.value });
      };
    
      const handleLogin = async (e) => {
        e.preventDefault();
        try {
          const url = "https://df45-112-196-51-235.ngrok-free.app/api/login";
          const { data: res } = await axios.post(url, data);
          console.log(res);
          if (res.success) {
            localStorage.setItem("token", JSON.stringify(res.data.token));
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setError("");
            navigate("/home");
          } else {
            console.log(res.message);
            setError(res.message);
          }
        } catch (error) {
          if (
            error.response &&
            error.response.status >= 400 &&
            error.response.status <= 500
          ) {
            setError(error.response.data.message);
          }
        }
      };

  return (
    <div className="signinup">
      <div className="text-center">
          <h1>Sign In</h1>
          <p>Need an account? <Link to="/signup">Sign Up</Link> </p>
        </div>
        <div className="smain d-flex align-items-center justify-content-center">
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                onChange={handleChange}
                placeholder="Password"
              />
            </Form.Group>
            {error ? (
              <Form.Text className="text-muted">* {error}</Form.Text>
            ) : (
              ""
            )}
            <Form.Group className="mb-3" controlId="formBasicCheckbox">
              <Form.Check type="checkbox" label="Check me out" />
            </Form.Group>
            <Button variant="primary" type="submit" onClick={handleLogin}>
              Submit
            </Button>
          </Form>
        </div>
    </div>
  )
}

export default SignIn

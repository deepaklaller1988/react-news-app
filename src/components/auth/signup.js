import React, { useState, useEffect } from "react";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function SignUp({baseUrl}) {
    const [data, setData] = useState({
      firstname: "",
      lastname:"",
      email: "",
      mobile: "",
      password: "",
      });
      const [error, setError] = useState("");
      const navigate = useNavigate();
    
      useEffect(() => {
        const auth = localStorage.getItem("token");
        if (auth) {
          // navigate("/home");
        }
      }, []);
    
      const handleChange = ({ currentTarget: input }) => {
        setData({ ...data, [input.name]: input.value });
      };
    
      const handleLogin = async (e) => {
        e.preventDefault();
        try {
          const url = baseUrl + `/api/users`;
          const {data:res} = await axios.post(url, data);
          console.log(res);
          // console.log(data)
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
            console.log(error)
            setError(error.response.data.message);
          }
        }
      };

  return (
    <div className="signinup">
      <div className="text-center">
          <h1>Sign Up</h1>
          <p>Already have an account? <Link to="/">Sign In</Link> </p>
        </div>
        <div className="smain d-flex align-items-center justify-content-center">
          <Form>
            <Form.Group className="mb-3" controlId="formBasicFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstname"
                placeholder="Enter First Name"
                onChange={handleChange}
              />
               </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicLastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastname"
                placeholder="Enter Last Name"
                onChange={handleChange}
              />
               </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicContact">
              <Form.Label>Contact</Form.Label>
              <Form.Control
                type="number"
                name="mobile"
                placeholder="Enter Contact"
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
            <Button variant="primary" type="submit" onClick={handleLogin}>
              Submit
            </Button>
          </Form>
        </div>
    </div>
  )
}

export default SignUp;

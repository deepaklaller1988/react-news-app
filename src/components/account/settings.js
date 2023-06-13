import React from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";


function Settings() {

    const handleSubmit = async () =>{
        console.log("object")
    }
  return (
    <div>
      <div>
        <h1>Select Your preferences</h1>
        <div>
        <Form.Check
            type='checkbox'
            id={`default-checkbox`}
          >
          <Form.Check.Input type='checkbox' />
            <Form.Check.Label>{`Top Headlines`}</Form.Check.Label>
        </Form.Check>
        <Form.Check
            type='checkbox'
            id={`default-checkbox`}
          >
          <Form.Check.Input type='checkbox' />
            <Form.Check.Label>{`Sports`}</Form.Check.Label>
        </Form.Check>
        <Form.Check
            type='checkbox'
            id={`default-checkbox`}
          >
          <Form.Check.Input type='checkbox' />
            <Form.Check.Label>{`Bussiness`}</Form.Check.Label>
        </Form.Check>
        <Form.Check
            type='checkbox'
            id={`default-checkbox`}
          >
          <Form.Check.Input type='checkbox' />
            <Form.Check.Label>{`Entertainment`}</Form.Check.Label>
        </Form.Check>
        <Button variant="primary" onClick={handleSubmit}>
              Submit
            </Button>
        </div>
      </div>
    </div>
  )
}

export default Settings;

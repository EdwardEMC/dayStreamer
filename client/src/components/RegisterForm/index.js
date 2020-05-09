import React, { Component } from "react";
import "./style.css";

class RegistrationForm extends Component {
  // Setting the component's initial state
  state = {
    name: "",
    email: "",
    password: ""
  };

  handleInputChange = event => {
    // Getting the value and name of the input which triggered the change
    let value = event.target.value;
    const name = event.target.name;

    if (name === "password") {
      value = value.substring(0, 15);
    }
    // Updating the input's state on input
    this.setState({
      [name]: value
    });
  };

  handleFormSubmit = e => {
    e.preventDefault();

    console.log(this.state, "STATE");
    // API call to login user

    // Clears the state for the next submission
    this.setState({
      name: "",
      email: "",
      password: ""
    });
  };

  render() {
    return (
      <div>
        <form className="form">
          <input
            value={this.state.name}
            name="name"
            onChange={this.handleInputChange}
            type="text"
            placeholder="John Smith"
            required
          />
          <input
            value={this.state.email}
            name="email"
            onChange={this.handleInputChange}
            type="text"
            placeholder="john@gmail.com"
            required
          />
          <input
            value={this.state.password}
            name="password"
            onChange={this.handleInputChange}
            type="password"
            placeholder="********"
            required
          />
          <button onClick={this.handleFormSubmit}>Submit</button>
        </form>
      </div>
    );
  };
};

export default RegistrationForm;
import React, { useState } from "react";
import UserPool from "../UserPool";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [family_name, setFamily_name] = useState("");
  const [phone_number, setPhone_number] = useState("");

  const onSubmit = (event) => {
    event.preventDefault();

    UserPool.signUp(email, password, [], null, (err, data) => {
      if (err) {
        console.error(err);
      }
      console.log(data);
    });
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <label htmlFor="email">Email</label>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        ></input>
        <label htmlFor="password">Password</label>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        ></input>
        {/* 
        <label htmlFor="family_name">Family_name</label>
        <input
          value={family_name}
          onChange={(event) => setFamily_name(event.target.value)}
        ></input>

        <label htmlFor="phone_number">Phone_number</label>
        <input
          value={phone_number}
          onChange={(event) => setPhone_number(event.target.value)}
        ></input> */}
        <button type="submit">SignUp</button>
      </form>
    </div>
  );
}

export default SignUp;

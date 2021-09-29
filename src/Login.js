import React, {useRef} from 'react';

function Login({sendLogin})  {
	const username = useRef();
	const passwd = useRef();
	
	/**
	 * Note that unlike elsewhere where the handler is in the index.js, 
	 * we put this here so we can take advantage of useRef to get the username and password,
	 * and call the passed in 'sendLogin' function.
	 **/
	const handleLogin = (event) => {
		//console.log("Got here");
		const user = username.current.value;
		const pwd = passwd.current.value
		sendLogin(user, pwd);
	}
	
	
	return (
		<div className="login-dialog">
			<div className="input-label">
				<label>Username:<input name="username"  ref={username}/></label>
			</div>
			<div className="input-label">
				<label>Password:<input type="password" name="password"  ref={passwd}/></label>
			</div>
			<div className="buttons">
				<button onClick={handleLogin}>Login</button>
			</div>
		</div>
	)
}

export default Login;
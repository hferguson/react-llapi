import React, {useRef} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

function Login({sendLogin})  {
	const username = useRef();
	const passwd = useRef();
	
	
	const handleLogin = (event) => {
		console.log("Got here");
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

function Container({nodeId, containerName, volumes}) {
	
	return (
		<div>
			<div className="folderHeader">Folder: {containerName}</div>
		</div>
		)
}

class ContentServer extends React.Component {
	baseURL = "http://win2012SQL008/OTCS/cs.exe";
	volumes = {};
	
	state = {
		loggedin: false,
		otcsticket: '',
		username: '',
		nodeId: -1
	};
	
	getEnterpriseWS = () => {
		const volumes = this.state.volumes;
		console.log("Getting Enterprise WS");
		for (let i=0;i<volumes.length;i++) {
			let vol = volumes[i];
			if (vol.type === 141) {
				console.log("Got Enterprise WS");
				this.setState({...this.state, 'nodeid' : vol.id, 'container_name' : vol.name});
				break;
			}
		}
	}
	
	getNodes = (nodeId) => {
		console.log(`Getting node IDs
	}
	
	getVolumes = () =>{
		if (!this.state.loggedin)
			return;
		const headers = {'otcsticket' : this.state.otcsticket};
		console.log(headers);
		axios({
				url : `${this.baseURL}/api/v1/volumes`, 
				method: 'get',
				headers: headers
			}).then((response) =>{
				this.getEnterpriseWS(response.data);
				this.setState({...this.state, 'volumes' : response.data}, () => {
					console.log("State of the state");
					console.log(this.state);
					this.getEnterpriseWS();
				});
				console.log(response.data);
			}).catch((error) => {
			console.log("Error caught");
			console.error(error);
			});
	}
	
	
	sendLogin = (user, pwd) => {
		console.log(`Username : ${user}`);
		if (user === null || user === undefined || user.length <=0)  {
			alert("Please enter a username");
			return;
		}
		const data = new FormData();
		data.append('username',  user);
		data.append('password', pwd);
		const headers = {
						'Content-Type' : 'application/x-www-form-urlencoded'
		}
		
		axios({method: 'post', 
			   url: `${this.baseURL}/api/v1/auth`, 
			   data: data,
			   headers: headers
		}).then((response) => {
				console.log("Response received");
				console.log(response);
				const data = response.data;
				const ticket = data.ticket;
				this.setState({'loggedin' : true, 'otcsticket' : ticket}, function() {
					this.getVolumes();
				});
		}).catch((error) => {
			console.log("Error caught");
			console.error(error);
		});
	}
	
	render() {
		return (
			<div className="csPage">
			{this.state.loggedin ? 
				<Container nodeId={this.state.nodeId} containerName={this.state.container_name} volumes={this.state.volumes} /> 
				: <Login sendLogin={this.sendLogin} />
			}
			</div>
			)
	}
}


ReactDOM.render(<ContentServer />, document.getElementById('root'));
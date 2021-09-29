import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Container from './Container';
import Login from './Login';




function ContentServer() {
	const baseURL = "http://localhost/OTCS/cs.exe";
	const baseHost = "http://localhost";
	
	const [prgCtx, setPrgCtx] = useState({
										loggedin: false,
										otcsticket: '',
										username: ''});
	
	//const [containerId, setContainerId] = useState(-1);
	//const [containerName, setContainerName] = useState('');
	const [container, setContainer] = useState({'id' : -1, 'name' : ''});
	const [volumes, setVolumes] = useState([]);			// all root volumes in the system
	const [nodes, setNodes] = useState([]);				// current folder listing
	const [sortCol,setSortCol] = useState('');			// current sort column
	const [sortDir, setSortDir] = useState('asc');		// sort direction 
	const [breadcrumbs, setBreadcrumbs] = useState([]);	// used for path to current node
	const [action, setAction] = useState({'id' :-1, 'actions': []});			// when user clicks on cmd onglets
	const [errMsg, setErrMsg] = useState('');			// Catch any error messages
	
	/**
	 * when user clicks "functions menu", use this to get list of actions.
	 * We take advantage of the fact that we got the correct action URL from
	 * the node object stored in the container component.
	 **/
	const getActions = (id, actionURL) => {
		const headers = {'otcsticket' : prgCtx.otcsticket};
		
		if (!prgCtx.loggedin) {
			return;
		}
		console.log("Calling actions REST...");
		axios({
				url : `${baseURL}/api/v1/nodes/${id}/actions`, 
				method: 'get',
				headers: headers
			}).then((response) =>{	
				// in response.action, we get all classic UI functions.
				// in response.data, have a single object with name=value pairs 
				// name is the cmd name, and value is the REST URL
				const actionObj = response.data.data;
				console.log(actionObj);
				let myActions = [];
				Object.keys(actionObj).map(key => {
					if (actionObj[key].length > 0) {
						let myAction = {'name' : key, 'url' : actionObj[key]};
						myActions.push(myAction);
					}
				});
				setAction({'id': id, 'actions': myActions});
			}).catch((error) => {

				handleApiError(error);
			});
	}
	/**
	 * Called after successful login and after volumes returned.
	 * It extracts the Enterprise WS from list of volumes and sets it as 
	 * current container node.
	 **/
	const getEnterpriseWS = () => {
		console.log("Getting Enterprise WS");
		getVolumeType(141);
	}
	
	const getPersonalWS = () => {
		getVolumeType(142);
	}
	
	/**
	 * Generalized call to get volume of a particular type.
	 * typeId is the Oscript node SubType (i.e. DTreeCore.SubType)
	 **/
	const getVolumeType = (typeId) => {
		for (let i=0;i<volumes.length;i++) {
			let vol = volumes[i];
			if (vol.type === typeId) {
				//console.log("Got Enterprise WS");
				//setContainerId(vol.id);
				//setContainerName(vol.name);
				setContainer({'id' : vol.id, 'name' : vol.name});
				break;
			}
		}
	}
	
	/**
	 * Called after login successfully via API
	 * to get all root volumes in the system.
	 * Typically only called at login
	 **/
	const getVolumes = () =>{
		
		const headers = {'otcsticket' : prgCtx.otcsticket};
		
		axios({
				url : `${baseURL}/api/v1/volumes`, 
				method: 'get',
				headers: headers
			}).then((response) =>{	
				console.log("Response from vols request");
				console.log(response.data.data);
				setVolumes(response.data.data);
			}).catch((error) => {

				handleApiError(error);
			});
	}
	
	/**
	  * Called from the Login component. Sends api auth POST request
	  * and receives the authentication token as part of the response.
	  * THe response is stored in the state variable prgCtx.
	  **/
	const sendLogin = (user, pwd) => {
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
			   url: `${baseURL}/api/v1/auth`, 
			   data: data,
			   headers: headers
		}).then((response) => {
				console.log("Response received to login");
				console.log(response);
				const data = response.data;
				const ticket = data.ticket;
				setPrgCtx({'loggedin' : true, 'otcsticket' : ticket, 'logintime' : new Date()});
		}).catch((error) => {
			console.log("Error caught");
			console.error(error);
		});
	}
	
	/**
	 * Helper function used to get the desired node out of the nodes state variable
	 * by matching on the id feature (DTreeCore.DataID)
	 **/
	const getNodeById = (nodeId) => {
		let retVal = undefined;
		if (nodeId == -1)
			return;
		for (let i=0;i<nodes.length;i++) {
			//console.log(i);
			if (nodes[i].id == nodeId) {
				retVal = nodes[i];
				//console.log("found it");
				break;
			}
		}
		return retVal;
	}
	
	/**
	 * Helper function that is used to tell if desired node is a container or a leaf.
	 * If it's a container, then we can drill into it like a folder. If not, it's likely 
	 * a document, shortcut or alias.
	 **/
	const isNodeContainer = (nodeId) => {
		let retVal = false;
		const node = getNodeById(nodeId);
		if (node != undefined) {
			//console.log(node);
			retVal = node.container;
		}
		return retVal;
	}
	
	/**
	 * General error handler for axios requests. Typically not called by the DOM but by 
	 * functions that use the REST API.
	 */
	const handleApiError = (error) => {
		let err = '';
		if (error.response) {
			const response = error.response;
			const status = response.status;
			console.log(response.data.error);
			err = response.data.error;
			if (status === 401) {
				// reset the prgCtx to zero
				//alert(errMsg);
				setPrgCtx({'loggedin' : false, 'otcsticket' : '', 'logintime' : null, 'username' : ''});
			} 
			console.log(error.response);
		} else  if (error.request) {
			err = "Request error";
			console.log(error.request);
		} else {
			err = "unknown error";
			console.log(error.request);
		}
		setErrMsg(err);
	}
	//**************************************************************
	//* Effects - these are functions that get called when a particular state variable 
	//* changes. The variable change(s) that invoke these are the last arg at the bottom of
	//* Each function.
	//
	/**
	 * Use this effect whenever user clicks on a new node
	 **/
	useEffect(() => {
		const headers = {'otcsticket' : prgCtx.otcsticket};
		// if not logged in, or if we don't actually have a container yet, ignore and return
		if (!prgCtx.loggedin && container.id == -1) {
			return;
		}
		setNodes([]);
		setAction({'id' : -1, 'actions' : []});
		//console.log("Fetching nodes");
		axios({
				url: `${baseURL}/api/v1/nodes/${container.id}/nodes`,
				method: 'get',
				headers: headers
			}).then((response) =>{	
				console.log("Response from nodes request");			
				console.log(response.data.data);
				// Set the node list going into our container component
				setNodes(response.data.data);
				// reset the breadcrumbs trail - append the just fetched node.
				// This works because we will have already set breadcrumbs to be the path up to 
				// the parent, and we just entered the child
				setBreadcrumbs([...breadcrumbs, {'id': container.id, 'name': container.name}]);
			}).catch((error) => {
				// TO DO: Sufrace this
				console.log("Error caught");
				console.error(error);
			});
				
	}, [container, prgCtx]);
	
	/** 
	 * called when nodes list for a folder updated
	 **/
	useEffect(() => {
		console.log("Nodes list:");
		console.log(nodes);
		setAction({'id' : -1, 'actions' : []});
	}, [nodes]);
	
	
	
	
	/** 
	 * Called when volumes list gets updated - this typically only happens when authenticating
	 * or reauthenticating
	 */
	useEffect(() => {
		if (!prgCtx.loggedin) {
			return;
		}
		console.log("volumes updated");
		console.log(volumes);
		getEnterpriseWS();
	}, [volumes, prgCtx]);
	
	
	
	/**
	 * Called when a login change has occurred.  If the response from sendLogin() is valid
	 * then this function will trigger fetching of volume nodes which will trigger getting
	 * the top level enterprise node.
	 **/
	useEffect(() => {
		//console.log("PrgCtx updated");
		//console.log(prgCtx);
		if (prgCtx.loggedin) {
			//console.log("Getting volumes");
			getVolumes();
		}
	}, [prgCtx]);
	
	//****************************************************************************
	//* Handler functions. These functions all take an event as an argument and 
	//* typically respond to onClick() or onChange() events in the DOM.
	//
	const eventHandlers = {
		/**
		 * This event handler handles the case where user clicks on a container node
		 * and spawns the appropriate fetch to get the children nodes. Ultimately this is
		 * what triggers the page to "drill" into the next folder down.
		 **/
		openContainer : (event) => {
			const target = event.target;
			const id = target.getAttribute('objid');
			//console.log(`Click detected for objId ${id}`);
			if (isNodeContainer(id)) {
				//console.log(target.innerText);
				setContainer({'id' : id, 'name' : target.innerText.trim()} );
			}
			
		},
		
		/**
		 * this handler allows user to click on breadcrumb trail and go back up one or more levels
		 * in the folder hierarcy
		 **/
		handleBreadcrumb : (event) => {
			console.log("handle breadcrumb");
			const target = event.target;
			const objId = target.getAttribute('objid');
			const pos = target.getAttribute('arraypos');
			let newCrumbs = []
			for (let i=0;i<Math.min(breadcrumbs.length, pos);i++) {
				 newCrumbs = [...newCrumbs, {'id' : breadcrumbs[i].id, 'name': breadcrumbs[i].name}];
			}
			setBreadcrumbs(newCrumbs);
			setContainer({'id' : objId, 'name' : target.innerText.trim()});
		},
		
		
		
		/** 
		 * Handler called when user clicks on column header to sort the nodes.
		 * Currently we are doing a sort of the nodes stored in the nodes state variable.
		 * We haven't updated this to handle the case where we are doing a paginated fetch
		 * via the API which would require refetching the current node and passing a sort parameter.
		 **/
		
		handleSort : (event) => {
			console.log("DEBUG sortNodes called");
			let sorted = 0;
			const target = event.target;
			const sortField = target.getAttribute('sorttype');
			const sortDir = target.getAttribute('sortdir');
			let directionModified = (sortDir === 'asc') ? 1 : -1;
			const sortedNodes = [].concat(nodes).sort((a, b) => {
				if (sortField === 'name') {
					sorted = (a.name > b.name) ? 1 : -1;
				} else if ( sortField === 'type') {
					sorted = (a.type > b.type) ? 1 : -1;
				} else if ( sortField === 'createdate') {
					sorted = (a.create_date > b.create_date) ? 1 : -1;
				} else if ( sortField === 'modifydate') {
					sorted = (a.modify_date > b.modify_date) ? 1 : -1;
				}
				sorted *= directionModified;
				return sorted;
			});
			let newSortDir = (sortDir === 'asc') ? 'desc' : 'asc';
			
			
			setSortCol(sortField);
			setSortDir(newSortDir);
			setNodes(sortedNodes);
		}
	}
	
	/**
	 * Local handler for the error panel
	 **/
	const handleClose = (event) => {
		const target = event.target;
		const alertDiv = target.parentElement;
		alertDiv.remove();
	}
	/**
	 * The main event. This renders the control and all child controls.
	 * if our state variable prgCtx has a valid OTCS ticket, it will display container
	 * component, otherwise, it will display a login page.
	 **/
	return (
			<div className="csPage">
			{errMsg.length ? 
				<div className="alert alert-danger alert-dismissible">
					{errMsg}
					<a href="#" className="close" onClick={handleClose} aria-label="close">&times;</a>
				</div> 
				: ''
			}
			{prgCtx.loggedin ? 
				<Container supportUrl={baseHost} 
						path={breadcrumbs} 
						container={container} 
						nodes={nodes} 
						actions={action}
						sortCol={sortCol} 
						sortDir={sortDir} 
						getActions={getActions} 
						eventHandlers={eventHandlers} />
				: <Login sendLogin={sendLogin} />
			}
			</div>
		)
	
}


ReactDOM.render(<ContentServer />, document.getElementById('root'));
import React from 'react';
import './CSObject.css';

function CSObject({urlPrefix, node, openContainer, getActions, actions, actionRef}) {
	const imgSrc = urlPrefix + node.icon;
	
	const handleCmds = (event) => {
		const target = event.target;
		const url = target.getAttribute('actionurl');
		const id = target.getAttribute('objid');
		console.log(`cmds link for id ${id} clicked: ${url}`);
			
		getActions(id, url);
	}
	return (
		<>
			<td><img src={imgSrc} alt={node.type_name}/></td>
			<td className="nodeLink" objid={node.id}  onClick={openContainer}>
				{node.name}
			</td>
			<td>
				{actions.id == node.id && actions.actions.length > 0 &&
					<div ref={actionRef} className="cs-popup">
						<ul className="cs-popup-list">
						<li className="cs-list-header" key={node.id}>Commands for {node.name}</li>
						{actions.actions.map(action => <li className="cs-list-elem" key={action.name}>{action.name}</li>)}
						</ul>
					</div>
				}
				<i className="fa fa-ellipsis-h" objid={node.id} actionurl={node.action_url} onClick={handleCmds}></i>
				
			</td>
			<td>{node.create_date}</td>
			<td>{node.modify_date}</td>
		</>
	);
}

export default CSObject;
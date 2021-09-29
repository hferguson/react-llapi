import React from 'react';
import './Trail.css';

function Trail({paths, handlePath}) {
	
	return (
		<div className="breadcrumb csPath">
		{paths.map((path, index) => {
			return (
			<span onClick={handlePath} className="csPathElem" objid={path.id} key={index} arraypos={index}>{path.name}</span>
		)})}
		</div>
	)
}

export default Trail;
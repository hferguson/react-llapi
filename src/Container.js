import React, {useRef, useEffect} from 'react';
import CSObject from './CSObject';
import Trail from './Trail';
import './Container.css';

/**
 * This function solely to catch the case, when the actions text-pop-up is active,
 * they click outside, and we want to close the text-pop-up
 */
function useOutsideAlerter(ref) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        ref.current.style.display = "none";
      }
    }
    // Bind the event listener to the document object so it takes effect everywhere
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}
/**
 * This file contains two components - the container component and the header column component.
 * The former represents a folder browse view, and the latter represents a single sortable column
 * with event handlers to handle sorting
 */
 
/**
 * this component represents a sortable header column. The Children prop represents the text passed
 * in for the column header title.
 **/
function HeaderCol({children,field, sorttype, currSort, sortdir, handleSort}) {
	
	
	let classes = "csHdrCol";
	let sortIcon ="";
	if (sorttype === currSort) {
		
		sortIcon = (sortdir === 'asc') ? 'fa fa-angle-down' : 'fa fa-angle-up';
	}
	
	return (
		
		<th scope="col" 
			className={classes} 
			sorttype={sorttype}
			sortdir={sortdir} 
			onClick={handleSort} 
			>
			{children}
			{sortIcon.length > 0 &&  <i className={sortIcon}></i> }
		</th>
		)
}

/**
 * This component represents a folder view (i.e. container).
 **/
function Container({supportUrl, path, container, actions, nodes, sortCol, sortDir, getActions, eventHandlers}) {
	const actionRef = useRef(null);
	useOutsideAlerter(actionRef);
	
	
	return (
		<div>
			<div className="folderHeader">Location: {container.name}</div>
			<div className="csPage">
				<div className="csPageSubHeader">
					<span>{nodes.length} children</span>
					<Trail paths={path} handlePath={eventHandlers.handleBreadcrumb} />
				</div>
				<table className="table table-hover table-striped">
					<thead>
						<tr>
							<HeaderCol sorttype="type" currSort={sortCol} sortdir={sortDir} handleSort={eventHandlers.handleSort}>&nbsp;</HeaderCol>
							<HeaderCol sorttype="name" currSort={sortCol} sortdir={sortDir} handleSort={eventHandlers.handleSort}>Name</HeaderCol>
							<th>&nbsp;</th>
							<HeaderCol sorttype="createdate" currSort={sortCol} sortdir={sortDir} handleSort={eventHandlers.handleSort}>Create Date</HeaderCol>
							<HeaderCol sorttype="modifydate" currSort={sortCol} sortdir={sortDir} handleSort={eventHandlers.handleSort}>Modify Date</HeaderCol>
						</tr>
					</thead>
				<tbody>
				{nodes.map(node => 
					<tr key={node.id}>
						<CSObject urlPrefix={supportUrl} node={node} openContainer={eventHandlers.openContainer} getActions={getActions} actions={actions} actionRef={actionRef} />
					 </tr>)}
				</tbody>
				</table>
			</div>
		</div>
		)
}
export default Container;
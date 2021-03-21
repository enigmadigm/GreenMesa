import React from 'react';
import * as H from 'history';
import ReactDOM from 'react-dom';

const root = document.getElementById("root");

export function Rootportal(props: {
    children?: React.ReactNode;
    location?: H.Location;
    show?: boolean;
}) {
    return root && (
        // Use a portal to render the children into the element
        ReactDOM.createPortal(
            props.children,
            // A DOM element
            root,
        )
    )
}
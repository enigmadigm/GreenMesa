import React from "react";
import { useLocation } from "react-router-dom";
import PacmanLoader from "react-spinners/PacmanLoader";
import "./Embark.css";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export function Embark() {
    const query = useQuery();
    const id = query.get("guild_id");

    React.useEffect(() => {
        setTimeout(() => {
            window.onunload = () => {
                if (id) {
                    window.opener.location.pathname = `/dash/${id}`;
                }
            }
            window.close();
        }, 2000)
    }, [id])

    return (
        <div className="embark-wrapper">
            <PacmanLoader color="#8bc5cd" />
        </div>
    )
}
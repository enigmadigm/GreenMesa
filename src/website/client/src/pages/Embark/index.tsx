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
    const [tron, setTron] = React.useState("");

    React.useEffect(() => {
        if (window.opener && window.parent && id) {
            setTron("Closing to dashboard")
        } else if (window.opener && window.parent) {
            setTron("Closing")
        } else if (id) {
            setTron("Redirecting to dashboard")
        } else {
            setTron("Enjoy infinitely loading")
        }
        setTimeout(() => {
            if (window.opener) {
                setTron("Goodbye")
                window.onunload = () => {
                    if (id) {
                        window.opener.location.pathname = `/dash/${id}`;
                    }
                }
                window.close();
            } else if (id) {
                setTron("Goodbye")
                window.location.pathname = `/dash/${id}`;
            } else {
                setTron("")
                // window.location.pathname = `/dash`;
            }
        }, 2000)
    }, [id])

    const altClick = () => {
        if (window.opener) {
            window.close();
        } else {
            window.location.pathname = "/dash";
        }
    }

    return (
        <div className="embark-container">
            <div className="embark-wrapper">
                <PacmanLoader color="#8bc5cd" />
            </div>
            <div className="embark-tron">
                {tron ? (
                    <div><button onClick={altClick}>{tron}</button></div>
                ) : null}
            </div>
        </div>
    )
}
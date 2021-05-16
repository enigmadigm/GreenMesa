import React from 'react';
import { DashboardMessage } from "../../../../../gm";
import { Rootportal } from '..';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './SuperMessage.css';

interface SuperMessageProps {
    value: DashboardMessage;
    set: React.Dispatch<React.SetStateAction<DashboardMessage>>
}

export function SuperMessage(props: SuperMessageProps) {
    const { value, set } = props;
    const [showing, setShowing] = React.useState<boolean>(false);
    const [editing, setEditing] = React.useState<boolean>(false);
    const [waiting, setWaiting] = React.useState<boolean>(false);
    const [em, setEm] = React.useState("");
    const [mc, setMc] = React.useState("");
    const modalWrapper = React.useRef(null);

    React.useEffect(() => {}, []);


    React.useEffect(() => {
        if (showing) {
            setTimeout(() => setMc("opaque"), 100)
        } else {
            setTimeout(() => setMc(""), 100)
        }
    }, [showing])

    const useOutsideClicker = (ref: React.MutableRefObject<any>) => {// https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
        React.useEffect(() => {
            /**
             * Alert if clicked on outside of element
             */
            function handleClickOutside(event: MouseEvent) {
                if (ref.current && !ref.current.contains(event.target)) {
                    handleCancelClick();
                }
            }

            // Bind the event listener
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                // Unbind the event listener on clean up
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [ref]);
    }

    useOutsideClicker(modalWrapper);

    const handleOkClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setShowing(false);
    };

    const handleCancelClick = () => {
        setShowing(false);
        set({ outside: "", embed: {} });
        setEm("");
    }

    const handleOpenClick = () => {
        handleCancelClick();
        if (!showing) {
            setEditing(false);
            setShowing(true);
        }
    }

    const handleOutsideChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const m = Object.assign({}, value);
        m.outside = e.target.value;
        set(m);
    }

    const handleFieldAdd = () => {
        if (!value.embed.fields) {
            value.embed.fields = [];
        }
        value.embed.fields.push({ name: "", value: "", inline: false });
    }

    const handleFieldDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: number) => {
    };

    return (
        <div>
            <button onClick={handleOpenClick}>open</button>
            {showing ? (
                <Rootportal show={showing}>
                    <div className="sm-super">
                        <div className={`sm-container ${mc}`} ref={modalWrapper}>
                            <div className="sm-form-container">
                                {em && (
                                    <div className="inline-error">
                                        {em}
                                    </div>
                                )}
                                <p style={{ fontWeight: 700, marginTop: 10, marginBottom: 5 }}>Message</p>
                                <textarea className="sm-txta"
                                    rows={7}
                                    placeholder="Enter message content"
                                    onChange={handleOutsideChange}
                                    value={value.outside}
                                ></textarea>
                                <br style={{ height: 5 }} />
                            </div>
                            <div className="sm-buttons">
                                <hr />
                                <button className="card-footer-button primary-button" onClick={handleOkClick}>Ok</button>
                                {/* <button className="card-footer-button twitch-cancel-bottom" onClick={handleCancelClick}>Cancel</button> */}
                            </div>
                        </div>
                    </div>
                </Rootportal>
            ) : null}
        </div>
    )
}

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
    const [em, setEm] = React.useState("");
    const [mc, setMc] = React.useState("");

    React.useEffect(() => {}, []);


    React.useEffect(() => {
        if (showing) {
            setTimeout(() => setMc("opaque"), 100)
        } else {
            setTimeout(() => setMc(""), 100)
        }
    }, [showing]);

    const handleCancelClick = () => {
        setShowing(false);
        set({ outside: "", embed: {} });
        setEm("");
    }

    const handleShowClick = () => {
        handleCancelClick();
        if (!showing) {
            setShowing(true);
        }
    }

    const handleOutsideChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const m = Object.assign({}, value);
        m.outside = e.target.value;
        set(m);
    }

    const handleFieldAdd = () => {
        const m = Object.assign({}, value);
        if (!m.embed.fields) {
            m.embed.fields = [];
        }
        m.embed.fields.push({ name: "", value: "", inline: false });
        set(m);
    }
    
    const handleFieldDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: number) => {
        const m = Object.assign({}, value);
        if (m.embed.fields && m.embed.fields.length) {
            m.embed.fields.splice(id, 1);
            set(m);
        }
    };

    return (
        <div>
            <button onClick={handleShowClick}>{showing ? "Close Creator" : "Show SuperMessage Creator"}</button>
            {showing ? (
                <div className={`sm-super ${mc}`}>
                    <div className="sm-form-container">
                        {em && (
                            <div className="inline-error">
                                {em}
                            </div>
                        )}
                        <input type="text" name="smicon" id="" />
                        <input type="text" name="smauthor" id="" />
                        <input type="text" name="smauthorurl" id="" />
                        <input type="text" name="smtitle" id="" />
                        <input type="text" name="smurl" id="" />
                        <input type="text" name="smdescription" id="" />
                        <input type="text" name="" id="" />
                        <input type="text" name="" id="" />
                        <input type="text" name="" id="" />
                        <input type="text" name="" id="" />
                        <textarea className="sm-txta"
                            rows={7}
                            placeholder="Enter message content"
                            onChange={handleOutsideChange}
                            value={value.outside}
                        ></textarea>
                        <br style={{ height: 5 }} />
                    </div>
                    {/* <div className="sm-buttons">
                        <hr />
                        <button className="primary-button" onClick={handleOkClick}>Ok</button>
                    </div> */}
                </div>

            ) : null}
        </div>
    )
}

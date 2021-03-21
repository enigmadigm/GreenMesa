import React from 'react';
import Select from 'react-select';
import { Center, Spinner } from '@chakra-ui/react';
import { ChannelData, ChannelEndpointData, TwitchEndpointData, TwitchSub } from '../../../../../gm';
import { HomeProps } from '../../pages/DashboardPage';
import { selectStylesMK1 } from '../DashboardAutomod/AutomoduleCard';
import { Rootportal } from '../Rootportal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit } from '@fortawesome/pro-light-svg-icons';
import { faTwitch } from '@fortawesome/free-brands-svg-icons';
import { faPlus } from '@fortawesome/pro-solid-svg-icons';
import PacmanLoader from "react-spinners/PacmanLoader";
import './Twitch.css';

export function DashboardTwitch(props: HomeProps) {
    const { setStatus } = props;
    const [loaded, setLoaded] = React.useState(false);
    const [channels, setChannels] = React.useState<ChannelData[]>([]);
    const [subs, setSubs] = React.useState<TwitchSub[]>([]);
    const [pending, setPending] = React.useState<TwitchSub>({ channel_id: "", streamer_id: "", streamer_login: "", message: "" });
    const [showing, setShowing] = React.useState<boolean>(false);
    const [editing, setEditing] = React.useState<boolean>(false);
    const [waiting, setWaiting] = React.useState<boolean>(false);
    const [typing, setTyping] = React.useState<Date>();
    const modalWrapper = React.useRef(null);

    React.useEffect(() => {
        fetch(`/api/discord/guilds/${props.meta.id}/twitch`)
            .then(x => x.json())
            .then((d: TwitchEndpointData) => {
                setSubs(d);
                return fetch(`/api/discord/guilds/${props.meta.id}/channels`);
            })
            .then(x => x.json())
            .then((d: ChannelEndpointData) => {
                setChannels(d.channels);
                setLoaded(true);
            })
            .catch(e => {
                setStatus(e.message);
                setLoaded(false);
            })
    }, [props, setStatus]);

    React.useEffect(() => {
        const tt = setInterval(() => {
            if ((Date.now() - (typing?.getTime() || 0)) / 1000) {
                //
            }
        }, 1000)
        return () => {
            clearInterval(tt);
        }
    }, [showing, typing])

    // React.useEffect(() => {
    //     console.log(pending);
    // }, [pending])

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

    const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setWaiting(true);
        const hdrs = new Headers();
        hdrs.append("Content-Type", "application/x-www-form-urlencoded");
        const fd = new URLSearchParams();
        fd.append("cid", pending.channel_id);
        fd.append("sid", pending.streamer_id);
        fd.append("login", pending.streamer_login);
        fd.append("message", pending.message);
        const obj = {
            method: 'PUT',
            headers: hdrs,
            body: fd
        };
        try {
            fetch(`/api/discord/guilds/${props.meta.id}/twitch`, obj)
                .then(x => x.json())
                .then((d) => {
                    if (d.success) {
                        setStatus({ msg: "Saved.", success: true });
                        setShowing(false);
                        setPending({ channel_id: "", streamer_id: "", streamer_login: "", message: "" });
                    } else {
                        setStatus({ msg: "Failed to save.", success: false });
                    }
                    setWaiting(false);
                }).catch(e => {
                    console.error(e);
                    setStatus({ msg: "Error", success: false });
                    setWaiting(false);
                });
        } catch (error) {
            console.error(error);
            setStatus({ msg: "Failed to save.", success: false });
            setWaiting(false);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string) => {
        try {
            fetch(`/api/discord/guilds/${props.meta.id}/twitch/${id}`, {
                method: "DELETE",
            })
                .then(x => x.json())
                .then((d) => {
                    if (d.success) {
                        setStatus({ msg: "Deleted", success: true });
                    } else {
                        setStatus({ msg: "Failed", success: false });
                    }
                }).catch(e => {
                    console.error(e);
                    setStatus({ msg: "Error", success: false });
                });
        } catch (error) {
            console.error(error);
            setStatus({ msg: "Error", success: false });
        }
    };

    const handleCancelClick = () => {
        setShowing(false);
        setPending({ channel_id: "", streamer_id: "", streamer_login: "", message: "" });
    }

    const handleChannelValueChange = (v: any) => {
        const m = Object.assign({}, pending);
        m.channel_id = v.value === "none" ? "" : v.value;
        setPending(m);
    }

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const m = Object.assign({}, pending);
        m.message = e.target.value;
        setPending(m);
    }

    const handleCreateClick = () => {
        handleCancelClick();
        if (!showing) {
            setEditing(false);
            setShowing(true);
        }
    }

    return loaded ? (
        <>
            <div style={{ width: "100%", padding: "0 15px", marginLeft: "auto", marginRight: "auto" }}>
                <br />
                <div className="control-row">
                    <div className="x-card-parent">
                        <div className="x-card">
                            <div className="x-card-header">Twitch Subscriptions</div>
                            <div className="x-card-body">
                                {subs.length ? (
                                    <div className="twitchcards">
                                        {subs.map(x => (
                                            <div className="twitchcard" key={x.streamer_id}>
                                                <div className="tc-left" onClick={() => {
                                                    setEditing(true);
                                                    setPending({ channel_id: x.channel_id, streamer_id: x.streamer_id, streamer_login: x.streamer_login, message: x.message });
                                                    setShowing(true);
                                                }}>
                                                    <div>{x.streamer_login}</div>
                                                </div>
                                                <div className="tc-center" onClick={() => {
                                                    setEditing(true);
                                                    setPending({ channel_id: x.channel_id, streamer_id: x.streamer_id, streamer_login: x.streamer_login, message: x.message });
                                                    setShowing(true);
                                                }}>
                                                    <div>#{channels.find(c => c.id === x.channel_id)?.name || "deleted-channel"}</div>
                                                </div>
                                                <div className="tc-buttons" >
                                                    <div>
                                                        <button onClick={(e) => {
                                                            handleDeleteClick(e, x.streamer_id);
                                                        }}><FontAwesomeIcon icon={faTrashAlt} /></button>
                                                        <button onClick={() => {
                                                            setEditing(true);
                                                            setPending({ channel_id: x.channel_id, streamer_id: x.streamer_id, streamer_login: x.streamer_login, message: x.message });
                                                            setShowing(true);
                                                        }}><FontAwesomeIcon icon={faEdit} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        No subscriptions exist for your server
                                    </>
                                )}
                                <button className="twitch-add" onClick={handleCreateClick}>
                                    <FontAwesomeIcon icon={faTwitch} />
                                    <FontAwesomeIcon icon={faPlus} style={{ fontSize: "1em", marginLeft: 10 }} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {showing ? (
                    <Rootportal show={showing}>
                        <div className="twitch-pm">
                            <div className="t-pu" ref={modalWrapper}>
                                {!waiting ? (
                                    <div style={{ padding: "1.25rem" }}>
                                        <p>{!!showing}</p>
                                        {editing ? (
                                            <p>Editing the subscription for <strong>{pending.streamer_login}</strong>.</p>
                                        ) : (
                                            <p>Setup a new subscription.</p>
                                        )}
                                        <p style={{ fontWeight: 700, marginTop: 20, marginBottom: 5 }}>Channel</p>
                                        <Select
                                            placeholder="None selected"
                                            options={[{ id: 'none', name: 'None' }, ...channels.filter(x => x.type === "text")/*.sort((a, b) => a.position - b.position)*/].map(c => {
                                                return { value: c.id, label: `${c.id !== "none" ? `#${c.name}` : c.name}` };
                                            })}
                                            menuPlacement="auto"
                                            value={pending.channel_id ? { value: pending.channel_id, label: channels.find(c => c.id === pending.channel_id)?.name } : { label: "None selected" }}
                                            onChange={handleChannelValueChange}
                                            styles={selectStylesMK1}
                                        />
                                        <p style={{ fontWeight: 700, marginTop: 10, marginBottom: 5 }}>Message</p>
                                        <textarea className="tc-ta"
                                            cols={30}
                                            rows={10}
                                            placeholder={`${pending.streamer_login} is live! Go check out {name} at {link}`}
                                            onChange={handleMessageChange}
                                        ></textarea>
                                        <br />
                                        <div className="tpu-buttons">
                                            <button className="card-footer-button" onClick={handleSaveClick}>Save</button>
                                            <button className="card-footer-button twitch-cancel-bottom" onClick={handleCancelClick}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="waiting-wrapper">
                                        <PacmanLoader color="rgb(100, 65, 164)" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </Rootportal>
                ) : null}
            </div>
        </>
    ) : (
        <Center className="lspinner">
            <Spinner color="red.500" size="xl" css="margin:auto" />
        </Center>
    )
}
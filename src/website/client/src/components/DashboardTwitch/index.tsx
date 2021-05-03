import React from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { Center, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Spinner } from '@chakra-ui/react';
import { ChannelData, ChannelEndpointData, TwitchEndpointData, TwitchSearchChannelsReturns, TwitchSub } from '../../../../../gm';
import { HomeProps } from '../../pages/DashboardPage';
import { selectStylesMK1 } from '../DashboardAutomod/AutomoduleCard';
import { Rootportal } from '../Rootportal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit } from '@fortawesome/pro-light-svg-icons';
import { faTwitch } from '@fortawesome/free-brands-svg-icons';
import { faPlus } from '@fortawesome/pro-solid-svg-icons';
import PacmanLoader from "react-spinners/PacmanLoader";
import './Twitch.css';
import { stringSimilarity } from '../../utils/parsers';

// export const selectStylesMK3: Partial<Styles<OptionTypeBase, true, GroupTypeBase<OptionTypeBase>>> = {
//     ...selectStylesMK1,
// }

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export function DashboardTwitch(props: HomeProps) {
    const { setStatus } = props;
    const [loaded, setLoaded] = React.useState(false);
    const [channels, setChannels] = React.useState<ChannelData[]>([]);
    const [subs, setSubs] = React.useState<TwitchSub[]>([]);
    const [pending, setPending] = React.useState<TwitchSub>({ channel_id: "", streamer_id: "", streamer_login: "", message: "", delete_after: -1, notified: 0 });
    const [showing, setShowing] = React.useState<boolean>(false);
    const [editing, setEditing] = React.useState<boolean>(false);
    const [waiting, setWaiting] = React.useState<boolean>(false);
    const [em, setEm] = React.useState("");
    const [mc, setMc] = React.useState("");
    const modalWrapper = React.useRef(null);
    //const [typing, setTyping] = React.useState<number>(0);

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

    // React.useEffect(() => {
    //     const tt = setInterval(() => {
    //         if ((Date.now() - (typing?.getTime() || 0)) / 1000) {
    //             //
    //         }
    //     }, 1000)
    //     return () => {
    //         clearInterval(tt);
    //     }
    // }, [showing, typing])

    // React.useEffect(() => {
    //     console.log(pending);
    // }, [pending])

    React.useEffect(() => {
        if (showing) {
            setTimeout(() => setMc("opaque"), 100)
        } else {
            setTimeout(() => setMc(""), 100)
        }
    }, [showing]);

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
        if (!pending.channel_id || !pending.streamer_id) return;
        setWaiting(true);
        const hdrs = new Headers();
        hdrs.append("Content-Type", "application/x-www-form-urlencoded");
        const fd = new URLSearchParams();
        fd.append("cid", pending.channel_id);
        fd.append("sid", pending.streamer_id);
        fd.append("login", pending.streamer_login);
        fd.append("message", pending.message);
        fd.append("delafter", `${pending.delete_after}`);
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
                        setPending({ channel_id: "", streamer_id: "", streamer_login: "", message: "", delete_after: -1, notified: 0 });
                        setEm("");
                    } else {
                        setStatus({ msg: "Failed save", success: false });
                        setEm(`There was an error in the backend, you may need to report it. ${d.error && `MSG: ${d.error}`}`);
                    }
                    setWaiting(false);
                }).catch(e => {
                    console.error(e);
                    setStatus({ msg: "Error", success: false });
                    setEm(e.message);
                    setWaiting(false);
                });
        } catch (error) {
            console.error(error);
            setStatus({ msg: "Failed save", success: false });
            setEm(error.message);
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
        setPending({ channel_id: "", streamer_id: "", streamer_login: "", message: "", delete_after: -1, notified: 0 });
        setEm("");
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

    let t = 0;
    const loadStreamOptions = async (inputValue: string) => {
        try {
            const nt = t + 1;
            t = nt;
            await sleep(500);
            if (t === nt) {
                const r = await fetch(`/api/twitch/search?q=${encodeURIComponent(inputValue)}&l=50`);
                const j: TwitchSearchChannelsReturns[] = await r.json();
                const streamers = j.map(x => {
                    return { label: x.display_name || x.broadcaster_login, value: x.id };
                }).filter(x => !subs.find(x1 => x1.streamer_id === x.value)).sort((a,b) => {
                    return (stringSimilarity(a.label, inputValue) > stringSimilarity(b.label, inputValue) ? -1 : 1);
                });
                return streamers;
            }
            return [];
        } catch (error) {
            console.error(error);
            return [{ label: "Could not load", value: "", isDisabled: true }];
        }
    }

    const handleStreamerValueChange = (v: any) => {
        const m = Object.assign({}, pending);
        m.streamer_id = v.value;
        m.streamer_login = v.label;
        setPending(m);
    }

    const formatThreshold = (val: number) => `${isNaN(val) || val < -1 ? -1 : val} notifications`
    const parseThreshold = (val: string) => parseInt(val.replace(/[\sA-Za-z]/g, ""), 10);
    const onThresholdChange = (valueAsString: string, valueAsNumber: number) => {
        const val = parseThreshold(valueAsString);
        const m = Object.assign({}, pending);
        m.delete_after = isNaN(val) || val < -1 ? -1 : val;
        setPending(m);
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
                                                    setPending({ channel_id: x.channel_id, streamer_id: x.streamer_id, streamer_login: x.streamer_login, message: x.message, delete_after: x.delete_after, notified: x.notified });
                                                    setShowing(true);
                                                }}>
                                                    <div>{x.streamer_login}</div>
                                                </div>
                                                <div className="tc-center" onClick={() => {
                                                    setEditing(true);
                                                    setPending({ channel_id: x.channel_id, streamer_id: x.streamer_id, streamer_login: x.streamer_login, message: x.message, delete_after: x.delete_after, notified: x.notified });
                                                    setShowing(true);
                                                }}>
                                                    <div>#{channels.find(c => c.id === x.channel_id)?.name || "deleted-channel"}</div>
                                                </div>
                                                <div className="tc-buttons" >
                                                    <div>
                                                        <button className="tc-cancel" onClick={(e) => {
                                                            handleDeleteClick(e, x.streamer_id);
                                                        }}><FontAwesomeIcon icon={faTrashAlt} /></button>
                                                        <button onClick={() => {
                                                            setEditing(true);
                                                            setPending({ channel_id: x.channel_id, streamer_id: x.streamer_id, streamer_login: x.streamer_login, message: x.message, delete_after: x.delete_after, notified: x.notified });
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
                                    <div className="twitch-add-front">
                                        <FontAwesomeIcon icon={faTwitch} />
                                        <FontAwesomeIcon icon={faPlus} style={{ fontSize: "1em", marginLeft: 10 }} />
                                    </div>
                                    <div className="twitch-add-middle"></div>
                                    <div className="twitch-add-back"></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {showing ? (
                    <Rootportal show={showing}>
                        <div className="twitch-pm">
                            <div className={`t-pu ${mc}`} ref={modalWrapper}>
                                {!waiting ? (
                                <>
                                    <div className="tpu-form-container">
                                        {em && (
                                            <div className="inline-error">
                                                {em}
                                            </div>
                                        )}
                                        <p>{!!showing}</p>
                                        {editing ? (
                                            <p>Editing the subscription for <strong>{pending.streamer_login}</strong>.</p>
                                        ) :
                                        (
                                        <>
                                            <p>Setup a new <FontAwesomeIcon icon={faTwitch} style={{ color: "rgb(100, 65, 164)" }} /> subscription.</p>
                                            <p style={{ fontWeight: 700, marginTop: 10, marginBottom: 5 }}>Streamer</p>
                                            <AsyncSelect styles={selectStylesMK1}
                                                loadOptions={loadStreamOptions}
                                                noOptionsMessage={() => 'Type something'}
                                                cacheOptions
                                                onChange={handleStreamerValueChange}
                                            />
                                            <p style={{ color: "rgba(209, 105, 142, 0.8)", marginTop: 5, fontSize: "0.9em" }}><i>Only channels that have streamed in the last <strong>six (6)</strong> months will be shown.</i></p>
                                        </>
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
                                        <p style={{ opacity: 0.8, marginTop: 5, fontSize: "0.9em" }}>Placeholders: <i>{'{name} {link} {game} {title}'}</i></p>
                                        <textarea className="tc-ta"
                                            rows={7}
                                            placeholder={`{name} just went live!\n{link}`}
                                            onChange={handleMessageChange}
                                            value={pending.message}
                                        ></textarea>
                                        <br style={{ height: 5 }} />
                                        <p style={{ fontWeight: 700 }}>Delete Notifier After:</p>
                                        <div className="tc-delafter">
                                            <NumberInput defaultValue={-1} value={formatThreshold(pending.delete_after)} onChange={onThresholdChange}>
                                                <NumberInputField />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </div>
                                    </div>
                                    <div className="tpu-buttons">
                                        <hr/>
                                            <button className="card-footer-button primary-button" onClick={handleSaveClick} disabled={!pending.channel_id || !pending.streamer_id}>{editing ? "Save" : "Create"}</button>
                                            {(!pending.channel_id || !pending.streamer_id) && <span style={{ color: "red", marginLeft: 10 }}>Missing options</span>}
                                        <button className="card-footer-button twitch-cancel-bottom" onClick={handleCancelClick}>Cancel</button>
                                    </div>
                                </>
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
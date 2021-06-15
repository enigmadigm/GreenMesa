import React from 'react';
import Select from 'react-select';
import { Center, Spinner } from '@chakra-ui/react';
import { ChannelData, DashboardMessage, MovementData, MovementEndpointData } from '../../../../../gm';
import { HomeProps } from '../../pages/DashboardPage';
import { selectStylesMK1 } from '../DashboardAutomod/AutomoduleCard';
import { isEqual } from 'lodash';
import { SuperMessage } from '../SuperMessage';
//TODO: add an accent color picker and make it a border that shows up along the entire left side of the builder (including close button)
type PickByValueType<T, U> = {// https://github.com/microsoft/TypeScript/issues/38646
    [K in keyof T as T[K] extends U ? K : never]: T[K]
}

export function DashboardMovement(props: HomeProps) {
    const { setStatus } = props;
    const [loaded, setLoaded] = React.useState(false);
    const [channels, setChannels] = React.useState<ChannelData[]>([]);
    const [data, setData] = React.useState<MovementData>({ add_channel: "", depart_channel: "", depart_message: { outside: "", embed: {} }, dm_message: { outside: "", embed: {} }, add_message: { outside: "", embed: {} } });
    const [original, setOriginal] = React.useState<MovementData>({ add_channel: "", depart_channel: "", depart_message: { outside: "", embed: {} }, dm_message: { outside: "", embed: {} }, add_message: { outside: "", embed: {} } });
    const [unsaved, setUnsaved] = React.useState(false);

    const goFetch = React.useCallback(() => {
        fetch(`/api/discord/guilds/${props.meta.id}/movement`)
            .then(x => x.json())
            .then((d: MovementEndpointData) => {
                setData(d.data);
                setOriginal(d.data);
                setChannels(d.channels);
                setLoaded(true);
            })
            .catch(e => {
                setStatus(e.message);
                setLoaded(false);
            })
    }, [props.meta.id, setStatus]);

    React.useEffect(() => {
        goFetch();
    }, [goFetch, props.meta.id, setStatus]);

    React.useEffect(() => {
        // console.group("data")
        // console.log("isequal", isEqual(JSON.parse(JSON.stringify(original)), JSON.parse(JSON.stringify(data))))
        // console.log("actually the same", original.add_message.embed === data.add_message.embed)
        // console.log("original", original.add_message.embed.authorname)
        // console.log("data", data.add_message.embed.authorname)
        // console.groupEnd()
        if (!isEqual(data, original) && !unsaved) {
            setUnsaved(true);
            return;
        }
        else if (isEqual(data, original)) {
            setUnsaved(false);
            return;
        }
    }, [data, original, unsaved])

    const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const hdrs = new Headers();
        hdrs.append("Content-Type", "application/json");
        const s = JSON.stringify(data);
        const obj = {
            method: 'PUT',
            headers: hdrs,
            body: s,
        };
        try {
            fetch(`/api/discord/guilds/${props.meta.id}/movement`, obj)
                .then(x => {
                    if (x.status === 200) {
                        setStatus({ msg: "Saved.", success: true });
                        goFetch();
                    } else {
                        setStatus({ msg: "Failed to save.", success: false });
                    }
                }).catch(e => {
                    console.error(e);
                    setStatus({ msg: "Error", success: false });
                });
        } catch (error) {
            console.error(error);
            setStatus({ msg: "Failed to save.", success: false });
        }
    };

    const handleResetClick = () => {
        setData(Object.assign({}, original));
    }

    const handleChannelValueChange = (v: any, s: 'add' | 'depart') => {
        const m = Object.assign({}, data);
        if (s === 'add') {
           m.add_channel = v.value === "none" ? "" : v.value;
        }
        if (s === 'depart') {
           m.depart_channel = v.value === "none" ? "" : v.value;
        }
        setData(m);
    }

    // const handleCheck = (e: any) => {
    //     const m = Object.assign({}, data);
    //     const name: keyof typeof LoggingFlags = e.target.name;
    //     if (e.target.checked) {
    //         m.events = m.events | LoggingFlags[name];
    //     } else {
    //         m.events = m.events & ~(LoggingFlags[name]);
    //     }
    //     setData(m);
    // }

    // const handleChannelsValueChange = (v: OptionsType<OptionTypeBase>) => {
    //     const m = Object.assign({}, data);
    //     m.ignored_channels = v.map(v1 => v1.value);
    //     setData(m);
    // }

    const setAMessage = (m: DashboardMessage, name: keyof PickByValueType<MovementData, DashboardMessage>) => {
        const d = Object.assign({}, data);
        d[name] = m;
        setData(d);
    }

    return loaded ? (
        <>
            <div style={{ width: "100%", padding: "0 15px", marginLeft: "auto", marginRight: "auto" }}>
                <br />
                <div className="control-row">
                    <div className="x-card-parent">
                        <div className="x-card">
                            <div className="x-card-header">Member Movement</div>
                            <div className="x-card-body">
                                <p>Make the bot respond to various types of member movement, such as joining and leaving a server.</p>
                            </div>
                        </div>
                    </div>
                    <div className="x-card-parent">
                        <div className="x-card">
                            <div className="x-card-header">Welcome Callout</div>
                            <div className="x-card-body">
                                <p style={{ marginBottom: 15 }}>Send a message in a channel when a member joins.</p>
                                <p style={{ fontWeight: 700, marginTop: 20 }}>Channel:</p>
                                <Select
                                    placeholder="No channel"
                                    options={[{ id: 'none', name: 'None' }, ...channels.filter(x => x.type === "text").sort((a, b) => a.position - b.position)].map(c => {
                                        return { value: c.id, label: `${c.id !== "none" ? `#${c.name}` : c.name}` };
                                    })}
                                    menuPlacement="auto"
                                    value={data.add_channel ? { value: data.add_channel, label: channels.find(c => c.id === data.add_channel)?.name } : { label: "No channel" }}
                                    onChange={(e) => handleChannelValueChange(e, 'add')}
                                    styles={selectStylesMK1}
                                />
                                <br />
                                <SuperMessage value={data.add_message} set={(m) => setAMessage(m, 'add_message')} />
                            </div>
                        </div>
                    </div>
                    <div className="x-card-parent">
                        <div className="x-card">
                            <div className="x-card-header">Welcome DM</div>
                            <div className="x-card-body">
                                <p style={{ marginBottom: 15 }}>Send a message to a member's DMs when they join.</p>
                                <SuperMessage value={data.dm_message} set={(m) => setAMessage(m, 'dm_message')} />
                            </div>
                        </div>
                    </div>
                    <div className="x-card-parent">
                        <div className="x-card">
                            <div className="x-card-header">Egress Callout</div>
                            <div className="x-card-body">
                                <p style={{ marginBottom: 15 }}>Send a message in a channel when a member leaves.</p>
                                <p style={{ fontWeight: 700, marginTop: 20 }}>Channel:</p>
                                <Select
                                    placeholder="No channel"
                                    options={[{ id: 'none', name: 'None' }, ...channels.filter(x => x.type === "text").sort((a, b) => a.position - b.position)].map(c => {
                                        return { value: c.id, label: `${c.id !== "none" ? `#${c.name}` : c.name}` };
                                    })}
                                    menuPlacement="auto"
                                    value={data.depart_channel ? { value: data.depart_channel, label: channels.find(c => c.id === data.depart_channel)?.name } : { label: "No channel" }}
                                    onChange={(e) => handleChannelValueChange(e, 'depart')}
                                    styles={selectStylesMK1}
                                />
                                <br />
                                <SuperMessage value={data.depart_message} set={(m) => setAMessage(m, 'depart_message')} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {unsaved ? (
                <div className="save-notice">
                    <div className="save-container">
                        <div className="save-contents">
                            <div className="save-text">Unsaved</div>
                            <div className="save-buttons">
                                <button className="reset-button" onClick={handleResetClick}>Reset</button>
                                <button className="save-button" onClick={handleSaveClick}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : <></>}
        </>
    ) : (
        <Center className="lspinner">
            <Spinner color="red.500" size="xl" css="margin:auto" />
        </Center>
    )
}
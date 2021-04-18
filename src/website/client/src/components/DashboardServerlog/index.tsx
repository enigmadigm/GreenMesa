import React from 'react';
import Select, { OptionsType, OptionTypeBase } from 'react-select';
import { Center, Spinner } from '@chakra-ui/react';
import { ChannelData, ChannelEndpointData, ServerlogData, ServerlogEndpointData } from '../../../../../gm';
import { HomeProps } from '../../pages/DashboardPage';
import { selectStylesMK1 } from '../DashboardAutomod/AutomoduleCard';
import { isEqual } from 'lodash';

import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { titleCase } from '../../utils/parsers';

const LoggingFlags = {
    ALL_EVENTS: 1 << 14,
    MEMBER_STATE: 1 << 0,
    MEMBER_UPDATE: 1 << 11,
    NICKNAME_UPDATE: 1 << 10,
    MESSAGE_DELETION: 1 << 1,
    MESSAGE_UPDATE: 1 << 2,
    ROLE_CREATION: 1 << 3,
    ROLE_DELETION: 1 << 4,
    CHANNEL_CREATION: 1 << 5,
    CHANNEL_DELETION: 1 << 6,
    CHANNEL_UPDATE: 1 << 7,
    EMOJI_CREATION: 1 << 8,
    EMOJI_DELETION: 1 << 9,
    VOICE_ANY: 1 << 12,
    OTHER_EVENTS: 1 << 13
};
// 16383 this figure is outdated because of additional options

type logtypes = 'log_channel' | 'member_channel' | 'server_channel' | 'voice_channel' | 'messages_channel' | 'movement_channel';
interface LogChannelSelectProps {
    channels: ChannelData[];
    data: ServerlogData;
    ch(v: any, s: logtypes): void;
    cat: logtypes;
}

export function LogChannelSelect(props: LogChannelSelectProps) {
    const { data, channels, ch, cat } = props;
    return (
        <>
            <Select
                placeholder="No channel"
                options={[{ id: 'none', name: 'None' }, ...channels.filter(x => x.type === "text")/*.sort((a, b) => a.position - b.position)*/].map(c => {
                    return { value: c.id, label: `${c.id !== "none" ? `#${c.name}` : c.name}` };
                })}
                menuPlacement="auto"
                value={data[cat] ? { value: data[cat], label: channels.find(c => c.id === data[cat])?.name } : { label: "No channel" }}
                onChange={(e) => ch(e, cat)}
                styles={selectStylesMK1}
            />
        </>
    )
}

export function DashboardServerlog(props: HomeProps) {
    const { setStatus } = props;
    const [loaded, setLoaded] = React.useState(false);
    //const [roles, setRoles] = React.useState<RoleData[]>([]);
    const [channels, setChannels] = React.useState<ChannelData[]>([]);
    const [data, setData] = React.useState<ServerlogData>({
        log_channel: "",
        member_channel: "",
        server_channel: "",
        voice_channel: "",
        messages_channel: "",
        movement_channel: "",
        ignored_channels: [],
        events: 0
    });
    const [original, setOriginal] = React.useState<ServerlogData>({
        log_channel: "",
        member_channel: "",
        server_channel: "",
        voice_channel: "",
        messages_channel: "",
        movement_channel: "",
        ignored_channels: [],
        events: 0
    });
    const [unsaved, setUnsaved] = React.useState(false);

    React.useEffect(() => {
        fetch(`/api/discord/guilds/${props.meta.id}/serverlog`)
            .then(x => x.json())
            .then((d: ServerlogEndpointData) => {
                setData(d);
                setOriginal(d);
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
        hdrs.append("Content-Type", "application/x-www-form-urlencoded");
        const fd = new URLSearchParams();
        const stringConf = JSON.stringify(data);
        fd.append("data", `${stringConf}`);
        const obj = {
            method: 'PUT',
            headers: hdrs,
            body: fd
        };
        try {
            fetch(`/api/discord/guilds/${props.meta.id}/serverlog`, obj)
                .then(x => x.json())
                .then((d) => {
                    if (d.guild.data) {
                        setStatus({ msg: "Saved.", success: true });
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
        setData(original);
    }

    const handleChannelValueChange = (v: any, s: logtypes) => {
        const m = Object.assign({}, data);
        m[s] = v.value === "none" ? "" : v.value;
        console.log(v.value)
        console.log(s)
        console.log(m)
        setData(m);
    }

    const handleCheck = (e: any) => {
        const m = Object.assign({}, data);
        const name: keyof typeof LoggingFlags = e.target.name;
        if (e.target.checked) {
            m.events = m.events | LoggingFlags[name];
        } else {
            m.events = m.events & ~(LoggingFlags[name]);
        }
        setData(m);
    }

    const handleChannelsValueChange = (v: OptionsType<OptionTypeBase>) => {
        const m = Object.assign({}, data);
        m.ignored_channels = v.map(v1 => v1.value);
        setData(m);
    }

    return loaded ? (
        <>
            <div style={{ width: "100%", padding: "0 15px", marginLeft: "auto", marginRight: "auto" }}>
                <br />
                <div className="control-row">
                    <div className="x-card-parent">
                        <div className="x-card">
                            <div className="x-card-header">Log Channels</div>
                            <div className="x-card-body">
                                <p>Select the locations where the different log event types should be routed.</p>
                                <p style={{ fontWeight: 700, marginTop: 20 }}>Default Channel:</p>
                                <LogChannelSelect {...{data, channels}} ch={handleChannelValueChange} cat="log_channel" />
                                <p style={{ fontWeight: 700, marginTop: 10 }}>Members:</p>
                                <LogChannelSelect {...{ data, channels }} ch={handleChannelValueChange} cat="member_channel" />
                                <p style={{ fontWeight: 700, marginTop: 10 }}>Messages:</p>
                                <LogChannelSelect {...{ data, channels }} ch={handleChannelValueChange} cat="messages_channel" />
                                <p style={{ fontWeight: 700, marginTop: 10 }}>Join / Leave:</p>
                                <LogChannelSelect {...{ data, channels }} ch={handleChannelValueChange} cat="movement_channel" />
                                <p style={{ fontWeight: 700, marginTop: 10 }}>Server:</p>
                                <LogChannelSelect {...{ data, channels }} ch={handleChannelValueChange} cat="server_channel" />
                                <p style={{ fontWeight: 700, marginTop: 10 }}>Voice:</p>
                                <LogChannelSelect {...{ data, channels }} ch={handleChannelValueChange} cat="voice_channel" />
                                <p style={{ fontWeight: 700, marginTop: 20 }}>Ignored Channels:</p>
                                <Select
                                    placeholder="Select channels . . ."
                                    isMulti
                                    options={channels.map(c => {
                                        return { value: c.id, label: `#${c.name}` };
                                    })}
                                    menuPlacement="auto"
                                    value={data.ignored_channels.map(c => {
                                        const cr = channels.find(x => x.id === c);
                                        if (cr) {
                                            return { value: cr.id, label: `#${cr.name}` };
                                        } else {
                                            return {};
                                        }
                                    })}
                                    onChange={handleChannelsValueChange}
                                    styles={selectStylesMK1}
                                />
                                <p style={{ color: "rgba(228,231,234, 0.8)", marginTop: 5 }}><i>Events in these channels will not be logged.</i></p>
                            </div>
                        </div>
                    </div>
                    <div className="x-card-parent">
                        <div className="x-card">
                            <div className="x-card-header">Event Selection</div>
                            <div className="x-card-body">
                                <p style={{ marginBottom: 15 }}>Toggle the events that will be logged.</p>
                                <FormControl component="fieldset">
                                    <FormGroup style={{ flexDirection: "row" }}>
                                        {Object.keys(LoggingFlags).map((f: any) => {
                                            const name: keyof typeof LoggingFlags = f;
                                            return (
                                                <FormControlLabel key={name}
                                                    control={<Checkbox checked={(data.events & LoggingFlags[name]) === LoggingFlags[name]} onChange={handleCheck} name={f} />}
                                                    label={titleCase(f.toLowerCase().split("_").join(" "))}
                                                    style={{ flex: "1 1 40%" }}
                                                />
                                            )
                                        })}
                                    </FormGroup>
                                </FormControl>
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
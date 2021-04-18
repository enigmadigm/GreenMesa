import { Center, Spinner } from '@chakra-ui/react';
import { faCheckCircle } from '@fortawesome/pro-solid-svg-icons';
import { faEdit, faSkull, faStarfighter, faTimesCircle } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { ChannelData, CommandConf, CommandsEndpointData, CommandsGlobalConf, RoleData } from '../../../../../gm';
import { HomeProps } from '../../pages/DashboardPage';
import { titleCase } from '../../utils/parsers';
import "./Commands.css";

interface CmdCat {
    name: string;
    count: number;
    // show: boolean;
}

function isEnabled(c: CommandConf) {
    return (c.enabled || !c.channel_mode || c.channels.length);
}

export function DashboardCommands(props: HomeProps) {
    const { setStatus } = props;

    const [loaded, setLoaded] = React.useState(false);
    const [commands, setCommands] = React.useState<CommandConf[]>([]);
    const [globalConf, setGlobalConf] = React.useState<CommandsGlobalConf>({});
    const [categories, ] = React.useState<CmdCat[]>([]);
    const [channels, setChannels] = React.useState<ChannelData[]>([]);
    const [roles, setRoles] = React.useState<RoleData[]>([]);
    const [selectedCmds, setSelectedCmds] = React.useState<string[]>([]);// the commands that should be shown as selected on the dashboard
    const [selectedCats, setSelectedCats] = React.useState<string[]>([]);// the cats that should be shown as selected on the dashboard
    const [applying, setApplying] = React.useState<string[]>([]);// the commands that the settings will actually be applied to on the dashboard
    const [pending, setPending] = React.useState<CommandConf>({name: "", enabled: true, channel_mode: false, role_mode: false, channels: [], roles: [], default_cooldown: 0});

    React.useEffect(() => {
        fetch(`/api/discord/guilds/${props.meta.id}/commands`)
            .then(x => x.json())
            .then((d: CommandsEndpointData) => {
                setCommands(d.commands);
                setGlobalConf(d.global);
                setChannels(d.channels);
                setRoles(d.roles);
                setLoaded(true);
            })
            .catch(e => {
                setStatus(e.message);
                setLoaded(false);
            })
    }, [props, setStatus]);

    React.useEffect(() => {
        commands.forEach(c => {
            const cat = categories.find(x => x.name === c.category);
            if (!cat) {
                categories.push({
                    name: c.category || "",
                    count: commands.reduce((p, curr) => curr.category === c.category ? p + 1 : p, 0),
                    // show: false,
                });
            }
        })
    }, [categories, commands])

    const handleCatCheck = (e: any) => {
        const target = e.target;
        if (target.type !== "checkbox") return;
        const name = target.name;
        const ck = !!target.checked;
        const category = categories.find(x => x.name === name);
        if (category) {
            if (ck && !selectedCats.includes(name)) {
                setSelectedCats([...selectedCats, name]);
            } else {
                setSelectedCats(categories.map(x => x.name).filter(x => selectedCats.includes(x) && x !== name));
            }
        }
    }

    const handleCmdCheck = (e: any) => {
        const target = e.target;
        if (target.type !== "checkbox") return;
        const name = target.name;
        const ck = !!target.checked;
        if (ck && !selectedCmds.includes(name)) {
            setSelectedCmds([...selectedCmds, name]);
        } else {
            setSelectedCmds(commands.map(x => x.name).filter(x => selectedCmds.includes(x) && x !== name));
        }
    }


    return loaded ? (
        <div style={{ width: "100%", padding: "0 15px", marginLeft: "auto", marginRight: "auto" }}>
            <br />
            <div className="control-row">
                <div className="x-card-parent" style={{width: "100%", position: "relative"}}>
                    <div className="x-card point-cb" style={{width: "100%"}}>
                        <div className="x-card-header">Commands</div>
                        <div className="x-card-body">
                            <div className="c-cats">
                                {categories.map((cat) => (
                                    <div className="c-cat" key={cat.name}>
                                        <label htmlFor={`ccc-${cat.name}`}>
                                            <input type="checkbox" id={`ccc-${cat.name}`} name={cat.name} value={`${titleCase(cat.name)} (${cat.count})`} checked={selectedCats.includes(cat.name)} onChange={handleCatCheck} style={{visibility: "hidden"}} />
                                            <span style={{ marginRight: 3, color: selectedCats.includes(cat.name) ? "#4db2aa" : "#b7202c", fontSize: "1.1em" }}>
                                                {selectedCats.includes(cat.name) ? <FontAwesomeIcon icon={faCheckCircle} /> : <FontAwesomeIcon icon={faTimesCircle} />}
                                            </span>
                                            {titleCase(cat.name)} ({cat.count})
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="ccards">
                                {commands.filter(x => selectedCats.includes(x.category || "")).sort((a, b) => (b.description_edited || b.description_short || "").length - (a.description_edited || a.description_short || "").length).map(cmd => (
                                    <div className="ccard">
                                        <div className="cheader">
                                            <span>
                                                <label htmlFor={`ccs-${cmd.name}`}>
                                                    <input type="checkbox" id={`ccs-${cmd.name}`} name={cmd.name} checked={selectedCmds.includes(cmd.name)} onChange={handleCmdCheck} style={{display: "none"}} />
                                                    <span style={{ marginRight: 3, color: selectedCmds.includes(cmd.name) ? "#4db2aa" : "#ffffff" }}>
                                                        {selectedCmds.includes(cmd.name) ? <FontAwesomeIcon icon={faCheckCircle} /> : <FontAwesomeIcon icon={faTimesCircle} />}
                                                    </span>
                                                </label>
                                                <span style={{ color: isEnabled(cmd) ? "#00ff00" : "#ff0000" }}>{isEnabled(cmd) ? <FontAwesomeIcon icon={faStarfighter} /> : <FontAwesomeIcon icon={faSkull} />}</span>
                                            </span>
                                            <span className="ctitle">{cmd.name}</span>
                                            <span className="cedit"><FontAwesomeIcon icon={faEdit} /></span>
                                        </div>
                                        <div className="cbody">
                                            {cmd.description_edited || cmd.description_short}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <Center className="lspinner">
            <Spinner color="red.500" size="xl" css="margin:auto" />
        </Center>
    )
}
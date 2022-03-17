import React from 'react';
import { Center, Spinner } from '@chakra-ui/react';
import { faCheckCircle, faFeather, faExclamationTriangle, faRabbitFast } from '@fortawesome/pro-solid-svg-icons';
import { faCircle, faEdit, faFilter, /* faRabbitFast, */ faSkull, faTimesCircle } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ChannelData, CommandConf, CommandsEndpointData, CommandsGlobalConf, RoleData } from '../../../../../gm';
import { HomeProps } from '../../pages/DashboardPage';
import { capitalize, stringSimilarity, titleCase } from '../../utils/parsers';
import { useLocation } from "react-router-dom";
import { Rootportal } from '../Rootportal';
import "./Commands.css";
import { PacmanLoader } from 'react-spinners';
import { selectStylesMK1, selectStylesMK2 } from '../DashboardAutomod/AutomoduleCard';
import Select, { OptionsType, OptionTypeBase } from 'react-select';
// import { faExclamationTriangle } from '@fortawesome/pro-duotone-svg-icons';

interface CmdCat {
    name: string;
    count: number;
    // show: boolean;
}

type PatchRequest = Omit<Partial<CommandConf & CommandsGlobalConf & {
    delete_overwrites?: boolean,
    apply: string[],
    enabed: boolean
}>, 'description' | 'description_short' | 'category' | 'confined' | 'overwrite' | 'name'>;

// interface PatchRequest {
//     apply: string[];
//     enabled: boolean;
//     delete_overwrites?: boolean;
//     channel_mode?: boolean;
//     channels?: string[];
//     role_mode?: boolean;
//     roles?: string[];
//     description_edited?: string;
//     cooldown?: number;
//     exp_level?: number;
//     level?: number;
//     overwites_ignore?: string[];
//     respond?: boolean;
// }

const DISABLED = <FontAwesomeIcon icon={faSkull} />;
const WARNING = <FontAwesomeIcon icon={faExclamationTriangle} />;
const CHECKED = <FontAwesomeIcon icon={faCheckCircle} />;
const UNCHECKED = <FontAwesomeIcon icon={faTimesCircle} />;
const ENABLED = <FontAwesomeIcon icon={faRabbitFast} />;
const OVERWRITE = <FontAwesomeIcon icon={faFeather} />;
const FILTER = <FontAwesomeIcon icon={faFilter} />;

function isEnabled(c: CommandConf) {
    return !!(c.enabled && (!c.channel_mode || (c.channel_mode && c.channels.length)));
}

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export function DashboardCommands(props: HomeProps) {
    const { setStatus } = props;
    const query = useQuery();
    const requested = query.get("select");

    const [loaded, setLoaded] = React.useState(false);// whether to show the module as loading
    const [commands, setCommands] = React.useState<CommandConf[]>([]);// the commands to be used to patch and configure, received from the api
    const [globalConf, setGlobalConf] = React.useState<CommandsGlobalConf>({});// the global defaults for all commands, overriden by overwrites, configured independently
    const [modRole, setModRole] = React.useState("");
    const [categories, ] = React.useState<CmdCat[]>([]);// the categories to display to help filter commands
    const [channels, setChannels] = React.useState<ChannelData[]>([]);// the channels to use in channel selection when configuring an overwrite
    const [roles, setRoles] = React.useState<RoleData[]>([]);// the roles to use in role selection when configuring an overwrite
    const [selectedCmds, setSelectedCmds] = React.useState<string[]>([]);// the commands that should be shown as selected on the dashboard
    const [selectedCats, setSelectedCats] = React.useState<string[]>([]);// the cats that should be shown as selected on the dashboard
    const [applying, setApplying] = React.useState<string[]>([]);// the commands that the settings will actually be applied to on the dashboard
    const [pending, setPending] = React.useState<CommandConf & CommandsGlobalConf>({ name: "", enabled: true, channel_mode: false, role_mode: false, channels: [], roles: [], default_cooldown: 0, overwrite: false });// the settings to apply to the 'applying' commands on the next patch, should be cleared after every patch or cancellation
    // const [delOw, setDelOw] = React.useState(false);// whether the applied commands should be deleted as overwrites on the next patch
    const [searchFor, setSearchFor] = React.useState("");// the search string to be used in sorting, deactivated by default
    const [em, setEm] = React.useState("");// the error message to show in the overwrite conf modal
    const [mc, setMc] = React.useState("");// the modal transition class (handled automatically)
    const [mm, setMM] = React.useState(0);// the modal mode, sets what is displayed in the modal
    const [showing, setShowing] = React.useState(false);// whether to show the overwrite conf modal
    const modalWrapper = React.useRef(null);// the reference to the overwrite conf modal wrapper to be used to detect outside clicks
    const [waiting, setWaiting] = React.useState<boolean>(false);

    const load = React.useCallback(() => {
        fetch(`/api/discord/guilds/${props.meta.id}/commands`)
            .then(x => x.json())
            .then((d: CommandsEndpointData) => {
                setCommands(d.commands);
                setGlobalConf(d.global);
                setModRole(d.mod_role);
                setChannels(d.channels);
                setRoles(d.roles);
                setLoaded(true);
            })
            .catch(e => {
                setStatus(e.message);
                setLoaded(false);
            })
    }, [props.meta.id, setStatus]);

    React.useEffect(() => {
        load();
    }, [props.meta.id, setStatus, load]);

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
        });
        if (requested) {
            const toSelect = requested.split(",").filter(x => x.length);
            if (toSelect.length) {
                setSelectedCmds(toSelect);
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, [categories, commands, requested]);

    /**
     * Send the required update info to the API to patch the values in the database
     * @param mode 0 => conf, 1 => remove, 2 => global, 3 => set state
     * @param app For single or quick edits, skip the applying state and provide command names directly
     */
    const patchNow = (mode = 0, app?: string[], state?: boolean) => {
        const hdrs = new Headers();
        hdrs.append("Content-Type", "application/json");
        // const fd = new URLSearchParams();
        // fd.append("module", `${mod}`);
        // fd.append("data", `${data}`);
        const toApply = app || applying;
        let bod: PatchRequest = { apply: [], enabled: true };
        if (!mode) {
            bod = {
                apply: toApply,
                enabled: pending.enabled,
                channel_mode: pending.channel_mode,
                channels: pending.channels,
                role_mode: pending.role_mode,
                roles: pending.roles,
            }
            if (typeof pending.cooldown === "number" && pending.cooldown >= pending.default_cooldown) {
                bod.cooldown = pending.cooldown;
            }
            if (pending.description_edited) {
                bod.description_edited = pending.description_edited;
            }
            if (typeof pending.level === "number") {
                bod.level = pending.level;
            }
            if (typeof pending.exp_level === "number") {
                bod.exp_level = pending.exp_level;
            }
        } else if (mode === 1) {// I may get rid of this option because the global options are so similar
            bod = {
                apply: toApply,
                enabled: false,
                delete_overwrites: true,
            };
        } else if (mode === 3) {// command multi-toggle
            if (typeof state !== "boolean") return;
            bod = {
                apply: toApply,
                enabled: state,
            }
        } else if (mode === 2) {// global conf modification
            bod = {
                apply: [],
                enabled: true,
                channel_mode: pending.channel_mode,
                channels: pending.channels,
                role_mode: pending.role_mode,
                roles: pending.roles,
                respond: pending.respond,
                perm_notif: pending.perm_notif
            }
        }
        const obj = {
            method: 'PATCH',
            headers: hdrs,
            body: JSON.stringify(bod),
        };
        try {
            fetch(`/api/discord/guilds/${props.meta.id}/commands`, obj)
                .then(x => {
                    if (x.status === 200) {
                        handleCancel();
                        setStatus({ msg: "Saved.", success: true });
                    } else {
                        setStatus({ msg: "Failed to save.", success: false });
                    }
                    load();
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
    }

    const saveModRole = () => {
        const hdrs = new Headers();
        hdrs.append("Content-Type", "application/json");
        const bod = { role: modRole };
        const obj = {
            method: 'PUT',
            headers: hdrs,
            body: JSON.stringify(bod),
        };
        try {
            fetch(`/api/discord/guilds/${props.meta.id}/modrole`, obj)
                .then(x => {
                    if (x.status === 200) {
                        handleCancel();
                        setStatus({ msg: "Saved.", success: true });
                    } else {
                        setStatus({ msg: "Failed to save.", success: false });
                    }
                    load();
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
    }

    React.useEffect(() => {
        if (showing) {
            setTimeout(() => setMc("opaque"), 100)
        } else {
            setTimeout(() => setMc(""), 100)
        }
    }, [showing]);

    React.useEffect(() => {
        setApplying(selectedCmds);
    }, [selectedCmds])

    const useOutsideClicker = (ref: React.MutableRefObject<any>) => {// https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
        React.useEffect(() => {
            /**
             * Alert if clicked on outside of element
             */
            function handleClickOutside(event: MouseEvent) {
                if (ref.current && !ref.current.contains(event.target)) {
                    handleCancel();
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

    const handleCancel = () => {
        setShowing(false);
        setApplying(selectedCmds);
        setPending({ name: "", enabled: true, channel_mode: false, role_mode: false, channels: [], roles: [], default_cooldown: 0, overwrite: false });
        setEm("");
        setMM(0);
        setWaiting(false);
    }

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
        let ck = false;
        let name = "";
        if (target.type !== "checkbox") {
            if (!e.currentTarget.attributes["data-target"]) return;
            name = e.currentTarget.attributes["data-target"].value;
            ck = !selectedCmds.includes(name);
        } else {
            ck = !!target.checked;
            name = target.name;
        }
        if (ck && !selectedCmds.includes(name)) {
            setSelectedCmds([...selectedCmds, name]);
        } else {
            setSelectedCmds(commands.map(x => x.name).filter(x => selectedCmds.includes(x) && x !== name));
        }
    }

    const toggleAllCats = () => {
        if (!selectedCats.length || selectedCats.length !== categories.length) {
            setSelectedCats(categories.map(x => x.name));
        } else {
            setSelectedCats([]);
        }
    }

    const selectAll = () => {
        setSelectedCmds(getShowing().map(x => x.name));
    }

    const deselectAll = () => {
        setSelectedCmds([]);
    }

    const getShowing = () => {
        return commands.filter(x => selectedCats.includes(x.category || "") || selectedCmds.includes(x.name));
    }

    const cmdSort = (a: CommandConf, b: CommandConf) => {
        return searchFor.length ?
            (stringSimilarity(a.name, searchFor) > stringSimilarity(b.name, searchFor) ? -1 : 1) :
            isEnabled(a) && !isEnabled(b) ? -1 : 1// ((b.description_edited || b.description_short || "").length - (a.description_edited || a.description_short || "").length)
    }

    const updateSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const targ = e.target;
        if (targ.type !== "text") return;
        const val = targ.value;
        setSearchFor(val);
    }

    const getSelected = () => {
        return commands.filter(x => selectedCmds.includes(x.name));
    }

    const removeSelectedOverwrites = () => {
        // setApplying(getSelected().filter(x => x.overwrite).map(x => x.name));
        patchNow(1, getSelected().filter(x => x.overwrite).map(x => x.name));
    }

    const removeOneOverwrite = (e: any) => {
        const target = e.currentTarget;
        const dt = target.attributes["data-target"].value;
        const c = commands.find(x => x.name === dt);
        if (c) {
            patchNow(1, [c.name]);
        }
    }

    const toggleOne = (e: any) => {
        const target = e.currentTarget;
        const dt = target.attributes["data-target"].value;
        const c = commands.find(x => x.name === dt);
        if (c) {
            setPending(c);
            patchNow(3, [c.name], !c.enabled);
        }
    }

    const toggleRespond = () => {
        const n = typeof globalConf.respond === "boolean" && !globalConf.respond ? true : false;
        pending.respond = n;
        setPending({ ...pending, respond: n });
        patchNow(2);
    }

    const togglePermNotif = () => {
        const n = typeof globalConf.perm_notif === "boolean" && !globalConf.perm_notif ? true : false;
        pending.perm_notif = n;
        setPending({
            ...pending,
            perm_notif: n
        });
        patchNow(2);
    }

    const handleSave = () => {
        setWaiting(true);
        if (mm === 2) {
            saveModRole();
        } else {
            patchNow(0);
        }
    }

    const handleEnabledToggle = (e: any) => {
        const target = e.target;
        if (target.type !== "checkbox") return;
        const m = Object.assign({}, pending);
        m.enabled = !!target.checked;
        setPending(m);
    }

    const handleChannelModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const m = Object.assign({}, pending);
        const val = e.target.value === "1" ? true : false;
        m.channel_mode = val;
        setPending(m);
    }

    const handleRoleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const m = Object.assign({}, pending);
        const val = e.target.value === "1" ? true : false;
        m.role_mode = val;
        setPending(m);
    }

    const handleChannelsValueChange = (v: OptionsType<OptionTypeBase>) => {
        const m = Object.assign({}, pending);
        m.channels = v.map(v1 => v1.value);
        setPending(m);
    }

    const handleRolesValueChange = (v: OptionsType<OptionTypeBase>) => {
        const m = Object.assign({}, pending);
        m.roles = v.map(v1 => v1.value);
        setPending(m);
    }

    const handleModRoleChange = (v: any) => {
        setModRole(v.value);
    }

    const enableSelected = () => {
        // setApplying(getSelected().filter(x => x.overwrite).map(x => x.name));
        patchNow(3, getSelected().filter(x => !x.enabled).map(x => x.name), true);
    }

    const disableSelected = () => {
        // setApplying(getSelected().filter(x => x.overwrite).map(x => x.name));
        patchNow(3, getSelected().filter(x => x.enabled).map(x => x.name), false);
    }

    const editOne = (e: any) => {
        const target = e.currentTarget;
        const dt = target.attributes["data-target"].value;
        const c = commands.find(x => x.name === dt);
        if (c) {
            setApplying([c.name]);
            setPending(c);
            // setEm(c.name);
            setMM(0);
            setShowing(true);
        }
    }

    const editSelected = () => {
        setApplying(selectedCmds);
        if (selectedCmds.length === 1) {
            const c = getSelected()[0];
            setPending(c);
        }
        setMM(0);
        setShowing(true);
    }

    const showIconKey = () => {
        setMM(1);
        setShowing(true);
    }

    const editModRole = () => {
        setMM(2);
        setShowing(true);
    }

    return loaded ? (
        <>
            <div style={{ width: "100%", padding: "0 15px", marginLeft: "auto", marginRight: "auto" }}>
                <br />
                <div className="control-row">
                    <div className="x-card-parent" style={{width: "100%", position: "relative"}}>
                        <div className="x-card point-cb" style={{width: "100%"}}>
                            <div className="x-card-header">Commands</div>
                            <div className="x-card-body" style={{paddingTop: "0.5em"}}>
                                <div className="c-btnrow">
                                    <button onClick={showIconKey}>Icon Key</button>
                                    <button disabled>Set Global Defaults</button>
                                    <button onClick={editModRole}>Set Mod Role</button>
                                    <button onClick={toggleRespond} title="Send a message to notify users that the command is disabled">{typeof globalConf.respond === "boolean" && !globalConf.respond ? UNCHECKED : CHECKED} Disabled Message</button>
                                    <button onClick={togglePermNotif} title="Send a message to notify users that they don't have permission to use a command">{typeof globalConf.perm_notif === "boolean" && !globalConf.perm_notif ? UNCHECKED : CHECKED} Missing Perms Message</button>
                                </div>
                                <hr style={{ marginBottom: 10, marginTop: 0 }} />
                                <div className="c-cats">
                                    <div className="c-cats-label" onClick={toggleAllCats} title="Toggle all filters">
                                        {FILTER}
                                    </div>
                                    {categories.map((cat) => (
                                        <div className="c-cat" key={cat.name} title={`Toggle the filter for ${cat.name}`}>
                                            <label htmlFor={`ccc-${cat.name}`}>
                                                <input type="checkbox" id={`ccc-${cat.name}`} name={cat.name} value={`${titleCase(cat.name)} (${cat.count})`} checked={selectedCats.includes(cat.name)} onChange={handleCatCheck} style={{visibility: "hidden"}} />
                                                <span style={{ marginRight: 3, color: selectedCats.includes(cat.name) ? "#4db2aa" : "#e0e0e0", fontSize: "1.1em" }}>
                                                    {selectedCats.includes(cat.name) ? <FontAwesomeIcon icon={faCheckCircle} style={{ borderRadius: "50em", border: "1px solid white" }} /> : UNCHECKED}
                                                </span>
                                                {titleCase(cat.name)} ({cat.count})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <hr style={{ marginBottom: 0, marginTop: 10 }} />
                                <div className="c-btnrow">
                                    <button disabled={selectedCmds.length === getShowing().length} onClick={selectAll}>
                                        Select All{selectedCmds.length !== getShowing().length ? ` (${getShowing().length - selectedCmds.length})` : null}
                                    </button>
                                    <button disabled={!selectedCmds.length} onClick={deselectAll}>
                                        Deselect All{selectedCmds.length ? ` (${selectedCmds.length})` : null}
                                    </button>
                                    <button disabled={!selectedCmds.length} onClick={editSelected}>
                                        Edit Selected{selectedCmds.length ? ` (${selectedCmds.length})` : null}
                                    </button>
                                    <button disabled={!getSelected().some(x => x.overwrite)} onClick={removeSelectedOverwrites}>
                                        Remove Selected Overwrites{getSelected().some(x => x.overwrite) ? ` (${getSelected().filter(x => x.overwrite).length})` : null}
                                    </button>
                                    <button disabled={!getSelected().filter(x => !x.enabled).length} onClick={enableSelected}>
                                        Enable Selected{getSelected().filter(x => x.enabled).length !== getShowing().length && getSelected().length ? ` (${getSelected().filter(x => !x.enabled).length})` : null}
                                    </button>
                                    <button disabled={!getSelected().filter(x => x.enabled).length} onClick={disableSelected}>
                                        Disable Selected{getSelected().filter(x => x.enabled).length ? ` (${getSelected().filter(x => x.enabled).length})` : null}
                                    </button>
                                    <input type="text" name="cmdsearch" id="cmdsearch" placeholder="Command search" value={searchFor} onChange={updateSearch} />
                                </div>
                                <hr style={{ marginBottom: 10, marginTop: 0 }} />
                                <div className="ccards">
                                    {getShowing().sort(cmdSort).map(cmd => (
                                        <div className="ccard" key={cmd.name}>
                                            <div className={`cheader ${selectedCmds.includes(cmd.name) ? "cselected" : ""}`}>
                                                <span className="ccheck">
                                                    <label htmlFor={`ccs-${cmd.name}`} title="Select command">
                                                        <input type="checkbox" id={`ccs-${cmd.name}`} name={cmd.name} checked={selectedCmds.includes(cmd.name)} onChange={handleCmdCheck} style={{display: "none"}} />
                                                        <span style={{ color: selectedCmds.includes(cmd.name) ? "#4db2aa" : "#ffffff" }}>
                                                            {selectedCmds.includes(cmd.name) ? CHECKED : <FontAwesomeIcon icon={faCircle} />}
                                                        </span>
                                                    </label>
                                                    <button className="cedit" data-target={cmd.name} onClick={editOne} title="Edit single command"><FontAwesomeIcon icon={faEdit} /></button>
                                                </span>
                                                <span className="ctitle" data-target={cmd.name} onClick={handleCmdCheck}>{cmd.name}</span>
                                                <span>
                                                    {cmd.overwrite ? <span className="cowindicator" title={`This command is an active overwrite\nClick to delete overwrite`} data-target={cmd.name} onClick={removeOneOverwrite}>{OVERWRITE}</span> : null}
                                                    <span className="cindicator" title={isEnabled(cmd) ? "Enabled\nClick to disable" : cmd.enabled ? "Enabled\nCurrent settings prevent this command from running" : "Disabled\nClick to enable"} style={{ color: (isEnabled(cmd) ? "#228b22" : (cmd.enabled ? "#ffba00" : "#ff0000")), fontSize: "1.2em" }} data-target={cmd.name} onClick={toggleOne}>{isEnabled(cmd) ? ENABLED : (cmd.enabled ? WARNING : DISABLED)}</span>
                                                </span>
                                            </div>
                                            <div className="cbody">
                                                {capitalize(cmd.description_edited || cmd.description_short)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                {showing ? (
                    <Rootportal show={showing}>
                        <div className="cm-wrapper">
                            <div className={`cm-container ${mc}`} ref={modalWrapper}>
                                {!waiting ? (
                                    <>
                                        <div className="cm-form-container">
                                            {mm === 0 || mm === 2 ?
                                            <>
                                                {em && (
                                                    <div className="inline-error">
                                                        {em}
                                                    </div>
                                                )}
                                                {mm === 2 ?
                                                <>
                                                    <p>Editing the <strong>modrole</strong>. This role determines who is allowed to use commands and actions that are restricted at or above the <strong>mod</strong> permissions level. Admins override this role and are not required to have it.</p>
                                                    <p style={{ fontWeight: 700, marginTop: 20, marginBottom: 5 }}>
                                                        Choose the mod role:
                                                    </p>
                                                    <Select
                                                        placeholder="Select role . . ."
                                                        options={roles.map(c => {
                                                            return { value: c.id, label: `@${c.name}`, color: c.hexColor };
                                                        })}
                                                        menuPlacement="auto"
                                                        value={modRole && roles.find(x => x.id === modRole) ? {value: modRole, label: roles.find(x => x.id === modRole)?.name, color: roles.find(x => x.id === modRole)?.hexColor } : { label: "None" }}
                                                        onChange={handleModRoleChange}
                                                        styles={selectStylesMK2}
                                                    />
                                                </>
                                                : <>
                                                    {applying.length ? <>
                                                        <p>Editing the config for <strong>{applying.length > 1 ? "multiple commands" : pending.name}</strong>.</p>
                                                        <div style={{ marginTop: 20 }}>
                                                            <label htmlFor={`c-enable-toggle`} title="Enable command">
                                                                <input type="checkbox" id={`c-enable-toggle`} checked={pending.enabled} onChange={handleEnabledToggle} style={{ display: "none" }} />
                                                                <span style={{ marginRight: 8, color: pending.enabled ? "#4db2aa" : "#ffffff" }}>
                                                                    {pending.enabled ? CHECKED : UNCHECKED}
                                                                </span>
                                                            Enable
                                                        </label>
                                                        </div>
                                                    </> : <>
                                                        <p>Editing the <strong>global defaults</strong> config.</p>
                                                        <p>The settings found here that can also be configured individually on commands are applied to commands that are <strong>not active overwrites (OVERWRITE)</strong></p>
                                                    </>}
                                                    <p style={{ fontWeight: 700, marginTop: 20, marginBottom: 5 }}>
                                                        <select onChange={handleChannelModeChange} value={!pending.channel_mode ? 0 : 1} >
                                                            <option value={0} defaultChecked>Disable</option>
                                                            <option value={1}>Enable</option>
                                                        </select>
                                                        in these channels:
                                                    </p>
                                                    <Select
                                                        placeholder="Select channels . . ."
                                                        isMulti
                                                        options={channels.map(c => {
                                                            return { value: c.id, label: `#${c.name}` };
                                                        })}
                                                        menuPlacement="auto"
                                                        value={pending.channels.map(c => {
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
                                                    <p style={{ fontWeight: 700, marginTop: 20, marginBottom: 5 }}>
                                                        <select onChange={handleRoleModeChange} value={!pending.role_mode ? 0 : 1} >
                                                            <option value={0} defaultChecked>Disable</option>
                                                            <option value={1}>Enable</option>
                                                        </select>
                                                        for these roles:
                                                    </p>
                                                    <Select
                                                        placeholder="Select roles . . ."
                                                        isMulti
                                                        options={roles.map(c => {
                                                            return { value: c.id, label: `@${c.name}`, color: c.hexColor };
                                                        })}
                                                        menuPlacement="auto"
                                                        value={pending.roles.map(c => {
                                                            const cr = roles.find(x => x.id === c);
                                                            if (cr) {
                                                                return { value: cr.id, label: `${cr.name}`, color: cr.hexColor };
                                                            } else {
                                                                return {};
                                                            }
                                                        })}
                                                        onChange={handleRolesValueChange}
                                                        styles={selectStylesMK2}
                                                    />
                                                </>}
                                            </> : <>
                                                <h4>Icon Key</h4>
                                                <ul style={{ marginLeft: 15 }}>
                                                    <li>{ENABLED}<br />Command Enabled</li>
                                                    <li>{WARNING}<br />Indicates that a command is enabled but won't run</li>
                                                    <li>{DISABLED}<br />Command Disabled</li>
                                                    <li>{OVERWRITE}<br />Indicates a command overwriting its defaults</li>
                                                    <li><FontAwesomeIcon icon={faCircle} /> or {UNCHECKED}<br />Unselected</li>
                                                    <li>{CHECKED}<br />Selected</li>
                                                    <li>{FILTER}<br />Indicates filters (sometimes is a button to toggle filters)</li>
                                                </ul>
                                            </>}
                                        </div>
                                        <div className="cm-buttons">
                                            <hr />
                                            {mm === 0 || mm === 2 ? <button className="card-footer-button primary-button" onClick={handleSave} disabled={false} >Save</button> : null}
                                            <button className="card-footer-button cm-cancel-bottom" onClick={handleCancel}>Cancel</button>
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
            </>
    ) : (
        <Center className="lspinner">
            <Spinner color="red.500" size="xl" css="margin:auto" />
        </Center>
    )
}
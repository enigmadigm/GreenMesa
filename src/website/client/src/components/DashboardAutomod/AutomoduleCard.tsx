import React from 'react';
import { HomeProps } from '../../pages/DashboardPage';
import { Center, Collapse, FormControl, FormLabel, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Spinner, Switch, useDisclosure } from '@chakra-ui/react';
import { AutomoduleData, AutomoduleEndpointData, ChannelData, RoleData } from '../../../../../gm';
import Select, { GroupTypeBase, OptionsType, OptionTypeBase, Styles } from "react-select";
import isEqual from 'lodash.isequal';
import chroma from 'chroma-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBadgeSheriff, faChevronDown, faChevronRight } from '@fortawesome/pro-duotone-svg-icons';

interface CustomModuleCardProps extends HomeProps {
    displayName: string;
    name: string;
    isTextModule?: boolean;
    description?: string;
    headerTag?: string;
    channels: ChannelData[];
    roles: RoleData[];
    reload?: number;
    // handleModuleSave: (mod: string, data: string, setModuleLoading?: React.Dispatch<React.SetStateAction<boolean>> | undefined) => void;
    CustomOptions?(props: AMCustomOptionsProps): JSX.Element;
}

export interface AMCustomOptionsProps extends CustomModuleCardProps {
    mod: AutomoduleData;
    setMod: React.Dispatch<React.SetStateAction<AutomoduleData>>;
    loaded: boolean;
    setLoaded: React.Dispatch<React.SetStateAction<boolean>>;
    unsaved: boolean;
    wmessage: string;
    setWMessage: React.Dispatch<React.SetStateAction<string>>;
}

export const selectStylesMK1: Partial<Styles<OptionTypeBase, true, GroupTypeBase<OptionTypeBase>>> = {
    control: (styles, state) => ({ ...styles, backgroundColor: '#343B41', color: '#9c9c9c', borderColor: state.isDisabled ? "#343B41" : "#23282c" }),
    menu: (styles) => ({ ...styles, backgroundColor: '#292e33', marginTop: 0 }),
    multiValue: (styles) => ({ ...styles, backgroundColor: '#001e52', borderColor: '#424242' }),
    multiValueLabel: (styles) => ({ ...styles, color: '#9c9c9c' }),
    multiValueRemove: (styles) => ({ ...styles, color: '#8a70ff' }),
    option: (styles, state) => ({ ...styles, ":hover": { backgroundColor: '#57626C' }, backgroundColor: "initial" }),
    dropdownIndicator: (styles, state) => ({ ...styles, color: state.isDisabled ? "#343B41" : styles.color }),
    indicatorSeparator: (styles, state) => ({ ...styles, backgroundColor: state.isDisabled ? "#343B41" : styles.backgroundColor }),
    input: (styles) => ({ ...styles, color: "#8a70ff" }),
    singleValue: (styles) => ({ ...styles, color: "#fff" }),
};

export const selectStylesMK2: Partial<Styles<OptionTypeBase, true, GroupTypeBase<OptionTypeBase>>> = {
    ...selectStylesMK1,
    //container: (styles) => ({ ...styles, border: "1px solid #23282c" }),
    control: (styles, state) => ({ ...styles, backgroundColor: '#343B41', color: '#9c9c9c', borderColor: state.isDisabled ? "#343B41" : "#23282c" }),
    menu: (styles) => ({ ...styles, backgroundColor: '#292e33', zIndex: 10000 }),
    multiValue: (styles, { data }) => {
        const color = chroma(data.color);
        const lum = color.luminance() > 0.1;
        const con = chroma.contrast(color, '#3A4149') < 4.5;
        const bg = con && lum ? color.alpha(0.6).hex() :
            data.color === "#000000" ? "transparent" : data.color;
        return {
            ...styles,
            backgroundColor: bg,
            borderColor: lum ? '#424242' : undefined,
            border: !lum && bg === "transparent" ? "#b0b0b0 1px solid" : `${bg} 1px solid`,
            borderRadius: "5px",
            overflow: "hidden",
        }
    },
    multiValueLabel: (styles, { data }) => {
        const color = chroma(data.color);
        const lum = color.luminance() > 0.1;
        const con = chroma.contrast(color, '#3A4149') < 4.5;
        return {
            ...styles,
            color: con && lum ? color.brighten(2).hex() :
                data.color === "#000000" ? '#b0b0b0' : color.brighten(3).hex()
        }
    },
    multiValueRemove: (styles, { data }) => {
        const color = chroma(data.color);
        const lum = color.luminance() > 0.1;
        const con = chroma.contrast(color, '#3A4149') < 4.5;
        return {
            ...styles,
            color: con && lum ? color.brighten(2).hex() :
                data.color === "#000000" ? '#b0b0b0' : color.darken(2).hex(),
            ":hover": {
                backgroundColor: "#861a00"
            }
        }
    },
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
        const color = chroma(data.color);
        return {
            ...styles,
            backgroundColor:
                isDisabled ? color.darken() :
                isSelected ? data.color :
                isFocused ? color.alpha(0.2).css() : "initial",
            color:
                isDisabled ? "#cccccc" :
                isSelected ? chroma.contrast(color, '#3A4149') > 2 ? 'white' : 'black' :
                        chroma.distance(color, '#292e33') < 35 ? "#c5c5c5" : data.color,
            cursor: isDisabled ? 'not-allowed' : 'default',
            ':active': {
                ...styles[':active'],
                backgroundColor: !isDisabled && (isSelected ? data.color : color.alpha(0.3).css()),
            },
        }
    },
    dropdownIndicator: (styles, state) => {
        return {
            ...styles,
            color: state.isDisabled ? "#343B41" : styles.color,
            ":hover": {
                // color: "#890000",
                color: chroma("hsl(0, 0%, 80%)").alpha(0.6).hex(),
                cursor: "pointer",
            }
        }
    },
    indicatorSeparator: (styles, state) => ({ ...styles, backgroundColor: state.isDisabled ? "#343B41" : styles.backgroundColor }),
    input: (styles) => ({ ...styles, color: "#8a70ff" }),
    clearIndicator: (styles, state) => {
        return {
            ...styles,
            color: state.isDisabled ? "#343B41" : styles.color,
            // color: '#b0b0b0',
            ":hover": {
                color: "#890000",
                cursor: "pointer",
            }
        }
    },
};

function checkEnabled(d: AutomoduleData) {
    return !!(d.enableAll || d.channels?.length || d.channelEffect === "disable");
}

function CollapseIndicator(props: {collapsed: boolean}) {
    return props.collapsed ? <FontAwesomeIcon icon={faChevronDown} style={{ width: 16 }} /> : <FontAwesomeIcon icon={faChevronRight} style={{ width: 16 }} />;
}

export function AutomoduleCard(props: CustomModuleCardProps) {
    const { setStatus, CustomOptions } = props;
    const [loaded, setLoaded] = React.useState(false);
    const [unsaved, setUnsaved] = React.useState(false);
    const [mod, setMod] = React.useState<AutomoduleData>({ name: props.name, text: false, enableAll: false, applyRoles: [], roleEffect: 'ignore' });
    const [original, setOriginal] = React.useState<AutomoduleData>({ name: props.name, text: false, enableAll: false, applyRoles: [], roleEffect: 'ignore' });
    const { isOpen: channelCollapse, onToggle: channelCollapseToggle } = useDisclosure();
    const { isOpen: roleCollapse, onToggle: roleCollapseToggle } = useDisclosure();
    const { isOpen: punishCollapse, onToggle: punishCollapseToggle } = useDisclosure();
    const [wmessage, setWMessage] = React.useState("");

    const load = React.useCallback(() => {
        fetch(`/api/discord/guilds/${props.meta.id}/automod/${props.name}`)
            .then(x => x.json())
            .then((d: AutomoduleEndpointData) => {
                setMod(d.automodule);
                setOriginal(d.automodule);
                setLoaded(true);
            })
            .catch(e => {
                setStatus(e.message);
                setLoaded(true);
            })
    }, [props.meta.id, props.name, setStatus])

    React.useEffect(() => {
        load();
    }, [props.meta.id, props.name, setStatus, props.reload, load]);

    React.useEffect(() => {
        if (!isEqual(mod, original) && !unsaved) {
            setUnsaved(true);
            return;
        }
        else if (isEqual(mod, original)) {
            setUnsaved(false);
            return;
        }
    }, [mod, original, unsaved])

    /* React.useEffect(() => {
        setTimeout(() => {
            if (!overflow) {
                overflow yes
            }
        }, 1000)
    }, [channelCollapse]) */

    const handleModuleSave = (mod: string, data: string, setModuleLoading?: React.Dispatch<React.SetStateAction<boolean>>) => {
        const hdrs = new Headers();
        hdrs.append("Content-Type", "application/x-www-form-urlencoded");
        const fd = new URLSearchParams();
        fd.append("module", `${mod}`);
        fd.append("data", `${data}`);
        const obj = {
            method: 'PUT',
            headers: hdrs,
            body: fd
        };
        try {
            fetch(`/api/discord/guilds/${props.meta.id}/automod`, obj)
                .then(x => x.json())
                .then((d) => {
                    if (d.guild.module) {
                        setStatus({ msg: "Saved.", success: true });
                    } else {
                        setStatus({ msg: "Failed to save.", success: false });
                    }
                    load();
                }).catch(e => {
                    console.error(e);
                    setStatus({ msg: "Error", success: false });
                    load();
                });
        } catch (error) {
            console.error(error);
            setStatus({ msg: "Failed to save.", success: false });
            load();
        }
    };

    const handleEnableAllToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const state = e.target.checked;
        const m = Object.assign({}, mod);
        m.enableAll = state;
        setMod(m);
    }

    const handleChannelsValueChange = (v: OptionsType<OptionTypeBase>) => {
        const m = Object.assign({}, mod);
        m.channels = v.map(v1 => v1.value);
        setMod(m);
    }

    const handleChannelEffectToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const state = e.target.checked;
        const m = Object.assign({}, mod);
        m.channelEffect = state ? "disable" : "enable";
        setMod(m);
    }

    const handleRolesValueChange = (v: OptionsType<OptionTypeBase>) => {
        const m = Object.assign({}, mod);
        m.applyRoles = v.map(v1 => v1.value);
        setMod(m);
    }

    const handleRoleEffectToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const state = e.target.checked;
        const m = Object.assign({}, mod);
        m.roleEffect = state ? "watch" : "ignore";
        setMod(m);
    }

    const handlePunishmentValueChange = (v: any) => {
        const m = Object.assign({}, mod);
        m.punishment = v.value === "none" ? undefined : v.value;
        setMod(m);
    }

    const onPunishTimeChange = (valueAsString: string, valueAsNumber: number) => {
        const m = Object.assign({}, mod);
        m.punishTime = valueAsNumber;
        setMod(m);
    }

    const handleActionsValueChange = (v: OptionsType<OptionTypeBase>) => {
        const m = Object.assign({}, mod);
        m.actions = v.map(v1 => v1.value);
        setMod(m);
    }

    const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        try {
            setLoaded(false);
            const stringMod = JSON.stringify(mod);
            handleModuleSave(props.name, stringMod, setLoaded);
        } catch (error) {
            console.error(error);
        }
    }

    return loaded ? (
        <div className="x-card">
            <div className={`cardtag ${unsaved ? "cardtag-y" : (mod.enableAll || mod.channels?.length || mod.channelEffect === "disable" ? "cardtag-g" : "cardtag-r")}`}>
                {unsaved ? "Unsaved" : (checkEnabled(mod) ? "Enabled" : "Disabled")}
            </div>
            <div className="x-card-header">
                <FontAwesomeIcon icon={faBadgeSheriff} style={{ marginRight: 5 }} />
                { props.displayName }
                {props.headerTag ? (
                    <span style={{ padding: "2px 5px", borderRadius: "4px", backgroundColor: " #001f3f ", marginLeft: 10 }} title="This tag is here to provide specific warnings about this module">{props.headerTag}</span>
                ) : <></>}
            </div>
            <div className="x-card-body">
                {(!mod.punishment || !mod.actions) && checkEnabled(mod) ? (
                    <div className="inline-error">
                        A punishment or action is not set for this module. It will do nothing.
                    </div>
                ) : null}
                {wmessage ? (
                    <div className="inline-error">
                        {wmessage}
                    </div>
                ) : null}
                <h5 className="cardsubtitle" style={{fontSize: "1.2em"}}>Module Configuration</h5>
                <p style={{ marginBottom: "1rem" }}>{ props.description }</p>
                <hr style={{ marginTop: 10, marginBottom: 10 }} />
                <FormControl display="flex" alignItems="center" mb="8px" mt="12px">
                    <FormLabel htmlFor={`enable-${props.name}`} mb="0" pb="5px">
                        {props.isTextModule ? "Enable everywhere: (overrides channel selection)" : "Enable?"}
                    </FormLabel>
                    <Switch id={`enable-${props.name}`} onChange={(e) => handleEnableAllToggle(e)} defaultChecked={mod.enableAll} checked={mod.enableAll} style={{ marginRight: 10 }} />
                    <span style={{ fontWeight: 700, paddingBottom: 5 }}>{props.isTextModule ? (mod.enableAll ? "overriding" : "not overriding") : (mod.enableAll ? "enabled" : "disabled")}</span>
                </FormControl>
                {props.isTextModule ? (
                    <>
                        <hr style={{ marginTop: 10, marginBottom: 10 }} />
                        <h4 className="cardsubtitle" onClick={channelCollapseToggle} style={{ cursor: "pointer" }}>
                            <span style={{ marginRight: 8 }}><CollapseIndicator collapsed={channelCollapse} /></span>
                            Channel Exclusion
                        </h4>
                        <Collapse in={channelCollapse} style={{overflow: "visible"}}>
                            <p>Select the channels that you would like to apply the current channel effect rule to. The current rule will either cause the automodule to be disabled or enabled in each channel.</p>
                            <br />
                            <Select
                                placeholder="Select channels . . ."
                                isMulti
                                options={props.channels.map(c => {
                                    return { value: c.id, label: `#${c.name}` };
                                })}
                                isDisabled={mod.enableAll}
                                menuPlacement="auto"
                                value={mod.channels?.map(c => {
                                    const cr = props.channels.find(x => x.id === c);
                                    if (cr) {
                                        return { value: cr.id, label: `#${cr.name}` };
                                    } else {
                                        return {};
                                    }
                                })}
                                onChange={handleChannelsValueChange}
                                styles={selectStylesMK1}
                            />
                            <br />
                            <p style={{fontWeight: 700}}>Choose Channel Effect:</p>
                            <FormControl display="flex" alignItems="center" isDisabled={mod.enableAll}>
                                <FormLabel htmlFor="ae-toggle-channeleffect" mb="0">
                                    Enables In
                                </FormLabel>
                                <Switch id="ae-toggle-channeleffect" onChange={(e) => handleChannelEffectToggle(e)} defaultChecked={mod.channelEffect !== "enable"} isDisabled={mod.enableAll} />
                                <FormLabel htmlFor="ae-toggle-channeleffect" ml="12px" mb="0" mr="0">
                                    Disables In
                                </FormLabel>
                            </FormControl>
                        </Collapse>
                    </>
                ) : <></>}
                <hr style={{ marginTop: 10, marginBottom: 10 }} />
                <h4 className="cardsubtitle" onClick={roleCollapseToggle} style={{ cursor: "pointer" }}>
                    <span style={{ marginRight: 8 }}><CollapseIndicator collapsed={roleCollapse} /></span>
                    Role Exclusion
                </h4>
                <Collapse in={roleCollapse} style={{ overflow: "visible" }}>
                    <p><i>Similar to channel exclusion.</i> Select the roles that you would like this module to ignore/have no effect on.</p>
                    <br />
                    <Select
                        placeholder="Select roles . . ."
                        isMulti
                        options={props.roles.map(c => {
                            return { value: c.id, label: `@${c.name}`, color: c.hexColor };
                        })}
                        menuPlacement="auto"
                        value={mod.applyRoles.map(c => {
                            const cr = props.roles.find(x => x.id === c);
                            if (cr) {
                                return { value: cr.id, label: `${cr.name}`, color: cr.hexColor };
                            } else {
                                return {};
                            }
                        })}
                        onChange={handleRolesValueChange}
                        styles={selectStylesMK2}
                    />
                    <br />
                    <p style={{ fontWeight: 700 }}>Choose Role Effect:</p>
                    <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="ae-toggle-roleeffect" mb="0">
                            Ignore
                        </FormLabel>
                        <Switch id="ae-toggle-roleeffect" onChange={(e) => handleRoleEffectToggle(e)} defaultChecked={mod.roleEffect !== "ignore"} />
                        <FormLabel htmlFor="ae-toggle-roleeffect" ml="12px" mb="0" mr="0">
                            Watch
                        </FormLabel>
                    </FormControl>
                </Collapse>
                <hr style={{ marginTop: 10, marginBottom: 10 }} />
                <h4 className="cardsubtitle" onClick={punishCollapseToggle} style={{ cursor: "pointer" }}>
                    <span style={{ marginRight: 8 }}><CollapseIndicator collapsed={punishCollapse} /></span>
                    Punishment
                </h4>
                <Collapse in={punishCollapse} style={{ overflow: "visible" }}>
                    <p>Select the punishments and actions that should be taken when there is an infraction.</p>
                    <br style={{ height: 5 }} />
                    <p style={{ fontWeight: 700 }}>Punishment:</p>
                    <Select
                        placeholder="Select punishment . . ."
                        options={['none', 'tempmute', 'mute', 'kick', 'tempban', 'ban'].map(c => {
                            return { value: c, label: `${c}` };
                        })}
                        menuPlacement="auto"
                        value={mod.punishment ? { value: mod.punishment, label: mod.punishment } : {label: "None"}}
                        onChange={handlePunishmentValueChange}
                        styles={selectStylesMK1}
                    />
                    {mod.punishment && ["tempmute","tempban"].includes(mod.punishment) ? (
                        <>
                            <br style={{ height: 5 }} />
                            <p style={{ fontWeight: 700 }}>Punishment Length (sec):</p>
                            <NumberInput id="ae-punishtime" defaultValue={0} value={mod.punishTime} onChange={onPunishTimeChange}>
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </>
                    ) : <></>}
                    <br style={{ height: 5 }} />
                    <p style={{ fontWeight: 700 }}>Actions:</p>
                    <Select
                        placeholder="Select actions . . ."
                        isMulti
                        options={[{ value: 'delete', display: "Delete message" }, { value: 'warn', display: "Warn" }, { value: 'channelMessage', display: "Post to channel" }, { value: 'courtesyMessage', display: "Courtesy message" }].filter(x => props.isTextModule ? true : (x.value === "delete" || x.value === "channelMessage" ? false : true)).map(c => {
                            return { value: c.value, label: `${c.display}` };
                        })}
                        menuPlacement="auto"
                        value={mod.actions?.map(c => {
                            const opts = [{ value: 'delete', display: "Delete message" }, { value: 'warn', display: "Warn" }, { value: 'channelMessage', display: "Post to channel" }, { value: 'courtesyMessage', display: "Courtesy message" }];
                            const display = opts.find(x => x.value === c)?.display || c;
                            return { value: c, label: `${display}` };
                        }) || []}
                        onChange={handleActionsValueChange}
                        styles={selectStylesMK1}
                    />
                </Collapse>
                {CustomOptions ? (
                    <>
                        <CustomOptions {...{ mod, setMod, loaded, setLoaded, unsaved, wmessage, setWMessage, ...props }} />
                    </>
                ) : <></>}
            </div>
            {unsaved ? (
                <div className="card-footer">
                    <button className="card-footer-button" onClick={handleSaveClick}>Save</button>
                </div>
            ) : <></>}
        </div>
    ) : (
            <div className="x-card" style={{ minWidth: "50ch" }}>
                <div className="x-card-header">{ props.displayName }</div>
                {/*<Stack>
                    <Skeleton height="20px" speed={0.2} />
                    <Skeleton height="20px" speed={0.2} />
                    <Skeleton height="20px" speed={0.2} />
                    <Progress isIndeterminate height="100px" colorScheme="facebook" backgroundColor="transparent" />
                </Stack>*/}
                <Center>
                    <Spinner color="red.500" size="lg" css="margin:auto" margin="30px" />
                </Center>
            </div>
        )
}
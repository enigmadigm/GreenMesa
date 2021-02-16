import React from 'react';
import { HomeProps } from '../../pages/DashboardPage';
import { Center, FormControl, FormLabel, Spinner, Switch } from '@chakra-ui/react';
import { ChannelData } from '.';
import { AutomoduleData, AutomoduleEndpointData } from '../../../../../gm';
import Select, { GroupTypeBase, OptionsType, OptionTypeBase, Styles } from "react-select"
import isEqual from 'lodash.isequal';

interface CustomModuleCardProps extends HomeProps {
    displayName: string;
    name: string;
    isTextModule?: boolean;
    description?: string;
    channels: ChannelData[];
    handleModuleSave: (mod: string, data: string, setModuleLoading?: React.Dispatch<React.SetStateAction<boolean>> | undefined) => void;
    CustomOptions?(props: AMCustomOptionsProps): JSX.Element;
}

export interface AMCustomOptionsProps extends CustomModuleCardProps {
    mod: AutomoduleData;
    setMod: React.Dispatch<React.SetStateAction<AutomoduleData>>;
    loaded: boolean;
    setLoaded: React.Dispatch<React.SetStateAction<boolean>>;
    unsaved: boolean;
}

const channelSelectStyles: Partial<Styles<OptionTypeBase, true, GroupTypeBase<OptionTypeBase>>> = {
    control: (styles, state) => ({ ...styles, backgroundColor: '#3A4149', color: '#9c9c9c', borderColor: state.isDisabled ? "#343B41" : "hsl(0, 0%, 80%)" }),
    menu: (styles) => ({ ...styles, backgroundColor: '#3A4149' }),
    multiValue: (styles) => ({ ...styles, backgroundColor: '#001e52', borderColor: '#424242' }),
    multiValueLabel: (styles) => ({ ...styles, color: '#9c9c9c' }),
    multiValueRemove: (styles) => ({ ...styles, color: '#8a70ff' }),
    option: (styles, state) => ({ ...styles, ":hover": { backgroundColor: '#57626C' }, backgroundColor: state.isFocused ? "initial" : "initial" }),
    dropdownIndicator: (styles, state) => ({ ...styles, color: state.isDisabled ? "#343B41" : styles.color }),
    indicatorSeparator: (styles, state) => ({ ...styles, backgroundColor: state.isDisabled ? "#343B41" : styles.backgroundColor })
};

export function AutomoduleCard(props: CustomModuleCardProps) {
    const { setStatus, handleModuleSave, CustomOptions } = props;
    const [loaded, setLoaded] = React.useState(false);
    const [unsaved, setUnsaved] = React.useState(false);
    const [mod, setMod] = React.useState<AutomoduleData>({ name: props.name, text: false, enableAll: false, applyRoles: [], roleEffect: 'ignore' });
    const [original, setOriginal] = React.useState<AutomoduleData>({ name: props.name, text: false, enableAll: false, applyRoles: [], roleEffect: 'ignore' });

    React.useEffect(() => {
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
    }, [props, setStatus]);

    React.useEffect(() => {
        if (!isEqual(mod, original) && !unsaved) {
            setUnsaved(true);
            return;
        }
        if (isEqual(mod, original)) {
            setUnsaved(false);
            return;
        }
    }, [mod, original, unsaved])

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

    const handelChannelEffectToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const state = e.target.checked;
        const m = Object.assign({}, mod);
        m.channelEffect = state ? "disable" : "enable";
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
                {unsaved ? "Unsaved" : (mod.enableAll || mod.channels?.length || mod.channelEffect === "disable" ? "Enabled" : "Disabled")}
            </div>
            <div className="x-card-header">{ props.displayName }</div>
            <div className="x-card-body">
                <h5 className="cardsubtitle" style={{fontSize: "1.2em"}}>Module Configuration</h5>
                <p style={{ marginBottom: "1rem" }}>{ props.description }</p>
                <hr style={{ marginTop: 10, marginBottom: 15 }} />
                <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor={`enable-${props.name}`} mb="0">
                        {props.isTextModule ? "Enable everywhere? (overrides channel selection)" : "Enable?"}
                    </FormLabel>
                    <Switch id={`enable-${props.name}`} onChange={(e) => handleEnableAllToggle(e)} defaultChecked={mod.enableAll} checked={mod.enableAll} style={{ marginRight: 10 }} />
                    <span style={{ fontWeight: 700 }}>{props.isTextModule ? (mod.enableAll ? "overriding" : "not overriding") : (mod.enableAll ? "enabled" : "disabled")}</span>
                </FormControl>
                {props.isTextModule ? (
                    <>
                        <hr style={{ marginTop: 10, marginBottom: 15 }} />
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
                            styles={channelSelectStyles}
                        />
                        <br />
                        <p style={{fontWeight: 700}}>Choose Channel Effect:</p>
                        <FormControl display="flex" alignItems="center" isDisabled={mod.enableAll}>
                            <FormLabel htmlFor="ae-toggle-channeleffect" mb="0">
                                Enables In
                            </FormLabel>
                            <Switch id="ae-toggle-channeleffect" onChange={(e) => handelChannelEffectToggle(e)} defaultChecked={mod.channelEffect !== "enable"} isDisabled={mod.enableAll} />
                            <FormLabel htmlFor="ae-toggle-channeleffect" ml="12px" mb="0" mr="0">
                                Disables In
                            </FormLabel>
                        </FormControl>
                    </>
                ) : <></>}
                {CustomOptions ? (
                    <>
                        <CustomOptions {...props} {...{mod, setMod, loaded, setLoaded, unsaved}} />
                    </>
                ) : <></>}
                {unsaved ? (
                    <div>
                        <hr style={{ marginTop: 20, marginBottom: 5 }} />
                        <button className="am-save-button" onClick={handleSaveClick}>Save</button>
                    </div>
                ) : <></>}
            </div>
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
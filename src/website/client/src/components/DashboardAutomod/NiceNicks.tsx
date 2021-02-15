import React from 'react';
import { HomeProps } from '../../pages/DashboardPage';
import { Center, FormControl, FormLabel, Spinner, Switch } from '@chakra-ui/react';
import { ChannelData } from '.';
import { AutomoduleData, AutomoduleEndpointData } from '../../../../../gm';
//import Select, { GroupTypeBase, OptionsType, OptionTypeBase, Styles } from "react-select"
import isEqual from 'lodash.isequal';

interface NiceNicksProps extends HomeProps {
    handleModuleSave: (mod: string, data: string, setModuleLoading?: React.Dispatch<React.SetStateAction<boolean>> | undefined) => void;
}

export function NiceNicks(props: NiceNicksProps) {
    const { setStatus, handleModuleSave } = props;
    const [loaded, setLoaded] = React.useState(false);
    const [unsaved, setUnsaved] = React.useState(false);
    const [mod, setMod] = React.useState<AutomoduleData>({ name: "nicenicks", text: false, enableAll: false, applyRoles: [], roleEffect: 'ignore' });
    const [original, setOriginal] = React.useState<AutomoduleData>({ name: "nicenicks", text: false, enableAll: false, applyRoles: [], roleEffect: 'ignore' });

    React.useEffect(() => {
        fetch(`/api/discord/guilds/${props.meta.id}/automod/nicenicks`)
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

    const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        try {
            setLoaded(false);
            const stringMod = JSON.stringify(mod);
            handleModuleSave("nicenicks", stringMod, setLoaded);
        } catch (error) {
            console.error(error);
        }
    }

    return loaded ? (
        <div className="x-card">
            <div className={`cardtag ${unsaved ? "cardtag-y" : (mod.enableAll ? "cardtag-g" : "cardtag-r")}`}>
                {unsaved ? "Unsaved" : (mod.enableAll ? "Enabled" : "Disabled")}
            </div>
            <div className="x-card-header">Nice Nicknames</div>
            <div className="x-card-body">
                <h5 className="cardsubtitle">Module Configuration</h5>
                <p style={{ marginBottom: "1rem" }}>This module will suppress <strong>all</strong> embeds that appear in a channel. This includes embeds from bots and links. Soon there will be an option to toggle for bots or roles.</p>
                <hr style={{ marginTop: 10, marginBottom: 15 }} />
                <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="enable-nicenicks" mb="0">
                        Enable?
                    </FormLabel>
                    <Switch id="enable-nicenicks" onChange={(e) => handleEnableAllToggle(e)} defaultChecked={mod.enableAll} style={{ marginRight: 10 }} />
                    <span style={{ fontWeight: 700 }}>{mod.enableAll ? "enabled" : "disabled"}</span>
                </FormControl>
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
                <div className="x-card-header">Nice Nicknames</div>
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
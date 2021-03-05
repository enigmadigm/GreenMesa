import React from 'react';
import './Automod.css';
import { Center, NumberInputStepper, Spinner, NumberInput, NumberInputField, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/react';
import { HomeProps } from '../../pages/DashboardPage';
import { AutomoduleCard, selectStylesMK1 } from './AutomoduleCard';
import { AntiEmbed } from './AntiEmbed';
import { AntiGif } from './AntiGif';
import { AntiLink } from './AntiLink';
import { NiceNicks } from './NiceNicks';
import { Profanity } from './Profanity';
import { ChannelData, ChannelEndpointData, RoleData, RoleEndpointData, WarnConf, WarnConfEndpointData } from '../../../../../gm';
import Select from 'react-select';

export function DashboardAutomod(props: HomeProps/* {match}: RouteComponentProps<MatchParams> */) {
    const { setStatus } = props;
    const [loaded, setLoaded] = React.useState(false);
    const [channels, setChannels] = React.useState<ChannelData[]>([]);
    const [roles, setRoles] = React.useState<RoleData[]>([]);
    const [warnConf, setWarnConf] = React.useState<WarnConf>({ punishment: "", threshold: 0, time: 0});

    React.useEffect(() => {
        fetch(`/api/discord/guilds/${props.meta.id}/channels`)
            .then(x => x.json())
            .then((d: ChannelEndpointData) => {
                setChannels(d.channels);
                return fetch(`/api/discord/guilds/${props.meta.id}/roles`);
            })
            .then(x => x.json())
            .then((d: RoleEndpointData) => {
                setRoles(d.roles);
                return fetch(`/api/discord/guilds/${props.meta.id}/warnconf`);
            })
            .then(x => x.json())
            .then((d: WarnConfEndpointData) => {
                setWarnConf(d.conf);
            })
            .catch(e => {
                setStatus(e.message);
                setLoaded(false);
            })
            .then(() => setLoaded(true))
    }, [props, setStatus]);

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
                }).catch(e => {
                    console.error(e);
                    setStatus({ msg: "Error", success: false });
                });
        } catch (error) {
            console.error(error);
            setStatus({ msg: "Failed to save.", success: false });
        }
    };

    const handleWarnConfSaveClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const hdrs = new Headers();
        hdrs.append("Content-Type", "application/x-www-form-urlencoded");
        const fd = new URLSearchParams();
        const stringConf = JSON.stringify(warnConf);
        fd.append("data", `${stringConf}`);
        const obj = {
            method: 'PUT',
            headers: hdrs,
            body: fd
        };
        try {
            fetch(`/api/discord/guilds/${props.meta.id}/warnconf`, obj)
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

    const handleWarnPunishmentChange = (v: any) => {
        const m = Object.assign({}, warnConf);
        m.punishment = v.value || undefined;
        setWarnConf(m);
    }

    const handleWarnTimeChange = (valueAsString: string, valueAsNumber: number) => {
        const m = Object.assign({}, warnConf);
        m.time = valueAsNumber;
        setWarnConf(m);
    }

    const handleWarnThresholdChange = (valueAsString: string, valueAsNumber: number) => {
        const m = Object.assign({}, warnConf);
        m.threshold = valueAsNumber;
        setWarnConf(m);
    }

    return loaded ? (
        <div style={{ width: "100%", padding: "0 15px", marginLeft: "auto", marginRight: "auto" }}>
            <br />
            <div className="control-row">
                <div className="x-card-parent">
                    <div className="x-card">
                        <div className="x-card-header">What Is Automod</div>
                        <div className="x-card-body">
                            <p>In this bot, automod is the name of a collection of uniquely purposed modules that run in the background and serve various purposes in the bot. These modules are there to moderate and manage your server as you see fit. Many of them watch over users and messages to filter them and protect others in the server. This includes features like preventing various types of messages and message content. Automod is fully off by default, and you can enable any module at your discretion. Some modules work better together.</p>
                            <hr style={{ marginTop: 10, marginBottom: 15 }} />
                            <h4 className="cardsubtitle">Using Automod</h4>
                            <p>Automod is comprised of various modules. From this dashboard, you have the ability to control those modules. With this dashboard, you can control each module's active status, the channels it should work in, and its behavior.</p>
                            <hr style={{ marginTop: 10, marginBottom: 15 }} />
                            <h4 className="cardsubtitle">Member Warns</h4>
                            <p>Warnings may be issued by the automod or by moderators. Use this config tool to select what happens if warnings surpass a set limit.</p>
                            <div style={{ height: 5 }} />
                            <p style={{ fontWeight: 700 }}>Warn Threshold:</p>
                            <NumberInput id="wc-threshold" min={-1} defaultValue={0} value={warnConf.threshold} onChange={handleWarnThresholdChange}>
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            <div style={{ height: 5 }} />
                            <p style={{ fontWeight: 700 }}>Punishment:</p>
                            <Select
                                placeholder="Select punishment . . ."
                                options={['tempmute', 'mute', 'kick', 'tempban', 'ban'].map(c => {
                                    return { value: c, label: `${c}` };
                                })}
                                menuPlacement="auto"
                                value={warnConf.punishment ? { value: warnConf.punishment, label: warnConf.punishment } : { label: "None" }}
                                onChange={handleWarnPunishmentChange}
                                styles={selectStylesMK1}
                            />
                            {warnConf.punishment && ["tempmute", "tempban"].includes(warnConf.punishment || "") ? (
                                <>
                                    <div style={{ height: 5 }} />
                                    <p style={{ fontWeight: 700 }}>Punishment Length (sec):</p>
                                    <NumberInput id="wc-punishtime" min={0} defaultValue={0} value={warnConf.time} onChange={handleWarnTimeChange}>
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                </>
                            ) : <></>}
                            <div>
                                <hr style={{ marginTop: 10, marginBottom: 5 }} />
                                <button className="am-save-button" onClick={handleWarnConfSaveClick}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="x-card-parent">
                    <AutomoduleCard {...props} channels={channels.filter(c => c.type === "text")} roles={roles} handleModuleSave={handleModuleSave}
                        displayName="Spam Prevention"
                        headerTag="ALPHA"
                        name="antispam"
                        description="ALPHA: Prevent spam anywhere in your server. The base feature of this module measures the message rate in your channel and at an excessive rate will begin silencing new messages. Feedback for this command is being accepted in the support server for the bot: https://dsc.gg/ro."
                        isTextModule
                    />
                </div>
                <div className="x-card-parent">
                    <AutomoduleCard {...props} channels={channels.filter(c => c.type === "text")} roles={roles} handleModuleSave={handleModuleSave}
                        displayName="Anti Embed"
                        name="antiembed"
                        description="This module will suppress all embeds that appear in a channel. This includes embeds from bots and links. Soon there will be an option to toggle for bots or roles."
                        isTextModule
                        CustomOptions={AntiEmbed}
                    />
                </div>
                <div className="x-card-parent">
                    <AutomoduleCard {...props} channels={channels.filter(c => c.type === "text")} roles={roles} handleModuleSave={handleModuleSave}
                        displayName="Anti Gif"
                        name="antigif"
                        description="This module will delete all messages that have GIFs (the most common animated image format) attached to them."
                        isTextModule
                        CustomOptions={AntiGif}
                    />
                </div>
                <div className="x-card-parent">
                    <AutomoduleCard {...props} channels={channels.filter(c => c.type === "text")} roles={roles} handleModuleSave={handleModuleSave}
                        displayName="Anti Link"
                        name="antilink"
                        description="This module will delete all messages containing links detected in their text. This does not apply to embeds (the special message blocks sent by bots or webhooks)."
                        isTextModule
                        CustomOptions={AntiLink}
                    />
                </div>
                <div className="x-card-parent">
                    <AutomoduleCard {...props} channels={channels.filter(c => c.type === "text")} roles={roles} handleModuleSave={handleModuleSave}
                        displayName="Nice Nicknames"
                        name="nicenicks"
                        description="This module will watch the nicknames of new users or any changes in existing users to make sure at least the first five letters exist on the printable ASCII table. If a user has an unfriendly username, it will automatically be changed to a placeholder and they will receive a message from the bot."
                        CustomOptions={NiceNicks}
                    />
                </div>
                <div className="x-card-parent">
                    <AutomoduleCard {...props} channels={channels.filter(c => c.type === "text")} roles={roles} handleModuleSave={handleModuleSave}
                        displayName="Christian Mode / Banned Phrases"
                        name="profanity"
                        description="Christian mode for your server. Enabling this module will censore all popular obscene language and many variations of that totally vulgar content."
                        isTextModule
                        CustomOptions={Profanity}
                    />
                </div>
            </div>
        </div>
    ) : (
            <Center className="lspinner">
                <Spinner color="red.500" size="xl" css="margin:auto" />
            </Center>
        )
}
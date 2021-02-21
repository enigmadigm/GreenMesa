import React from 'react';
import { GuildItemSpecial } from '../../../../../gm';
import { Button, Image } from '@chakra-ui/react';
import { host } from '../../index';

interface GuildMenuItemProps {
    guild: GuildItemSpecial;
}

export function GuildMenuItem(props: GuildMenuItemProps) {
    const { guild } = props;

    const openInvitePanel = () => {
        window.open(`${host}/invite/${guild.id}`, "Invite Stratum", "height=700,width=500");
    }

    return (
        <div className={`gmi${!guild.bot ? " gmi-unclaimed" : ""}`}>
            <div className="gminfo">
                <div className="gmicon">
                    {guild.icon ? (
                        <Image src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}?size=64`} alt="Icon" objectFit="contain"></Image>
                    ) : (
                        <div className="gmplacer">
                            <div>
                                {guild.name ? guild.name[0] : ""}
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    {guild.name} {guild.owner ? (
                        <span className="gm-tag" title="You own this server">OWNER</span>
                    ) : <></>}
                </div>
            </div>
            <div className="gmopts">
                {guild.bot ? (
                    <Button onClick={() => { window.location.pathname = `/dash/${guild.id}` }}>View Dash</Button>
                ) : (
                    <Button className="gmb-nobot" onClick={openInvitePanel}>Add</Button>
                )}
            </div>
        </div>
    )
}
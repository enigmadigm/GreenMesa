import React from 'react';
import { GuildItemSpecial } from '../../../../../gm';
import { Button } from '@chakra-ui/react';
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
                {guild.name} {guild.owner ? (
                    <span style={{ padding: "2px 5px", borderRadius: "4px", backgroundColor: " #001f3f ", marginLeft: 5, fontSize: "0.7em" }} title="You own this server">OWNER</span>
                ) : <></>}
            </div>
            <div className="gmopts">
                {guild.bot ? (
                    <Button onClick={() => { window.location.pathname = `/dash/${guild.id}` }}>View Dashboard</Button>
                ) : (
                    <Button className="gmb-nobot" onClick={openInvitePanel}>Embark</Button>
                )}
            </div>
        </div>
    )
}
import React from 'react';
import { Heading, Box, Button, Divider } from '@chakra-ui/react';
import { host } from '../../index';

interface IProps {
    guildsButton?: boolean;
}

export function DashHeader(props: IProps) {
    return (
        <header>
            <Box className="top-header">
                <Heading className="h-title">Stratum Dashboard</Heading>
                <div className="lnav-buttons">
                    {props.guildsButton ? (
                        <Button variant="outline" type="submit" onClick={() => { window.location.pathname = `/menu` }}>Guilds</Button>
                    ) : ""}
                    <Button variant="outline" type="submit" onClick={() => { window.location.href = `${host}/invite` }}>Invite</Button>
                    <Button variant="outline" type="submit" onClick={() => { window.location.href = `${host}/api/auth/logout` }}>Logout</Button>
                </div>
            </Box>
            <Divider />
            <br />
        </header>
    )
}
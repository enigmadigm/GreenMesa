import React from 'react';
//import { Link } from 'react-router-dom';
import { RESTAPIPartialCurrentUserGuild } from 'discord-api-types';
import { Table, Thead, Tbody, Tr, Th, Td, Button, Badge, Container } from '@chakra-ui/react';
//import { host } from '../../index';

interface IGuildProps/* extends RouteComponentProps*/ {
    guilds: RESTAPIPartialCurrentUserGuild[];
}

export function GuildMenuWrapper(props: IGuildProps) {
    const guilds = props.guilds;

    return (
        <Container>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Name</Th>
                        <Th>Options</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {guilds.map((guild) => (
                        <Tr key={guild.id}>
                            <Td>
                                {guild.name} {guild.owner ? <Badge>Owner</Badge> : ""}
                            </Td>
                            <Td>
                                <Button onClick={() => { window.location.pathname = `/dash/${guild.id}`}}>View Dashboard</Button>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Container>
    )
}
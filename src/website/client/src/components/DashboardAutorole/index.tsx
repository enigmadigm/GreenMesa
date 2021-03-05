import { Center, Spinner } from '@chakra-ui/react';
import React from 'react';
import { AutoroleEndpointData, LevelsEndpointData, RoleData, RoleEndpointData } from '../../../../../gm';
import { HomeProps } from '../../pages/DashboardPage';
//import { /*Input, Button, Container*/ } from '@chakra-ui/react';
//import { Formik } from "formik";

interface Level {
    id: string;
    name: string;
    color: string;
    level: number;
}

function AutoroleCard(props: { level: Level }) {
    const { level } = props;
    return (
        <div className="levelcard">
            <div className="lc-left" style={{ color: level.color }} >
                <div>{level.name}</div>
            </div>
            <div className="lc-level" style={{ color: level.color }} >
                {level.level}
            </div>
        </div>
    )
}

export function DashboardAutorole(props: HomeProps) {
    const { setStatus } = props;
    const [loaded, setLoaded] = React.useState(false);
    const [roles, setRoles] = React.useState<RoleData[]>([]);
    const [arData, setARData] = React.useState<AutoroleEndpointData | undefined>();

    React.useEffect(() => {
        fetch(`/api/discord/guilds/${props.meta.id}/roles`)
            .then(x => x.json())
            .then((d: RoleEndpointData) => {
                setRoles(d.roles);
                return fetch(`/api/discord/guilds/${props.meta.id}/autoroles`);
            })
            .then(x => x.json())
            .then((d: AutoroleEndpointData) => {
                setARData(d);
            })
            .catch(e => {
                setStatus(e.message);
                setLoaded(false);
            })
            .then(() => setLoaded(true))
    }, [props, setStatus]);

    return loaded ? (
        <div style={{ width: "100%", padding: "0 15px", marginLeft: "auto", marginRight: "auto" }}>
            <br />
            <div className="control-row">
                <div className="x-card-parent">
                    <div className="x-card">
                        <div className="x-card-header">Autorole</div>
                        <div className="x-card-body">
                            <p style={{ marginBottom: "1rem" }}>View the autorole configuration.</p>
                            <h4 className="cardsubtitle">Leveling</h4>
                            <p style={{ marginBottom: "1rem" }}>Nothing here yet.</p>
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
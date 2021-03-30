import { Center, Spinner } from '@chakra-ui/react';
import React from 'react';
import { LevelsEndpointData, RoleData, RoleEndpointData } from '../../../../../gm';
import { HomeProps } from '../../pages/DashboardPage';
import './Levels.css';
//import { /*Input, Button, Container*/ } from '@chakra-ui/react';
//import { Formik } from "formik";

interface Level {
    id: string;
    name: string;
    color: string;
    level: number;
}

function LevelCard(props: { level: Level }) {
    const { level } = props;
    return (
        <div className="levelcard">
            <div className="lc-left" style={{color: level.color}} >
                <div>{level.name}</div>
            </div>
            <div className="lc-level" style={{ color: level.color }} >
                {level.level}
            </div>
        </div>
    )
}

export function DashboardLeveling(props: HomeProps) {
    const { setStatus } = props;
    const [loaded, setLoaded] = React.useState(false);
    const [levels, setLevels] = React.useState<Level[]>([]);
    const [levelData, setLevelData] = React.useState<LevelsEndpointData | undefined>();
    const [roles, setRoles] = React.useState<RoleData[]>([]);

    React.useEffect(() => {
        fetch(`/api/discord/guilds/${props.meta.id}/roles`)
            .then(x => x.json())
            .then((d: RoleEndpointData) => {
                setRoles(d.roles);
                return fetch(`/api/discord/guilds/${props.meta.id}/levels`);
            })
            .then(x => x.json())
            .then((d: LevelsEndpointData) => {
                setLevelData(d);
            })
            .catch(e => {
                setStatus(e.message);
                setLoaded(false);
            })
            .then(() => setLoaded(true))
    }, [props, setStatus]);

    React.useEffect(() => {
        if (levelData) {
            setLevels(levelData.levels.map(l => {
                const r = roles.find(r2 => r2.id === l.roleid);
                return {
                    id: l.roleid,
                    name: r?.name || "deleted-role",
                    color: r?.hexColor || "#ffffff",
                    level: l.level
                }
            }))
        }
    }, [levelData, roles])

    return loaded ? (
        <div style={{ width: "100%", padding: "0 15px", marginLeft: "auto", marginRight: "auto" }}>
            <br />
            <div className="control-row">
                <div className="x-card-parent">
                    <div className="x-card">
                        <div className="x-card-header">Levels</div>
                        <div className="x-card-body">
                            <p style={{ marginBottom: "1rem" }}>View the levels your guild is configured to use.</p>
                            <h4 className="cardsubtitle">Leveling</h4>
                            <p style={{ marginBottom: "1rem" }}>Leveling is a user activity based system. When members chat in your server, they gain units referred to as xp, exp, experience, or whatever else your server wants to call them. Stratum keeps track of the points, and you can see a member leaderboard showing user rankings. There are rules for gaining points: members can gain from 15 - 26 points at most once per minute. As members gain points, they also level up. After levelling up, they still retain their points. Roles in your server can be rewarded for levelling up.</p>
                            <p style={{ marginBottom: "1rem" }}>Here you can see the levels that are currently set up. To configure the levels from your server, use the <code>sm settings levels</code> subcommand. It lets you assign existing roles to any level you want.</p>
                            <br />
                            <div className="levelssec">
                                {levelData && !levelData.enabled ? (
                                    <div className="inline-alert">
                                        Levelling is disabled. Even if level roles are set, they will not be used until leveling is enabled with <code>sm settings levels enable</code>.
                                    </div>
                                ) : <></>}
                                {levels.filter(x => x.name !== "deleted-role").length ? (
                                    <div className="levelcards">
                                        {levels.map(x => (
                                            <LevelCard key={`${x.id}-${x.level}`} level={x} />
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        No level roles are set in this server
                                    </>
                                )}
                            </div>
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
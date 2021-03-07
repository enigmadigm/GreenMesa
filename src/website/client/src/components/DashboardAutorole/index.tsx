import { Center, Spinner } from '@chakra-ui/react';
import React from 'react';
import Select, { OptionsType, OptionTypeBase } from 'react-select';
import { AutoroleData, AutoroleEndpointData, RoleData, RoleEndpointData } from '../../../../../gm';
import { HomeProps } from '../../pages/DashboardPage';
import { selectStylesMK2 } from '../DashboardAutomod/AutomoduleCard';
//import { /*Input, Button, Container*/ } from '@chakra-ui/react';
//import { Formik } from "formik";

/*function AutoroleCard(props) {
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
}*/

export function DashboardAutorole(props: HomeProps) {
    const { setStatus } = props;
    const [loaded, setLoaded] = React.useState(false);
    const [roles, setRoles] = React.useState<RoleData[]>([]);
    const [data, setData] = React.useState<AutoroleData>({ roles: [], botRoles: [] });

    React.useEffect(() => {
        fetch(`/api/discord/guilds/${props.meta.id}/roles`)
            .then(x => x.json())
            .then((d: RoleEndpointData) => {
                setRoles(d.roles);
                return fetch(`/api/discord/guilds/${props.meta.id}/autoroles`);
            })
            .then(x => x.json())
            .then((d: AutoroleEndpointData) => {
                setData(d.data);
            })
            .catch(e => {
                setStatus(e.message);
                setLoaded(false);
            })
            .then(() => setLoaded(true))
    }, [props, setStatus]);

    const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const hdrs = new Headers();
        hdrs.append("Content-Type", "application/x-www-form-urlencoded");
        const fd = new URLSearchParams();
        const stringConf = JSON.stringify(data);
        fd.append("data", `${stringConf}`);
        const obj = {
            method: 'PUT',
            headers: hdrs,
            body: fd
        };
        try {
            fetch(`/api/discord/guilds/${props.meta.id}/autorole`, obj)
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

    const handleUserRolesValueChange = (v: OptionsType<OptionTypeBase>) => {
        const m = Object.assign({}, data);
        m.roles = v.map(v1 => v1.value);
        setData(m);
    }

    const handleBotRolesValueChange = (v: OptionsType<OptionTypeBase>) => {
        const m = Object.assign({}, data);
        m.botRoles = v.map(v1 => v1.value);
        setData(m);
    }

    return loaded ? (
        <div style={{ width: "100%", padding: "0 15px", marginLeft: "auto", marginRight: "auto" }}>
            <br />
            <div className="control-row">
                <div className="x-card-parent">
                    <div className="x-card">
                        <div className="x-card-header">Autoroles</div>
                        <div className="x-card-body">
                            <h4 className="cardsubtitle">Users</h4>
                            <p style={{ marginBottom: "1rem" }}>Set the roles that will be given to normal users when they join.</p>
                            <Select
                                placeholder="Select roles . . ."
                                isMulti
                                options={roles.map(c => {
                                    return { value: c.id, label: `@${c.name}`, color: c.hexColor };
                                })}
                                menuPlacement="auto"
                                value={data.roles?.map(c => {
                                    const cr = roles.find(x => x.id === c);
                                    if (cr) {
                                        return { value: cr.id, label: `${cr.name}`, color: cr.hexColor };
                                    } else {
                                        return {};
                                    }
                                })}
                                onChange={handleUserRolesValueChange}
                                styles={selectStylesMK2}
                            />
                            <br/>
                            <h4 className="cardsubtitle">Bots</h4>
                            <p style={{ marginBottom: "1rem" }}>Set the roles that will be given to bots when they are added.</p>
                            <Select
                                placeholder="Select roles . . ."
                                isMulti
                                options={roles.map(c => {
                                    return { value: c.id, label: `@${c.name}`, color: c.hexColor };
                                })}
                                menuPlacement="auto"
                                value={data.botRoles?.map(c => {
                                    const cr = roles.find(x => x.id === c);
                                    if (cr) {
                                        return { value: cr.id, label: `${cr.name}`, color: cr.hexColor };
                                    } else {
                                        return {};
                                    }
                                })}
                                onChange={handleBotRolesValueChange}
                                styles={selectStylesMK2}
                            />
                        </div>
                        <div className="card-footer">
                            <button className="card-footer-button" onClick={handleSaveClick}>Save</button>
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
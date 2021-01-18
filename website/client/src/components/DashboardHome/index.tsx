import React from 'react';
import { /*Input, Button,*/ Container } from '@chakra-ui/react';
import { Formik } from "formik";
//import { RouteComponentProps } from 'react-router-dom';
import { GMeta, IUser } from '../../pages/DashboardPage';

interface HomeProps {
    //match: RouteComponentProps<MatchParams>;
    user: IUser;
    meta: GMeta;
    
}

/*interface MatchParams {
    id: string;
}*/

export function DashboardHome(props: HomeProps/* {match}: RouteComponentProps<MatchParams> */) {
    //const [prefix, setPrefix] = React.useState("sm");

    return (
        <Container style={{ width: "100%", padding: "0 15px", marginLeft: "auto", marginRight: "auto" }}>
            <br />
            <div className="control-row">
                <div style={{ /*flex: "0 0 50%",*/ position: "relative", width: "100%", paddingRight: 15, paddingLeft: 15 }}>
                    <div className="x-card">
                        <div className="x-card-header">Prefix</div>
                        <div className="x-card-body">
                            <Formik
                                initialValues={{ prefix: props.meta.prefix }}
                                onSubmit={async (values) => {
                                    try {
                                        const hdrs = new Headers();
                                        hdrs.append("Content-Type", "application/x-www-form-urlencoded");
                                        const fd = new URLSearchParams();
                                        fd.append("prefix", `${values.prefix}`);
                                        const obj = {
                                            method: 'PUT',
                                            headers: hdrs,
                                            body: fd
                                        };
                                        await fetch(`/api/discord/guilds/${props.meta.id}/prefix`, obj);
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }}
                            >
                                {
                                    (fprops) => (
                                        <form onSubmit={fprops.handleSubmit}>
                                            <h4 className="cardsubtitle">Set Bot Prefix</h4>
                                            <p style={{ marginBottom: "1rem" }}>Set the prefix of the bot in the server.</p>
                                            <div className="input-group">
                                                <input type="text" name="prefix" onChange={fprops.handleChange} defaultValue={props.meta.prefix} style={{ color: "black", padding: "5px 8px" }} />
                                                <button type="submit" style={{ backgroundColor: "#2F353A", border: "solid #fff 1px", padding: "4px 10px" }}>Update Prefix</button>
                                            </div>
                                        </form>
                                    )
                                }
                            </Formik>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    )
}
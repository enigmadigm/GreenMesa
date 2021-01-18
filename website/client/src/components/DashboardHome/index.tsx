import React from 'react';
import { /*Input, Button,*/ Container } from '@chakra-ui/react';
import { Formik, ErrorMessage } from "formik";
import { GMeta, IUser } from '../../pages/DashboardPage';
import * as yup from 'yup';
//import { RouteComponentProps } from 'react-router-dom';

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

    const prefixSchema = yup.object().shape({
        prefix: yup.string().required()
    });

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
                                onSubmit={async (values, actions) => {
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
                                        actions.setStatus({
                                            sent: true,
                                            msg: "Prefix updated."
                                        })
                                    } catch (e) {
                                        console.error(e);
                                        actions.setStatus({
                                            sent: false,
                                            msg: "There was an error. Try reloading."
                                        })
                                    }
                                }}
                                validationSchema={prefixSchema}
                            >
                                {
                                    (fprops) => (
                                        <form onSubmit={fprops.handleSubmit}>
                                            <h4 className="cardsubtitle">Set Bot Prefix</h4>
                                            <p style={{ marginBottom: "1rem" }}>Set the prefix of the bot in the server.</p>
                                            <div className="input-group">
                                                <input type="text" name="prefix" onChange={fprops.handleChange} defaultValue={fprops.values.prefix} style={{ color: "black", padding: "5px 8px" }} />
                                                <button className="c-button" type="submit" disabled={fprops.isSubmitting}>Update Prefix</button>
                                                <br/>
                                                <br/>
                                                {fprops.status && fprops.status.msg && (
                                                    <div className={`field-alert ${fprops.status.sent ? "field-success" : "field-error"}`}>
                                                        {fprops.status.msg}
                                                    </div>
                                                )}
                                                <ErrorMessage name="prefix">
                                                    {(msg) => (
                                                        <div className="field-alert field-error">{msg}</div>
                                                    )}
                                                </ErrorMessage>
                                            </div>
                                        </form>
                                    )
                                }
                            </Formik>
                        </div>
                    </div>
                </div>
            </div>
            <br/>
            <div className="control-row">
                <div style={{ /*flex: "0 0 50%",*/ position: "relative", width: "100%", paddingRight: 15, paddingLeft: 15 }}>
                    <div className="x-card">
                        <div className="x-card-header">Moderation</div>
                        <div className="x-card-body">
                            <h4 className="cardsubtitle">Toggle Moderation Features</h4>
                            <p style={{ marginBottom: "1rem" }}>Set whether moderation features are allowed to be used on Stratum.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    )
}
import React from 'react';
import { /*Input, Button,*/ Container } from '@chakra-ui/react';
//import { Formik } from "formik";
import { RouteComponentProps } from 'react-router-dom';

interface MatchParams {
    id: string;
}

export function DashboardLevelling({ match }: RouteComponentProps<MatchParams>) {
    return (
        <Container style={{ width: "100%", padding: "0 15px", marginLeft: "auto", marginRight: "auto" }}>
            <br />
            <div className="control-row">
                <div style={{ /*flex: "0 0 50%",*/ position: "relative", width: "100%", paddingRight: 15, paddingLeft: 15 }}>
                    <div className="x-card">
                        <div className="x-card-header">Levels</div>
                        <div className="x-card-body">
                            <h4 className="cardsubtitle">Levelling Controls</h4>
                            <p style={{ marginBottom: "1rem" }}>Once developed, this area will provide controls and config for the levelling features of Stratum.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    )
}
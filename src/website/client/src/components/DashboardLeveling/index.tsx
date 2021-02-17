import React from 'react';
import { HomeProps } from '../../pages/DashboardPage';
//import { /*Input, Button, Container*/ } from '@chakra-ui/react';
//import { Formik } from "formik";

export function DashboardLeveling(props: HomeProps) {
    return (
        <div style={{ width: "100%", padding: "0 15px", marginLeft: "auto", marginRight: "auto" }}>
            <br />
            <div className="control-row">
                <div className="x-card-parent">
                    <div className="x-card">
                        <div className="x-card-header">Levels</div>
                        <div className="x-card-body">
                            <h4 className="cardsubtitle">Leveling Controls</h4>
                            <p style={{ marginBottom: "1rem" }}>Once developed, this area will provide controls and config for the leveling features of Stratum.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
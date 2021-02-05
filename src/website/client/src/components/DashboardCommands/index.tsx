import React from 'react';
import { HomeProps } from '../../pages/DashboardPage';

export function DashboardCommands(props: HomeProps) {
    return (
        <div style={{ width: "100%", padding: "0 15px", marginLeft: "auto", marginRight: "auto" }}>
            <br />
            <div className="control-row">
                <div style={{ /*flex: "0 0 50%",*/ position: "relative", width: "100%", paddingRight: 15, paddingLeft: 15 }}>
                    <div className="x-card">
                        <div className="x-card-header">Commands</div>
                        <div className="x-card-body">
                            <h4 className="cardsubtitle">Command Config</h4>
                            <p style={{ marginBottom: "1rem" }}>Enable or disable the commands for Stratum.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
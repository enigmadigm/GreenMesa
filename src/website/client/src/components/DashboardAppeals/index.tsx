import { Center, Spinner } from '@chakra-ui/react';
import React from 'react';
import { HomeProps } from '../../pages/DashboardPage';

export function DashboardAppeals(props: HomeProps) {
    const { setStatus } = props;
    const [loaded, setLoaded] = React.useState(false);

    React.useEffect(() => {
        fetch(`/api/discord/guilds/${props.meta.id}/config`)
            .then(x => x.json())
            .then((d) => {
                // set(d);
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
                        <div className="x-card-header">Appeals</div>
                        <div className="x-card-body">
                            <p style={{ marginBottom: "1rem" }}>An automated system of punishment appeals collection based on this website.</p>
                            <h4 className="cardsubtitle">Appealing</h4>
                            <p style={{ marginBottom: "1rem" }}>The behavior and use of this system is up to you. The intended purpose of this feature is to make it easy for moderators to collect and process appeals from members. These appeals may be for things like bans or other punishments. This system makes it possible to do this without having to go through a manual service like Google Forms. Users can simply submit their appeal on the appeals page, and moderators can take it from there.</p>
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

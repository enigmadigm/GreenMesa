import { Guild, User } from "discord.js";
import { InviteData, InviteStateData, XClient } from "../gm";

/**
 * This class tracks invites
 * every time a member joins or leaves, update is called which updates the state in the db
 * the old state is also compared with the new state, and the invites that have a different number of uses are considered to have been used or caused a member to leave
 */
export default class {
    public client: XClient;

    constructor(client: XClient) {
        this.client = client;
    }

    public async update(guild: Guild): Promise<void> {
        const previousResult = await this.client.database.getGuildSetting(guild.id, "invites_data");//TODO: make this method for interactions with the table
        if (!previousResult) return;
        const stateBefore: InviteStateData = JSON.parse(previousResult.value);
        const invitesBefore = stateBefore.invites;
        const invitesCollection = await guild.fetchInvites();
        const invites: InviteData[] = invitesCollection.filter(x => typeof x.uses === "number" && x.inviter instanceof User).map((x) => {
            return { inviter: x.inviter?.id || "", uses: x.uses || 0, code: x.code, channel: x.channel.id };
        });

    }
    //TODO: to receive the member that has left or joined separate function(s) needed to handle exact member change
    /// OR: an argument for update() `state` boolean
}
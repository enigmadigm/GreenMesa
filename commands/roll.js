const xlg = require("../xlogger");
const { getGlobalSetting } = require("../dbmanager");
const { DiceRoll } = require('rpg-dice-roller');

module.exports = {
    name: 'roll',
    description: {
        short: 'role rpg dice or learn dice notation',
        long: 'Send no arguments to learn how to use dice notation with this command or in general. Send valid dice notation with the command to...roll dice, pretty much.'
    },
    usage: "[number of and die type (e.g. 4d6)]",
    aliases: ['r', 'dice', 'cast'],
    category: "fun",
    async execute(client, message, args) {
        let notation = args.join(" ") || false;
        if (!notation) {
            return message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting("darkred_embed_color"))[0].value, 10),
                    title: '🔤 dice notation :game_die:',
                    description: "**Die quantity**\nA single die has a minimum quantity of `1`, and a maximum quantity of `999`.\n*These are valid:* `d8, 1d10, 999d6, 20d4 + 999d10`\n*These are not:* `0d10, 1000d6, -1d20`\n\n**Standard (d{n})**\nA standard die has a positive numerical number of sides, like typical 6 sided dice, or a d20. You can roll dice with almost any number of sides.```js\nd6 // roll a single 6 sided dice \n4d10 // roll a 10 sided dice 4 times and add the results together\n```\n**Percentile dice (d%)**\nPercentile dice roll a whole number between `1-100`, and are specified with the format `d%`. This is a shorthand for a standard die with 100 sides, `d100`\n```js\n4d%  // roll a percentile die 4 times and add the results together\n```Is equivalent to:```js\n4d100 // roll a 100 sided die 4 times and add the results together\n```\n[Dice Notation](https://en.wikipedia.org/wiki/Dice_notation) Wikipedia article\n[RPGDR](https://github.com/GreenImp/rpg-dice-roller) ([MIT](https://opensource.org/licenses/MIT))",
                    footer: {
                        text: "RPG Dice Roller",
                        iconURL: "https://avatars0.githubusercontent.com/u/1846676?s=460&u=92bead751a59a193c0fbd2326862ed03b61dd404&v=4"
                    }
                }
            }).catch(xlg.error);
        }
        try {
            const roll = new DiceRoll(notation);
            const desc = `\`\`\` ${roll.output} \`\`\`\n🔹**Maximum Total:** ${roll.maxTotal}\n🔹**Minimum Total:** ${roll.minTotal}\n🔹**Average Total:** ${roll.averageTotal}`;
            if (desc.length > 2044) throw new Error("The message would have broken Discord's character limit.");
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting("darkred_embed_color"))[0].value, 10),
                    description: desc,
                    footer: {
                        text: "RPG Dice Roller",
                        iconURL: "https://avatars0.githubusercontent.com/u/1846676?s=460&u=92bead751a59a193c0fbd2326862ed03b61dd404&v=4"
                    }
                }
            }).catch(xlg.error);
        } catch (error) {
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting("fail_embed_color"))[0].value, 10),
                    title: 'Error Rolling',
                    description: `${error.message}`
                }
            }).catch(xlg.error);
        }
    }
}
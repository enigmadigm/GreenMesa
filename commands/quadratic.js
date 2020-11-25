const xlg = require("../xlogger");
const { getGlobalSetting } = require("../dbmanager")

module.exports = {
    name: "quadratic",
    description: "find the 0s of a quadratic",
    usage: "<a> <b> <c>",
    args: true,
    async execute(client, message, args) {
        if (!(await client.specials.argsNumRequire(message.channel, args, 3))) return false;
        if (!(await client.specials.argsMustBeNum(message.channel, args))) return false;

        /* Thanks, this saved me time
         * https://www.programiz.com/javascript/examples/quadratic-roots
         */

        let a = args[0];
        let b = args[1];
        let c = args[2];
        // calculate discriminant
        let discriminant = b * b - 4 * a * c;
        let root1, root2;

        // condition for real and different roots
        if (discriminant > 0) {
            root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            root2 = (-b - Math.sqrt(discriminant)) / (2 * a);

            // result
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting('darkgreen_embed_color'))[0].value),
                    title: "Quadratic Solution: Two Real Roots",
                    description: `The roots of quadratic equation are \`${root1}\` and \`${root2}\``
                }
            }).catch(xlg.error);
        }

        // condition for real and equal roots
        else if (discriminant == 0) {
            root1 = root2 = -b / (2 * a);

            // result
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting('darkgreen_embed_color'))[0].value),
                    title: "Quadratic Solution: Double Root",
                    description: `The roots of quadratic equation are \`${root1}\` and \`${root2}\``
                }
            }).catch(xlg.error);
        }

        // if roots are not real
        else {
            let realPart = (-b / (2 * a)).toFixed(2);
            let imagPart = (Math.sqrt(-discriminant) / (2 * a)).toFixed(2);

            // result
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting('darkgreen_embed_color'))[0].value),
                    title: "Quadratic Solution: Imaginary Roots",
                    description: `The roots of quadratic equation are \`${realPart} + ${imagPart}i\` and \`${realPart} - ${imagPart}i\``
                }
            }).catch(xlg.error);
        }
    }
}
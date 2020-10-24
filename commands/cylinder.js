const xlg = require("../xlogger");
const { getGlobalSetting } = require("../dbmanager");
const { argsMustBeNum, argsNumRequire } = require('../utils/specialmsgs');

// https://www.w3resource.com/javascript-exercises/javascript-object-exercise-5.php
function Cylinder(cyl_height, cyl_diameter) {
  this.cyl_height = cyl_height;
  this.cyl_diameter = cyl_diameter;
}
Cylinder.prototype.Volume = function () {
  var radius = this.cyl_diameter / 2;
  return this.cyl_height * Math.PI * radius * radius;
};

module.exports = {
    name: "cylinder",
    description: "find the area/surface of a cylinder",
    usage: "<height> <diameter>",
    args: true,
    async execute(client, message, args) {
        if (!(await argsNumRequire(message.channel, args, 2))) return false;
        if (!(await argsMustBeNum(message.channel, args))) return false;

        var cyl = new Cylinder(args[0], args[1]);

        message.channel.send({
            embed: {
                color: parseInt((await getGlobalSetting('darkgreen_embed_color'))[0].value),
                title: "Area of Cylinder: Answer",
                description: `The total area is \`${cyl.Volume().toFixed(4)}\``
            }
        }).catch(xlg.error);
    }
}
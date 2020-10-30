module.exports = {
  name: "eval",
  aciklama: "Nairobi",
  async calistir(client, message, args) {
       let owner = ["712441813952364565", "356849332395180032"];
        if (owner.includes(message.author.id)) {
       
          try {
            var evaled = clean(await eval(args.join(" ")));
            message.channel.send(`${evaled.replace(new RegExp(client.token, "g"), "nairobi")}`.replace("undefined", "Bulunamadı!"), { code: "js", split: true })
          } catch (err) {
            message.channel.send(err, { code: "js", split: true })
          }
          function clean(text) {
            if (typeof text !== "string")
              text = require("util").inspect(text, { depth: 0 });
            text = text
              .replace(/`/g, "`" + String.fromCharCode(8203))
              .replace(/@/g, "@" + String.fromCharCode(8203));
            return text;
          }
  }
  }
};

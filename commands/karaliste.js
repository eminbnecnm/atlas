module.exports = {
  name: "karaliste",
  aciklama: "Nairobi",
  async calistir(client, message, args) {
const db = require("quick.db")
const request = require("request")
const Discord = require("discord.js")
      let owner = ["712441813952364565", "356849332395180032"];
      if (owner.includes(message.author.id)) {


        
         if(args[0] === "ekle") {
           let id = args[1]
           if(!id) return message.channel.send("Lütfen karalisteye eklenecek kullanıcının ID'sini giriniz.").then(x => x.delete(15000))
           if(isNaN(id)) return message.channel.send("ID Girdiğinize Emin olun.").then(x => x.delete(15000))
           let reason = args.slice(2).join(' ')
           if(!reason) return message.channel.send("Lütfen sebep yaz. Min: `25` karakter.").then(x => x.delete(15000))
           if(reason.length < 25) return message.channel.send("Minumum `25` Karakter.") .then(x => x.delete(15000))
          request({
          url: `https://discord.com/api/v6/users/${id}`,
          headers: {
            "Authorization": `Bot ${process.env.token}`,
            "Content-Type": "application/json"
          },
        }, function(error, response, body) {
          if (error) return console.log(error)
          let üye = JSON.parse(body)
          
          let karaliste = db.get(`karaliste_${id}`)
          if(karaliste) {
            message.channel.send("Kullanıcı Zaten Karalisteye Ekli.").then(x => x.delete(15000))
          } else {
           db.set(`karaliste_${id}`, {sebep: reason})
           message.channel.send(`<@${üye.id}> \`${üye.username} / ${üye.id}\` Karalisteye Eklendi.`).then(x => x.delete(15000))
           client.channels.get(process.env.karalistelog).send(new Discord.RichEmbed().setColor("RED").setDescription(`<@${üye.id}> \`${üye.username} / ${üye.id}\` Adlı Üye <@${message.author.id}> \`${message.author.username} / ${message.author.id}\`  Tarafından Karalisteye Eklendi.\nSebep: \`${reason}\``))
            
            }
         })
       
       } 
          
        
        if(args[0] === "çıkar") {
        let id = args.slice(1).join(' ')
        if(!id) return message.channel.send("Lütfen karalisteye eklenecek kullanıcının ID'sini giriniz.").then(x => x.delete(15000))
        if(isNaN(id)) return message.channel.send("ID Girdiğinize Emin olun.").then(x => x.delete(15000))
          
        request({
          url: `https://discord.com/api/v6/users/${id}`,
          headers: {
            "Authorization": `Bot ${process.env.token}`,
            "Content-Type": "application/json"
          },
        }, function(error, response, body) {
          if (error) return console.log(error)
          let üye = JSON.parse(body) 
          
        let karaliste = db.get(`karaliste_${id}`)
        if(karaliste == undefined) {
          message.channel.send("Zaten Karalisteye Ekli Değil.").then(x => x.delete(15000))
        } else {
          db.delete(`karaliste_${id}`)
          message.channel.send(`<@${üye.id}> \`${üye.username} / ${üye.id}\` Karalisteden Çıkarıldı.`).then(x => x.delete(15000))
          client.channels.get(process.env.karalistelog).send(new Discord.RichEmbed().setColor("GREEN").setDescription(`<@${üye.id}> \`${üye.username} / ${üye.id}\` Adlı Üye <@${message.author.id}> \`${message.author.username} / ${message.author.id}\` Tarafından Karalisteden Çıkartıldı.`))
        }
          })
    
       }}
    
    if(!args[0]) return message.channel.send(`Kullanım Şekli:\n\`!karaliste ekle 712441813952364565 sebep(Min: 25 Karakter)\n!karaliste çıkar 712441813952364565\` `).then(x => x.delete(40000))
    
  }
};

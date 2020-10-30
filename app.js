const Discord  = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const client = new Discord.Client({disableEveryone: true});
const express = require('express');
const nairobi = require('express-handlebars');
const passport = require("passport");
const { Strategy } = require("passport-discord");
const session = require("express-session");
const useful = require('useful-tools')
const url = require("url");
const app = express();
const randomString = require("random-string");
const bookman = require("bookman");
const db = (global.db = {});
const bodyParser = require("body-parser");
const path = require("path");
const qdb = require("quick.db")
const request = require("request")
let ayar = {prefix: "!"}

const listener = app.listen(process.env.PORT || 8000, function() {
	console.log('Your app is listening on port ' + listener.address().port);
});

client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(join(__dirname, "commands", `${file}`));
  client.commands.set(command.name, command);
}

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  if (message.content.startsWith(ayar.prefix)) {
    const args = message.content.slice(ayar.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
      client.commands.get(commandName) ||
      client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 1) * 3000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 3000;
        return message.reply(`Lütfen \`${command.name}\` komutunu tekrar kullanmadan önce ${timeLeft.toFixed(1)} saniye bekleyin!`)
      }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
      command.calistir(client, message, args);
    } catch (error) {
      console.error(error);
      message.reply(`\`${command.name}\` Kodunda Hata Var!`).catch(console.error);
    }
  }
});
 


client.login(process.env.token);
client.on("ready", () => {
    console.log("Site Ve Bot Açıldı! by Nairobi");
    client.user.setActivity("Atlas Development.")
});



let rütbeler = ["freecode", "inviter1", "inviter2", "inviter3", "inviteraltyapi", "botlist", "v12"]
for (let rütbe in rütbeler) {
  db[rütbeler[rütbe]] = new bookman(rütbeler[rütbe])
}

app.engine('hbs', nairobi({
    defaultLayout: 'main',
    extname: '.hbs'
}));

app.set('view engine', 'hbs');
app.use(express.static(__dirname + "/cssler"));



passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});
const scopes = ["identify", "guilds"];
passport.use(new Strategy(
    {
      clientID: process.env.botid,
      clientSecret: process.env.secrettoken,
      callbackURL: process.env.callback,
      scope: scopes
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => done(null, profile));
    }
  )
);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: false
  })
);

app.use(session({
    secret: "secret-session-thing",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.get("/giris", passport.authenticate("discord", { scope: scopes})
);
app.get("/callback",
  passport.authenticate("discord", {
    failureRedirect: "/error"
  }),
  (req, res) => {
  let karaliste = qdb.get(`karaliste_${req.user.id}`)
  if(karaliste) {
    req.logOut() 
     res.redirect(url.format({
        pathname: "/hata",
        query: {
          message:  `Karalisteye eklendiğin için siteye giriş yapamıyorsun. Sebep: ${karaliste.sebep}`
        }
      }))
    
    
  } else {
    res.redirect("/");
  client.channels.get(process.env.giriscikislog).send(`\`${req.user.username} / ${req.user.id}\` **${useful.tarih(new Date())}** Tarihinde siteye giriş yaptın.`)
  } 
 },
);
app.get("/cikis", (req, res) => {
  req.logOut();
  return res.redirect("/");
});


app.get('/', (req, res) => {

    res.render('home', {
      kullanıcı: req.user
    });
});



//RESİM SERVİSİ
/*app.get("/resimadd", (req, res) => {
  if (!req.user || !client.guilds.get(process.env.sunucuid).members.has(req.user.id)) return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: "1",
          message:  "Resim Ekleyebilmek için Discord sunucumuza katılmanız ve siteye giriş yapmanız gerekmektedir."
        }
      }) 
    );
  
res.render("resimadd", {
  kullanıcı: req.user
  });
});

const up = require("multer")({ dest: "public/" });
app.post("/resimadd", up.single("dosya"), (req, res) => {
  const id = randomString({ length: 20 });
  const { resim_isim } = req.body;
  
  qdb.set(`resim.${id}`, {
    imagePath: req.file.path,
    imageName: resim_isim,
    dosya: req.file
  });
  
  res.redirect("/resim/"+ id);
})


app.get("/resim/:id", (req, res) => {
  if (!req.params.id) return res.redirect("/");
  let data = qdb.get(`resim.${req.params.id}`);
  
  // const doc = veritabanı işlemleri
  //console.log(data.imagePath)
  res.render("resim", {
    kullanıcı: req.user || null,
    img: data.imagePath
  });
})*/
//RESİM UPLOAD




/*const fetch = require("node-fetch");
let uptimeMap = new Map();

setInterval(() => {
  Object.keys(qdb.get("uptime")).forEach((id) => {
 
    qdb.get(`uptime.${id}`).forEach(async({ url, time }) => {
      if (!uptimeMap.get(url)) {
        let req = await fetch(url);
      
        let newData = { uptimeNow: Date.now(), time, owner: id };
        if (!uptimeMap.get(url)) newData.firstUptime = Date.now();
      
        uptimeMap.set(url, newData)
      } else {
        if (time - (Date.now() - uptimeMap.get(url).time) > 0) return;
        
        let req = await fetch(url);
      
        let newData = { uptimeNow: Date.now(), time, owner: id };
        if (!uptimeMap.get(url)) newData.firstUptime = Date.now();
      
        uptimeMap.set(url, newData)
      }
    })
  })
}, 750)*/


app.get("/uptimeadd", (req, res) => {
    if (!req.user || !client.guilds.get(process.env.sunucuid).members.has(req.user.id)) return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message:  "Uptime sistemine erişmek için sunucumuza giriş yapmalı ve sitemize giriş yapmanız gerekmekte."
        }
      }) 
    );
    res.render("uptimeadd", {
      kullanıcı: req.user,
      kullanıcıisim: req.user.username+"#"+req.user.discriminator,
      tarih: useful.tarih(new Date())
  });
});


app.get("/uptimepanel", (req, res) => {
    if (!req.user || !client.guilds.get(process.env.sunucuid).members.has(req.user.id)) return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message:  "Uptime sistemine erişmek için sunucumuza giriş yapmalı ve sitemize giriş yapmanız gerekmekte."
        }
      }) 
    );
  Object.keys(qdb.get("uptime")).forEach((id) => {
 qdb.get(`uptime.${id}`).forEach(({ url, time }) => {
   
  const values = { days: "gün", hours: "saat", minutes: "dakika", seconds: "saniye" };
function calculateTime(calculatedTime) {
  let output = [];
  
  let convertedTime = new Date(calculatedTime);
  convertedTime = { days: Math.floor(calculatedTime / 86400000) , hours: convertedTime.getHours(), minutes: convertedTime.getMinutes(), seconds: convertedTime.getSeconds() };
  
  return Object.keys(values).filter((key) => convertedTime[key] != 0).map((key) => `${convertedTime[key]} ${values[key]}`).join(", ");
}
qdb.set(`aktiflik`, calculateTime(client.uptime))
    res.render("uptimepanel", {
      kullanıcı: req.user,
      kullanıcıisim: req.user.username+"#"+req.user.discriminator,
     // acikkalma: qdb.get(`aktiflik`),
      uptimeList: qdb.get(`uptime.${req.user.id}`)
  });
});
    })
  })

app.get("/uptimesil", (req, res) => {
  if (!req.user || !client.guilds.get(process.env.sunucuid).members.has(req.user.id) || !req.query.url) return res.redirect("/uptimepanel")
  let nArray = qdb.get(`uptime.${req.user.id}`);
  nArray = nArray.filter((x) => x.url != req.query.url);
  
  qdb.set(`uptime.${req.user.id}`, nArray)
  
  res.redirect("/uptimepanel")
})

app.post("/uptimeaddform", (req, res) => {
  if (!client.guilds.get(process.env.sunucuid).members.get(req.user.id).roles.has(process.env.member)) { 
   
   return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message:  "Uptimeye URL Ekleyebilmek için Sunucuda Members Rolüne Sahip Olmasılısın."
        }
      }) 
    );
   
   } else {
  let uptime = req.body
 
  let uptimeList = qdb.has(`uptime.${req.user.id}`) ? qdb.get(`uptime.${req.user.id}`).length : 0
      
  if (
    client.guilds.get(process.env.sunucuid).members.get(req.user.id).roles.has(process.env.booster) && 6 > uptimeList
  ) {
    qdb.push(`uptime.${req.user.id}`, { url: uptime.url, time: uptime.time })
      
    res.redirect(`/uptimepanel`);
  } else if(
    3 > uptimeList
  ) {
    qdb.push(`uptime.${req.user.id}`, { url: uptime.url, time: uptime.time })
      
    res.redirect(`/uptimepanel`);
  } else return res.redirect(url.format({
    pathname: "/hata",
    query: {
      message:  "Hakların Dolmuş."
    }
  }))
  client.channels.get(process.env.uptimelog).send(new Discord.RichEmbed()
.setColor("RED")
.setDescription(`<@${req.user.id}> \`${req.user.username+"#"+req.user.discriminator} / ${req.user.id}\` Adlı kullanıcı \`${uptime.url.slice(0,14)}\` Url'sini Uptime Sistemine Ekledi. (Korumadan Ötürü URL'lin bir kısmı silinmiştir.)\nToplam Eklediği URL Sayısı: \`${qdb.get(`uptime.${req.user.id}`).length || 0}\` `))
  
   }   
})

const fetch = require("node-fetch");
setInterval(() => {
Object.keys(qdb.get("uptime")).forEach((id) => {
 
qdb.get(`uptime.${id}`).forEach(({ url, time }) => {
  fetch(url)
    })
  })

}, 750)


/*setInterval(() => {

  qdb.set(`aktifliksüre`, süre)
}, 8000)*/
  
//BOTLİST
app.get("/botadd", (req, res) => {
  if (!req.user || !client.guilds.get(process.env.sunucuid).members.has(req.user.id)) return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message:  "Bot Ekleyebilmek için Discord sunucumuza katılmanız ve siteye giriş yapmanız gerekmektedir."
        }
      }) 
    );
  res.render("botadd", {
    kullanıcı: req.user
  });
});

app.post("/botaddform", (req, res) => {
if (!client.guilds.get(process.env.sunucuid).members.get(req.user.id).roles.has(process.env.member)) { 
   
   return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message:  "Bot Ekleyebilmek için Sunucuda Members Rolüne Sahip Olmasılısın."
        }
      }) 
    );
   
   } else {
let nairobi = req.body
let ID = nairobi['bot_id'];
     
     if (db['botlist'].get(`botlar.${ID}`)) return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message:  "Sistemde zaten ekli."
        }
      }) 
    );
     
request({
  url: `https://discord.com/api/v6/users/${ID}`,
  headers: {
    "Authorization": `Bot ${process.env.token}`,
    "Content-Type": "application/json"
  },
}, function(error, response, body) {
  if (error) return console.log(error)
  let bot = JSON.parse(body)
  

  
let veriler = {
  botid: bot.id,
  botprefix: nairobi['bot_prefix'],
  kisaaciklama: nairobi['bot_kisaaciklama'],
  uzunaciklama: nairobi['bot_uzunaciklama'],
  kütüphane: nairobi['bot_kütüphane'],
  website: nairobi['bot_site'],
  desteksunucusu: nairobi['bot_desteks'],
  id: randomString({ length: 12 }),
  sahipid: req.user.id,
  sahipisim: req.user.username+"#"+req.user.discriminator,
  sahipavatar: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png` || `https://cdn.glitch.com/13efe8ae-55a7-4df4-9e5f-d6d7be1698a0%2Fdownload.png?v=1601707775471`,
  sahip1: req.user,
  avatar: `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.png`,
  isim: bot.username+"#"+bot.discriminator,
  tarih: useful.tarih(new Date())
}


client.channels.get(process.env.botlistlog1).send(`${bot.username} Adlı Bot Sisteme Eklendi. (Bu mesaj bot sunucuya girdiği anda editlenecektir.)\n0 Perm: https://discord.com/oauth2/authorize?client_id=${bot.id}&scope=bot&permissions=0 \n8 Perm: [https://discord.com/oauth2/authorize?client_id=${bot.id}&scope=bot&permissions=8`).then(nairobi => qdb.set(`mesaj.${bot.id}`, {mesaj: nairobi.id, botid: bot.id}))

client.channels.get(process.env.botlistlog).send(new Discord.RichEmbed()
.setColor("RED")
.setThumbnail(bot.avatarURL || `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`)
.setDescription(`<@${req.user.id}> \`${req.user.username+"#"+req.user.discriminator} / ${req.user.id}\` Adlı kullanıcı <@${bot.id}>  \`${bot.username} / ${bot.id}\` Adlı Botu Ekledi.`)
.addField("Bot'a Ulaşmak İçin;", `[Tıkla!](https://atlasdevelopment.glitch.me/bot/${veriler.id})`)                                       
.addField("Bot'u Davet Etmek İçin;", `0 Perm: [Tıkla!](https://discord.com/oauth2/authorize?client_id=${bot.id}&scope=bot&permissions=0) \n8 Perm: [Tıkla!](https://discord.com/oauth2/authorize?client_id=${bot.id}&scope=bot&permissions=8)`)
                                                )
db['botlist'].set(`botlar.${veriler.id}`, veriler)
res.redirect(`/bot/${veriler.id}`);
  
  })
     }
});


client.on("guildMemberAdd", (member) => {
if(!member.user.bot) return;
  client.guilds.forEach(async guild => {
   const sa = Object.keys(qdb.get('mesaj')) 
   const as = sa.splice(0, Object.keys(qdb.get('mesaj')).length) 
   const ass = as.map(x=>x) 
   for(var i = 0; i < Object.keys(qdb.get('mesaj')).length; i++) { 
   let idd = ass[i] 
  
   request({
  url: `https://discord.com/api/v6/users/${qdb.get(`mesaj.${idd}`)}`,
  headers: {
    "Authorization": `Bot ${process.env.token}`,
    "Content-Type": "application/json"
  },
}, function(error, response, body) {
  if (error) return console.log(error)
  let bot = JSON.parse(body)
   member.addRole("762936957746806804")
  if(member.id === qdb.get(`mesaj.${idd}.botid`)) return guild.channels.get("762938150762053652").fetchMessage(qdb.get(`mesaj.${idd}.mesaj`)).then(nairobi => {
    nairobi.edit(`<@${qdb.get(`mesaj.${idd}.botid`)}> Sunucuya Eklendi.`)
  })
  
     })
   }
  
  })
})


app.get("/bot/:id", (req, res) => {
  if (
    !req.user ||
    !client.guilds.get(process.env.sunucuid).members.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message:
            "Botları görebilmek için Discord sunucumuza katılmanız ve siteye giriş yapmanız gerekmektedir."
        }
      })
    );

  var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.botlist.get("botlar");
  var code = findCodeToId(data, id);
  if (code) {
    let guild = client.guilds.get(process.env.sunucuid);
    let member = req.user ? guild.members.get(req.user.id) : null;
    if (member) {
      res.render("bot", {
        kullanıcı: req.user,
        kod: code
      });
    } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            message: "Yetersiz yetki"
          }
        })
      );
    }
  } else {
    res.redirect("/");
  }
});


app.get("/botlar", (req, res) => {
  var data = db.botlist.get("botlar");
  data = sortData(data);
 // console.log(data)
  res.render("botlar", {
    kullanıcı: req.user,
    veri: data
  });
});


app.get("/botpanel", (req, res) => {
  var botlist = db.botlist.get("botlar")
  botlist = sortData(botlist)
  let guild = client.guilds.get(process.env.sunucuid);
  let member = req.user ? guild.members.get(req.user.id) : null;
    if (member && member.roles.has(process.env.owner)) {
  res.render("botpanel", {
    kullanıcı: req.user,
    botlar: botlist
  });
   } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            message: "Bot Panele Girmek İçin Yetkiniz Yok!"
          }
        })
      );
    }
});


app.get("/sil/bot/:id", (req, res) => {

    let member = client.guilds.get(process.env.sunucuid).members.get(req.user.id);
    if (!member) {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            message: "Botu silmek için gerekli yetkiye sahip değilsiniz."
          }
        })
      );
    } else {
      if (member.roles.has(process.env.owner)) {
        let id = req.params.id;
        if (!id) {
          res.redirect(
            url.format({
              pathname: "/hata",
              query: {
                message: "Bir kod id'si belirtin."
              }
            })
          );
        }
        var bot = findCodeToId(db["botlist"].get("botlar"), id);
        if (!bot)
          res.redirect(
            url.format({
              pathname: "/hata",
              query: {
                message: "Böyle bir bot bulunamadı"
              }
            })
          );
        else {
          db["botlist"].delete(`botlar.${id}`);
          res.redirect("/botpanel");
        }
      } else {
        res.redirect(
          url.format({
            pathname: "/hata",
            query: {
              message: "Yetkiniz yok."
            }
          })
        );
      }
    }
});


//ISTEK KOD

app.get("/istekkod", (req, res) => {
    if (!req.user || !client.guilds.get(process.env.sunucuid).members.has(req.user.id)) return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message:  "İstek kod sistemine erişmek için sunucumuza giriş yapmalı ve sitemize giriş yapmanız gerekmekte."
        }
      }) 
    );
    res.render("istekkod", {
    kullanıcı: req.user,
    kullanıcıisim: req.user.username+"#"+req.user.discriminator,
    tarih: useful.tarih(new Date())
  });
});

let ms = require("parse-ms");
app.post("/istekkodform", (req, res) => {
  
let cooldown = 86400000, 
amount = Math.floor(Math.random() * 10) + 200;      
let istek = qdb.fetch(`istek_${req.user.id}`)
    if (istek !== null && cooldown - (Date.now() - istek) > 0) {
        let timeObj = ms(cooldown - (Date.now() - istek));
      
     return res.redirect(
      url.format({
        pathname: "/hata",
        query: {

          message:  `İstek İsteyebilmek İçin ${timeObj.hours} Saat ${timeObj.minutes} Dakika ${timeObj.seconds} Saniye Beklemelisin!`
        }
      }) 
    );
      
      
    } else {
  
  let istek = req.body
  let embed = new Discord.RichEmbed()
  .setColor("GREEN")                                               
  .setAuthor("İstek Kod Bildirildi.")
  .setDescription(`<@${req.user.id}> \`${req.user.username+"#"+req.user.discriminator} / ${req.user.id}\` Adlı Kullanıcı İstek Kod İstedi.`)                                               
  .addField("**İstek:**", istek.istek_istek) 
     if (istek.istek_istekimage) {
        embed.setImage(istek.istek_istekimage);
      }
  qdb.set(`istek_${req.user.id}`, Date.now())
  client.channels.get(process.env.istekkanal).send(embed)

      
    }
  res.redirect("/");
})


//HATALI KOD
app.get("/hatabildir", (req, res) => {
    if (!req.user || !client.guilds.get(process.env.sunucuid).members.has(req.user.id)) return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message:  "Hatalı kod sistemine erişmek için sunucumuza giriş yapmalı ve sitemize giriş yapmanız gerekmekte."
        }
      }) 
    );
    res.render("bildir", {
    kullanıcı: req.user,
    kullanıcıisim: req.user.username+"#"+req.user.discriminator,
    tarih: useful.tarih(new Date())
  });
});


app.post("/hatakodform", (req, res) => {
    
let cooldown = 86400000, 
amount = Math.floor(Math.random() * 10) + 200;      
let hatas = qdb.fetch(`hata_${req.user.id}`)
    if (hatas !== null && cooldown - (Date.now() - hatas) > 0) {
        let timeObj = ms(cooldown - (Date.now() - hatas));
      
     return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message:  `Hata Bildirebilmek İçin ${timeObj.hours} Saat ${timeObj.minutes} Dakika ${timeObj.seconds} Saniye Beklemelisin!`
        }
      }) 
    );
      
      
    } else {
  let hata = req.body
  let embeds = new Discord.RichEmbed()
  .setColor("RED")                                               
  .setAuthor("Hatalı Kod Bildirildi.")
  .setDescription(`<@${req.user.id}> \`${req.user.username+"#"+req.user.discriminator} / ${req.user.id}\` Adlı Kullanıcı Hata Bildirdi.`)                                               
  .addField("**Hata:**", hata.hata_hata) 
     if (hata.hata_hataimage) {
        embeds.setImage(hata.hata_hataimage);
      }

   qdb.set(`hata_${req.user.id}`, Date.now())
  client.channels.get(process.env.hatakanal).send(embeds)
    }
    res.redirect("/")
})

app.get("/paylas", (req, res) => {
    let guild = client.guilds.get(process.env.sunucuid);
    let member = req.user ? guild.members.get(req.user.id) : null;
  if (!req.user || !client.guilds.get(process.env.sunucuid).members.has(req.user.id)) return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message:  "Kod paylaşabilmek için Discord sunucumuza katılmanız ve siteye giriş yapmanız gerekmektedir."
        }
      }) 
    );
  /*  if (!member.roles.has(process.env.owner) || member.roles.has(process.env.admin) || member.roles.has(process.env.codesharer) || member.roles.has(process.env.mod)) return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message:  "Yetersiz Yetki."
        }
      }) 
    );*/
  res.render("kodpaylasim", {
    kullanıcı: req.user
  });
});



app.post("/kodpaylasimform", (req, res) => {
  let rank = req.body.kod_kategoriler;
  let veriler = {
    isim: req.body.kod_ismi,
    paylasankisi: req.user.username,
    id: randomString({ length: 20 }),
    aciklama: req.body.aciklama,
    modüller: req.body.modüller.split(","),
    resim: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`,
    main_kodu: req.body.main_code,
    komutlar_kodu: req.body.komutlar_code,
    kod_rank: rank,
    tarih: useful.tarih(new Date())
  }
  client.channels.get(process.env.kodlog).send(new Discord.RichEmbed()
.setColor("GREEN")
.setAuthor("Siteye yeni kod eklendi.")
.setDescription(`Kodu Ekleyen: <@${req.user.id}> \`${req.user.username+"#"+req.user.discriminator} / ${req.user.id}\`\nEklenen Kod: \`${veriler.isim}\`\nBulunuğu Kategori: \`${veriler.kod_rank}\``)
.addField("**Koda Ulaş:**", `[Tıkla!](https://atlasdevelopment.glitch.me/${veriler.kod_rank}/${veriler.id})`)


)
  db[veriler.kod_rank].set(`kodlar.${veriler.isim}`, veriler);
  res.redirect(`/${veriler.kod_rank}/${veriler.id}`);

})







//Profil
app.get("/profil/:id", (req, res) => {
  if (!req.user || !client.guilds.get(process.env.sunucuid).members.has(req.user.id)) return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: "1",
          message:  "Profiline Erişemek için Discord sunucumuza katılmanız ve siteye giriş yapmanız gerekmektedir."
        }
      }) 
    );
  let id = req.params.id;
  let member = client.guilds.get(process.env.sunucuid).members.get(id);
  if (!member)
    res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message: "Profil Bulunamadı."
        }
      })
    );
  else {
    let yetki = {
      inviter1: member.roles.has(process.env.inviter1),
      inviter2: member.roles.has(process.env.inviter2),
      inviter3: member.roles.has(process.env.inviter3),
      inviteraltyapi:member.roles.has(process.env.inviteraltyapi),
      sahip: member.roles.has(process.env.owner),
      yetkili: member.roles.has(process.env.admin),
      kodcu: member.roles.has(process.env.codesharer),
      booster: member.roles.has(process.env.booster)
    };
    res.render("profil", {
      kullanıcı: req.user,
      member: member,
      avatarURL: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`,
      yetkiler: yetki
    });
  }
});


//Admin 
app.get("/adminpanel", (req, res) => {
  var freecode = db.freecode.get("kodlar")
  freecode = sortData(freecode)
  var v12 = db.v12.get("kodlar")
  v12 = sortData(v12)
  var inviter1 = db.inviter1.get("kodlar");
  inviter1 = sortData(inviter1);
  var inviter2 = db.inviter2.get("kodlar");
  inviter2 = sortData(inviter2)
  var inviter3 = db.inviter3.get("kodlar");
  inviter3 = sortData(inviter3)
  var inviteraltyapı = db.inviteraltyapi.get("kodlar")
  inviteraltyapı = sortData(inviteraltyapı)
  let guild = client.guilds.get(process.env.sunucuid);
  let member = req.user ? guild.members.get(req.user.id) : null;
    if (member &&
      (member.roles.has(process.env.owner))) {
  res.render("adminpanel", {
    kullanıcı: req.user,
    freecode: freecode,
    v12: v12,
    inviter1: inviter1,
    inviter2: inviter2,
    inviter3: inviter3,
    inviteraltyapi: inviteraltyapı
  });
   } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            message: "Admin Panele Girmek İçin Yetkiniz Yok!"
          }
        })
      );
    }
});

//KOD SİL - - - - - -- - - - 
app.get("/sil/:rank/:id", (req, res) => {
  if (req.user) {
    let member = client.guilds.get(process.env.sunucuid).members.get(req.user.id);
    if (!member) {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            message: "Kodu silmek için gerekli yetkiye sahip değilsiniz."
          }
        })
      );
    } else {
      if (member.roles.has(process.env.owner)) {
        let id = req.params.id;
        if (!id) {
          res.redirect(
            url.format({
              pathname: "/hata",
              query: {
                message: "Bir kod id'si belirtin."
              }
            })
          );
        }
        let rank = req.params.rank;
        if (!rank) {
          res.redirect(
            url.format({
              pathname: "/hata",
              query: {
                message: "Bir kod rankı belirtin."
              }
            })
          );
        }

        var rawId = findCodeToId(db[rank].get("kodlar"), id);
        if (!rawId)
          res.redirect(
            url.format({
              pathname: "/hata",
              query: {
                message: "Böyle bir kod bulunamadı"
              }
            })
          );
        else {
          db[rank].delete("kodlar." + rawId.isim);
          res.redirect("/adminpanel");
        }
      } else {
        res.redirect(
          url.format({
            pathname: "/hata",
            query: {
              message: "Yetkiniz yok."
            }
          })
        );
      }
    }
  } else {
    res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message: "Kodları Görüntülüyebilmek için Discord sunucumuza katılmanız ve siteye giriş yapmanız gerekmektedir."
        }
      })
    );
  }
});


//FREE CODE
app.get("/freecode", (req, res) => {
  var data = db.freecode.get("kodlar");
  data = sortData(data);
  res.render("freecode", {
    kullanıcı: req.user,
    veri: data
  });
});

app.get("/freecode/:id", (req, res) => {
    if (!req.user || !client.guilds.get(process.env.sunucuid).members.has(req.user.id))
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message:
            "Kodları görebilmek için Discord sunucumuza katılmanız ve siteye giriş yapmanız gerekmektedir."
        }
      })
    );
  var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.freecode.get("kodlar");
  var code = findCodeToId(data, id);
        res.render("kod", {
        kullanıcı: req.user,
        kod: code
      });
});

//INVITER |

app.get("/inviter1", (req, res) => {
  var data = db.inviter1.get("kodlar");
  data = sortData(data);
  res.render("inviter1", {
    kullanıcı: req.user,
    veri: data
  });
});



app.get("/inviter1/:id", (req, res) => {
  if (
    !req.user ||
    !client.guilds.get(process.env.sunucuid).members.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message:
            "Kodları görebilmek için Discord sunucumuza katılmanız ve siteye giriş yapmanız gerekmektedir."
        }
      })
    );

  var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.inviter1.get("kodlar");
  var code = findCodeToId(data, id);
  if (code) {
    let guild = client.guilds.get(process.env.sunucuid);
    let member = req.user ? guild.members.get(req.user.id) : null;
    if (member &&
      (member.roles.has(process.env.inviter1) ||
        member.roles.has(process.env.admin) ||
        member.roles.has(process.env.mod) ||
        member.roles.has(process.env.booster) ||
        member.roles.has(process.env.sponsor) ||
        member.roles.has(process.env.owner)
      
      )
    ) {
      res.render("kod", {
        kullanıcı: req.user,
        kod: code
      });
    } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            message: "Yetersiz yetki"
          }
        })
      );
    }
  } else {
    res.redirect("/");
  }
});
//INVITER ||

app.get("/inviter2", (req, res) => {
  var data = db.inviter2.get("kodlar");
  data = sortData(data);
  res.render("inviter2", {
    kullanıcı: req.user,
    veri: data
  });
});



app.get("/inviter2/:id", (req, res) => {
  if (
    !req.user ||
    !client.guilds.get(process.env.sunucuid).members.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message:
            "Kodları görebilmek için Discord sunucumuza katılmanız ve siteye giriş yapmanız gerekmektedir."
        }
      })
    );

  var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.inviter2.get("kodlar");
  var code = findCodeToId(data, id);
  if (code) {
    let guild = client.guilds.get(process.env.sunucuid);
    let member = req.user ? guild.members.get(req.user.id) : null;
    if (member &&
      (member.roles.has(process.env.inviter2) ||
        member.roles.has(process.env.admin) ||
        member.roles.has(process.env.mod) ||
        member.roles.has(process.env.booster) ||
        member.roles.has(process.env.sponsor) ||
        member.roles.has(process.env.owner)
      
      )
    ) {
      res.render("kod", {
        kullanıcı: req.user,
        kod: code
      });
    } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            message: "Yetersiz yetki"
          }
        })
      );
    }
  } else {
    res.redirect("/");
  }
});

//INVITER |||

app.get("/inviter3", (req, res) => {

  var data = db.inviter3.get("kodlar");
  data = sortData(data);
  res.render("inviter3", {
    kullanıcı: req.user,
    veri: data
  });
});





app.get("/inviter3/:id", (req, res) => {
  if (
    !req.user ||
    !client.guilds.get(process.env.sunucuid).members.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message:
            "Kodları görebilmek için Discord sunucumuza katılmanız ve siteye giriş yapmanız gerekmektedir."
        }
      })
    );

  var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.inviter3.get("kodlar");
  var code = findCodeToId(data, id);
  if (code) {
    let guild = client.guilds.get(process.env.sunucuid);
    let member = req.user ? guild.members.get(req.user.id) : null;
    if (member &&
      (member.roles.has(process.env.inviter3) ||
        member.roles.has(process.env.admin) ||
        member.roles.has(process.env.booster) ||
        member.roles.has(process.env.sponsor) ||
        member.roles.has(process.env.mod) ||
        member.roles.has(process.env.owner)
      
      )
    ) {
      res.render("kod", {
        kullanıcı: req.user,
        kod: code
      });
    } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            message: "Yetersiz yetki"
          }
        })
      );
    }
  } else {
    res.redirect("/");
  }
});

//V12

app.get("/v12", (req, res) => {
  var data = db.v12.get("kodlar");
  data = sortData(data);
  res.render("v12", {
    kullanıcı: req.user,
    veri: data
  });
});





app.get("/v12/:id", (req, res) => {
    if (!req.user || !client.guilds.get(process.env.sunucuid).members.has(req.user.id))
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message:
            "Kodları görebilmek için Discord sunucumuza katılmanız ve siteye giriş yapmanız gerekmektedir."
        }
      })
    );
  var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.v12.get("kodlar");
  var code = findCodeToId(data, id);
        res.render("kod", {
        kullanıcı: req.user,
        kod: code
      });
});

//INVITER Altyapi

app.get("/inviteraltyapi", (req, res) => {
  var data = db.inviteraltyapi.get("kodlar");
  data = sortData(data);
  res.render("inviteraltyapi", {
    kullanıcı: req.user,
    veri: data
  });
});





app.get("/inviteraltyapi/:id", (req, res) => {
  if (!req.user || !client.guilds.get(process.env.sunucuid).members.has(req.user.id))
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          message:
            "Kodları görebilmek için Discord sunucumuza katılmanız ve siteye giriş yapmanız gerekmektedir."
        }
      })
    );

  var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.inviteraltyapi.get("kodlar");
  var code = findCodeToId(data, id);
  if (code) {
    let guild = client.guilds.get(process.env.sunucuid);
    let member = req.user ? guild.members.get(req.user.id) : null;
    if (member &&
      (member.roles.has(process.env.inviteraltyapi) ||
        member.roles.has(process.env.admin) ||
        member.roles.has(process.env.sponsor) ||
        member.roles.has(process.env.mod) ||
        member.roles.has(process.env.owner)
      
      )
    ) {
      res.render("altyapıkod", {
        kullanıcı: req.user,
        kod: code
      });
    } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            message: "Yetersiz yetki"
          }
        })
      );
    }
  } else {
    res.redirect("/");
  }
});

function findCodeToId(data, id) {
  var keys = Object.keys(data);
  keys = keys.filter(key => data[key].id == id)[0];
  keys = data[keys];
  return keys;
}

function sortData(object) {
  var keys = Object.keys(object);
  var newData = {};
  var arr = [];
  keys.forEach(key => {
    arr.push(key);
  });
  arr.reverse();
  arr.forEach(key => {
    newData[key] = object[key];
  });
  return newData;
}




//HATA KODLARI KISMI!

app.get("/hata", (req, res) => {
  res.render("warning", {
    kullanıcı: req.user,
    tarih: useful.tarih(new Date()),
    message: req.query.message
  });
});

app.use((req, res) => {
  const err = new Error("Not Found");
  err.status = 404;
  return res.redirect(
    url.format({
      pathname: "/hata",
      query: {
        message: "Aradığınız Sayfa Bulunamadı."
      }
    })
  );
});









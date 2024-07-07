const { Client, LocalAuth, Poll } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const Guild = require("./handler/guild.js");

// Make sure to update the wwebVersion if needed
const wwebVersion = "2.2412.54";

const client = new Client({
  authStrategy: new LocalAuth(),
  webVersionCache: {
    type: "remote",
    remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
  },
});

function createPoll(msg) {
  const parts = msg.split(' ');
  const title = parts[2];
  const options = parts.splice(3);

  console.log(msg, parts);

  return new Poll(title, options);
}

client.on("qr", (qr) => {
  // Generate and scan this code with your phone
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  console.log(`message recived from id: ${msg.from}`);
  const guild = new Guild(msg, client);
  await guild.initialize();
  if (msg.body === "!ping") {
    await msg.reply("pong");
  }
  if (msg.body.startsWith("!poll create")) {
    try {
      await client
        .sendMessage(msg.from, createPoll(msg.body))
        .catch((err) => console.log(err));
    } catch (error) {
      console.log(error);
    }
  }

  if (msg.body === "!chat id") {
    await msg.reply(guild.chat.id.user)
  }

  if (msg.body.startsWith("!chat setIcon")) {
    guild.setGrpIcon()
      .then(() => {
        msg.reply('Group image updated successfully!');
      })
      .catch(err => {
        console.log(err)
        msg.reply(`${err}`)
      })
  }

  if (msg.body === "!chat delIcon") {
    guild.deleteGrpIcon()
      .then(async () => {
        msg.reply('Group image deleted successfully')
      })
      .catch(err => {
        console.log(err);
        msg.reply(`${err}`);
      })
  }
});

client.on("message_edit", (msg, newMsg, prevMsg) => {
  client.sendMessage(
    msg.from,
    `Message edited \n previous message: ${prevMsg} \n new message: ${newMsg}`
  );
});

client.initialize().catch((err) => {
  console.error("Client initialization failed:", err);
});

const axios = require("axios")
const { MessageMedia } = require("whatsapp-web.js")

module.exports = class Guild {
  #client;
  #msg;

  constructor(msg, client) {
    this.#msg = msg;
    this.id = msg.from;
    this.#client = client;
    this.chat = null;
  }

  async initialize() {
    try {
      this.chat = await this.#client.getChatById(this.id);
    } catch (error) {
      console.error('Error fetching guild data', error);
    }
  }

  async getChat() {
    if (!this.chat) {
      await this.initialize();
    }
    return this.chat;
  }

  async isGroup() {
    if (!this.chat) await this.getChat();
    return this.chat ? this.chat.isGroup : false;
  }

  async getId() {
    if (!this.chat) await this.getChat();
    return this.chat ? this.chat.id.user : null;
  }

  async setGrpIcon() {
    try {
      if (!await this.isGroup()) {
        throw new Error('This guild is not a group');
      }

      if (this.#msg.type === 'image') {
        const media = await this.#msg.downloadMedia();
        console.log(media);
        const buffer = Buffer.from(media.data, 'base64');
        await this.chat.setPicture(media);
        console.log('Group image updated successfully!');
      } else {
        let imageUrl;
        const urlMatch = this.#msg.body.match(/!chat setIcon\s+(https?:\/\/\S+)/);
        if (urlMatch && urlMatch[1]) {
          imageUrl = urlMatch[1];
        } else {
          throw new Error('Invalid command format or URL not found');
        }

        const media = await MessageMedia.fromUrl(imageUrl)
        console.log(media);
        await this.chat.setPicture(media)
      }
    } catch (error) {
      console.error('Error updating group image:', error);
    }
  }
};

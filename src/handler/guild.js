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
    await this.initialize();
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
    if (!await this.isGroup()) {
      throw new Error('This guild is not a group');
    }
    try {
      let media;
      if (this.#msg.type === 'image') {
        media = await this.#msg.downloadMedia();
      } else {
        const urlMatch = this.#msg.body.match(/!chat setIcon\s+(https?:\/\/\S+)/);
        if (!urlMatch || !urlMatch[1]) {
          throw new Error('URL not found');
        }
        const imageUrl = urlMatch[1];
        media = await MessageMedia.fromUrl(imageUrl);
      }
      await this.chat.setPicture(media);
      return true;

    } catch (error) {
      console.log(`Error updating group image:`, error);
      throw error;
    }
  }

  async deleteGrpIcon() {
    if (!await this.isGroup()) {
      throw new Error('This guild is not a group');
    }
    try {
      await this.chat.deletePicture()
      return true;
    } catch (error) {
      console.log(`Error occureed in deleting grp icon`, error)
      throw error
    }
  }
};

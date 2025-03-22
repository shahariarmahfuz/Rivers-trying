module.exports.config = {
  name: 'ai',
  version: '1.1.0',
  permission: 0,
  credits: 'Metoushela',
  description: '',
  prefix: false,
  premium: false,
  category: 'without prefix',
  usage: '',
  cooldowns: 3,
  dependency: {
    axios: ''
  }
};

module.exports.run = async function ({ api, event, args }) {
  const axios = require('axios');
  const ask = args.join(' ');
  if (!ask) {
    return api.sendMessage(
      '✨ 𝗔𝗻𝗼𝘁𝗵𝗲𝗿-𝗠𝗲\n━━━━━━━━━━━\n\nPlease provide a question.',
      event.threadID,
      event.messageID
    );
  }

  try {
    const res = await axios.get(
      `https://new-ai-buxr.onrender.com/ai?q=${encodeURIComponent(ask)}&id=${event.senderID}`
    );
    const reply = res.data.response.trim();
    return api.sendMessage(
      `✨ 𝗔𝗻𝗼𝘁𝗵𝗲𝗿-𝗠𝗲\n━━━━━━━━━━━\n\n${reply}\n\nby Metoushela Walker and Ulric Atayi`,
      event.threadID,
      event.messageID
    );
  } catch (error) {
    return api.sendMessage(
      'An unexpected error occurred while fetching the API.',
      event.threadID,
      event.messageID
    );
  }
};

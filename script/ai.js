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
    return api.sendMessage('আপনার প্রশ্নটি লিখুন।', event.threadID, event.messageID);
  }

  try {
    const res = await axios.get(
      `https://new-ai-buxr.onrender.com/ai?q=${encodeURIComponent(ask)}&id=${event.senderID}`
    );
    let reply = res.data.response.trim();

    // ১ম ধাপ: * **টেক্সট** → • টেক্সট (বুলেট পয়েন্টে কনভার্ট)
    reply = reply.replace(/\*\s*\*\*\s*(.*?)\s*\*\*/g, '• $1');
    
    // ২য় ধাপ: **বোল্ড** → বোল্ড (ডাবল স্টার সরানো)
    reply = reply.replace(/\*\*(.*?)\*\*/g, '$1');
    
    // ৩য় ধাপ: *ইটালিক* → ইটালিক (সিঙ্গেল স্টার সরানো)
    reply = reply.replace(/\*(.*?)\*/g, '$1');

    return api.sendMessage(reply, event.threadID, event.messageID);
  } catch (error) {
    return api.sendMessage('একটি ত্রুটি ঘটেছে। দয়া করে পরে আবার চেষ্টা করুন।', event.threadID, event.messageID);
  }
};

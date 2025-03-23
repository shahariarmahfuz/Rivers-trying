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

    // ১ম ধাপ: যেকোনো * **টেক্সট** → • টেক্সট (সব স্টার এবং স্পেস হ্যান্ডেল)
    reply = reply.replace(/\*[\s*]*\*{2,}[\s*]*(.*?)[\s*]*\*{2,}[\s*]*/g, '• $1');

    // ২য় ধাপ: **বোল্ড** → বোল্ড (বাকি ** সরানো)
    reply = reply.replace(/\*\*(.*?)\*\*/g, '$1');

    // ৩য় ধাপ: *ইটালিক* → ইটালিক (বাকি * সরানো)
    reply = reply.replace(/\*(.*?)\*/g, '$1');

    // ৪র্থ ধাপ: একা থাকা স্টার (যেমন: *টেক্সট বা টেক্সট*) সরানো
    reply = reply.replace(/(?<!\w)\*+(?!\w)/g, '');

    return api.sendMessage(reply, event.threadID, event.messageID);
  } catch (error) {
    return api.sendMessage('একটি ত্রুটি ঘটেছে। দয়া করে পরে আবার চেষ্টা করুন।', event.threadID, event.messageID);
  }
};

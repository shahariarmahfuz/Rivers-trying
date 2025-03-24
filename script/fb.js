module.exports.config = {
  name: 'fb',
  version: '1.0.0',
  permission: 0,
  credits: 'Metoushela',
  description: 'Facebook ভিডিও ডাউনলোডার',
  prefix: false,
  premium: false,
  category: 'utility',
  usage: '[Facebook ভিডিও লিংক]',
  cooldowns: 5,
  dependency: {
    axios: '',
    fs: ''
  }
};

module.exports.run = async function ({ api, event, args }) {
  const axios = require('axios');
  const fs = require('fs');
  const path = require('path');
  
  const fbLink = args[0];
  
  if (!fbLink || !fbLink.includes('facebook.com') && !fbLink.includes('fb.watch')) {
    return api.sendMessage('দয়া করে একটি বৈধ Facebook ভিডিও লিংক প্রদান করুন।', event.threadID, event.messageID);
  }
  
  try {
    api.sendMessage('⏳ অপেক্ষা করুন, আপনার ভিডিওটি ডাউনলোড করা হচ্ছে...', event.threadID, event.messageID);
    
    const apiUrl = `https://facebook-api-1uv3.onrender.com/fb?link=${encodeURIComponent(fbLink)}`;
    const response = await axios.get(apiUrl);
    
    if (response.data.status !== 'success' || !response.data.links) {
      return api.sendMessage('ভিডিও ডাউনলোড করতে সমস্যা হয়েছে। দয়া করে অন্য লিংক চেষ্টা করুন।', event.threadID);
    }
    
    // HD লিংক নেওয়া হবে যদি থাকে, নাহলে SD লিংক নেওয়া হবে
    const videoUrl = response.data.links.hd_url || response.data.links.sd_url;
    
    if (!videoUrl) {
      return api.sendMessage('ভিডিও লিংক পাওয়া যায়নি।', event.threadID);
    }
    
    // ভিডিও ডাউনলোড
    const videoResponse = await axios({
      method: 'get',
      url: videoUrl,
      responseType: 'stream'
    });
    
    const tempPath = path.join(__dirname, '..', 'temp', `fb_video_${Date.now()}.mp4`);
    const writer = fs.createWriteStream(tempPath);
    
    videoResponse.data.pipe(writer);
    
    writer.on('finish', () => {
      api.sendMessage({
        body: '✅ আপনার ভিডিওটি ডাউনলোড করা হয়েছে!',
        attachment: fs.createReadStream(tempPath)
      }, event.threadID, () => {
        fs.unlinkSync(tempPath); // টেম্প ফাইল ডিলিট
      });
    });
    
    writer.on('error', (error) => {
      console.error(error);
      api.sendMessage('ভিডিও ডাউনলোড করতে ত্রুটি হয়েছে।', event.threadID);
    });
    
  } catch (error) {
    console.error(error);
    api.sendMessage('ভিডিও ডাউনলোড করতে ত্রুটি হয়েছে। দয়া করে পরে আবার চেষ্টা করুন।', event.threadID);
  }
};

module.exports.config = {
  name: 'fb',
  version: '1.0.0',
  permission: 0,
  credits: 'Metoushela',
  description: 'Facebook Video Downloader',
  prefix: false,
  premium: false,
  category: 'utility',
  usage: '[Facebook video link]',
  cooldowns: 5,
  dependency: {
    axios: '',
    fs: '',
    path: ''
  }
};

module.exports.run = async function ({ api, event, args }) {
  const axios = require('axios');
  const fs = require('fs');
  const path = require('path');
  
  const fbLink = args[0];
  const MAX_FILE_SIZE_MB = 30;

  if (!fbLink || (!fbLink.includes('facebook.com') && !fbLink.includes('fb.watch'))) {
    return api.sendMessage('Please provide a valid Facebook video link.', event.threadID, event.messageID);
  }

  try {
    // Send waiting message and store its ID
    const waitingMsg = await api.sendMessage('⏳ Downloading your video, please wait...', event.threadID);

    const apiUrl = `https://facebook-api-1uv3.onrender.com/fb?link=${encodeURIComponent(fbLink)}`;
    const response = await axios.get(apiUrl);

    if (response.data.status !== 'success' || !response.data.links) {
      await api.unsendMessage(waitingMsg.messageID);
      return api.sendMessage('Error downloading video. Please try another link.', event.threadID, event.messageID);
    }

    const videoUrl = response.data.links.hd_url || response.data.links.sd_url;
    if (!videoUrl) {
      await api.unsendMessage(waitingMsg.messageID);
      return api.sendMessage('Video link not found.', event.threadID, event.messageID);
    }

    // Check file size
    const headResponse = await axios.head(videoUrl);
    const contentLength = headResponse.headers['content-length'];
    const fileSizeMB = contentLength ? Math.round(contentLength / (1024 * 1024)) : 0;

    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      await api.unsendMessage(waitingMsg.messageID);
      return api.sendMessage(`❌ Video is too large (${fileSizeMB}MB). Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`, event.threadID, event.messageID);
    }

    // Create temp directory
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempPath = path.join(tempDir, `fb_video_${Date.now()}.mp4`);
    const writer = fs.createWriteStream(tempPath);

    const videoResponse = await axios({
      method: 'get',
      url: videoUrl,
      responseType: 'stream'
    });

    videoResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Verify actual file size
    const stats = fs.statSync(tempPath);
    const actualFileSizeMB = Math.round(stats.size / (1024 * 1024));

    if (actualFileSizeMB > MAX_FILE_SIZE_MB) {
      fs.unlinkSync(tempPath);
      await api.unsendMessage(waitingMsg.messageID);
      return api.sendMessage(`❌ Downloaded video is too large (${actualFileSizeMB}MB). Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`, event.threadID, event.messageID);
    }

    // Unsend waiting message and send video without any text
    await api.unsendMessage(waitingMsg.messageID);
    await api.sendMessage({
      attachment: fs.createReadStream(tempPath)
    }, event.threadID);

    // Delete temp file after sending
    fs.unlink(tempPath, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

  } catch (error) {
    console.error('Error:', error);
    api.sendMessage('Error downloading video. Please try again later.', event.threadID, event.messageID);
  }
};

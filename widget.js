(function () {
  // === CONFIGURATION LOADER ===
  const cfg = window.MyBotConfig || {};
  const clientId   = cfg.clientId   || "default";
  const avatarUrl  = cfg.avatar     || "";
  const botName    = cfg.botName    || "AVA";
  const botImage   = cfg.botImage   || avatarUrl;
  const greeting   = cfg.greeting   || null;
  const apiBase    = (cfg.api || "").replace(/\/+$/, "");
  const theme      = cfg.theme || {};

  const background = theme.background || "#ffffff";
  const textColor  = theme.text       || "#1a1a1a";
  const primary    = theme.primary    || "#2b2b2b";
  const userMsgBg  = theme.userMsgBg  || primary;
  const botMsgBg   = theme.botMsgBg   || "#e6e6e6";

  // === STYLE INJECTION ===
const style = document.createElement("style");
style.textContent = `
  @keyframes blink {0%{opacity:0.2;}20%{opacity:1;}100%{opacity:0.2;}}

  .bb-avatar {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: url(${avatarUrl}) center/cover no-repeat;
    cursor: pointer;
    z-index: 2147483647;
  }
  .bb-notif {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 20px;
    height: 20px;
    background: red;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 6px rgba(0,0,0,0.3);
    color: white;
    font-size: 12px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bb-chat {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 360px;
    height: 500px;
    background: ${background};
    color: ${textColor};
    border: 1px solid ${primary};
    border-radius: 8px;
    display: none;
    flex-direction: column;
    z-index: 2147483647;
    overflow: hidden;
    font-family: sans-serif;
  }
  .bb-chat-header {
    display: flex;
    align-items: center;
    background: ${primary};
    color: #fff;
    padding: 8px;
  }
  .bb-chat-header img { width: 32px; height: 32px; border-radius: 50%; margin-right: 8px; }
  .bb-chat-header span { flex: 1; font-weight: bold; }
  .bb-chat-header button { background: transparent; border: none; color: #fff; font-size: 18px; cursor: pointer; }

  .bb-messages { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 6px; }

  .bb-inputbar { display: flex; border-top: 1px solid ${primary}; }
  .bb-inputbar input { flex: 1; border: none; padding: 10px; }
  .bb-inputbar button { border: none; cursor: pointer; }
  .bb-inputbar button.ask {
    background: ${primary};
    color: #fff;
    padding: 10px 15px;
  }
  .bb-inputbar button.mic {
    background: #1abc9c;
    color: #fff;
    padding: 10px;
    margin-left: 4px;
    border-radius: 4px;
    font-size: 16px;
  }

  .bb-typing {
    display: inline-block;
    background: ${botMsgBg};
    color: #000;
    padding: 8px;
    border-radius: 6px;
    max-width: 80%;
    align-self: flex-start;
    font-style: italic;
  }
  .bb-typing span { animation: blink 1.4s infinite both; }
  .bb-typing span:nth-child(2) { animation-delay: 0.2s; }
  .bb-typing span:nth-child(3) { animation-delay: 0.4s; }

  /* 🔴 Pulsing mic animation */
  .mic-pulse {
    display: inline-block;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.6; }
    100% { transform: scale(1); opacity: 1; }
  }

  @media (max-width: 600px) {
    .bb-avatar {
      width: 120px;
      height: 120px;
      bottom: 10px;
      right: 10px;
    }
    .bb-chat {
      width: 95%;
      left: 2.5%;
      right: 2.5%;
      height: 70%;
      bottom: 140px;
    }
  }
`;
document.head.appendChild(style);

  // === AVATAR ===
  const avatar = document.createElement("div");
  avatar.className = "bb-avatar";
  const notifDot = document.createElement("div");
  notifDot.className = "bb-notif";
  notifDot.textContent = "1";
  avatar.appendChild(notifDot);
  document.body.appendChild(avatar);

  // === CHAT CONTAINER ===
  const chat = document.createElement("div");
  chat.className = "bb-chat";

  const header = document.createElement("div");
  header.className = "bb-chat-header";
  const headerImg = document.createElement("img");
  headerImg.src = botImage;
  const headerTitle = document.createElement("span");
  headerTitle.textContent = botName;
  const headerClose = document.createElement("button");
  headerClose.innerHTML = "×";
  headerClose.onclick = () => (chat.style.display = "none");
  header.appendChild(headerImg);
  header.appendChild(headerTitle);
  header.appendChild(headerClose);

  const messages = document.createElement("div");
  messages.className = "bb-messages";

  const inputBar = document.createElement("div");
  inputBar.className = "bb-inputbar";
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Ask AVA...";
  const sendBtn = document.createElement("button");
  sendBtn.className = "ask";
  sendBtn.textContent = "Ask";
  const micBtn = document.createElement("button");
  micBtn.className = "mic";
  micBtn.innerHTML = "🎤";

  inputBar.appendChild(input);
  inputBar.appendChild(sendBtn);
  inputBar.appendChild(micBtn);

  chat.appendChild(header);
  chat.appendChild(messages);
  chat.appendChild(inputBar);
  document.body.appendChild(chat);

  // === MESSAGE HANDLER ===
  function addMsg(text, from = "bot") {
    const msg = document.createElement("div");
    msg.textContent = text;
    msg.style.margin = "5px 0";
    msg.style.padding = "8px";
    msg.style.borderRadius = "6px";
    msg.style.maxWidth = "80%";
    msg.style.wordWrap = "break-word";
    msg.style.display = "inline-block";

    if (from === "bot") {
      msg.style.background = botMsgBg;
      msg.style.color = "#000";
      msg.style.alignSelf = "flex-start";
    } else {
      msg.style.background = userMsgBg;
      msg.style.color = "#fff";
      msg.style.alignSelf = "flex-end";
    }

    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    return msg;
  }

  // === TYPING INDICATOR ===
  let typingEl = null;
  function showTyping() {
    hideTyping();
    typingEl = document.createElement("div");
    typingEl.className = "bb-typing";
    typingEl.innerHTML = "<span>.</span><span>.</span><span>.</span>";
    messages.appendChild(typingEl);
    messages.scrollTop = messages.scrollHeight;
  }
  function hideTyping() {
    if (typingEl) {
      typingEl.remove();
      typingEl = null;
    }
  }

  async function sendToBot(message) {
  addMsg(message, "user");
  input.value = "";

  // Show typing dots while waiting for text reply
  showTyping();

  try {
    const res = await fetch(`${apiBase}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, message })
    });

    hideTyping();

    if (!res.ok) {
      addMsg(`I had trouble replying just now (status ${res.status}).`);
      return;
    }

    const data = await res.json();
    const botReply =
      data.reply || data.answer || data.message || "I had trouble replying just now.";

    // Start voice streaming immediately (no wait for typing animation)
    speakReply(botReply);

    // Show text reply
    addMsg(botReply);

  } catch (err) {
    console.error("sendToBot error:", err);
    hideTyping();
    addMsg("I had trouble replying just now.");
  }
}

 // === Streaming speakReply: plays directly from /voice-stream (no full download) ===
let currentAudio = null;
let speakingIndicator = null;

async function speakReply(text) {
  try {
    // Stop any current speech
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }

    // Show "AVA is preparing to speak..." indicator
    speakingIndicator = document.createElement("div");
    speakingIndicator.textContent = "💭 AVA is preparing to speak...";
    speakingIndicator.style.fontStyle = "italic";
    speakingIndicator.style.color = "#555";
    speakingIndicator.style.margin = "5px 0";
    messages.appendChild(speakingIndicator);
    messages.scrollTop = messages.scrollHeight;

    // Build streaming URL
    const url = `${apiBase}/voice-stream?voice=alloy&text=${encodeURIComponent(text)}`;

    // Create audio element and stream
    currentAudio = new Audio();
    currentAudio.addEventListener("play", () => {
      if (speakingIndicator) {
        speakingIndicator.remove();
        speakingIndicator = null;
      }
    });

    currentAudio.src = url;
    currentAudio.autoplay = true;

    await currentAudio.play();

  } catch (err) {
    console.error("Streaming playback error:", err);
    if (speakingIndicator) {
      speakingIndicator.remove();
      speakingIndicator = null;
    }
  }
}

  // === EVENT LISTENERS ===
  function openChat() {
    chat.style.display = "flex";
    if (notifDot && notifDot.parentNode) notifDot.remove();
    if (greeting && messages.childElementCount === 0) {
      addMsg(greeting, "bot");
    }
  }

  avatar.onclick = () => openChat();

  sendBtn.onclick = () => {
    const msg = input.value.trim();
    if (msg) sendToBot(msg);
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });

  micBtn.onclick = async () => {
  try {
    // 🔇 Stop AVA if she's speaking
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];

    // 🔴 Show recording indicator (unchanged)
    micBtn.style.background = "white";
    micBtn.style.color = "red";
    micBtn.textContent = "🔴";

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    mediaRecorder.onstop = async () => {
      // reset button style
      micBtn.style.background = "#1abc9c";
      micBtn.style.color = "white";
      micBtn.textContent = "🎤";

      const blob = new Blob(chunks, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", blob, "speech.webm");

      try {
        const resp = await fetch(`${apiBase}/stt`, {
          method: "POST",
          body: formData
        });

        if (!resp.ok) {
          addMsg("🎤 Speech‑to‑text failed.", "bot");
          return;
        }

        const data = await resp.json();
        const transcript = data.text;

        if (transcript && transcript.trim() !== "") {
          sendToBot(transcript); // ✅ goes through same flow as typed input
        } else {
          addMsg("🎤 Sorry, I couldn’t understand that.", "bot");
        }
      } catch (err) {
        addMsg("🎤 STT error: " + err.message, "bot");
      }
    };

    mediaRecorder.start();
    addMsg("🎤 Listening...", "bot");

    setTimeout(() => mediaRecorder.stop(), 5000);
  } catch (err) {
    addMsg("🎤 Microphone error: " + err.message, "bot");
  }
};
})();

      

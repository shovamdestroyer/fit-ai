// public/js/chatbot.js
// SATHI AI Chatbot — Frontend Logic, Speech Input, Quick Actions & Backend Integration

const SathiChat = (() => {
  let conversationHistory = [];
  let currentMode = 'companion'; // 'companion' | 'dietitian' | 'fitness'
  let isSending = false;
  let recognition = null;

  // Initialize Speech Recognition for Voice Input
  function initSpeechRecognition(onResultCallback, onEndCallback) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onResultCallback) onResultCallback(transcript);
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        if (onEndCallback) onEndCallback();
      };

      recognition.onend = () => {
        if (onEndCallback) onEndCallback();
      };
    }
  }

  function startVoiceRecording(onResult, onEnd) {
    if (!recognition) {
      initSpeechRecognition(onResult, onEnd);
    }
    if (recognition) {
      try {
        recognition.start();
        return true;
      } catch (e) {
        console.warn('Recognition start exception:', e);
      }
    }
    return false;
  }

  function stopVoiceRecording() {
    if (recognition) {
      try { recognition.stop(); } catch (e) {}
    }
  }

  // Format Markdown (Bold, Lists, Headers) into clean HTML
  function formatMarkdown(text) {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.*$)/gim, '<h4 style="margin: 6px 0; color: #f472b6; font-size: 1rem;">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 style="margin: 8px 0; color: #fdf4ff; font-size: 1.1rem;">$1</h3>')
      // Bold & Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Bullet lists
      .replace(/^\s*•\s*(.*$)/gim, '<li>$1</li>')
      .replace(/^\s*-\s*(.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gims, '<ul style="margin: 6px 0 6px 18px;">$1</ul>')
      // Line breaks
      .replace(/\n\n/g, '<div style="margin: 8px 0;"></div>')
      .replace(/\n/g, '<br>');
    return html;
  }

  // Send message to server
  async function sendMessage(text) {
    if (!text || !text.trim() || isSending) return null;
    const userText = text.trim();
    isSending = true;

    // Append to UI immediately
    appendMessageToUI('user', userText);
    showTypingIndicator(true);

    const token = Auth.getAuthToken() || 'guest-demo-token';
    const profile = Auth.loadProfile() || {};
    const nutrientTotals = Nutrition.getDailyNutrientTotals();
    const waterTotal = Water.getTodayTotal();

    const todayStats = {
      caloriesConsumed: nutrientTotals.calories,
      proteinConsumed: nutrientTotals.protein,
      carbsConsumed: nutrientTotals.carbs,
      fatConsumed: nutrientTotals.fat,
      waterConsumed: waterTotal,
      waterTarget: Water.getDailyTarget()
    };

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-guest-mode': Auth.getCurrentUser()?.isGuest ? 'true' : 'false'
        },
        body: JSON.stringify({
          message: userText,
          history: conversationHistory,
          userProfile: profile,
          todayStats,
          chatType: currentMode
        })
      });

      showTypingIndicator(false);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || "I'm here for you! Could you please ask that again?";

      // Append to memory history
      conversationHistory.push({ role: 'user', content: userText });
      conversationHistory.push({ role: 'model', content: reply });

      appendMessageToUI('sathi', reply);
      isSending = false;
      return reply;

    } catch (err) {
      showTypingIndicator(false);
      isSending = false;
      console.error('SATHI Chat error:', err);
      const friendlyError = `I ran into a temporary connection hiccup. Don't worry, you can tap again or ask about BMR, Indian meal swaps, or yoga poses!`;
      appendMessageToUI('sathi', friendlyError, true);
      return null;
    }
  }

  function appendMessageToUI(sender, content, isError = false) {
    const pane = document.getElementById('sathi-messages');
    if (!pane) return;

    const msgEl = document.createElement('div');
    msgEl.className = `chat-msg msg-${sender}`;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (sender === 'sathi') {
      msgEl.innerHTML = `
        <div class="chat-avatar-mini">✨</div>
        <div class="msg-bubble ${isError ? 'bubble-error' : ''}">
          ${formatMarkdown(content)}
          <div class="msg-time">${timeStr} • SATHI</div>
        </div>
      `;
    } else {
      msgEl.innerHTML = `
        <div class="chat-avatar-mini">👤</div>
        <div class="msg-bubble">
          ${formatMarkdown(content)}
          <div class="msg-time">${timeStr} • You</div>
        </div>
      `;
    }

    pane.appendChild(msgEl);
    pane.scrollTop = pane.scrollHeight;
  }

  function showTypingIndicator(show) {
    const indicator = document.getElementById('sathi-typing');
    if (indicator) {
      indicator.style.display = show ? 'flex' : 'none';
      if (show) {
        const pane = document.getElementById('sathi-messages');
        if (pane) pane.scrollTop = pane.scrollHeight;
      }
    }
  }

  function setMode(mode) {
    if (['companion', 'dietitian', 'fitness'].includes(mode)) {
      currentMode = mode;
      return currentMode;
    }
    return currentMode;
  }

  function resetChat() {
    conversationHistory = [];
    const pane = document.getElementById('sathi-messages');
    if (pane) {
      pane.innerHTML = '';
      appendWelcomeMessage();
    }
  }

  function appendWelcomeMessage() {
    const profile = Auth.loadProfile() || {};
    const name = profile.name ? profile.name.split(' ')[0] : 'there';
    const welcome = `Hey ${name}! I'm **SATHI** ✨\n\nYour personal AI fitness, yoga, and wellness companion.\n\n` +
      `Here's what you can ask me:\n` +
      `• 🧘 *"How do I align my hips in Warrior II?"*\n` +
      `• 🔥 *"My maintenance is 2,400 calories. What is a 350-calorie deficit?"*\n` +
      `• 🥗 *"Can I replace paneer with tofu in lunch?"*\n` +
      `• 🍲 *"How many calories are in 2 rotis and a bowl of dal?"*\n` +
      `• 💧 *"How much water should I drink today?"*\n\n` +
      `Tap a quick action card below or type any question!`;

    appendMessageToUI('sathi', welcome);
  }

  return {
    sendMessage,
    setMode,
    resetChat,
    appendWelcomeMessage,
    startVoiceRecording,
    stopVoiceRecording
  };
})();

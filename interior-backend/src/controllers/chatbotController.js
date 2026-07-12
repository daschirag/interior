const { processMessage } = require("../services/chatbotEngine");
const { createChatbotLead } = require("../models/chatbotLeadModel");

/** In-memory session state for awaiting contact after complex_query */
const sessions = new Map();

function getSession(sessionId) {
  if (!sessionId) return {};
  return sessions.get(sessionId) || {};
}

function setSession(sessionId, state) {
  if (!sessionId) return;
  if (!state || (!state.awaitingContact && !state.originalQuestion)) {
    sessions.delete(sessionId);
    return;
  }
  sessions.set(sessionId, {
    awaitingContact: !!state.awaitingContact,
    originalQuestion: state.originalQuestion || null,
  });
}

const postMessage = async (req, res) => {
  try {
    const message = req.body && req.body.message;
    const sessionId =
      (req.body && (req.body.sessionId || req.body.session_id)) || null;

    if (message == null || String(message).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "message is required",
      });
    }

    const prior = getSession(sessionId);
    const result = processMessage(String(message), prior);

    if (result.lead) {
      try {
        await createChatbotLead({
          sessionId,
          name: result.lead.name,
          phone: result.lead.phone,
          email: result.lead.email,
          originalQuestion: result.lead.originalQuestion,
        });
      } catch (leadErr) {
        console.error("chatbot lead save failed:", leadErr.message);
      }
    }

    setSession(sessionId, result.session);

    return res.json({
      success: true,
      reply: result.reply,
      intent: result.intent,
      needsContact: !!result.needsContact,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Chatbot failed to process message",
    });
  }
};

module.exports = { postMessage };

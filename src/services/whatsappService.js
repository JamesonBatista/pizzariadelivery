import { whatsappConfig, hasWhatsappProvider } from "../config/whatsappConfig.js";

function applyTemplate(template, variables) {
  return template.replace(/\{(\w+)\}/g, (_, key) => variables[key] ?? "");
}

export function createWhatsappService(config = whatsappConfig) {
  function buildMessage(templateId, variables = {}) {
    const template = config.templates[templateId];

    if (!template) {
      throw new Error(`Template de WhatsApp nao encontrado: ${templateId}`);
    }

    return {
      templateId,
      message: applyTemplate(template.message, variables)
    };
  }

  async function sendMessage({ phone, templateId, variables }) {
    const payload = {
      phone,
      ...buildMessage(templateId, variables)
    };

    if (!hasWhatsappProvider(config)) {
      return {
        ...payload,
        status: "prepared",
        provider: config.provider
      };
    }

    throw new Error("Provider de WhatsApp ainda nao foi conectado.");
  }

  return {
    buildMessage,
    sendMessage
  };
}

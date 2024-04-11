import dotenv from "dotenv";
dotenv.config();
import readline from "readline";

// Import Tools
import Anthropic from "@anthropic-ai/sdk";
import {
  weatherToolSchema,
  getOrderStatusSchema,
  toolHandler,
} from "./tools.js";

const anthropic = new Anthropic();

const MODEL_HAIKU = "claude-3-haiku-20240307";
const MODEL_OPUS = "claude-3-opus-20240229";

const createAPIMessage = async (model, messages) => {
  return anthropic.beta.tools.messages.create({
    model,
    max_tokens: 1024,
    messages,
    tools: [weatherToolSchema, getOrderStatusSchema, subAgentSchema],
  });
};

const processConversation = async (message, model = MODEL_HAIKU) => {
  const messages = [{ role: "user", content: message }];
  let response = await createAPIMessage(model, messages);

  console.log(response);

  while (response.stop_reason === "tool_use") {
    // Create the messages array with the original user message and AI response
    const messages = [
      { role: "user", content: message },
      { role: "assistant", content: response.content },
    ];

    // The next message in this sequence needs to be a USER message with the Tool Responses
    // We can create this object with an empty content array
    const toolMessages = {
      role: "user",
      content: [],
    };

    // Loop through the response content to handle any tool_use messages
    for (let i = 0; i < response.content.length; i++) {
      const contentType = response.content[i].type;
      const toolName = response.content[i].name || "";
      const toolInput = response.content[i].input || null;
      const toolId = response.content[i].id || "";

      // If the content type is text, log the response and continue
      if (contentType === "text") {
        console.log("AI: ", response.content[i].text);
        continue;
      }

      // If the content type is tool_use, handle the tool
      if (contentType === "tool_use") {
        const toolResult = await toolHandler(toolName, toolInput);

        // Add the tool result to the messages array
        toolMessages.content.push({
          type: "tool_result",
          tool_use_id: toolId,
          content: toolResult,
        });
      }
    }

    // Append the tool responses to the messages array
    messages.push(toolMessages);

    // Create a new message which includes the tool results
    response = await createAPIMessage(model, messages);
  }

  return response.content[0].text || "No response";
};

// Create the readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Trigger the chat
const startChat = async () => {
  rl.question("User (type 'exit' to quit): ", async (input) => {
    if (input.toLowerCase() === "exit") {
      rl.close();
      return;
    }

    const response = await processConversation(input);

    console.log("AI: ", response);

    startChat();
  });
};

startChat();

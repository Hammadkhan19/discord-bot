import { Client, GatewayIntentBits } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const togetherAPI = axios.create({
  baseURL: "https://api.together.xyz",
  headers: {
    Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
    "Content-Type": "application/json",
  },
});

client.once("ready", () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Ignore bot messages

  try {
    const response = await togetherAPI.post("/inference", {
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      prompt: `System: You are a trading AI assistant.\nUser: ${message.content}`,
      max_tokens: 500,
      temperature: 0.7,
      stop: ["</s>", "User:", "System:"],
    });

    const reply =
      response.data.output.choices[0]?.text || "No response generated";
    message.reply(reply);
  } catch (error) {
    console.error("Error:", error);
    if (error.message?.includes("quota")) {
      message.reply(
        "❌ The bot is currently unavailable due to API limits. Please try again later."
      );
    } else {
      message.reply("❌ There was an error processing your request.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

const app = express();
app.get("/", (req, res) => res.send("Bot is alive!"));

app.listen(3000, () => console.log("Keep-alive server running on Railway!"));

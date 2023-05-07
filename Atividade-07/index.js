const express = require("express");
const mongoose = require("mongoose");
const app = express();
const HttpFunction = require("@google-cloud/functions-framework");

const port = process.env.PORT || "8000";
app.set("port", port);
app.use(express.json());

const url =
  "mongodb+srv://birablau:Minecraft859@cluster0.crppuch.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

// Definir schema para as mensagens
const messageSchema = new mongoose.Schema({
  message: String,
  author: String,
  timestamp: Date,
});

// Definir schema para a conversa, incluindo as mensagens
const conversationSchema = new mongoose.Schema({
  messages: [messageSchema],
  date: { type: Date, default: Date.now },
});

// Criar modelo a partir do schema
const Conversation = mongoose.model("Conversation", conversationSchema);

// Recuperar conversa com as mensagens
app.get("/", async (req, res) => {
  try {
    const conversations = await Conversation.aggregate([
      {
        $project: {
          "messages.author": 1,
          "messages.message": 1,
          "messages.timestamp": 1,
          _id: 0,
        },
      },
    ]);
    if (conversations.length === 0) {
      res.status(404).send("Nenhuma conversa encontrada");
      return;
    }
    res.send(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao recuperar conversas");
  }
});

// Endpoint para criar uma nova mensagem
app.post("/", async (req, res) => {
  const { author, message } = req.body;

  try {
    // Busca todas as conversas
    const conversations = await Conversation.find();

    // Se não há conversas, cria uma nova com a mensagem enviada
    if (conversations.length === 0) {
      const conversation = new Conversation({
        messages: [
          {
            author,
            message,
            timestamp: new Date(),
          },
        ],
      });
      await conversation.save();
      res.status(201).send("Mensagem salva com sucesso");
      return;
    }

    // Se já existem conversas, adiciona a mensagem na última
    const lastConversation = conversations[conversations.length - 1];
    lastConversation.messages.push({
      author,
      message,
      timestamp: new Date(),
    });
    await lastConversation.save();
    res.status(201).send("Mensagem salva com sucesso");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao salvar mensagem");
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));

exports.hey = app;

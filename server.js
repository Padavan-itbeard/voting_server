
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
const cors = require("cors");

const PORT = 3001;

// Создаем объект голосования
var voting = {
  // Инициализация голосования
  init: function (options) {
    this.question = options.question;
    this.choices = options.choices;
    this.votes = new Array(this.choices.length).fill(0);
  },

  // Добавляем голос
  addVote: function (choiceIndex) {
    if (choiceIndex >= 0 && choiceIndex < this.choices.length) {
      this.votes[choiceIndex]++;
    }
  },

  // Получаем результаты голосования
  getResults: function () {
    var results = [];
    for (var i = 0; i < this.choices.length; i++) {
      results.push({
        choice: this.choices[i],
        votes: this.votes[i]
      });
    }
    return results;
  }
};

// Инициализация голосования
voting.init({
  question: "Какой ваш любимый язык программирования?",
  choices: ["JavaScript", "Python", "Java", "C++"]
});

app.use(cors());
app.use(express.json());

// Обработка POST-запроса для добавления голоса
app.post('/vote', (req, res) => {
  const choiceIndex = req.body.choiceIndex;
  voting.addVote(choiceIndex);
  // Отправляем обновленные результаты всем подключенным клиентам
  io.emit('resultsUpdated', voting.getResults());
  res.sendStatus(200);
});

// Обработка GET-запроса для получения результатов голосования
app.get('/results', (req, res) => {
  const results = voting.getResults();
  res.json(results);
});

// Запуск сервера на порту
http.listen(PORT, () => {
  console.log(`Сервер голосования запущен на порту ${PORT}`);
});

require('dotenv').config();
const express = require('express');
const HelloWordService = require('./services/hello-world');
const bodyParser = require('body-parser');

const MovieRecommendationsService = require('./services/movie-recommendations');
const configuration = require('./config/configuration');
const { ChatGroq } = require('@langchain/groq');
//const { GoogleGenerativeAI } = require('@langchain/google-generative-ai');

const app = express();
app.use(bodyParser.json());

app.put('/post-test', async (req, res) => {
  const recommendations = await new MovieRecommendationsService(
    new ChatGroq({
      apiKey: configuration.groq.apiKey,
      model: 'openai/gpt-oss-120b',
    })
  ).getMovieRecommendations(req.body);
  res.send(recommendations);
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/:nameToSalute', (req, res) => {
  res.send(new HelloWordService().greet(req.params.nameToSalute));
});

module.exports = app;

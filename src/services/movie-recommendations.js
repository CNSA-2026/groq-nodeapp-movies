const { z } = require('zod');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StructuredOutputParser } = require('@langchain/core/output_parsers');
const { RunnableSequence } = require('@langchain/core/runnables');

class MovieRecommendationsService {
  constructor(model) {
    this.model = model;

    this.parser = StructuredOutputParser.fromZodSchema(
      z.object({
        movies: z
          .array(
            z.object({
              title: z.string().describe('title of the movie'),
              director: z.string().describe('director of the movie'),
              year: z.number().describe('year the movie was released'),
              reason: z
                .string()
                .describe('reason why the movie was recommended'),
            })
          )
          .describe('json array of recommended movies'),
      })
    );

    this.chain = RunnableSequence.from([
      new PromptTemplate({
        template: `Given a list of movies suggest 5 new movies. Do not repeat the movies from the list.\n{format_instructions}
        List of movies: {movies}`,
        inputVariables: ['movies'],
        partialVariables: {
          format_instructions: this.parser.getFormatInstructions(),
        },
      }),
      this.model,
      this.parser,
    ]);
  }

  async getMovieRecommendations({ movies }) {
    const response = await this.chain.invoke({
      movies: movies.join(','),
    });

    return response;
  }
}

module.exports = MovieRecommendationsService;

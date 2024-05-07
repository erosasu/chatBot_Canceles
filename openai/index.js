const OpenAI = require( "openai");
const { generatePrompt, generatePromptDetermine } =require( "./prompt");
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

/**
 * 
 * @param name 
 * @param history 
 */
const run = async (name, history) => {

    const promtp = generatePrompt(name)
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: [
            {
                "role": "system",
                "content": promtp
            },
            ...history
        ],
        temperature: 1,
        max_tokens: 200,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response.choices[0].message.content
}

const runDetermine = async (history) => {

    const promtp = generatePromptDetermine()
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: [
            {
                "role": "system",
                "content": promtp
            },
            ...history
        ],
        temperature: 1,
        max_tokens: 200,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response.choices[0].message.content
}

module.exports= { run, runDetermine }



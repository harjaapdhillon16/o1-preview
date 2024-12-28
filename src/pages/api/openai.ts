// @ts-nocheck

import { DEFAULT_OPENAI_MODEL } from "@/shared/Constants";
import { OpenAIModel } from "@/types/Model";
import * as dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// Get your environment variables
dotenv.config();

// OpenAI instance creation
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY
});


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const body = req.body;
  const messages = (body?.messages || []) as any[];
  const model = (body?.model || DEFAULT_OPENAI_MODEL) as OpenAIModel;

  try {
    const initialMessages: any[] = messages.splice(
      0,
      3
    );
    const latestMessages: any[] = messages
      .slice(-5)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }))

    const completion = await openai.chat.completions.create({
      model: model.id,
      messages: [...initialMessages, ...latestMessages].filter((item) => item !== "system"),
    });

    const responseMessage = completion.choices[0].message?.content.trim();

    if (!responseMessage) {
      res
        .status(400)
        .json({ error: "Unable get response from OpenAI. Please try again." });
    }

    res.status(200).json({ message: responseMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred during ping to OpenAI. Please try again.",
    });
  }
}

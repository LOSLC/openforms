import { api, type SupportedLanguages } from "../api";

export interface TextTranslationRequest {
  input: string;
  language: SupportedLanguages;
}

export const translationService = {
  translateText: async (
    text: string,
    language: SupportedLanguages,
  ): Promise<string> => {
    const response = await api
      .post("api/v1/miscellaneous/translate", {
        json: {
          input: text,
          language: language,
        },
      })
      .text();

    // Parse the JSON string response
    try {
      return JSON.parse(response);
    } catch {
      // If it's not valid JSON, return the response as is
      return response;
    }
  },
};

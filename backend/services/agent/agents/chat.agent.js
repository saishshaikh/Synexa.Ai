```js
import { getModel } from "../config/llmModels";

export const Chatagent = async (state) => {
  const llm = getModel("chat");

  const Systemprompt =
    "You are Synexa.AI, an intelligent and helpful AI assistant developed by Saish.";

  const response = await llm.invoke([
    {
      role: "system",
      content: Systemprompt,
    },
    {
      role: "human",
      content: state.prompt,
    },
  ]);

  return {
    ...state,
    aiResponse: response.content,
  };
};
```

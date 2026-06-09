import axios from "axios";

const response = await axios.post(
  "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
  {
    inputs: enhancedPrompt
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`
    },
    responseType: "arraybuffer"
  }
);

console.log(response.status);
// import OpenAI from "openai";

import { GoogleGenAI } from "@google/genai";
import { thumbnail } from "../models/Thumbnail.js";
import { User } from "../models/user.js";
import fs from "fs";

import dotenv from "dotenv";
dotenv.config();

// const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY, timeout:3000});
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// export const generateThumbnail = async (req, res) => {
//     const {title, style} = req.body;
//     console.log(title, style);
//     console.log("req.user: ", req.user);
//     const userId = req.user.id;
//     try{
//         const user = await User.findById(userId);
//         console.log("Found User: ", user);
//         if(user.credits < 1){
//             return res.status(402).json({success: false, message: "Insufficient credits"});
//         }

//         console.log("OpenAI Key Exists: ", !!process.env.OPENAI_API_KEY);

//         const completion = await openai.chat.completions.create({
//             model: "gpt-4o",
//             messages:[
//                 {
//                     role: "system",
//                     content: "You are an expert visual director for youtube thumbnails. you output only the raw pyshical description for an image generator.",
//                 },
//                 {
//                     role: "user",
//                     content: `create a high-contrast, click-worthy DALL-E 3 prompt for a video titled "${title}".
//                     style: ${style}
//                     Requirements:
//                     -The text "{title}" MUST be legible and center-stage.
//                     -Use 3D render style, 8k resolution vibrant lightning.
//                     -Make it emotional and expressive.`
//                 }
//             ]
//         });
//         const enhancedPrompt = completion.choices[0].message.content;

//         const imageResponse = await openai.images.generate({
//             model: "dall-e-3",
//             prompt: enhancedPrompt,
//             n: 1,
//             size:"1024x1024",
//             quality: "hd",
//             style: "vivid"
//         });

//         const imageUrl = imageResponse.data[0].url

//         // const enhancedPrompt =`${title}, ${style}, youtube thumbnail, clickworthy, vibrant colors, professional, 4k`;

//         // const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}`;

//         const newThumbnail = await thumbnail.create({
//             userId,
//             title,
//             style,
//             enhancedPrompt,
//             imageUrl
//         });

//         const updatedUser = await User.findByIdAndUpdate(
//             userId,
//             {$inc: {credits: -1}},
//             {new: true}
//         );
//         res.status(200).json({
//             success: true,
//             data: newThumbnail,
//             creditsLeft: updatedUser.credits
//         });

//     }catch(error){
//         res.status(500).json({success: false, message: "AI generation failed", error: error.message});
//     }
// }

// export const getHistory = async (req, res) => {
//     try {
//         const history = (await thumbnail.find({ userId: req.user.id})).sort({createdAt: -1});
//         res.status(200).json({ success: true, data: history });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "fetch failed!"});
//     }
// };

// export const deleteThumbnail = async (req, res) => {
//     try {
//         const history = await thumbnail.findOneAndDelete({_id: req.params.id, userId: req.user.id});
//         res.status(200).json({ success: true, message: "Deleted successfully!" });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "delete failed!"});
//     }
// };
//---------------------------------------------------------
// export const generateThumbnail = async (req, res) => {
//   const { title, style } = req.body;
//   console.log("Generating: Safe Multi-Model System...", title, style);
//   const userId = req.user.id;

//   try {
//     // 1. Verify user credits
//     const user = await User.findById(userId);
//     // if (!user || user.credits < 1) {
//     //     return res.status(402).json({ success: false, message: "Insufficient credits" });
//     // }

//     // 2. Expand text title into a descriptive prompt (With Automatic Gemini Fallback)
//     let enhancedPrompt = "";
//     // const textPrompt = `You are an expert visual director for YouTube thumbnails. Output ONLY a raw physical description for an image generator. Create a high-contrast, click-worthy prompt for a video titled "${title}". Style: ${style}. Requirements: Use a vibrant 3D render style with emotional expressions.`;

//     const textPrompt = `You are an expert visual director for YouTube thumbnails.
// Output ONLY a physical graphic description for an image generator.
// Create a high-contrast, click-worthy scene based on the topic "${title}".

// STYLE REQUIREMENTS: ${style}. Saturated, epic lighting, cinematic composition.

// TEXT GRAPHICS REQUIREMENTS:
// 1. The text "${title}" MUST be written out explicitly in large, bold, clear, legible typography stamped onto the image.
// 2. The specific words "Season 1" and "Episode 1" must be prominently displayed as a clear overlay block in a corner or center stage, using thick readable fonts so a viewer can read it instantly on a phone screen.`;

//     const structuredContents = [
//       {
//         role: "user", // Note: Gemini treats initial system-style behavior instructions elegantly as user pre-prompts
//         parts: [
//           {
//             text: "You are an expert visual director for YouTube thumbnails. You output ONLY the raw physical description for an image generator.",
//           },
//         ],
//       },
//       {
//         role: "user",
//         parts: [
//           {
//             text: `Create a high-contrast, click-worthy prompt for an image generator based on a video titled "${title}".
//                     Style requirements: ${style}

//                     CRITICAL REQUIREMENTS:
//                     - The text "${title}" MUST be written out explicitly, legible, clear, and center-stage on the layout.
//                     - The text must look like a high-contrast graphic design overlay.
//                     - Use a 3D render style with 8k resolution and vibrant cinematic lighting.
//                     - Make the overall scene highly emotional and expressive.`,
//           },
//         ],
//       },
//     ];

//     try {
//       console.log("Trying Primary Text Model (Gemini 2.5)...");
//       const textResponse = await ai.models.generateContent({
//         model: "gemini-2.5-flash",
//         contents: textPrompt,
//       });
//       enhancedPrompt = textResponse.text;
//     } catch (textError) {
//       console.warn("Gemini 2.5 Overloaded. Dropping back to Gemini 2.0...");
//       const backupTextResponse = await ai.models.generateContent({
//         model: "gemini-2.0-flash",
//         contents: textPrompt,
//       });
//       enhancedPrompt = backupTextResponse.text;
//     }

//     // 3. Generate Image using Hugging Face (With Supported Models and Fallback)
//     let hfResponse;
//     const primaryModelUrl =
//       "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell";
//     const backupModelUrl =
//       "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0";

//     try {
//       console.log("Trying Primary Image Model (FLUX.1)...");
//       hfResponse = await fetch(primaryModelUrl, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${process.env.HF_TOKEN}`,
//         },
//         body: JSON.stringify({ inputs: enhancedPrompt }),
//       });
//     } catch (imgError) {
//       console.warn("Primary HF router busy. Contacting Backup Image Engine...");
//       hfResponse = await fetch(backupModelUrl, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${process.env.HF_TOKEN}`,
//         },
//         body: JSON.stringify({ inputs: enhancedPrompt }),
//       });
//     }

//     // Handle error statuses returned by the server (like a 503 model loading block)
//     if (!hfResponse.ok) {
//       console.warn(
//         "Primary returned error status, executing backup model stream...",
//       );
//       hfResponse = await fetch(backupModelUrl, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${process.env.HF_TOKEN}`,
//         },
//         body: JSON.stringify({ inputs: enhancedPrompt }),
//       });

//       if (!hfResponse.ok) {
//         const errTxt = await hfResponse.text();
//         throw new Error(`All image generation pools busy: ${errTxt}`);
//       }
//     }

//     // 4. Convert the raw binary buffer into a base64 Data URL
//     const arrayBuffer = await hfResponse.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
//     const base64Image = buffer.toString("base64");
//     const imageUrl = `data:image/jpeg;base64,${base64Image}`;

//     fs.writeFileSync("generated-thumbnail.png", base64Image, "base64");
//     console.log(
//       "📁 Image saved directly to backend folder as 'generated-thumbnail.png'!",
//     );

//     // 5. Commit the asset record to MongoDB
//     const newThumbnail = await thumbnail.create({
//       userId,
//       title,
//       style,
//       enhancedPrompt,
//       imageUrl,
//     });

//     // 6. Safely deduct 1 credit from the user's account
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { $inc: { credits: -1 } },
//       { new: true },
//     );

//     res.status(200).json({
//       success: true,
//       data: newThumbnail,
//       creditsLeft: updatedUser.credits,
//     });
//   } catch (error) {
//     console.error("Critical Pipeline Failure:", error);
//     res.status(500).json({
//       success: false,
//       message: "Generation failed completely",
//       error: error.message,
//     });
//   }
// };

export const getHistory = async (req, res) => {
  try {
    const history = await thumbnail
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: "fetch failed!" });
  }
};

export const deleteThumbnail = async (req, res) => {
  try {
    await thumbnail.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    res.status(200).json({ success: true, message: "Deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "delete failed!" });
  }
};



export const generateThumbnail = async (req, res) => {
    const { title, style } = req.body;
    console.log("Generating via Offline Prompt-Engine + Hugging Face...", title, style);
    const userId = req.user.id;

    try {
        // 1. Credit Safeguard (Optional: keep commented out while testing locally)
        // const user = await User.findById(userId);
        // if (!user || user.credits < 1) { return res.status(402).json({ success: false }); }

        // 2. Local High-Precision Prompt Engine (Bypasses Gemini 429 entirely!)
        // This replaces the API call with a perfectly structured instructions string
        const enhancedPrompt = `A high-contrast, click-worthy YouTube thumbnail concept for a video titled "${title}". 
        Style orientation: ${style}. 
        The image layout MUST prominently feature the exact text words "${title}" written out in huge, bold, razor-sharp, crystal-clear typography. 
        Important: Create high-contrast block lettering overlays explicitly spelling out aligned cleanly near the corner or center. 
        Vibrant cinematic studio lighting, highly descriptive 8k resolution graphic layout design with intense emotional focus, absolutely no text typos or gibberish.`;

        console.log("Generated prompt layout successfully. Routing to Hugging Face pool...");

        // 3. Generate Image using Hugging Face (100% Free & Independent)
        let hfResponse;
        const primaryModelUrl = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell";
        const backupModelUrl = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0";

        try {
            console.log("Trying Primary Image Model (FLUX.1)...");
            hfResponse = await fetch(primaryModelUrl, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.HF_TOKEN}`
                },
                body: JSON.stringify({ inputs: enhancedPrompt }),
            });
        } catch (imgError) {
            console.warn("Primary HF router busy. Contacting Backup Image Engine...");
            hfResponse = await fetch(backupModelUrl, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.HF_TOKEN}`
                },
                body: JSON.stringify({ inputs: enhancedPrompt }),
            });
        }

        if (!hfResponse.ok) {
            console.warn("Primary returned error status, executing backup model stream...");
            hfResponse = await fetch(backupModelUrl, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.HF_TOKEN}`
                },
                body: JSON.stringify({ inputs: enhancedPrompt }),
            });
            
            if (!hfResponse.ok) {
                const errTxt = await hfResponse.text();
                throw new Error(`All image generation pools busy: ${errTxt}`);
            }
        }

        // 4. Convert the raw binary buffer into base64 strings and write file
        const arrayBuffer = await hfResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString("base64");
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;

        // Save a real copy directly into your local project backend folder to view instantly!
        fs.writeFileSync('generated-thumbnail.png', base64Image, 'base64');
        console.log("📁 Image saved directly to backend folder as 'generated-thumbnail.png'!");

        // 5. Commit asset layout metadata straight to MongoDB
        const newThumbnail = await thumbnail.create({
            userId,
            title,
            style,
            enhancedPrompt,
            imageUrl
        });

        // 6. Deduct balance safely
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $inc: { credits: -1 } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: newThumbnail,
            creditsLeft: updatedUser ? updatedUser.credits : 0
        });

    } catch (error) {
        console.error("Critical Pipeline Failure:", error);
        res.status(500).json({ success: false, message: "Generation failed completely", error: error.message });
    }
};




// export const generateThumbnail = async (req, res) => {
//     const { title, style } = req.body;
//     console.log("Generating: Safe Multi-Model System...", title, style);
//     const userId = req.user.id;

//     try {
//         // 1. Verify user credits
//         const user = await User.findById(userId);
//         // if (!user || user.credits < 1) {
//         //     return res.status(402).json({ success: false, message: "Insufficient credits" });
//         // }

//         // 2. Expand text title into a descriptive prompt (With Automatic Gemini Fallback)
//         let enhancedPrompt = "";
        
//         // 👇 THIS IS THE MODIFIED BLOCK WITH STRINGENT TEXT GENERATION INSTRUCTIONS
//         const textPrompt = `You are an expert visual director for YouTube thumbnails. 
// Output ONLY a raw, highly descriptive physical layout description for an image generator.
// Create an epic, high-contrast, click-worthy scene based on the topic: "${title}".
// Style: ${style}. 

// CRITICAL TYPOGRAPHY REQUIREMENTS:
// 1. You MUST include the exact text words "${title}" written out crystal clear, bold, and perfectly spelled on the image.
// 2. The text layout must feature prominent, visible overlays reading "SEASON 1" and "EPISODE 1" in clean, high-contrast block lettering.
// 3. Ensure all text avoids gibberish or AI distortion; typography must look like a clean graphic design overlay, centered or aligned neatly in a corner.`;
        
//         try {
//             console.log("Trying Primary Text Model (Gemini 2.5)...");
//             const textResponse = await ai.models.generateContent({
//                 model: "gemini-2.5-flash",
//                 contents: textPrompt,
//             });
//             enhancedPrompt = textResponse.text;
//         } catch (textError) {
//             console.warn("Gemini 2.5 Overloaded. Dropping back to Gemini 2.0...");
//             const backupTextResponse = await ai.models.generateContent({
//                 model: "gemini-2.0-flash",
//                 contents: textPrompt,
//             });
//             enhancedPrompt = backupTextResponse.text;
//         }

//         // 3. Generate Image using Hugging Face (With Supported Models and Fallback)
//         let hfResponse;
//         const primaryModelUrl = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell";
//         const backupModelUrl = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0";

//         try {
//             console.log("Trying Primary Image Model (FLUX.1)...");
//             hfResponse = await fetch(primaryModelUrl, {
//                 method: "POST",
//                 headers: { 
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${process.env.HF_TOKEN}`
//                 },
//                 body: JSON.stringify({ inputs: enhancedPrompt }),
//             });
//         } catch (imgError) {
//             console.warn("Primary HF router busy. Contacting Backup Image Engine...");
//             hfResponse = await fetch(backupModelUrl, {
//                 method: "POST",
//                 headers: { 
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${process.env.HF_TOKEN}`
//                 },
//                 body: JSON.stringify({ inputs: enhancedPrompt }),
//             });
//         }

//         // Handle error statuses returned by the server (like a 503 model loading block)
//         if (!hfResponse.ok) {
//             console.warn("Primary returned error status, executing backup model stream...");
//             hfResponse = await fetch(backupModelUrl, {
//                 method: "POST",
//                 headers: { 
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${process.env.HF_TOKEN}`
//                 },
//                 body: JSON.stringify({ inputs: enhancedPrompt }),
//             });
            
//             if (!hfResponse.ok) {
//                 const errTxt = await hfResponse.text();
//                 throw new Error(`All image generation pools busy: ${errTxt}`);
//             }
//         }

//         // 4. Convert the raw binary buffer into a base64 Data URL
//         const arrayBuffer = await hfResponse.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);
//         const base64Image = buffer.toString("base64");
//         const imageUrl = `data:image/jpeg;base64,${base64Image}`;

//         fs.writeFileSync('generated-thumbnail.png', base64Image, 'base64');
//         console.log("📁 Image saved directly to backend folder as 'generated-thumbnail.png'!");


//         // 5. Commit the asset record to MongoDB
//         const newThumbnail = await thumbnail.create({
//             userId,
//             title,
//             style,
//             enhancedPrompt,
//             imageUrl
//         });

//         // 6. Safely deduct 1 credit from the user's account
//         const updatedUser = await User.findByIdAndUpdate(
//             userId,
//             { $inc: { credits: -1 } },
//             { new: true }
//         );

//         res.status(200).json({
//             success: true,
//             data: newThumbnail,
//             creditsLeft: updatedUser.credits
//         });

//     } catch (error) {
//         console.error("Critical Pipeline Failure:", error);
//         res.status(500).json({ success: false, message: "Generation failed completely", error: error.message });
//     }
// };
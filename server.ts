import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable CORS to support hybrid deployments (frontend on Vercel, backend on Render)
  app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));

  // Crucial: parse JSON bodies with a generous limit to support base64 imagery or large drafts
  app.use(express.json({ limit: "50mb" }));

  // Initialize Gemini Client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Helper helper function to handle Gemini API rate limits with retries and model fallback
  async function generateContentWithRetry(
    params: {
      model: string;
      contents: any;
      config?: any;
    },
    maxRetries = 3,
    delayMs = 2000
  ): Promise<any> {
    let attempt = 0;
    let lastError: any = null;
    let currentModel = params.model;

    while (attempt <= maxRetries) {
      try {
        console.log(`[Gemini API] Requesting ${currentModel} (Attempt ${attempt + 1}/${maxRetries + 1})...`);
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (error: any) {
        lastError = error;
        const errString = JSON.stringify(error) || "";
        const errMessage = error?.message || "";
        const errStringLower = errString.toLowerCase();
        const errMessageLower = errMessage.toLowerCase();
        const isTransientOrQuotaError = errMessage.includes("429") || 
                           errMessage.includes("503") ||
                           error?.status === "RESOURCE_EXHAUSTED" || 
                           error?.status === "UNAVAILABLE" ||
                           errString.includes("429") ||
                           errString.includes("503") ||
                           errString.includes("RESOURCE_EXHAUSTED") ||
                           errString.includes("UNAVAILABLE") ||
                           error?.code === 429 ||
                           error?.code === 503 ||
                           errMessageLower.includes("quota") ||
                           errStringLower.includes("quota") ||
                           errMessageLower.includes("limit") ||
                           errStringLower.includes("limit") ||
                           errMessageLower.includes("resource_exhausted") ||
                           errStringLower.includes("resource_exhausted") ||
                           errMessageLower.includes("unavailable") ||
                           errStringLower.includes("unavailable") ||
                           errMessageLower.includes("demand") ||
                           errStringLower.includes("demand");

        const isNotFoundError = errMessage.includes("404") ||
                                 errString.includes("404") ||
                                 error?.status === "NOT_FOUND" ||
                                 errMessageLower.includes("not found") ||
                                 errStringLower.includes("not_found") ||
                                 errMessageLower.includes("not supported") ||
                                 errStringLower.includes("not supported") ||
                                 errMessageLower.includes("is not found for api version");

        if (isTransientOrQuotaError || isNotFoundError) {
          console.warn(`[Gemini API] Error hit on model ${currentModel} (Transient/Quota/NotFound). Details: ${errMessage}`);
          
          // Fallback mechanism to keep application running
          if (currentModel.startsWith("gemma") || currentModel === "gemini-2.5-flash-lite") {
            console.warn(`[Gemini API] Falling back from ${currentModel} to gemini-3.5-flash...`);
            currentModel = "gemini-3.5-flash";
            attempt++;
            continue;
          }

          if (currentModel === "gemini-3.1-pro-preview" || currentModel === "gemini-3.1-pro") {
            console.warn(`[Gemini API] Falling back from ${currentModel} to gemini-3.5-flash...`);
            currentModel = "gemini-3.5-flash";
            attempt++;
            continue;
          }

          if (currentModel === "gemini-3.5-flash") {
            console.warn(`[Gemini API] Falling back from gemini-3.5-flash to gemini-3.1-flash-lite...`);
            currentModel = "gemini-3.1-flash-lite";
            attempt++;
            continue;
          }

          if (currentModel === "gemini-3-pro-image-preview" || currentModel === "gemini-3-pro-image") {
            console.warn(`[Gemini API] Falling back from ${currentModel} to gemini-3.1-flash-image...`);
            currentModel = "gemini-3.1-flash-image";
            attempt++;
            continue;
          }

          if (attempt === maxRetries) {
            break;
          }

          const waitTime = delayMs * Math.pow(2, attempt);
          console.log(`[Gemini API] Waiting ${waitTime}ms before retrying ${currentModel}...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          attempt++;
        } else {
          // Other critical errors should be thrown immediately
          throw error;
        }
      }
    }

    throw new Error(
      `Service is temporarily experiencing high traffic or model unavailability. Please retry in a few seconds. (Technical Details: ${lastError?.message || JSON.stringify(lastError)})`
    );
  }

  // --- API Endpoints ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // 1. Generate Email Campaign copy and optimization score
  app.post("/api/generate-campaign", async (req, res) => {
    try {
      const { campaignType, audience, description, tone, extraOffer, ctaLink, brandingColor, copyLengthOption, selectedElements, brandProfile, isImmersive, selectedModel } = req.body;

      if (!campaignType || !audience || !description) {
        return res.status(400).json({ error: "Missing required fields: campaignType, audience, description" });
      }

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server. Please add it to your secrets panel." });
      }

      let modelToUse = "gemma-4-26b-it"; // Default to gemma 4 26B as preferred by user
      if (selectedModel) {
        if (selectedModel === "gemma 4 26B") {
          modelToUse = "gemma-4-26b-it";
        } else if (selectedModel === "gemma 4 31B") {
          modelToUse = "gemma-4-31b-it";
        } else if (selectedModel === "3.1 flash lite") {
          modelToUse = "gemini-3.1-flash-lite";
        } else if (selectedModel === "Gemini 2.5 Flash Lite") {
          modelToUse = "gemini-2.5-flash-lite";
        } else if (selectedModel === "3.5 flash") {
          modelToUse = "gemini-3.5-flash";
        } else {
          modelToUse = selectedModel;
        }
      }

      // Compute precise copy length and line-count guidance based on user selections
      let lengthGuidance = "";
      const is250Plus = copyLengthOption && copyLengthOption.includes("250+");
      const isBalanced = (copyLengthOption && copyLengthOption.includes("100 - 250")) || copyLengthOption === "medium" || (copyLengthOption && copyLengthOption.toLowerCase().includes("medium"));
      const isPunchy = (copyLengthOption && copyLengthOption.includes("under 100")) || copyLengthOption === "short" || (copyLengthOption && copyLengthOption.toLowerCase().includes("punchy"));

      if (isImmersive && is250Plus) {
        lengthGuidance = `
        - BOTH IMMERSIVE MODE AND "250+ WORDS" OPTIONS ARE ACTIVATED:
          CRITICAL: You MUST write EXTREMELY rich, lengthy, and highly detailed copy. 
          - The body copies for the main campaign and all three variants MUST contain ALMOST 20+ LINES of fully articulated text.
          - EXACT WORD COUNT: You MUST write a MINIMUM OF 400 WORDS per variant body.
          - Do not summarize. Include offers, full details, background story, and terms. Each body must have 4-5 full paragraphs.`;
      } else if (is250Plus) {
        lengthGuidance = `
        - ONLY "250+ WORDS" OPTION IS ACTIVATED:
          CRITICAL: You MUST write very long, highly detailed copy. 
          - The body copies for the main campaign and all three variants MUST contain ALMOST 15+ LINES of text.
          - EXACT WORD COUNT: You MUST write a MINIMUM OF 250 WORDS per variant body.
          - Describe all features, benefits, and special offers in exquisite, narrative-driven detail.`;
      } else if (isBalanced) {
        lengthGuidance = `
        - BALANCED OPTION (Medium copy, 100-250 words) IS ACTIVATED:
          CRITICAL: You MUST write standard-length, engaging copy. The body copies for the main campaign and all three variants MUST contain ALMOST 10+ LINES of text, roughly 150 words, with solid product details, promotional offers, and structured points.`;
      } else if (isPunchy || copyLengthOption === 'short') {
        lengthGuidance = `
        - PUNCHY OPTION (Short copy, under 100 words) IS ACTIVATED:
          CRITICAL: You MUST write concise but highly engaging copy. The body copies for the main campaign and all three variants MUST contain ALMOST 5+ LINES of highly focused copywriting, roughly 75 words, clearly highlighting the special offers/deals, call-to-actions, and main features.`;
      } else {
        lengthGuidance = `
        - The body copies for the main campaign and all three variants MUST contain at least 10+ lines of text (about 150 words), structured with beautiful paragraph spacing.`;
      }

      // Compute dynamic layout/components guidance to force selected structural elements
      let layoutGuidance = "";
      if (selectedElements && selectedElements.length > 0) {
        layoutGuidance = `
        CRITICAL - REQUIRED STRUCTURAL COMPONENTS MANDATE:
        The user has explicitly selected and enabled the following structural layout components to be included in the email campaign:
        ${selectedElements.map((el: string) => `* "${el}"`).join('\n        ')}

        For BOTH the main campaign (bodyHtml, bodyMarkdown) and ALL THREE VARIANTS (variants[0..2].bodyHtml, variants[0..2].bodyMarkdown), you MUST explicitly build, write, and fully render every single one of these selected components into the text and layout. DO NOT leave them out under any circumstances.

        Specific component design and content criteria:
        - If 'Interactive FAQ Section' (or FAQ Accordion / faq) is selected:
          You MUST include a dedicated section titled "Frequently Asked Questions" containing at least 3 custom-crafted, highly relevant questions and answers specifically written about this product/event/service. Style it beautifully using inline HTML styles (e.g. rounded-none, light background container, clear text margins, subtle borders).
        - If 'Product Benefits Comparison Table' (or Benefits Table / table) is selected:
          You MUST include a fully fleshed out, beautifully styled comparison table with header columns (such as "Feature / Benefit", "Our Custom Solution", "Traditional Competitors") and at least 3 custom rows detailing features, comparison parameters, or advantages, styled with clear thin border styling (\`border: 1px solid rgba(26,26,26,0.15);\`) and padded cells.
        - If 'Social Media Links block' (or Social Follow block / social) is selected:
          You MUST design a highly stylized, centered horizontal footer row or list showing social media follow handles/links (e.g., "Facebook", "Instagram", "Twitter", "LinkedIn") centered with subtle borders, custom font sizing, and elegant spacing.
        - If 'Elegant Legal Unsubscribe Footer block' (or Unsubscribe Footer / unsubscribe) is selected:
          You MUST write a professional, highly styled legal footer block at the very bottom (e.g. "This message was sent to [Email Address] by [Brand Name]. You received this because you are subscribed to our newsletter. [Unsubscribe] | [Manage Preferences] | [Privacy Policy]"). Style it with a small font size (e.g. 11px or 12px), lighter color, and elegant visual separators.

        FAIL-SAFE VERIFICATION RULE: If selected, the structural elements MUST be present in BOTH the main campaign and all three variants. Do not output placeholders; output fully written content tailored to this campaign.
        `;
      } else {
        layoutGuidance = `
        No special structural components selected. Standard email layout rules apply.
        `;
      }

      const prompt = `
        You are a world-class direct-response email marketing strategist and master copywriter.
        Generate a complete, high-converting email marketing campaign based on the following specifications:
        
        - Campaign Preset Type: ${campaignType}
        - Target Audience / Customer Segment: ${audience}
        - Product, Service, or Event Description: ${description}
        - Tone of Voice: ${tone || 'Friendly & Professional'}
        - Special Offer / Discount Parameters: ${extraOffer || 'None'}
        - Target CTA Link URL: ${ctaLink || 'https://example.com'}
        - Brand Primary Accent Color: ${brandingColor || '#0284c7'}
        - Desired Copy Length Option Selected: ${copyLengthOption || 'Medium Copy (100-250 words)'}
        - Layout Blocks to Include: ${(selectedElements && selectedElements.length > 0) ? selectedElements.join(', ') : 'Standard Newsletter Structure'}

        STRICT LINE COUNT & COPY LENGTH CRITERIA:
        ${lengthGuidance}

        STRICT STRUCTURAL COMPONENTS REQUIREMENT:
        ${layoutGuidance}

        ${isImmersive ? `
        - IMMERSIVE GENERATION FLAG ACTIVATED:
          CRITICAL: You MUST write EXTREMELY rich, lengthy, detailed, and highly immersive content. Do not write short copy. Generate comprehensive paragraphs for the body. Use beautiful stylized HTML formatting, intricate storytelling, vivid contextual depth, complex scenarios, elegant visual dividers, and sophisticated psychological hooks. Ensure the design and text quality is absolute top-tier, resembling a masterclass in brand copywriting.
        ` : ''}

        - Sender Brand & Organization Context:
          ${brandProfile ? `
          * Sender Name: ${brandProfile.fullName || 'N/A'}
          * Role: ${brandProfile.role || 'N/A'}
          * Organization / Company: ${brandProfile.companyName || 'N/A'}
          * Industry Vertical: ${brandProfile.industry || 'N/A'}
          * Core Value Proposition: ${brandProfile.valueProposition || 'N/A'}
          * Target Audience Persona (Overriding default): ${brandProfile.targetAudience || 'N/A'}
          * Brand Voice Profile (Overriding default): ${brandProfile.brandVoice || 'N/A'}
          * Key Products / Offerings: ${brandProfile.keyProducts || 'N/A'}
          * Core Brand Narrative / Story: ${brandProfile.brandStory || 'N/A'}
          * Forbidden Words / Spam Guardrails: ${brandProfile.copywritingRules || 'N/A'}
          ` : 'No custom brand profile supplied. Use the default general tone guidelines.'}

        Ensure the output strictly aligns with the structure requested in the schema.
        
        CRITICAL VARIANT INSTRUCTION:
        You must generate 3 distinct copy and analytical variants inside the 'variants' array:
        - Variant [0] MUST be Urgent/Direct themed. Focus on high urgency, FOMO, or direct benefit.
        - Variant [1] MUST be Benefit-driven. Focus on direct user value, problem-solving, and outcome.
        - Variant [2] MUST be Curiosity-focused. Focus on opening loops, storytelling, or a mystery hook.

        BRAND COHERENCE RULES:
        - If a custom Brand Voice Profile and Narrative is supplied above, you MUST strictly mimic that tone (e.g., if literary and quiet, write with quiet sophistication; if punchy and techy, write modern tech copy).
        - If "Forbidden Words / Spam Guardrails" are listed, make sure NONE of those forbidden words appear in the generated subjects, previews, headlines, or email bodies.
        - Dynamically use the Sender Name and Role in the email signature block. For example: "Warmly, [Sender Name]" or "Sincerely, [Sender Name], [Role] at [Organization]". Avoid generic "The Team" sign-offs.

        - For each variant's 'bodyMarkdown' and 'bodyHtml':
        - Write fully custom body copy specifically written for that variant's psychological hook.
        - Ensure all body copy adheres to the strict line count criteria described in the STRICT LINE COUNT & COPY LENGTH CRITERIA section. (e.g. 400+ words for Immersive + 250+ words).
        - DO NOT cut corners. You are a senior copywriter and must deliver the FULL final product.
        - Every paragraph in 'bodyHtml' MUST be styled with a line-height of 1.6 to 1.7 and standard spacing.
        - DO NOT include outer <html>, <head>, or <body> tags in bodyHtml. Start directly with an outer container <div>.
        - Use inline styles (CSS) or direct clean layout formatting. Make it look like a highly polished newsletter with generous padding, neat borders, beautiful headers, elegant card groupings, and a prominent centered Call-To-Action button utilizing the brand accent color (\`${brandingColor || '#0284c7'}\`).
        - Set the href attribute of the Call-To-Action button EXACTLY to the Target CTA Link URL: \`${ctaLink || 'https://example.com'}\`.
        - If any specific layout blocks (like FAQ Block, Social Media, Product Benefit Table, or Unsubscribe Footer) were requested (as detailed in the STRICT STRUCTURAL COMPONENTS REQUIREMENT section), you MUST build them into the HTML and draft them in Markdown body. DO NOT just write "Add table here". You must write the actual full HTML code for the table, the FAQ items, the footer, etc.
        - CRITICAL: Place the placeholder string "[HEADER_IMAGE]" (case-sensitive) in the src attribute of the main header image tag: <img src="[HEADER_IMAGE]" ... /> so the user can dynamically swap in generated AI visuals. Ensure the image is styled nicely (e.g. max-width: 100%, border-radius: 8px, margin-bottom: 24px, display: block).
        - Use elegant, readable typography and include placeholder text inside the body for personalization, e.g., "Hi [First Name],".
        - The CTA button must be styled with background-color: \`${brandingColor || '#0284c7'}\`; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; margin: 20px 0;
        
        SUGGESTED VISUAL PROMPT GENERATION INSTRUCTION:
        The 'suggestedVisualPrompt' (in the root and inside each variant) MUST be a highly detailed, professional visual prompt for an image generation model to produce a gorgeous newsletter header banner.
        To do this, you MUST deeply analyze the overall mood of the entire campaign, incorporating and reflecting all inputs provided:
        * The Campaign Type ("${campaignType}"): For instance, a launch might suggest high energy or reveal, whereas an abandoned cart might suggest reassurance or an exclusive gift.
        * The Core Details / Description ("${description}"): Describe the actual product, service, or event subjects vividly (e.g. textures, materials, shapes, context).
        * The Audience / Customer Segment ("${audience}"): Tailor the visual style and elements to appeal directly to this segment's aesthetic taste (e.g., minimalist and sophisticated for premium professionals, vibrant and high-contrast for gamers, warm and cozy for hobbyists).
        * The Selected Tone / Voice ("${tone}"): Match the visual energy (e.g., professional & clear implies high-end studio lighting, bold implies dramatic shadows and high contrast, playful implies soft minimalist 3D clay or illustrated art).
        * The Brand Color ("${brandingColor}"): Explicitly specify this brand color as the primary accent color, ambient background glow, or lighting highlight in the image description.
        * The Copy Length & Immersive details: If isImmersive is active or long copy is selected, design a more intricate and sophisticated visual scene with multiple layered elements and rich cinematic detail.
        * Ensure it is written as a direct, high-quality, descriptive prompt for a text-to-image model (e.g. "Cinematic 3D render of a premium hand-stitched leather desk pad on a modern walnut wood desk, architectural raw brass pen nearby, soft studio lighting with subtle glowing violet details, ultra high-definition, 16:9 banner"). Avoid generic keywords like "gorgeous", "beautiful", or "high-resolution" and instead use descriptive composition, material, light source, perspective, and texture-oriented details.

        Analyze the copywriting specifically for that variant to set 'spamScore', 'spamTriggers', 'readabilityGrade', 'readTime', 'optimizationTips', and generate a tailored visual asset generation prompt for this variant.
      `;

      const response = await generateContentWithRetry({
        model: modelToUse,
        contents: prompt,
        config: {
          systemInstruction: `You are a master email copywriter. You are STRICTLY FORBIDDEN from being brief or using placeholders. You MUST follow all length constraints and explicitly write out all structural layout components (tables, FAQs, social links) in full without summarizing. When 250+ words or immersive mode is selected, your output must be EXTREMELY long, detailed, and visually elaborate in both Markdown and HTML. NEVER use "[insert content here]" type placeholders. Write out everything completely.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subjectLines: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of exactly 3 different subject lines: [0] Urgent/Direct, [1] Benefit-driven, [2] Curiosity-focused."
              },
              previewTexts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of exactly 3 matching preview/preheader texts for the subject lines above."
              },
              headline: {
                type: Type.STRING,
                description: "A punchy, attractive main headline for the email banner."
              },
              bodyMarkdown: {
                type: Type.STRING,
                description: "A comprehensive, beautifully formatted Markdown email body copy. If isImmersive is active or copyLength is long, you MUST write an extensive, detailed copy of 3-5 long paragraphs with rich narratives and details (minimum 250 words). If structural components are selected under STRICT STRUCTURAL COMPONENTS REQUIREMENT, you MUST draft all of them here as markdown sections. NEVER write short placeholder lines."
              },
              bodyHtml: {
                type: Type.STRING,
                description: "A complete, beautifully styled HTML email body containing the [HEADER_IMAGE] image tag. Must be highly detailed, immersive, containing structured tables/sections, elegant layout dividers, and a styled CTA button using the brand accent color. If structural components are selected under STRICT STRUCTURAL COMPONENTS REQUIREMENT, you MUST write the actual full-length HTML code for all of them within this HTML snippet. No brief templates: write the actual full-length HTML copy with 3-5 comprehensive paragraphs."
              },
              ctaText: {
                type: Type.STRING,
                description: "The text for the primary CTA button."
              },
              spamScore: {
                type: Type.INTEGER,
                description: "A default estimated spam risk score from 0 to 10."
              },
              spamTriggers: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Default list of found salesy words."
              },
              readabilityGrade: {
                type: Type.STRING,
                description: "Default Flesch-Kincaid readability grade level."
              },
              readTime: {
                type: Type.STRING,
                description: "Default estimated read time."
              },
              optimizationTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Default exactly 3 actionable improvements."
              },
              suggestedVisualPrompt: {
                type: Type.STRING,
                description: "A beautiful, descriptive prompt to generate a matching newsletter banner using the image generator."
              },
              predictedCTR: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Predicted Click-Through-Rate (CTR) for exactly the 3 variants above, e.g. ['4.8%', '6.2%', '3.5%']."
              },
              predictedOpenRate: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Predicted Open Rate for exactly the 3 variants above, e.g. ['45.5%', '51.2%', '38.0%']."
              },
              predictedSentiment: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Brief sentiment or psychological trigger description for exactly the 3 variants, e.g. ['High Urgency & FOMO', 'Curiosity & Mystery', 'Direct Benefit & Value']."
              },
              spamSafeRating: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Spam safe rating out of 100% for exactly the 3 variants, e.g. ['92% - Urgency risk', '100% - Safe', '100% - Safe']."
              },
              variants: {
                type: Type.ARRAY,
                description: "An array of exactly 3 objects matching the 3 variant indices respectively.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    preview: { type: Type.STRING },
                    bodyMarkdown: { 
                      type: Type.STRING,
                      description: "Extensive, highly customized body copy in Markdown specifically written for this variant's psychological hook. If isImmersive is active or copyLength is long, this MUST contain 3-5 full paragraphs, exceeding 250 words, with deep storytelling and details. If structural components are selected under STRICT STRUCTURAL COMPONENTS REQUIREMENT, you MUST draft all of them here as markdown sections."
                    },
                    bodyHtml: { 
                      type: Type.STRING,
                      description: "Fully designed HTML snippet for this variant. MUST be complete and visually impressive, containing the [HEADER_IMAGE] image tag, beautifully integrated tables/sections, and a styled CTA button. If structural components are selected under STRICT STRUCTURAL COMPONENTS REQUIREMENT, you MUST write the actual full-length HTML code for all of them within this HTML snippet."
                    },
                    spamScore: { type: Type.INTEGER },
                    spamTriggers: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    readabilityGrade: { type: Type.STRING },
                    readTime: { type: Type.STRING },
                    optimizationTips: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    suggestedVisualPrompt: {
                      type: Type.STRING,
                      description: "A customized image generation prompt designed specifically for this variant's subject, content, and tone."
                    }
                  },
                  required: ["subject", "preview", "bodyMarkdown", "bodyHtml", "spamScore", "spamTriggers", "readabilityGrade", "readTime", "optimizationTips", "suggestedVisualPrompt"]
                }
              }
            },
            required: [
              "subjectLines", "previewTexts", "headline", "bodyMarkdown", "bodyHtml", "ctaText", 
              "spamScore", "spamTriggers", "readabilityGrade", "readTime", "optimizationTips", "suggestedVisualPrompt",
              "predictedCTR", "predictedOpenRate", "predictedSentiment", "spamSafeRating", "variants"
            ]
          }
        }
      });

      const jsonStr = response.text?.trim() || "{}";
      const result = JSON.parse(jsonStr);

      res.json(result);
    } catch (error: any) {
      console.error("Generate Campaign Error:", error);
      res.status(500).json({ error: error?.message || "An unexpected error occurred during campaign generation." });
    }
  });

  // 2. Generate visuals banner image (supports 1K, 2K, 4K)
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, aspectRatio, size } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required to generate an image." });
      }

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server. Please add it to your secrets panel." });
      }

      // Model: gemini-3-pro-image with retry & fallback
      const response = await generateContentWithRetry({
        model: 'gemini-3-pro-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "16:9",
            imageSize: size || "1K" // Affordance: 1K, 2K, 4K
          }
        }
      });

      if (!response?.candidates?.[0]?.content?.parts) {
        throw new Error("No candidates or parts returned from the image generator model.");
      }

      // Loop to locate inlineData
      let imageUrl = null;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mimeType};base64,${base64Data}`;
          break;
        }
      }

      if (imageUrl) {
        res.json({ imageUrl });
      } else {
        res.status(500).json({ error: "The image model did not return inline binary data." });
      }
    } catch (error: any) {
      console.error("Generate Image Error:", error);
      res.status(500).json({ error: error?.message || "An unexpected error occurred during image generation." });
    }
  });

  // 3. Multi-turn chatbot supporting 3 specific roles and models
  app.post("/api/chat", async (req, res) => {
    try {
      const { role, messages } = req.body; // role: strategist, copywriter, editor. messages: list of ChatMessage

      if (!role || !messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Missing required parameters: role, messages" });
      }

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured. Add it in Secrets." });
      }

      // Map roles to models and system instructions
      let model = "gemini-3.5-flash";
      let systemInstruction = "";

      if (role === "strategist") {
        model = "gemini-3.5-flash"; // Dynamic Strategy Tasks
        systemInstruction = `
          You are an elite, highly analytical Growth and Brand Strategy Consultant with 20+ years of experience in SaaS, e-commerce, and direct-to-consumer email marketing. 
          Your role is to help the user map out overall campaign structures, deep target audience segmentation, positioning angles, competitive differentiation, and business metrics (CTR, Open Rates, ROI). 
          Provide rich, structured, and insightful answers with concrete recommendations. Keep a highly professional and consultive tone.
        `;
      } else if (role === "copywriter") {
        model = "gemini-3.5-flash"; // General tasks
        systemInstruction = `
          You are a world-class Direct Response Email Copywriter who has written legendary, highly-converting welcome sequences, product announcements, and promotional newsletters. 
          Your role is to brainstorm headlines, write alternative email variations, polish current copy, refine hooks, and draft engaging narratives. 
          You are punchy, friendly, creative, and action-oriented. Focus on psychological triggers and compelling hooks.
        `;
      } else if (role === "editor") {
        model = "gemini-3.1-flash-lite"; // Fast tasks
        systemInstruction = `
          You are a fast, sharp, and highly concise Email Copy Editor and Proofreader. 
          Your role is to rapidly audit email copy for grammar, structure, estimated read time, and spam word risks. 
          Provide brief, bullet-point revisions and corrections instantly. 
          Keep responses under 150 words, completely direct, and highly focused.
        `;
      }

      // Construct Gemini content parts
      const contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const response = await generateContentWithRetry({
        model: model,
        contents: contents,
        config: {
          systemInstruction: systemInstruction.trim()
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Chat Error:", error);
      res.status(500).json({ error: error?.message || "An unexpected error occurred in the chatbot model." });
    }
  });

  // --- Serve Frontend Application ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started on http://localhost:${PORT}`);
  });
}

startServer();

const path = require('path');
const fs = require('fs');

class AIController {
    async analyzeArt(req, res) {
        try {
            const { imagePath } = req.body;

            // Шукаємо картинку
            const fullPath = path.join(__dirname, '..', imagePath);
            if (!fs.existsSync(fullPath)) {
                return res.status(404).json({ error: 'Image not found on server' });
            }

            const base64Image = fs.readFileSync(fullPath).toString("base64");
            const apiKey = process.env.GEMINI_API_KEY.trim();

            // ====================================================================
            // КРОК 1: АВТОМАТИЧНО ВИБИВАЄМО З GOOGLE СПИСОК ЖИВИХ МОДЕЛЕЙ
            // ====================================================================
            const modelsReq = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const modelsData = await modelsReq.json();
            
            if (!modelsData.models) {
                console.error("Google не віддав список моделей:", modelsData);
                return res.status(500).json({ error: 'API Key does not have access to models.' });
            }

            // Фільтруємо ті, що працюють з генерацією контенту і є Gemini
            const validModels = modelsData.models.filter(m => 
                m.supportedGenerationMethods && 
                m.supportedGenerationMethods.includes("generateContent") && 
                m.name.includes("gemini")
            );

            // Автоматично беремо найшвидшу (flash) або першу робочу
            const targetModel = validModels.find(m => m.name.includes("flash")) || validModels[0];
            
            if (!targetModel) {
                return res.status(500).json({ error: 'No compatible Gemini models found for this key.' });
            }

            // Виводимо в термінал, яку модель Google зараз реально дозволяє юзати
            console.log(`[ORACLE] Гугл здався. Використовуємо живу модель: ${targetModel.name}`);

            const prompt = `You are a professional and concise art curator. You are STRICTLY FORBIDDEN to use introductory words, greetings, or goodbyes. Output the result EXCLUSIVELY in JSON format with three fields:
            {
              "vibe": "Mood and aesthetics of the artwork (2-3 sentences)",
              "core": "What works perfectly in terms of composition, colors, or technique (2-3 sentences)",
              "spark": "Constructive advice on what could be added, changed, or improved (2-3 sentences)"
            }
            Write in English. Respond ONLY with valid JSON.`;

            // ====================================================================
            // КРОК 2: ВІДПРАВЛЯЄМО ЗАПИТ НА ЗНАЙДЕНУ МОДЕЛЬ
            // ====================================================================
            const url = `https://generativelanguage.googleapis.com/v1beta/${targetModel.name}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: "image/jpeg",
                                    data: base64Image
                                }
                            }
                        ]
                    }],
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                    ]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("RAW GOOGLE ERROR:", data);
                return res.status(500).json({ error: `Google API Error: ${data.error?.message || 'Unknown error'}` });
            }

            let text = data.candidates[0].content.parts[0].text;
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();

            res.json(JSON.parse(text));

        } catch (error) {
            console.error("Критична помилка Оракула:", error);
            res.status(500).json({ error: 'The Oracle is currently silent. Try again later.' });
        }
    }
}

module.exports = new AIController();
# OpenRouter Modelle für Automatisierte Tests (Max. 5$/M Output Tokens)

Diese erweiterte Liste dient als Ausgangslage für automatisierte Tests und wurde anhand des Kostenlimits von 5 USD pro 1 Million Output-Tokens ausgewählt. Modelle, die aufgrund von OpenRouter-Upstream-Fehlern, strikten JSON-Schema-Inkompatibilitäten (502/400) oder hartnäckigen Format-Fehlern chronisch abstürzten, wurden nach ausführlichen Tests (`LLMAutomated.test.ts`) entfernt. 

Übrig bleiben 29 verifizierte Modelle (inkl. "Thinker"-Modelle, die mehr Zeit benötigen, und Rate-Limit-kandidaten bei Free-Tiers).

| Model ID | Name | Preis ($/M Output) |
| :--- | :--- | :--- |
| `meta-llama/llama-3.3-70b-instruct:free` | Meta: Llama 3.3 70B Instruct (free) | 0.00 |
| `qwen/qwen3-coder:free` | Qwen: Qwen3 Coder 480B A35B (free) | 0.00 |
| `google/gemma-4-31b-it:free` | Google: Gemma 4 31B (free) | 0.00 |
| `nousresearch/hermes-3-llama-3.1-405b:free` | Nous: Hermes 3 405B Instruct (free) | 0.00 |
| `qwen/qwen3-next-80b-a3b-instruct:free` | Qwen: Qwen3 Next 80B A3B Instruct (free) | 0.00 |
| `deepseek/deepseek-v4-flash` | DeepSeek: DeepSeek V4 Flash | 0.15 |
| `qwen/qwen-2.5-72b-instruct` | Qwen2.5 72B Instruct | 0.40 |
| `nvidia/llama-3.3-nemotron-super-49b-v1.5` | NVIDIA: Llama 3.3 Nemotron Super 49B V1.5 | 0.40 |
| `qwen/qwen3-vl-32b-instruct` | Qwen: Qwen3 VL 32B Instruct | 0.42 |
| `tencent/hunyuan-a13b-instruct` | Tencent: Hunyuan A13B Instruct | 0.57 |
| `openai/gpt-4o-mini` | OpenAI: GPT-4o-mini | 0.60 |
| `qwen/qwen-plus` | Qwen: Qwen-Plus | 0.78 |
| `deepseek/deepseek-chat` | DeepSeek: DeepSeek V3 | 0.80 |
| `deepseek/deepseek-v4-pro` | DeepSeek: DeepSeek V4 Pro | 0.87 |
| `qwen/qwen3.5-35b-a3b` | Qwen: Qwen3.5-35B-A3B | 1.00 |
| `qwen/qwen3.7-plus` | Qwen: Qwen3.7 Plus | 1.28 |
| `aion-labs/aion-3.0-mini` | AionLabs: Aion-3.0-Mini | 1.40 |
| `mistralai/mistral-large-2512` | Mistral: Mistral Large 3 2512 | 1.50 |
| `google/gemini-3.1-flash-lite` | Google: Gemini 3.1 Flash Lite | 1.50 |
| `openai/gpt-4.1-mini` | OpenAI: GPT-4.1 Mini | 1.60 |
| `morph/morph-v3-large` | Morph: Morph V3 Large | 1.90 |
| `moonshotai/kimi-k2.5` | MoonshotAI: Kimi K2.5 | 2.02 |
| `google/gemini-2.5-flash` | Google: Gemini 2.5 Flash | 2.50 |
| `x-ai/grok-4.20` | xAI: Grok 4.20 | 2.50 |
| `deepseek/deepseek-r1` | DeepSeek: R1 | 2.50 |
| `qwen/qwen3-coder-plus` | Qwen: Qwen3 Coder Plus | 3.25 |
| `qwen/qwen3.7-max` | Qwen: Qwen3.7 Max | 3.75 |
| `qwen/qwen3-max` | Qwen: Qwen3 Max | 3.90 |
| `anthropic/claude-haiku-4.5` | Anthropic: Claude Haiku 4.5 | 5.00 |

Diese 29 verifizierten Modelle wurden in die `LLMService.ts` unter den `openrouter` Provider konfiguriert.

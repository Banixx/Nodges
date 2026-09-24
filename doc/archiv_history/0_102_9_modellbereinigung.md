# Modellbereinigung

In diesem Dokument wird die Bereinigung der OpenRouter-Modellliste in `src/utils/LLMService.ts` dokumentiert.

## Geplante Aenderungen

### 1. Entfernen von Free-Modellen
Folgende Modelle werden aus der Liste der `openrouter`-Modelle in `src/utils/LLMService.ts` entfernt:
* `meta-llama/llama-3.3-70b-instruct:free`
* `qwen/qwen3-coder:free`
* `google/gemma-4-31b-it:free`
* `nousresearch/hermes-3-llama-3.1-405b:free`
* `qwen/qwen3-next-80b-a3b-instruct:free`

### 2. Hinzufuegen neuer Modelle
Folgende Modelle werden der `openrouter`-Modellliste hinzugefuegt:
* `kwaipilot/kat-coder-pro-v2.5` (Name: "kwaipilot: Kat Coder Pro V2.5")
* `openai/gpt-5.6-luna` (Name: "OpenAI: GPT-5.6 Luna")

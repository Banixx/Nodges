# Korrektur des Standard-LLM-Modells fuer LightRAG und OpenRouter (Version 0.102.14)

## Zusammenfassung
Das Standard-LLM-Modell fuer OpenRouter und das LightRAG-Backend wurde von `openai/gpt-4o-mini` auf `morph/morph-v3-large` ("Morph: Morph V3 Large") umgestellt.

## Geänderte Dateien
- **[main.py](file:///c:/Users/ich/Desktop/code/_projects/Nodges/lightrag-backend/main.py)**: `LLM_MODEL` Fallback von `openai/gpt-4o-mini` auf `morph/morph-v3-large` korrigiert.
- **[LLMService.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LLMService.ts)**: OpenRouter Fallback-Modell in `getActiveModel` auf `morph/morph-v3-large` gesetzt.

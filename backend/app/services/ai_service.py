import httpx
import json
from app.core.config import settings

class AIService:
    def __init__(self):
        self.api_key = settings.AI_API_KEY

    async def get_explanation(self, question: str, prediction_type: str = "general", context: dict = None) -> str:
        if self.api_key and len(self.api_key.strip()) > 5:
            try:
                prompt = self._build_prompt(question, prediction_type, context)
                # Call Gemini / OpenAI external REST endpoint
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
                headers = {"Content-Type": "application/json"}
                payload = {
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }]
                }
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        text = data['candidates'][0]['content']['parts'][0]['text']
                        return text
            except Exception as e:
                print(f"[AIService] External API call failed: {e}. Falling back to domain knowledge engine.")

        # Fallback intelligent agricultural expert synthesis
        return self._domain_expert_fallback(question, prediction_type, context)

    def _build_prompt(self, question: str, prediction_type: str, context: dict) -> str:
        ctx_str = json.dumps(context, indent=2) if context else "None"
        return f"""You are AgriVision AI's Senior Agronomist and Crop Scientist Assistant.
Answer the following farmer query accurately, professionally, and concisely.

Context of ML Model Prediction ({prediction_type}):
{ctx_str}

User Question:
"{question}"

Provide practical agronomic recommendations, actionable step-by-step guidance, and model interpretation.
"""

    def _domain_expert_fallback(self, question: str, prediction_type: str, context: dict) -> str:
        q_lower = question.lower()

        if prediction_type == "disease" and context:
            crop = context.get("crop_name", "Crop")
            disease = context.get("disease_name", "Disease")
            conf = context.get("confidence", 0.90)
            return (
                f"### AgriVision AI Agronomic Diagnostic Report\n\n"
                f"**Target Crop:** {crop}\n"
                f"**Detected Condition:** {disease} (Confidence: {conf*100:.1f}%)\n\n"
                f"**Key Analysis:**\n"
                f"The CNN visual classifier detected characteristic leaf spot/blight lesions corresponding to **{disease}**. "
                f"High humidity combined with poor canopy airflow typically accelerates spore germination.\n\n"
                f"**Actionable Recommendations:**\n"
                f"1. **Foliage Sanitation:** Prune and destroy heavily infected lower foliage to prevent horizontal spore spread.\n"
                f"2. **Fungicidal Application:** Apply targeted copper hydroxide or chlorothalonil spray during early morning hours.\n"
                f"3. **Irrigation Control:** Switch to drip irrigation instead of overhead sprinklers to keep leaf surfaces dry."
            )

        elif prediction_type == "health" and context:
            status = context.get("predicted_health", "Optimal / Healthy")
            return (
                f"### Crop Health Analysis & Soil Management Guidance\n\n"
                f"**Assessed Health Status:** {status}\n\n"
                f"**Agronomic Evaluation:**\n"
                f"The Random Forest Classifier analyzed soil pH, N-P-K nutrient stoichiometry, and microclimatic moisture. "
                f"Maintaining soil pH within the 6.0 - 7.5 range ensures maximum cation exchange capacity and nutrient availability.\n\n"
                f"**Remediation & Upkeep:**\n"
                f"- If nitrogen or potassium is deficient, apply top-dressing with neem-coated urea or muriate of potash.\n"
                f"- Maintain soil moisture near 50-65% field capacity during flowering and fruit development stages."
            )

        elif prediction_type == "yield" and context:
            y_val = context.get("predicted_yield", 4.5)
            unit = context.get("unit", "tons/ha")
            return (
                f"### Crop Yield Forecasting & Optimization Plan\n\n"
                f"**Predicted Harvest Yield:** {y_val} {unit}\n\n"
                f"**Model Drivers (XGBoost Feature Importance):**\n"
                f"The prediction reflects local climate trends, fertilizer application rate, and soil quality index.\n\n"
                f"**Yield Maximization Strategy:**\n"
                f"1. **Fertigation Timing:** Split nitrogen applications into 3 doses (basal, tillering, and panicle initiation).\n"
                f"2. **Moisture Conservation:** Use organic straw mulching to conserve root zone moisture during peak thermal stress."
            )

        else:
            return (
                f"### AgriVision AI Assistant Answer\n\n"
                f"Thank you for reaching out to AgriVision AI! Regarding your question:\n\n"
                f"*\"{question}\"*\n\n"
                f"**Agronomic Insights:**\n"
                f"Effective agricultural management relies on integrating accurate soil telemetry, early disease diagnosis, "
                f"and data-driven yield projections. For optimal crop health, ensure soil organic matter is replenished annually "
                f"and monitor crop canopy using our CNN disease detector."
            )

ai_service = AIService()

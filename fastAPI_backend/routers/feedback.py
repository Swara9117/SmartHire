#for technical interview
from fastapi import APIRouter
from database.chat_history import load_messages
from services.stt_service import load_assemblyai_analysis
from services.gemini_service import gemini_model

router = APIRouter()

@router.get("/feedback")
async def get_feedback():
    messages = load_messages()
    vocal_analysis = load_assemblyai_analysis()

    # Summarize vocal analysis for the prompt
    vocal_summary = ""
    for i, analysis in enumerate(vocal_analysis, 1):
        sentiment = analysis.get('sentiment_analysis_results', [])
        confidence = analysis.get('confidence', None)
        # You can extract more features as needed
        vocal_summary += f"\nAnswer {i}: Confidence={confidence}, Sentiment={sentiment}"

    feedback_prompt = (
        "\n".join(f"{m['role']}: {m['content']}" for m in messages) +
        f"\n\nVocal analysis of the user's answers:{vocal_summary}\n"
        "Assistant: Please provide a structured interview feedback with the following sections as headings: Confidence, Tone, Sentiment, and Accuracy. For each section, give a score out of 10 and a short explanation. Format the response as:\n"
        "Confidence: <score>/10 - <explanation>\n"
        "Tone: <score>/10 - <explanation>\n"
        "Sentiment: <score>/10 - <explanation>\n"
        "Accuracy: <score>/10 - <explanation>\n"
        "give a brief overall summary.\n"
        "Also, calculate and display the total score out of 10 as the average of the four section scores. Format: Total Score: <score>/10.\n"
        "Finally, based on the scores, give a final verdict as 'PASS' if the average score is 6 or above, otherwise 'FAIL'. Format: Verdict: PASS/FAIL."
    )
    response = gemini_model.generate_content(feedback_prompt)
    return {"feedback": response.text.strip()}

@router.get("/feedback_heatmap")
async def feedback_heatmap():
    vocal_analysis = load_assemblyai_analysis()
    heatmap_data = []
    for i, analysis in enumerate(vocal_analysis, 1):
        confidence = analysis.get('confidence', None)
        sentiment = None
        sentiments = analysis.get('sentiment_analysis_results', [])
        if sentiments:
            sentiment = max(sentiments, key=lambda s: s['confidence'])['sentiment']
        heatmap_data.append({
            "answer": i,
            "confidence": confidence,
            "sentiment": sentiment
        })
    return {"heatmap": heatmap_data}


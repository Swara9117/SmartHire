import requests
import time
import pickle
import os
from pathlib import Path

assemblyai_api_key = os.getenv("ASSEMBLYAI_API_KEY")
ASSEMBLYAI_ANALYSIS_FILE = Path("assemblyai_analysis.pkl")

def analyze_audio_with_assemblyai(audio_file_path):
    headers = {'authorization': assemblyai_api_key}
    # 1. Upload audio
    with open(audio_file_path, 'rb') as f:
        upload_response = requests.post(
            'https://api.assemblyai.com/v2/upload',
            headers=headers,
            files={'file': f}
        )
    if upload_response.status_code != 200:
        raise Exception("AssemblyAI upload failed")
    audio_url = upload_response.json()['upload_url']

    # 2. Request transcription + sentiment + acoustic analysis
    json_data = {
        "audio_url": audio_url,
        "sentiment_analysis": True,
    }
    transcript_response = requests.post(
        "https://api.assemblyai.com/v2/transcript",
        json=json_data,
        headers=headers
    )
    if transcript_response.status_code != 200:
        print("AssemblyAI transcript error:", transcript_response.status_code, transcript_response.text)
        raise Exception("AssemblyAI transcript request failed")
    transcript_id = transcript_response.json()['id']

    # 3. Poll for completion
    while True:
        polling = requests.get(
            f"https://api.assemblyai.com/v2/transcript/{transcript_id}",
            headers=headers
        )
        result = polling.json()
        if result['status'] == 'completed':
            break
        elif result['status'] == 'failed':
            raise Exception("AssemblyAI transcription failed")
        time.sleep(3)

    return result

def save_assemblyai_analysis(analysis):
    if ASSEMBLYAI_ANALYSIS_FILE.exists():
        all_analysis = pickle.load(ASSEMBLYAI_ANALYSIS_FILE.open("rb"))
    else:
        all_analysis = []
    all_analysis.append(analysis)
    with ASSEMBLYAI_ANALYSIS_FILE.open("wb") as f:
        pickle.dump(all_analysis, f)

def load_assemblyai_analysis():
    if ASSEMBLYAI_ANALYSIS_FILE.exists():
        return pickle.load(ASSEMBLYAI_ANALYSIS_FILE.open("rb"))
    return []
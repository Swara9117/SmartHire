import requests
import time
import pickle
import os
import mimetypes
from pathlib import Path

assemblyai_api_key = os.getenv("ASSEMBLYAI_API_KEY")
ASSEMBLYAI_ANALYSIS_FILE = Path("assemblyai_analysis.pkl")

def analyze_audio_with_assemblyai(audio_file_path):
    headers = {'authorization': assemblyai_api_key}
    print(f"Uploading audio file to AssemblyAI: {audio_file_path}")
    content_type, _ = mimetypes.guess_type(audio_file_path)
    if not content_type:
        content_type = 'application/octet-stream'
    with open(audio_file_path, 'rb') as f:
        upload_response = requests.post(
            'https://api.assemblyai.com/v2/upload',
            headers=headers,
            files={'file': (Path(audio_file_path).name, f, content_type)}
        )
    print(f"Upload response status: {upload_response.status_code}")
    if upload_response.status_code != 200:
        print(f"Upload failed: {upload_response.text}")
        raise Exception("AssemblyAI upload failed")
    audio_url = upload_response.json()['upload_url']
    print(f"Audio uploaded. URL: {audio_url}")

    json_data = {
        "audio_url": audio_url,
        "sentiment_analysis": True
    }
    transcript_response = requests.post(
        "https://api.assemblyai.com/v2/transcript",
        json=json_data,
        headers=headers
    )
    print(f"Transcript response status: {transcript_response.status_code}")
    if transcript_response.status_code != 200:
        print("AssemblyAI transcript error:", transcript_response.status_code, transcript_response.text)
        raise Exception("AssemblyAI transcript request failed")
    transcript_id = transcript_response.json()['id']
    print(f"Transcript ID: {transcript_id}")

    while True:
        print(f"Polling transcript status for ID: {transcript_id}")
        polling = requests.get(
            f"https://api.assemblyai.com/v2/transcript/{transcript_id}",
            headers=headers
        )
        result = polling.json()
        print(f"Polling result: {result}")
        if result['status'] == 'completed':
            print("Transcription completed.")
            break
        elif result['status'] == 'failed':
            print("Transcription failed.")
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
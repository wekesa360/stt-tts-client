import speech_recognition as sr
from io import BytesIO

def speech_to_text(audio_content: bytes) -> str:
    recognizer = sr.Recognizer()
    
    with sr.AudioFile(BytesIO(audio_content)) as source:
        audio = recognizer.record(source)

    try:
        text = recognizer.recognize_google(audio)
        return text
    except sr.UnknownValueError:
        return "Speech recognition could not understand the audio"
    except sr.RequestError as e:
        return f"Could not request results from speech recognition service; {e}"

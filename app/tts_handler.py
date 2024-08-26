import pyttsx3
import io
import base64

def text_to_speech(text: str) -> str:
    engine = pyttsx3.init()
    
    # Save the speech to a byte stream
    output = io.BytesIO()
    engine.save_to_file(text, output)
    engine.runAndWait()
    
    # Get the byte stream content and encode it to base64
    audio_content = output.getvalue()
    base64_audio = base64.b64encode(audio_content).decode('utf-8')
    
    return base64_audio
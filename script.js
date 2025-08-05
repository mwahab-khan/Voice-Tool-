// === VOICE GENERATOR JAVASCRIPT ===

// DOM Elements
const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const playButton = document.getElementById('playButton');
const downloadButton = document.getElementById('downloadButton');
const statusMessage = document.getElementById('statusMessage');
const audioPlayer = document.getElementById('audioPlayer');

// ElevenLabs API Key (The provided key is used as requested)
// Note: This key is publicly exposed and should be handled with care.
// For a production application, use a backend server to hide your API key.
const apiKey = 'sk_3df14090020fb58c645580a163f08ab279a719c656d9d268';

// ElevenLabs API Endpoint
const ttsEndpoint = 'https://api.elevenlabs.io/v1/text-to-speech/';

// Mapping human-readable names to ElevenLabs Voice IDs
// The eleven_multilingual_v2 model can handle multiple languages with a single voice.
// We select voices with a male/female persona.
const voiceMap = {
    'English Male': 'pNInz6obpgDQGcFyl2A0',  // Adam
    'English Female': 'EXAVITQu4vr4xnSDxMaL', // Bella
    'Urdu Male': 'pNInz6obpgDQGcFyl2A0',     // Adam (Multilingual)
    'Urdu Female': 'EXAVITQu4vr4xnSDxMaL',   // Bella (Multilingual)
    'Hindi Male': 'pNInz6obpgDQGcFyl2A0',    // Adam (Multilingual)
    'Hindi Female': 'EXAVITQu4vr4xnSDxMaL',  // Bella (Multilingual)
    'Spanish Male': 'pNInz6obpgDQGcFyl2A0',  // Adam (Multilingual)
    'Spanish Female': 'EXAVITQu4vr4xnSDxMaL' // Bella (Multilingual)
};

// Event Listeners
playButton.addEventListener('click', generateAndPlayVoice);
downloadButton.addEventListener('click', downloadVoice);

// --- Functions ---

/**
 * Disables/enables buttons and shows a loading/status message.
 * @param {boolean} isLoading - true to show loading state, false otherwise.
 * @param {string} message - The message to display.
 * @param {string} statusType - 'info', 'success', or 'error' for styling.
 */
function setUIState(isLoading, message = '', statusType = 'info') {
    playButton.disabled = isLoading;
    downloadButton.disabled = isLoading;

    if (isLoading) {
        statusMessage.textContent = 'Generating voice... Please wait.';
        statusMessage.className = 'status-message'; // Clear previous status
        audioPlayer.removeAttribute('src');
    } else {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${statusType}`;
    }
}

/**
 * Handles the entire text-to-speech process.
 * Fetches audio from ElevenLabs and plays it.
 */
async function generateAndPlayVoice() {
    const userInput = textInput.value.trim();
    if (!userInput) {
        setUIState(false, 'Please enter some text.', 'error');
        return;
    }
    
    setUIState(true);

    // Construct the full text with the required greeting
    const fullText = "Welcome to the Ultimate World of Azan. " + userInput;
    
    const selectedVoice = voiceSelect.value;
    const voiceId = voiceMap[selectedVoice];

    try {
        const response = await fetch(ttsEndpoint + voiceId, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text: fullText,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `API Error: ${response.status} ${response.statusText}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        audioPlayer.src = audioUrl;
        audioPlayer.play();

        // Store the audio URL for the download function
        downloadButton.dataset.audioUrl = audioUrl;
        downloadButton.disabled = false;
        
        setUIState(false, 'Voice generated successfully!', 'success');

    } catch (error) {
        console.error('Error generating voice:', error);
        setUIState(false, `Error: ${error.message}`, 'error');
        downloadButton.disabled = true; // Disable download on error
    }
}

/**
 * Handles downloading the generated voice as an MP3 file.
 */
function downloadVoice() {
    const audioUrl = downloadButton.dataset.audioUrl;
    if (audioUrl) {
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = 'Azan_World_Voice.mp3';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        setUIState(false, 'No voice available to download.', 'error');
    }
          }

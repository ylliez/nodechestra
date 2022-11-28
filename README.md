# Nodechestra - Prototype
## Instructions
1. Download [prototype folder](https://github.com/ylliez/CART451/tree/main/project/prototype) from GitHub
2. Download [Max/MSP application](https://cycling74.com/downloads) (no need for subscription)
3. Open `n4m_synth.maxpat` file
4. Start Node script
5. Turn on DAC
6. Launch webpage
7. Play around with controls (if necessary, adjust gain on patch)

## UI
### Inspo
- [Virtual Synth](https://virtual-synth.netlify.app/)/[GH](https://github.com/gauthammk/Virtual-Synth)
- [Web Audio API synth](https://www.dabbmedia.com/web-audio/synth/)/[GH](https://github.com/dabbmedia/web-audio-synth)


## Components
- Waveform    hands     panning between waveforms       Rx continuous / Lx discrete         OK
- Delay       hands     delay parameters                Ry amt / Lx time                    OK
- Noise       hands     noise parameters                Ry amt / Lx colour                  OK
- Reverb      pose      reverb parameters          Lsh amt / Lin dec / Rin dam / Rsh diff   OK


## Resources
### ML
[MediaPipe](https://google.github.io/mediapipe/)
[Hands](https://google.github.io/mediapipe/solutions/hands)
[Face mesh landmarks](https://mediapipe.dev/images/mobile/hand_landmarks.png)
[Hands Codepen](https://codepen.io/mediapipe/pen/RwGWYJw)

[Face Mesh](https://google.github.io/mediapipe/solutions/face_mesh)
[Face mesh landmarks](https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png)

[Pose](https://google.github.io/mediapipe/solutions/pose)
[Pose landmarks](https://mediapipe.dev/images/mobile/pose_tracking_full_body_landmarks.png)
[Pose Codepen](https://codepen.io/mediapipe/pen/jOMbvxw)

### sound
[MIDI notes & frequencies](https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies)

[vocal range](https://www.wikidoc.org/index.php/Vocal_range)
Soprano: C4 - C6
Mezzo-Soprano: A3 - A5
Contralto: E3 - E5
Tenor: C3 - C5
Baritone: G2 - G4
Bass: E2 - E4

### Other
- [CSS toggle switch](https://www.w3schools.com/howto/howto_css_switch.asp) --> irrelevant


## Issues
- function distribution --> OK : resolved by socket.io implementation
- disconnect crash --> OK : resolved by socket.io implementation
- s2c GUI value change --> NO : irrelevant due to compartmentalization
- s2c audio feed --> NO : AFAIK not possible
- ML control --> OK : in process of implementation/debugging
- Data control? --> TBD
- Actual client network access --> TBD (Heroku deployment of GitHub repo)

- routing : express routes &&/|| socket.io namespaces
- namespaces vs. rooms
- attributing/serving pages
- procedurally generating HTML/JS pages : [EJS](https://ejs.co/)? React/Vue?
    - Vue & IO:
        - https://www.npmjs.com/package/vue-socket.io
        - https://deepinder.me/creating-a-real-time-chat-app-with-vue-socket-io-and-nodejs
        - https://blog.openreplay.com/rendering-real-time-data-with-vue-node-and-socket-io
    - React & IO:
        - https://www.freecodecamp.org/news/build-a-realtime-chat-app-with-react-express-socketio-and-harperdb/


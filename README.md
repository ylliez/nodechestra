# Nodechestra
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


## Parameters

| parameter | function | detail | tool | implemented |
| - | - | - | - | - |
| Waveform  |  waveform panning |      Rx continuous / Lx discrete       |  hands   |  OK
| Delay     | delay parameters          |      Ry amt / Lx time                  |  hands   |  OK
| Noise     | noise parameters          |      Ry amt / Lx colour                |  hands   |  OK
| Reverb    | reverb parameters         | Lsh amt / Lin dec / Rin dam / Rsh diff |  pose    |  OK


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

[vocal ranges](https://www.wikidoc.org/index.php/Vocal_range)
Operatic:
Soprano: C4-C6
Mezzo-Soprano: A3-A5
Contralto: E3-E5
Tenor: C3-C5
Baritone: G2-G4
Bass: E2-E4

Choral:
Soprano: C4-A5
Mezzo-Soprano: A3-F5
Contralto: F3-D5
Tenor: B2-G4
Baritone: G2-E4
Bass/Basso: E2-C4

### Other
- [CSS toggle switch](https://www.w3schools.com/howto/howto_css_switch.asp) --> irrelevant
- [favicon](https://icon-icons.com/icon/perfect-circle/53928)

## Deployment
### Heroku
- Heroku set-up, tie repo & deploy --> NO : crash, issue with package.json start script ==> change to server script
- retest (& try in VSC terminal) -> NO : crash; issue w/ max-api usage --> try [max-api-or-not](https://github.com/dimitriaatos/max-api-or-not)
- retest --> NO : crash, "Web process failed to bind to $PORT within 60 seconds of launch" ; just too slow
- retest --> NO : still slow error despite build "succeeded" & "deploy" awa attempt to open app & access local host...
- retest --> NO : still crash -->

- 12/02: Deployed but H14 (no web processes running) --> subscribe to Eco Dynos & scale project dynos to 1 (https://devcenter.heroku.com/articles/scaling)

#### info
[error codes](https://devcenter.heroku.com/articles/error-codes)
[dynos](https://devcenter.heroku.com/articles/dynos)


## Issues
- [x] function distribution --> OK : resolved by socket.io implementation
- disconnect crash --> OK : resolved by socket.io implementation
- s2c GUI value change --> NO : irrelevant due to compartmentalization
- s2c audio feed --> NO : AFAIK not possible
- ML control --> OK : in process of implementation/debugging
- Data control? --> TBD
- Actual client network access --> TBD (Heroku deployment of GitHub repo) ==> CSC

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

- clamp values? ([link1](https://www.webtips.dev/webtips/javascript/how-to-clamp-numbers-in-javascript), [link2](https://stackoverflow.com/questions/11409895/whats-the-most-elegant-way-to-cap-a-number-to-a-segment))
- draw UI elements of MediaPipe 
    - lips: https://github.com/google/mediapipe/issues/2040

Node modules on 
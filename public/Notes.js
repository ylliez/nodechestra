class Notes {
    constructor(startNote, endNote) {
        let notes = ["C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2", "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3", "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5", "C6"]
        this.noteArray = []
        this.midiArray = []
        let startRange = notes.indexOf(startNote)
        let endRange = notes.indexOf(endNote);
        for (let i = startRange; i <= endRange; i++) {
            this.midiArray.push(i + 36);
            this.noteArray.push(notes[i])
        }
        this.numberNotes = this.midiArray.length
        this.startNote = this.midiArray[0]
    }
}
// console.log(midiArray)
// console.log(noteArray)
// console.log(numberNotes)
// console.log(startRange)
// console.log(startNote)
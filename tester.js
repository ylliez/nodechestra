// let midiArray = [47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67];
// let numberNotes = midiArray.length // 25
// let startNote = midiArray[0] // 48
// console.log(numberNotes)
// console.log(startNote)

// const fs = require('fs');
// ntoes = fs.readFileSync('public/notes.json', 'utf8');

// notesJSON = JSON.parse(ntoes)
// console.log(notesJSON)
// console.log(notesJSON[4])
// console.log(notesJSON.indexOf("E2"))

let notes = new Notes("G2", "E4");
console.log(notes.midiArray)
console.log(notes.noteArray)
console.log(notes.numberNotes)
console.log(notes.startRange)
console.log(notes.startNote)


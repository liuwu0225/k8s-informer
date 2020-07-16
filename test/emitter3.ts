import EventEmitter from "eventemitter3";

const EE = new EventEmitter(),
  context = { foo: "bar" };

function emitted() {
  console.log(this === context); // true
}

EE.once("event-name", emitted, context);
EE.on("another-event", emitted, context);
EE.removeListener("another-event", emitted, context);

console.log("==========first time=========");
EE.emit("event-name");
console.log("==========second time=========");
EE.emit("event-name");

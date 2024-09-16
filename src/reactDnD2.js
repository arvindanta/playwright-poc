//const a = document.querySelector(".column").children[0]
//const b = document.querySelector(".fv-reportgroup-root")
// const a = arguments[0];

function createEvent(typeOfEvent) {
  var event = document.createEvent("CustomEvent");
  event.initCustomEvent(typeOfEvent, true, true, null);
  event.dataTransfer = {
    data: {},
    setData: function (key, value) {
      this.data[key] = value;
    },
    getData: function (key) {
      return this.data[key];
    },
  };
  return event;
}
function dispatchEvent(element, event, transferData, clientX, clientY) {
  if (transferData !== undefined) {
    event.dataTransfer = transferData;
  }
  if (clientX !== undefined) {
    event.clientX = clientX;
  }
  if (clientY !== undefined) {
    event.clientY = clientY;
  }
  if (element.dispatchEvent) {
    element.dispatchEvent(event);
  } else if (element.fireEvent) {
    element.fireEvent("on" + event.type, event);
  }
}
function simulateHTML5DragAndDrop(a) {
  if (a === "") {
    element = document.querySelector(".column").children[0];
  } else {
    element = [...document.querySelectorAll("h3")]
      .filter((e) => e.innerText.trim() === a)[0]
      .closest("div[draggable]");
  }

  target = document.querySelector(".fv-reportgroup-root");

  console.log(element);
  console.log(target);
  const x = Math.floor(Math.random() * 1001);
  var dragStartEvent = createEvent("dragstart");
  dispatchEvent(element, dragStartEvent, undefined, x, 50);

  var dragOver = createEvent("dragover");
  dispatchEvent(target, dragOver, dragStartEvent.dataTransfer, x, 50);
  var dropEvent = createEvent("drop");
  dispatchEvent(target, dropEvent, dragStartEvent.dataTransfer, x, 50);
  var dragEndEvent = createEvent("dragend");
  dispatchEvent(element, dragEndEvent, dropEvent.dataTransfer, x, 50);
}

window.simulateHTML5DragAndDrop = simulateHTML5DragAndDrop;

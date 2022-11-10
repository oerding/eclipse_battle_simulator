/* draggable element */
const items = document.querySelectorAll(".grid-item");

items.forEach(() => addEventListener("dragstart", dragStart));

let count = 0;
let id = 0;
function dragStart(e) {
  id = copy_item(e.target);
  e.dataTransfer.setData("text/plain", id);
}

// erstelle eine Kopie des objekt das gedraggt Wird.
// diese copy bekommt eine forlaufende id "count".
// die kopie wird in div copy als unsichtbar gespeichert.
const copy_item = function (item) {
  count++;
  const element = document.createElement("img");
  element.id = `${count}`;
  element.src = `${item.src}`;
  element.alt = `${item.id}`;
  element.classList = `${item.classList} invisible`;
  document.getElementById("copy").appendChild(element);
  return count;
};

/* drop targets */
const boxes = document.querySelectorAll(".ship-part");

boxes.forEach((box) => {
  box.addEventListener("dragenter", dragEnter);
  box.addEventListener("dragover", dragOver);
  box.addEventListener("dragleave", dragLeave);
  box.addEventListener("drop", drop);
});

function dragEnter(e) {
  e.preventDefault();
  e.target.classList.add("drag-over");
}

function dragOver(e) {
  e.preventDefault();
  e.target.classList.add("drag-over");
}

function dragLeave(e) {
  e.target.classList.remove("drag-over");
}

// the helper is needed so that in the case that there is already an component in the place where a new comonent is dropped, then die alte kann erst gelöscht werden und dann durch die neue ersetzt werden.
function drop(e) {
  if (e.target.src) {
    console.log("target", e.target);
    console.log("e.target.id", e.target.id);
    console.log("e.target.parentNode", e.target.parentNode);
    const target = e.target.parentNode;
    e.target.parentNode.removeChild(document.getElementById(`${e.target.id}`));
    console.log("after");
    drop_helper(target, e);
  } else {
    drop_helper(e.target, e);
  }
}

const drop_helper = function (target, e) {
  target.classList.remove("drag-over");
  document.getElementById(`${count}`).classList.remove("invisible");

  // get the draggable element
  const id = e.dataTransfer.getData("text/plain");
  const draggable = document.getElementById(id);

  // add it to the drop target
  target.appendChild(draggable);

  // remove the box where it was dragged to get rid of the border
  target.style.setProperty("border", "none");
};

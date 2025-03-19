"use strict";

const textInput = document.querySelector(".text-input");
const addTextBtn = document.querySelector(".btn");
const textDisplay = document.querySelector(".text-display");

let selectedChars = [];
let isSelecting = false;
let selectionBox = null;
let startX, startY;

addTextBtn.addEventListener("click", function () {
  addTextToDisplay(textInput.value);
  textInput.value = "";
});

textInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTextBtn.click();
  }
});

// Function to add text to the display area
function addTextToDisplay(text) {
  const textLine = document.createElement("div");

  for (let i = 0; i < text.length; i++) {
    const charSpan = document.createElement("span");
    charSpan.className = "char";
    charSpan.textContent = text[i];
    charSpan.draggable = true;
    charSpan.dataset.index = i;

    // Add event listeners for character selection
    charSpan.addEventListener("mousedown", handleCharMouseDown);
    charSpan.addEventListener("dragstart", handleDragStart);
    charSpan.addEventListener("dragover", handleDragOver);
    charSpan.addEventListener("drop", handleDrop);

    textLine.appendChild(charSpan);
  }

  textDisplay.appendChild(textLine);
}

function handleCharMouseDown(e) {
  if (e.ctrlKey) {
    toggleCharSelection(this);
    e.preventDefault();
  } else {
    const isAlreadySelected = selectedChars.indexOf(this) !== -1;

    if (!isAlreadySelected) {
      clearSelection();
      selectChar(this);
    }
  }
}

// Selection rectangle functionality
textDisplay.addEventListener("mousedown", function (e) {
  if (e.target === textDisplay) {
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;

    selectionBox = document.createElement("div");
    selectionBox.className = "selection-box";
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    document.body.appendChild(selectionBox);

    e.preventDefault();
  }
});

document.addEventListener("mousemove", function (e) {
  if (isSelecting && selectionBox) {
    const width = e.clientX - startX;
    const height = e.clientY - startY;

    selectionBox.style.width = `${Math.abs(width)}px`;
    selectionBox.style.height = `${Math.abs(height)}px`;
    selectionBox.style.left = `${width > 0 ? startX : e.clientX}px`;
    selectionBox.style.top = `${height > 0 ? startY : e.clientY}px`;

    updateSelectionFromBox();
  }
});

document.addEventListener("mouseup", function () {
  // End selection
  if (isSelecting && selectionBox) {
    document.body.removeChild(selectionBox);
    selectionBox = null;
    isSelecting = false;
  }
});

// Select characters inside the selection box
const updateSelectionFromBox = () => {
  if (!selectionBox) return;

  const boxRect = selectionBox.getBoundingClientRect();
  const chars = textDisplay.querySelectorAll(".char");

  clearSelection();

  chars.forEach((char) => {
    const charRect = char.getBoundingClientRect();

    if (
      !(
        charRect.right < boxRect.left ||
        charRect.left > boxRect.right ||
        charRect.bottom < boxRect.top ||
        charRect.top > boxRect.bottom
      )
    ) {
      selectChar(char);
    }
  });
};

const toggleCharSelection = (char) => {
  const index = selectedChars.indexOf(char);
  if (index === -1) {
    selectChar(char);
  } else {
    unselectChar(char);
  }
};

const selectChar = (char) => {
  char.classList.add("selected");
  selectedChars.push(char);
};

function unselectChar(char) {
  char.classList.remove("selected");
  const index = selectedChars.indexOf(char);
  if (index !== -1) {
    selectedChars.splice(index, 1);
  }
}

const clearSelection = () => {
  selectedChars.forEach((char) => {
    char.classList.remove("selected");
  });
  selectedChars = [];
};

function handleDragStart(e) {
  // Create a visual drag image
  const dragImg = document.createElement("div");
  dragImg.className = "drag-preview";

  // Get the actual text content of selected characters
  const dragText = selectedChars.map((char) => char.textContent).join("");

  // Set the drag text as the content of the drag image
  dragImg.textContent = dragText;

  // Add to DOM temporarily for the drag image
  document.body.appendChild(dragImg);
  e.dataTransfer.setDragImage(dragImg, 10, 10);

  setTimeout(() => {
    document.body.removeChild(dragImg);
  }, 0);

  if (selectedChars.indexOf(this) === -1) {
    clearSelection();
    selectChar(this);
  }

  // Set the actual text content as the drag data
  e.dataTransfer.setData("text/plain", dragText);
  e.dataTransfer.effectAllowed = "move";
}

const handleDragOver = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
};

function handleDrop(e) {
  e.preventDefault();

  const dropTarget = this;

  if (selectedChars.indexOf(dropTarget) !== -1) {
    return;
  }

  const line = dropTarget.parentNode;
  const allChars = Array.from(line.children);
  const insertionIndex = allChars.indexOf(dropTarget);
  const newOrder = [...allChars];

  selectedChars.forEach((char) => {
    const index = newOrder.indexOf(char);
    if (index !== -1) {
      newOrder.splice(index, 1);
    }
  });

  newOrder.splice(insertionIndex, 0, ...selectedChars);

  newOrder.forEach((char, i) => {
    char.dataset.index = i;
    line.appendChild(char);
  });
}

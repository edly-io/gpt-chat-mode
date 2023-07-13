const textarea = document.getElementById("student-message");

textarea.addEventListener("input", () => {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
});

function addChatMessage(sender, content, senderClass) {
  var newMessageDiv = document.getElementById("new-message-container");

  var chatMessageDiv = document.createElement("div");
  chatMessageDiv.classList.add("chat-message");

  var strongElement = document.createElement("strong");
  strongElement.textContent = sender;

  var spanElement = document.createElement("span");
  spanElement.classList.add(senderClass);
  spanElement.textContent = content;

  chatMessageDiv.appendChild(strongElement);
  chatMessageDiv.appendChild(spanElement);

  newMessageDiv.appendChild(chatMessageDiv);
}

function addUserMessage(content) {
  addChatMessage("USER", content, "user-message");
}

function addGPTMessage(content) {
  addChatMessage("ASSISTANT", content, "gpt-message");
}

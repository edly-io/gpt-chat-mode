function GPTChatModeXBlock(runtime, element) {
  var chatContainer = document.querySelector(".chat-container");
  var inputContainer = document.querySelector(".input-container");
  const waitingIndicator = $(".lds-ellipsis");
  const errorMessage = $("#error-message", element);
  const errorContainer = $(".error-container", element);
  const submitMessageButton = $(".submit-message", element);
  const studentMessage = $("#student-message", element);

  var messageToGpt = runtime.handlerUrl(element, "message_to_gpt");

  function enableStudentView() {
    chatContainer.style.width = "75%";
    chatContainer.style.margin = "0 auto";
    inputContainer.style.backgroundColor = "#f5f5f5";
  }

  function showGPTAnswer(result) {
    if (result.hasOwnProperty("error")) {
      errorContainer.show();
      errorMessage.text(result.error);
    }

    addGPTMessage(result.gpt_message);
    if (result.success) {
      waitingIndicator.css("display", "none");
      submitMessageButton.show();
    }
    studentMessage.val("");
    studentMessage.attr("placeholder", "Type your message...");
  }

  submitMessageButton.click(function (eventObject) {
    console.log("hereeeee");
    if (studentMessage.val()) {
      addUserMessage(studentMessage.val());

      const userMessage = studentMessage.val();

      studentMessage.val("");
      studentMessage.attr(
        "placeholder",
        "Waiting for response from the server..."
      );
      studentMessage.css("height", "16px");
      submitMessageButton.hide();
      errorContainer.hide();
      waitingIndicator.css("display", "inline-block");

      $.ajax({
        type: "POST",
        url: messageToGpt,
        data: JSON.stringify({ user_message: userMessage }),
        success: showGPTAnswer,
      });
    }
  });

  $(function ($) {
    /* Here's where you'd do things on page load. */
    enableStudentView();
  });
}

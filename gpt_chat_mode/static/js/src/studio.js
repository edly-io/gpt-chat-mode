function GPTChatModeStudioXBlock(runtime, element) {
  const errorMessage = $("#error-message", element);
  const systemContainer = $(".system-container", element);
  const parametersContainer = $(".parameters-container", element);
  const submitMessageButton = $(".submit-message", element);
  const waitingIndicator = $(".lds-ellipsis");
  const errorContainer = $(".error-container", element);
  const studentMessage = $("#student-message", element);

  var setParameters = runtime.handlerUrl(element, "set_parameters");
  var messageToGpt = runtime.handlerUrl(element, "message_to_gpt");
  var getParameters = runtime.handlerUrl(element, "get_parameters");

  const inputTitle = document.getElementById("input-title");
  const title = document.getElementById("title");
  const systemMessage = document.getElementById("system");
  const apiKey = document.getElementById("api-key");
  const dropdownToggle = document.querySelector(".dropdown-toggle");
  const dropdownContent = document.querySelector(".dropdown-content");

  const sliders = [
    { id: "temperature", inputId: "temperatureValue" },
    { id: "maxLength", inputId: "maxLengthValue" },
    { id: "topP", inputId: "topPValue" },
    { id: "frequencyPenalty", inputId: "frequencyPenaltyValue" },
    { id: "presencePenalty", inputId: "presencePenaltyValue" },
  ];

  function enableStaffView() {
    systemContainer.show();
    parametersContainer.show();
    studentMessage.attr(
      "placeholder",
      "Write a message to set the direction of chat"
    );
  }

  function setNewParameter(parameter) {
    $.ajax({
      type: "POST",
      url: setParameters,
      data: JSON.stringify(parameter),
    });
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
    studentMessage.attr(
      "placeholder",
      "Write a message to set the direction of chat"
    );
  }

  function updateParameters() {
    $.ajax({
      type: "POST",
      url: getParameters,
      data: JSON.stringify({}),
      success: (parameters) => {
        console.log("pakora meters ", parameters);
        setSliderValues(parameters.sliders);
        selectDropdownValue(parameters.model);

        title.textContent = parameters.title;
        

      },
    });
  }

  submitMessageButton.click(function (eventObject) {
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

  systemMessage.addEventListener("blur", (event) => {
    setNewParameter({ system: event.target.value });
  });

  apiKey.addEventListener("blur", (event) => {
    setNewParameter({ api_key: event.target.value });
  });

  inputTitle.addEventListener("blur", (event) => {
    title.textContent = event.target.value;
    setNewParameter({ title: event.target.value });
  });

  function handleSliderInputChange(sliderEl, value) {
    const parsedValue =
      Math.max(Math.min(Number(value), sliderEl.max), sliderEl.min) ||
      sliderEl.min;

    sliderEl.value = parsedValue;
    const progress =
      ((value - sliderEl.min) / (sliderEl.max - sliderEl.min)) * 100;
    sliderEl.style.background = `linear-gradient(to right, #808080 ${progress}%, #ccc ${progress}%)`;
  }

  sliders.forEach(({ id, inputId }) => {
    const sliderEl = document.getElementById(id);
    const inputEl = document.getElementById(inputId);

    sliderEl?.addEventListener("input", (event) => {
      handleSliderInputChange(sliderEl, event.target.value);
    });

    inputEl?.addEventListener("input", (event) => {
      handleSliderInputChange(sliderEl, event.target.value);
    });

    sliderEl.addEventListener("blur", (event) => {
      const { id } = sliderEl;
      setNewParameter({ [id]: Number(event.target.value) });
    });
  });

  function setSliderValues(sliderValues) {
    for (const [sliderId, value] of Object.entries(sliderValues)) {
      const sliderEl = document.getElementById(sliderId);
      const inputEl = document.getElementById(`${sliderId}Value`);

      inputEl.value = value;

      if (sliderEl) {
        handleSliderInputChange(sliderEl, value);
      }
    }
  }

  dropdownContent.querySelectorAll("a").forEach((item) => {
    item.addEventListener("click", () => {
      const selectedValue = item.textContent;

      dropdownToggle.textContent = selectedValue;

      dropdownContent.querySelectorAll("a").forEach((item) => {
        item.classList.remove("active");
      });
      item.classList.add("active");
      setNewParameter({ model_name: item.textContent });
    });
  });

  function selectDropdownValue(value) {
    dropdownToggle.textContent = value;

    dropdownContent.querySelectorAll("a").forEach((item) => {
      if (item.textContent === value) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  document.addEventListener("click", (event) => {
    const isClickInsideDropdown = dropdownToggle.contains(event.target);
    if (!isClickInsideDropdown) {
      console.log("herher");
      dropdownContent.style.display = "none";
    }
  });

  dropdownToggle.addEventListener("click", () => {
    console.log("here");
    dropdownContent.style.display = "block";
  });

  $(function ($) {
    /* Here's where you'd do things on page load. */
    updateParameters();
    enableStaffView();
  });
}

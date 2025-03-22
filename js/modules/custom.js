export default function custom() {
  const cardNumberInput = document.getElementById("card_number");
  const cardHolderInput = document.getElementById("card_holder");
  const cardMonthSelect = document.getElementById("card__form--select");
  const cardYearSelect = document.getElementById("card_year");
  const cardCvvInput = document.getElementById("card_cvv");

  const cardNumberPreview = document.querySelector(".card__preview--number");
  const cardPreview = document.querySelector(".card__preview");
  const staticNumber = document.querySelector(".card__preview--number-static");
  const animatedNumber = document.querySelector(
    ".card__preview--number-animated"
  );

  const visaLogo = document.querySelector(".card__preview--logo-visa");
  const mastercardLogo = document.querySelector(
    ".card__preview--logo-mastercard"
  );
  const backVisaLogo = document.querySelector(".back-visa-logo");
  const backMastercardLogo = document.querySelector(".back-mastercard-logo");
  const cvvStrip = document.querySelector(".cvv-strip");
  const focusFrame = document.querySelector(".focus-frame");

  let lastCardNumberLength = 0;
  let lastRemovedDigit = "";
  let previousCardNumber = "";
  let previousCardHolder = "";

  backVisaLogo.style.opacity = "1";
  backMastercardLogo.style.opacity = "0";

  function updateCardNumber(element, newText) {
    const defaultFormat = "#### #### #### ####";

    if (!newText) {
      staticNumber.textContent = defaultFormat;
      animatedNumber.textContent = defaultFormat;
      lastCardNumberLength = 0;
      return;
    }

    let formattedNumber = "";
    let digitIndex = 0;
    const digits = newText.replace(/\s/g, "");

    for (let i = 0; i < defaultFormat.length; i++) {
      if (defaultFormat[i] === " ") {
        formattedNumber += " ";
      } else if (digitIndex < digits.length) {
        formattedNumber += digits[digitIndex++];
      } else {
        formattedNumber += "#";
      }
    }

    staticNumber.textContent = formattedNumber;

    const isDigitAdded = digits.length > lastCardNumberLength;
    const isDigitRemoved = digits.length < lastCardNumberLength;

    const changedDigitIndex = isDigitAdded
      ? digits.length - 1
      : lastCardNumberLength - 1;

    if (isDigitAdded || isDigitRemoved) {
      let charIndex = 0;
      let html = "";
      for (let i = 0; i < formattedNumber.length; i++) {
        if (formattedNumber[i] === " ") {
          html += " ";
          continue;
        }

        if (charIndex === changedDigitIndex) {
          if (isDigitAdded) {
            html += `<span style="position:relative;">`;
            html += `<span class="animate-hash">#</span>`;
            html += `<span class="animate-char">${formattedNumber[i]}</span>`;
            html += `</span>`;
          } else if (isDigitRemoved) {
            html += `<span style="position:relative;">`;
            html += `<span class="animate-char-remove">${
              formattedNumber[i] === "#"
                ? lastRemovedDigit || "0"
                : formattedNumber[i]
            }</span>`;
            html += `<span class="animate-hash-add">#</span>`;
            html += `</span>`;
          }
        } else {
          html += formattedNumber[i];
        }

        if (formattedNumber[i] !== " ") {
          charIndex++;
        }
      }

      animatedNumber.innerHTML = html;

      element.classList.add("animating");
      setTimeout(() => {
        element.classList.remove("animating");
        animatedNumber.innerHTML = formattedNumber;
      }, 500);
    }

    lastCardNumberLength = digits.length;
  }

  function animateExpiryValue(container, oldValue, newValue, className) {
    const containerHeight = container.offsetHeight;
    container.style.height = containerHeight + "px";

    container.querySelector(`.current-${className}`).remove();

    const oldElement = document.createElement("span");
    oldElement.classList.add(`${className}-old`);
    oldElement.textContent = oldValue;
    container.appendChild(oldElement);

    const newElement = document.createElement("span");
    newElement.classList.add(`${className}-new`);
    newElement.textContent = newValue;
    container.appendChild(newElement);

    setTimeout(() => {
      container.innerHTML = "";
      const currentElement = document.createElement("span");
      currentElement.classList.add(`current-${className}`);
      currentElement.textContent = newValue;
      container.appendChild(currentElement);
    }, 500);

    container.classList.add("expiry-flash");
    setTimeout(() => {
      container.classList.remove("expiry-flash");
    }, 300);
  }

  cardNumberInput.addEventListener("input", function (event) {
    let cardNumber = this.value.replace(/\s/g, "").replace(/[^0-9]/g, "");

    if (cardNumber.length < previousCardNumber.length) {
      for (let i = 0; i < previousCardNumber.length; i++) {
        if (i >= cardNumber.length || cardNumber[i] !== previousCardNumber[i]) {
          lastRemovedDigit = previousCardNumber[i];
          break;
        }
      }
    }

    previousCardNumber = cardNumber;

    if (cardNumber.length > 16) {
      cardNumber = cardNumber.slice(0, 16);
    }

    let formattedNumber = "";
    for (let i = 0; i < cardNumber.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedNumber += " ";
      }
      formattedNumber += cardNumber[i];
    }
    this.value = formattedNumber;

    updateCardNumber(cardNumberPreview, formattedNumber);

    let logoType = "visa";

    if (cardNumber.startsWith("4")) {
      logoType = "visa";
    } else if (cardNumber.startsWith("5")) {
      logoType = "mastercard";
    } else if (cardNumber.length === 0) {
      logoType = "visa";
    }

    if (logoType !== currentLogoType) {
      const fromLogo = currentLogoType === "visa" ? visaLogo : mastercardLogo;
      const toLogo = logoType === "visa" ? visaLogo : mastercardLogo;

      animateLogoChange(fromLogo, toLogo);
      currentLogoType = logoType;
    }
  });

  const cardHolderValue = document.querySelector(
    ".card__preview--holder .value"
  );
  cardHolderInput.addEventListener("input", function () {
    const segments = this.value.split(" ");
    const longestSegmentLength = segments.reduce(
      (max, segment) => Math.max(max, segment.length),
      0
    );

    let maxLength = 24;

    if (longestSegmentLength > 10) {
      maxLength = Math.max(22, 36 - longestSegmentLength);
    }

    if (this.value.length > maxLength) {
      this.value = this.value.slice(0, maxLength);
    }

    const currentValue = this.value || "AD SOYAD";

    if (currentValue.length > previousCardHolder.length) {
      const isFirstChar = currentValue.length === 1;

      let html = "";
      for (let i = 0; i < currentValue.length; i++) {
        if (i === currentValue.length - 1) {
          const animClass = isFirstChar
            ? "animate-char-holder-first"
            : "animate-char-holder-rest";
          html += `<span class="${animClass}">${currentValue[i]}</span>`;
        } else {
          html += currentValue[i];
        }
      }

      cardHolderValue.innerHTML = html;
    } else if (currentValue.length < previousCardHolder.length) {
      let removedIndex = 0;
      for (let i = 0; i < previousCardHolder.length; i++) {
        if (
          i >= currentValue.length ||
          currentValue[i] !== previousCardHolder[i]
        ) {
          removedIndex = i;
          break;
        }
      }

      const wrapperElement = document.createElement("div");
      wrapperElement.style.position = "relative";
      wrapperElement.style.display = "inline-block";

      const currentElement = document.createElement("span");
      currentElement.textContent = currentValue;
      currentElement.style.visibility = "visible";
      wrapperElement.appendChild(currentElement);

      const animElement = document.createElement("span");
      animElement.style.position = "absolute";
      animElement.style.top = "0";
      animElement.style.left = "0";
      animElement.style.pointerEvents = "none";

      let removedChar = previousCardHolder[removedIndex];
      let prefix = previousCardHolder.substring(0, removedIndex);

      const spacer = document.createElement("span");
      spacer.style.visibility = "hidden";
      spacer.textContent = prefix;
      animElement.appendChild(spacer);

      const animChar = document.createElement("span");
      animChar.className = "animate-char-holder-remove";
      animChar.textContent = removedChar;
      animElement.appendChild(animChar);

      wrapperElement.appendChild(animElement);

      cardHolderValue.innerHTML = "";
      cardHolderValue.appendChild(wrapperElement);

      setTimeout(() => {
        if (cardHolderValue.contains(wrapperElement)) {
          cardHolderValue.removeChild(wrapperElement);
          cardHolderValue.textContent = currentValue;
        }
      }, 500);
    } else if (currentValue !== previousCardHolder) {
      cardHolderValue.textContent = currentValue;
    }

    previousCardHolder = currentValue;
  });

  const expiryValue = document.querySelector(".card__preview--expiry .value");
  let lastMonth = "";
  let lastYear = "";

  function formatValue(value, defaultValue) {
    if (!value) return defaultValue;
    return value.length === 1 ? `0${value}` : value;
  }

  function updateExpiry() {
    const month = formatValue(cardMonthSelect.value, "MM");
    const year = formatValue(cardYearSelect.value, "YY");

    const monthChanged = month !== lastMonth && lastMonth !== "";
    const yearChanged = year !== lastYear && lastYear !== "";

    const monthContainer = expiryValue.querySelector(".month-container");
    const yearContainer = expiryValue.querySelector(".year-container");

    if (monthChanged) {
      animateExpiryValue(monthContainer, lastMonth, month, "month");
    }

    if (yearChanged) {
      animateExpiryValue(yearContainer, lastYear, year, "year");
    }

    if (!monthChanged && !yearChanged) {
      const currentMonth = monthContainer.querySelector(".current-month");
      if (currentMonth) currentMonth.textContent = month;

      const currentYear = yearContainer.querySelector(".current-year");
      if (currentYear) currentYear.textContent = year;
    }

    lastMonth = month;
    lastYear = year;
  }

  function setupExpiryListeners() {
    cardMonthSelect.removeEventListener("change", updateExpiry);
    cardYearSelect.removeEventListener("change", updateExpiry);

    cardMonthSelect.addEventListener("change", updateExpiry);
    cardYearSelect.addEventListener("change", updateExpiry);

    updateExpiry();
  }

  setupExpiryListeners();

  cardCvvInput.addEventListener("focus", () => {
    cardPreview.classList.add("is-flipped");
    setTimeout(() => {
      document.querySelector(".cvv-strip").classList.add("active");
    }, 400);
  });

  cardCvvInput.addEventListener("blur", () => {
    document.querySelector(".cvv-strip").classList.remove("active");

    const activeElement = document.activeElement;
    if (activeElement === cardNumberInput) {
      focusTarget = cardNumberPreview;
    } else if (activeElement === cardHolderInput) {
      focusTarget = cardHolderValue.parentElement;
    } else if (
      activeElement === cardMonthSelect ||
      activeElement === cardYearSelect
    ) {
      focusTarget = expiryValue.parentElement;
    } else {
      focusTarget = null;
    }

    cardPreview.classList.remove("is-flipped");
  });

  cardCvvInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "").slice(0, 3);
    cvvStrip.textContent = this.value || "•••";
  });

  document.querySelector(".card__preview-front").appendChild(focusFrame);

  let focusTarget = null;

  cardPreview.addEventListener("transitionend", (e) => {
    if (e.propertyName === "transform") {
      if (!cardPreview.classList.contains("is-flipped") && focusTarget) {
        setTimeout(() => {
          animateFocusTo(focusTarget);
          focusTarget = null;
        }, 50);
      }
    }
  });

  function animateFocusTo(element) {
    if (!element) return;

    if (cardPreview.classList.contains("is-flipped")) {
      focusTarget = element;
      return;
    }

    const rect = element.getBoundingClientRect();
    const parentRect = element
      .closest(".card__preview-front")
      .getBoundingClientRect();

    if (element === cardHolderValue.parentElement) {
      const holderRect = cardHolderValue.parentElement.getBoundingClientRect();
      const expiryRect = expiryValue.parentElement.getBoundingClientRect();

      focusFrame.style.opacity = "1";
      focusFrame.style.left = holderRect.left - parentRect.left + "px";
      focusFrame.style.top = holderRect.top - parentRect.top + "px";
      focusFrame.style.width = expiryRect.left - holderRect.left - 10 + "px";
      focusFrame.style.height = holderRect.height + "px";
    } else if (element === expiryValue.parentElement) {
      const expiryRect = expiryValue.parentElement.getBoundingClientRect();

      focusFrame.style.opacity = "1";
      focusFrame.style.left = expiryRect.left - parentRect.left + "px";
      focusFrame.style.top = expiryRect.top - parentRect.top + "px";
      focusFrame.style.width = "80px";
      focusFrame.style.height = expiryRect.height + "px";
    } else {
      focusFrame.style.opacity = "1";
      focusFrame.style.left = rect.left - parentRect.left + "px";
      focusFrame.style.top = rect.top - parentRect.top + "px";
      focusFrame.style.width = rect.width + "px";
      focusFrame.style.height = rect.height + "px";
    }
  }

  function hideFocusFrame() {
    focusFrame.style.opacity = "0";
  }

  cardPreview.addEventListener("transitionstart", (e) => {
    if (e.propertyName === "transform") {
      hideFocusFrame();
    }
  });

  cardNumberInput.addEventListener("focus", () => {
    if (cardPreview.classList.contains("is-flipped")) {
      focusTarget = cardNumberPreview;
    } else {
      animateFocusTo(cardNumberPreview);
    }
  });

  cardNumberInput.addEventListener("blur", () => {
    hideFocusFrame();
  });

  cardHolderInput.addEventListener("focus", () => {
    if (cardPreview.classList.contains("is-flipped")) {
      focusTarget = cardHolderValue.parentElement;
    } else {
      animateFocusTo(cardHolderValue.parentElement);
    }
  });

  cardHolderInput.addEventListener("blur", () => {
    hideFocusFrame();
  });

  function handleExpiryFocus() {
    if (cardPreview.classList.contains("is-flipped")) {
      focusTarget = expiryValue.parentElement;
    } else {
      animateFocusTo(expiryValue.parentElement);
    }
  }

  function handleExpiryBlur() {
    hideFocusFrame();
  }

  cardMonthSelect.addEventListener("focus", handleExpiryFocus);
  cardMonthSelect.addEventListener("blur", handleExpiryBlur);
  cardYearSelect.addEventListener("focus", handleExpiryFocus);
  cardYearSelect.addEventListener("blur", handleExpiryBlur);

  cardNumberInput.addEventListener("blur", function () {
    if (!this.value) {
      lastCardNumberLength = 0;
      updateCardNumber(cardNumberPreview, "");
    }
  });

  function setupCardLogos() {
    const logoContainer = document.createElement("div");
    logoContainer.className = "logo-container";

    if (!document.querySelector(".card__preview--logo-visa")) {
      const visaLogo = document.createElement("div");
      visaLogo.classList.add("card__preview--logo", "card__preview--logo-visa");
      logoContainer.appendChild(visaLogo);

      const mastercardLogo = document.createElement("div");
      mastercardLogo.classList.add(
        "card__preview--logo",
        "card__preview--logo-mastercard"
      );
      logoContainer.appendChild(mastercardLogo);

      cardPreview.appendChild(logoContainer);
    }

    visaLogo.style.opacity = "1";
    mastercardLogo.style.opacity = "0";
  }

  setupCardLogos();

  function animateLogoChange(fromLogo, toLogo) {
    fromLogo.classList.add("logo-out");
    toLogo.classList.add("logo-in");

    setTimeout(() => {
      fromLogo.style.opacity = "0";
      toLogo.style.opacity = "1";

      setTimeout(() => {
        fromLogo.classList.remove("logo-out");
        toLogo.classList.remove("logo-in");
      }, 500);
    }, 250);

    const backFromLogo =
      fromLogo === visaLogo
        ? document.querySelector(".back-visa-logo")
        : document.querySelector(".back-mastercard-logo");

    const backToLogo =
      toLogo === visaLogo
        ? document.querySelector(".back-visa-logo")
        : document.querySelector(".back-mastercard-logo");

    setTimeout(() => {
      if (backFromLogo) backFromLogo.style.opacity = "0";
      if (backToLogo) backToLogo.style.opacity = "1";
    }, 250);
  }

  let currentLogoType = "visa";

  window.addEventListener("DOMContentLoaded", function () {
    const expiryElement = document.querySelector(".card__preview--expiry");
    const width = expiryElement.offsetWidth;
    expiryElement.style.width = width + "px";
  });
}

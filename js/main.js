const WHATSAPP_URL = "https://wa.me/34620887502";
const HOME_VIDEOS = [
  "ftmo3xXBD1U",
  "C0tP4zLYwJE",
  "uqfSt2GYk9Q",
  "m-K45hW_rNI",
  "p1e_81nzB48",
];
const WEEKLY_CALENDAR_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwaK5dtcqMuVIH0tUEofI_kAVgDhHquo8_vi5Il6BN8VoBFvPzh5QpvyVpl7knU-rD_Bw/exec";
const WEEKLY_CALENDAR_CALLBACK = "AZTAWeeklyCalendarCallback";
const MEMBER_ACCESS_STORAGE_KEY = "azta-member-access";
const MEMBER_PASSWORD_HASH =
  "2243b4221c3cb18edb5812254414baa771bd90789f30c506b9fb2f527c804066";

function formatDateForMessage(value) {
  if (!value) return "";

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function setFieldState(field, isInvalid) {
  field.toggleAttribute("aria-invalid", isInvalid);
}

function initTrialForm() {
  const form = document.querySelector("#trial-form");
  if (!form) return;

  const nameField = form.querySelector("#trial-name");
  const phoneField = form.querySelector("#trial-phone");
  const dateField = form.querySelector("#trial-date");
  const messageBox = form.querySelector("#trial-form-message");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameField.value.trim();
    const phone = phoneField.value.trim();
    const date = dateField.value;

    setFieldState(nameField, !name);
    setFieldState(dateField, !date);

    if (!name || !date) {
      messageBox.textContent = "Indica tu nombre y el día que quieres venir.";
      (name ? dateField : nameField).focus();
      return;
    }

    setFieldState(phoneField, false);
    messageBox.textContent = "";

    const formattedDate = formatDateForMessage(date);
    const phonePart = phone ? ` Mi teléfono es ${phone}.` : "";
    const text = `Hola, soy ${name}. Me gustaría venir a probar un ensayo el ${formattedDate}.${phonePart} ¿Os viene bien?`;
    const url = `${WHATSAPP_URL}?text=${encodeURIComponent(text)}`;
    const whatsappWindow = window.open(url, "_blank", "noopener,noreferrer");

    if (whatsappWindow) {
      whatsappWindow.opener = null;
    } else {
      window.location.href = url;
    }
  });
}

function initVideoCarousel() {
  const frame = document.querySelector("#home-video-frame");
  const previous = document.querySelector(".video-nav-prev");
  const next = document.querySelector(".video-nav-next");
  const current = document.querySelector("#video-current");
  const carousel = document.querySelector(".video-carousel");

  if (!frame || !previous || !next || !current || !carousel) return;

  let index = 0;

  function renderVideo() {
    frame.src = `https://www.youtube.com/embed/${HOME_VIDEOS[index]}`;
    current.textContent = String(index + 1);
  }

  function showPreviousVideo() {
    index = (index - 1 + HOME_VIDEOS.length) % HOME_VIDEOS.length;
    renderVideo();
  }

  function showNextVideo() {
    index = (index + 1) % HOME_VIDEOS.length;
    renderVideo();
  }

  previous.addEventListener("click", showPreviousVideo);
  next.addEventListener("click", showNextVideo);

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPreviousVideo();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextVideo();
    }
  });
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function renderWeeklyDay(dayName, dayData) {
  const day = document.querySelector(`[data-week-day="${dayName}"]`);
  if (!day) return;

  const titleElement = day.querySelector("[data-week-title]");
  const descriptionElement = day.querySelector("[data-week-description]");

  if (titleElement) {
    titleElement.textContent = dayData?.title?.trim() || "";
  }

  if (descriptionElement) {
    descriptionElement.textContent = dayData?.description?.trim() || "";
  }
}

function renderWeeklyCalendar(data) {
  if (!data?.ok) return;

  renderWeeklyDay("monday", data.monday);
  renderWeeklyDay("wednesday", data.wednesday);
}

function clearWeeklyCalendar() {
  document
    .querySelectorAll("[data-week-title], [data-week-description]")
    .forEach((element) => {
      element.textContent = "";
    });
}

function initWeeklyCalendar() {
  const section = document.querySelector("#esta-semana");
  if (!section) return;

  clearWeeklyCalendar();
  window[WEEKLY_CALENDAR_CALLBACK] = renderWeeklyCalendar;

  const script = document.createElement("script");
  const separator = WEEKLY_CALENDAR_SCRIPT_URL.includes("?") ? "&" : "?";

  script.src =
    `${WEEKLY_CALENDAR_SCRIPT_URL}` +
    `${separator}callback=${encodeURIComponent(WEEKLY_CALENDAR_CALLBACK)}` +
    `&_=${Date.now()}`;
  script.async = true;
  script.onload = () => {
    script.remove();
  };
  script.onerror = () => {
    console.warn("AZTA: no se pudo cargar la información semanal.");
    script.remove();
  };

  document.head.append(script);
}

function showMembersContent() {
  const accessSection = document.querySelector("#member-access");
  const membersContent = document.querySelector("#members-content");

  if (accessSection) {
    accessSection.hidden = true;
  }

  if (membersContent) {
    membersContent.hidden = false;
  }

  document.body.classList.add("member-authenticated");
  initWeeklyCalendar();
}

function initMemberAccess() {
  const accessForm = document.querySelector("#member-access-form");
  const membersContent = document.querySelector("#members-content");
  if (!accessForm || !membersContent) return;

  const passwordField = accessForm.querySelector("#member-password");
  const messageBox = accessForm.querySelector("#member-access-message");

  if (sessionStorage.getItem(MEMBER_ACCESS_STORAGE_KEY) === "true") {
    showMembersContent();
    return;
  }

  accessForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const password = passwordField.value;
    const passwordHash = await sha256(password);

    if (passwordHash === MEMBER_PASSWORD_HASH) {
      sessionStorage.setItem(MEMBER_ACCESS_STORAGE_KEY, "true");
      passwordField.value = "";
      passwordField.removeAttribute("aria-invalid");
      messageBox.textContent = "";
      showMembersContent();
      return;
    }

    passwordField.setAttribute("aria-invalid", "true");
    messageBox.textContent = "Contraseña incorrecta.";
    passwordField.focus();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTrialForm();
  initVideoCarousel();
  initMemberAccess();
});

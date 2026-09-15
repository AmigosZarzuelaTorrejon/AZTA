const WHATSAPP_URL = "https://wa.me/34620887502";
const WEEKLY_CALENDAR_SCRIPT_URL =
  "PASTE_GOOGLE_APPS_SCRIPT_EXEC_URL_HERE";
const WEEKLY_CALENDAR_CALLBACK = "AZTAWeeklyCalendarCallback";

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

function createTextElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function formatEventTime(event) {
  if (event.start && event.end) {
    return `${event.start} – ${event.end}`;
  }

  return event.start || event.end || "";
}

function renderWeeklyEvent(dayName, dayData) {
  const container = document.querySelector(
    `[data-week-day="${dayName}"] [data-week-content]`,
  );
  if (!container) return;

  container.textContent = "";

  const event = Array.isArray(dayData?.events) ? dayData.events[0] : null;
  if (!event) return;

  const title = event.title?.trim();
  const time = formatEventTime(event).trim();
  const description = event.description?.trim();

  if (title) {
    container.append(createTextElement("h3", "week-event-title", title));
  }

  if (time) {
    container.append(createTextElement("p", "week-event-time", time));
  }

  if (description) {
    container.append(
      createTextElement("p", "week-event-description", description),
    );
  }
}

function renderWeeklyCalendar(data) {
  if (!data?.ok) return;

  renderWeeklyEvent("monday", data.monday);
  renderWeeklyEvent("wednesday", data.wednesday);
}

function initWeeklyCalendar() {
  const weeklySection = document.querySelector("#esta-semana");
  if (!weeklySection) return;

  weeklySection
    .querySelectorAll("[data-week-content]")
    .forEach((container) => {
      container.textContent = "";
    });

  window[WEEKLY_CALENDAR_CALLBACK] = renderWeeklyCalendar;

  if (
    !WEEKLY_CALENDAR_SCRIPT_URL ||
    WEEKLY_CALENDAR_SCRIPT_URL === "PASTE_GOOGLE_APPS_SCRIPT_EXEC_URL_HERE"
  ) {
    return;
  }

  const script = document.createElement("script");
  const separator = WEEKLY_CALENDAR_SCRIPT_URL.includes("?") ? "&" : "?";
  script.src = `${WEEKLY_CALENDAR_SCRIPT_URL}${separator}callback=${encodeURIComponent(WEEKLY_CALENDAR_CALLBACK)}`;
  script.async = true;
  document.head.append(script);
}

document.addEventListener("DOMContentLoaded", () => {
  initTrialForm();
  initWeeklyCalendar();
});

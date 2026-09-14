const WHATSAPP_URL = "https://wa.me/34620887502";

function formatDateForMessage(value) {
  if (!value) return "";

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function setFieldState(field, isInvalid) {
  field.toggleAttribute("aria-invalid", isInvalid);
}

document.addEventListener("DOMContentLoaded", () => {
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
});

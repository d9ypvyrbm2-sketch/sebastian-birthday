const PARTY = new Date("2026-11-08T15:00:00-05:00").getTime();
const slides = [
  { type: "image", src: "invitation.png", label: "The invitation" },
  { type: "image", src: "photos/01-day-one.jpg", label: "Day one" },
  { type: "image", src: "photos/02-smile.jpg", label: "A smile" },
  { type: "image", src: "photos/03-five-months.jpg", label: "Five months" },
  { type: "image", src: "photos/04-at-home.jpg", label: "At home" },
  { type: "image", src: "photos/05-red-sox.jpg", label: "Red Sox" },
  { type: "image", src: "photos/06-out-to-eat.jpg", label: "Out to eat" },
  { type: "image", src: "photos/07-pool.jpg", label: "In the pool" },
  { type: "image", src: "photos/08-car.jpg", label: "In the car" },
];

const countdown = document.getElementById("countdown");
const song = document.getElementById("song");
const sound = document.getElementById("sound");
const slide = document.getElementById("slide");
const dots = document.getElementById("dots");
const label = document.getElementById("slide-label");
const form = document.getElementById("reply");
const nameInput = document.getElementById("guest-name");
const yes = document.getElementById("yes");
const no = document.getElementById("no");
const error = document.getElementById("error");
const send = document.getElementById("send");

let index = 0;
let coming = null;
let hold = false;

function split(now) {
  const gap = PARTY - now;
  if (gap <= 0) return null;
  const seconds = Math.floor(gap / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
}

function paintCountdown() {
  const left = split(Date.now());
  if (!left) {
    countdown.outerHTML = '<p class="party-here">Sebastian\'s birthday is here</p>';
    return;
  }
  const values = [left.days, left.hours, left.minutes, left.seconds];
  countdown.querySelectorAll("strong").forEach((node, i) => {
    node.textContent = String(values[i]);
  });
}

function showSlide() {
  const item = slides[index];
  slide.src = item.src;
  slide.alt = item.label;
  label.textContent = index + 1 + " of " + slides.length + ". " + item.label;
  dots.querySelectorAll("button").forEach((dot, i) => {
    if (i === index) dot.setAttribute("aria-current", "true");
    else dot.removeAttribute("aria-current");
  });
}

let slideTimer = 0;

function armSlides() {
  clearTimeout(slideTimer);
  slideTimer = setTimeout(() => go(1), 4000);
}

function go(step) {
  index = (index + step + slides.length) % slides.length;
  showSlide();
  armSlides();
}

slides.forEach((item, dotIndex) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.className = "party-dot";
  dot.setAttribute("aria-label", item.label);
  dot.addEventListener("click", () => {
    index = dotIndex;
    showSlide();
    armSlides();
  });
  dots.appendChild(dot);
});
document.getElementById("prev").addEventListener("click", () => go(-1));
document.getElementById("next").addEventListener("click", () => go(1));
showSlide();
armSlides();
paintCountdown();
setInterval(paintCountdown, 1000);

function startSong() {
  if (hold) return;
  song.play().then(() => {
    sound.textContent = "Pause song";
  }).catch(() => {
    sound.textContent = "Play song";
  });
}

sound.addEventListener("click", () => {
  if (song.paused) {
    hold = false;
    startSong();
  } else {
    hold = true;
    song.pause();
    sound.textContent = "Play song";
  }
});
startSong();
window.addEventListener("pointerdown", startSong);

function choose(value) {
  coming = value;
  yes.setAttribute("aria-pressed", value === true ? "true" : "false");
  no.setAttribute("aria-pressed", value === false ? "true" : "false");
}
yes.addEventListener("click", () => choose(true));
no.addEventListener("click", () => choose(false));

function showError(message) {
  error.hidden = false;
  error.textContent = message;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!name) {
    showError("Please type your name.");
    return;
  }
  if (coming === null) {
    showError("Please choose coming or not coming.");
    return;
  }
  send.disabled = true;
  send.textContent = "Sending";
  error.hidden = true;
  addReply(name, coming)
    .then(() => {
      form.innerHTML = '<div class="party-thanks"><h2>Thank you</h2><p>Your answer is saved.</p></div>';
    })
    .catch(() => {
      send.disabled = false;
      send.textContent = "Send answer";
      showError("That did not send. Please try again.");
    });
});

const deviceKey = "sebastian-party-device";
let deviceId = localStorage.getItem(deviceKey);
if (!deviceId) {
  deviceId = crypto.randomUUID();
  localStorage.setItem(deviceKey, deviceId);
}
rememberDevice(deviceId).catch(() => {});

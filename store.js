const GIST_ID = "0c38820f0a8248f829e1969f73f31651";
const GIST_TOKEN = "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";

function emptyBook() {
  return { replies: [], devices: [] };
}

function authHeaders() {
  return {
    Authorization: "Bearer " + GIST_TOKEN,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

async function readBook() {
  const response = await fetch("https://api.github.com/gists/" + GIST_ID, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("The list could not be read.");
  const data = await response.json();
  const file = data.files && data.files["party.json"];
  if (!file || !file.content) return emptyBook();
  const parsed = JSON.parse(file.content);
  return {
    replies: Array.isArray(parsed.replies) ? parsed.replies : [],
    devices: Array.isArray(parsed.devices) ? parsed.devices : [],
  };
}

async function writeBook(book) {
  const response = await fetch("https://api.github.com/gists/" + GIST_ID, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({
      files: { "party.json": { content: JSON.stringify(book) } },
    }),
  });
  if (!response.ok) throw new Error("The list could not be saved.");
}

async function updateBook(change) {
  let lastError = new Error("The list could not be saved.");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const book = await readBook();
      change(book);
      await writeBook(book);
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function rememberDevice(deviceId) {
  await updateBook((book) => {
    if (!book.devices.includes(deviceId)) book.devices.push(deviceId);
  });
}

async function addReply(name, coming) {
  await updateBook((book) => {
    book.replies.push({
      name,
      coming,
      createdAt: new Date().toISOString(),
    });
  });
}

const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion-list .suggestion"); // Fixed selector
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

let userMessage = null;
let isResponseGenerated = false;

// API configuration
const API_KEY = "AIzaSyAWoU6R4AKFmf6GwiCAMrk7aQYkMyAzJhA";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const loadLocalstorageData = () => {
    const savedChats = localStorage.getItem("savedChats");

    // Restore saved chats and sanitize if needed
    chatList.innerHTML = savedChats || "";

    document.body.classList.toggle("hide-header", savedChats);
    chatList.scrollTop = chatList.scrollHeight; // Fixed scrolling
}

loadLocalstorageData();

// Create a new message element and return it
const createMessageElement = (content, ...className) => {
    const div = document.createElement("div");
    div.classList.add("message", ...className);
    div.innerHTML = content;
    return div;
}

// Show typing effect by displaying words one by one
const showTypingEffect = (text, textElement) => {
    const words = text.split(' ');
    let currentWordIndex = 0;
    const typingInterval = setInterval(() => {
        // Append each word to the text element with a space
        textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];

        // if all words are displayed
        if (currentWordIndex === words.length) {
            clearInterval(typingInterval);
            isResponseGenerated = false;
            localStorage.setItem("savedChats", chatList.innerHTML); // Save chats to local storage
            chatList.scrollTop = chatList.scrollHeight; // Scroll to the bottom
        }
    }, 75);
}

// Fetch response from the API based on user message
const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text"); // Get text element

    // Send a post request to the API with the user's message
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: userMessage }]
                }]
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        // Get the API response text
        const apiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text; // Updated for safety
        if (apiResponse) {
            showTypingEffect(apiResponse, textElement);
        } else {
            isResponseGenerated = false;
        }
    } catch (error) {
        console.error("Error fetching the API response:", error);
        textElement.innerText = error.message;
        SVGComponentTransferFunctionElement.classList.add("error");
    } finally {
        incomingMessageDiv.classList.remove("loading");
    }
}

// Show a loading animation while waiting for the API response
const showLoadingAnimation = () => {
    const html = `
        <div class="message-content">
            <img src="images/botIcon.png" alt="Gemini Image" class="avatar">
            <p class="text"></p>
            <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
            </div>
        </div>
        <span onclick="copyMessage(this)" class="icon material-symbols-rounded">
            content_copy
        </span>`;

    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
    chatList.appendChild(incomingMessageDiv); // Append to chat list

    chatList.scrollTop = chatList.scrollHeight; // Fixed scrolling
    generateAPIResponse(incomingMessageDiv);
}

// Copy message text to the clipboard
const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "done"; // Show tick icon
    setTimeout(() => copyIcon.innerText = "content_copy", 1000); // Revert icon after 1 second
}

// Handle sending outgoing chat messages
const handleOutgoingChat = () => {
    userMessage = document.querySelector(".typing-input").value.trim() || userMessage;
    if (!userMessage || isResponseGenerated) return; // Exit if no message

    isResponseGenerated = true;

    const html = `
        <div class="message-content">
            <img src="images/images.jpeg" alt="User Image" class="avatar">
            <p class="text">${userMessage}</p>
        </div>`;

    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    chatList.appendChild(outgoingMessageDiv); // Append to chat list

    typingForm.reset();
    chatList.scrollTop = chatList.scrollHeight; // Fixed scrolling
    document.body.classList.add("hide-header"); // Hide the header once chat starts
    setTimeout(showLoadingAnimation, 500);
}

// Set userMessage and handle outgoing chat when a suggestion is clicked
suggestions.forEach(suggestion => {
    suggestion.addEventListener("click", () => {
        userMessage = suggestion.querySelector(".text").innerText;
        handleOutgoingChat();
    });
});

toggleThemeButton.addEventListener("click", () => {
    const isLightMode = document.body.classList.toggle("light-mode");
    toggleThemeButton.innerText = isLightMode ? "Dark Mode" : "Light Mode"; // Improved text
});

// Delete all chats from local storage when the button is clicked
deleteChatButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all messages?")) {
        localStorage.removeItem("savedChats");
        loadLocalstorageData();
    }
});

typingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleOutgoingChat();
});

document.getElementById("removeAsterisksButton").addEventListener("click", function () {
    const input = document.getElementById("inputString").value;
    const cleanedString = removeAsterisks(input);
    document.getElementById("outputString").innerText = cleanedString;
});


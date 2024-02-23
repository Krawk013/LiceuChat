const chatContainer = document.getElementById('chat-container');
const chatRooms = document.getElementById('chat-rooms');
const chatArea = document.getElementById('chat-area');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const imageInput = document.getElementById('image-input');

let currentRoom = null;

// Function to join a chat room
function joinRoom(room) {
	currentRoom = room;
	chatRooms.style.display = 'none';
	chatArea.style.display = 'block';
}

// Function to handle form submission
function handleFormSubmit(event) {
	event.preventDefault();
	const message = messageInput.value;
	const image = imageInput.value;
	if (!message && !image) return;
	const messageElement = document.createElement('div');
	messageElement.textContent = message;
	if (image) {
		const imageElement = document.createElement('img');
	

$(document).ready(function () {
	function openChatWindow() {
		document.getElementById("myForm").style.display = "block";
	}
	  
	function closeChatWindow() {
		document.getElementById("myForm").style.display = "none";

		// clear old messages
		var messages = document.getElementById("messages");
		while (messages.firstChild){
			messages.removeChild(messages.firstChild);
		}
		// set welcome message
		var div2 = document.createElement("div");
		div2.classList.add("bot-message");
		div2.innerHTML = welcome_message;
		messages.appendChild(div2);
	}
	
	function hideChatWindow() {
		document.getElementById("myForm").style.display = "none";
	}
		
	function send() {
		if(document.getElementById("text").value != ""){
			// add user message to chatbox
			var div_user = document.createElement("div");
			div_user.classList.add("user-message")
			div_user.innerHTML = document.getElementById("text").value;

			var div = document.getElementById("messages");
			div.appendChild(div_user);
			updateScroll();
			
			// send user message to server
			var url_variables = window.location.search.substring(1);
			new_url = 'http://' + window.location.hostname + '/messages?' + url_variables;
			//new_url = 'http://' + window.location.hostname + ':3000/messages?' + url_variables; // remove comment for local
			
			// send message to server and display response
			post(new_url, function(result){
				// create new div for bot message
				var div_bot = document.createElement("div");
				div_bot.classList.add("bot-message");
				div_bot.innerHTML = result;
				
				div.appendChild(div_bot);
				updateScroll();
				// clear old user message from text area
				document.getElementById("text").value = "";
			});
		}
	}
	
	function post(new_url, callback){
		$.post(new_url, {text: document.getElementById("text").value }, function(data, status, jqXHR) {
			callback(data);
		});
	}
	
	function updateScroll(){
		var div = document.getElementById("messages");
		div.scrollTop = div.scrollHeight;
	}
	
	function drawChatwindow(bot_identity){
		// find the body and head of html document
		var body = document.getElementsByTagName("body")[0];
		var head = document.getElementsByTagName("head")[0];

		// add css links
		var link = document.createElement("link");
		link.href = "css/bootstrap.min.css";
		link.rel= "stylesheet";
		head.appendChild(link);
		var link = document.createElement("link");
		link.href = "css/font-awesome.min.css";
		link.rel= "stylesheet";
		head.appendChild(link);
		var link = document.createElement("link");
		link.href = "css/chatbox.css";
		link.rel= "stylesheet";
		head.appendChild(link);

		// chat open button
		var button = document.createElement("button");
		button.innerHTML = "Chat";
		button.addEventListener ("click", openChatWindow);
		button.classList.add("open-button");
		body.appendChild(button);

		var div_chat = document.createElement("div");
		div_chat.classList.add("chat-popup");
		div_chat.setAttribute("id", "myForm");

		var box = document.createElement("div");
		box.classList.add("chat-box");

		// bot avatar/image
		var img = new Image();
		img.src = bot_identity.image_url;
		img.classList.add("img");
		box.appendChild(img);

		// close button
		var button_close= document.createElement("button");
		button_close.innerHTML = "X";
		button_close.addEventListener ("click", closeChatWindow);
		button_close.setAttribute("id", "close_button");
		button_close.classList.add("btn", "close");
		box.appendChild(button_close);

		// hide button
		var button_hide= document.createElement("button");
		button_hide.innerHTML = "_";
		button_hide.addEventListener ("click", hideChatWindow);
		button_hide.setAttribute("id", "hide_button");
		button_hide.classList.add("btn", "close");
		box.appendChild(button_hide);
		
		// bot name
		var h = document.createElement("h1");
		h.classList.add("name");
		h.appendChild(document.createTextNode(bot_identity.bot_name));
		box.appendChild(h);
		
		// bot description
		var p = document.createElement("p");
		p.classList.add("description");
		p.appendChild(document.createTextNode(bot_identity.description));
		box.appendChild(p);

		// messages box
		var div = document.createElement("div");
		div.classList.add("messages");
		div.setAttribute("id", "messages");
		
		// set welcome message
		var div2 = document.createElement("div");
		div2.classList.add("bot-message");
		div2.innerHTML = welcome_message;
		div.appendChild(div2);
		
		box.appendChild(div);

		// text input box
		var text = document.createElement("input");
		text.name = "msg";
		text.placeholder = "Type message..";
		text.setAttribute("id", "text");
		text.classList.add("text-area");
		text.addEventListener("keyup",function(e){
			if(e.keyCode === 13){
				send();
			}
		});
		box.appendChild(text);
		
		// send button
		var button_send = document.createElement("button");
		button_send.innerHTML = ">";
		button_send.addEventListener("click", send);
		button_send.setAttribute("id", "send_button");
		button_send.classList.add("btn", "send");
		box.appendChild(button_send);
		
		// add the chatbot to body
		div_chat.appendChild(box);
		body.appendChild(div_chat);
	}
	
	var welcome_message = "";
	var bot_identity = {};
	var test = 0; // 0=try to connect to server, 1=test UI without server
	var new_url = "";
	
	// get url parameters
	var url_variables = window.location.search.substring(1);
	new_url = 'http://' + window.location.hostname + '/chat?' + url_variables;
	//new_url = 'http://' + window.location.hostname + ':3000/chat?' + url_variables; // remove comment for local
	
	if (test == 1){
		bot_identity = {identity: "happy", description: "I am feeling good!", image_url: "img/face1.png", name: "happyBot"};
		welcome_message = "Test state. No connection to server.";
		drawChatwindow(bot_identity);
	} else {
		// send url parameters to /chat route
		$.get(new_url, {}, function(data, status, jqXHR) {
			bot_identity = data;
			welcome_message = "Click send message button or press enter.";
			drawChatwindow(bot_identity);
		});
	}
	
});
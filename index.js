/* Firebase setup */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, update} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js" //make sure to import all functions you need

const appSettings = {
    databaseURL: "https://scrimba-project-96533-default-rtdb.firebaseio.com/"
}
const app = initializeApp(appSettings)
const database = getDatabase(app)
const endorsementsInDB = ref(database, "endorsements")

/* DOM */
const formEl = document.getElementById("form-el")
const contentInputEl = document.getElementById("content-input")
const senderInputEl = document.getElementById("sender-input")
const receiverInputEl = document.getElementById("receiver-input")
const endorsementsPostsEl = document.getElementById("endorsements-posts")

/* localStorage for likes feature*/
let likedIDs = []
const likedIDsFromLocalStorage = JSON.parse( localStorage.getItem("likedIDs") )
if (likedIDsFromLocalStorage) {
    likedIDs = likedIDsFromLocalStorage
}

/* onload Events */
formEl.addEventListener("submit", function(event) {
    event.preventDefault() //prevent reload the page when hitting 'enter'
    // validation incase 'required' not supported on some browsers
    if (contentInputEl.value){
        writeNewPost(contentInputEl.value, senderInputEl.value, receiverInputEl.value)
        clearInputFieldEl()
    }
})

onValue(endorsementsInDB, function(snapshot) {
    if (snapshot.exists()) {
        clearEndorsementsPostsEl()
        let itemsArray = Object.entries(snapshot.val())
        // go through from the end, alternative way is reverse itemsArray 
        for (let i = itemsArray.length - 1; i >= 0; i--) {
            let currentItem = itemsArray[i]
            render(currentItem)
        }    
    } else {
        endorsementsPostsEl.innerHTML = "No posts yet, sorry!"
    }
})

/* Function Definition */
function writeNewPost(content, sender, receiver){
    const postData = {
        content: content,
        sender: sender,
        receiver: receiver,
        likesCount: 0
    }
    push(endorsementsInDB, postData)
}

function clearInputFieldEl() {
    contentInputEl.value = ""
    senderInputEl.value = ""
    receiverInputEl.value = ""
}

function clearEndorsementsPostsEl() {
    endorsementsPostsEl.innerHTML = ""
    /* alternative method
    while(endorsementsPostsEl.firstChild){
        endorsementsPostsEl.removeChild(endorsementsPostsEl.firstChild);
    }
    */
}

function render(item) {
    let itemID = item[0]
    let itemValue = item[1]

/* 
innerHTML and Template strings
pro: dry code
con: need to sanitize to reduce the risk of cross-site scripting (XSS) attacks
*/
    let newSectionEl = document.createElement("section")
    newSectionEl.classList.add("post-box")
    let temp = `
            <p class="font-bold">${itemValue.receiver ? `To ${itemValue.receiver}` : ""}</p>
            <p>${itemValue.content}</p>
            <p class="font-bold">${itemValue.sender ? `From ${itemValue.sender}` : ""}</p>
            <button class="likes-button" aria-label="Like this post" title="Clike to like this post">
                <i class="fas fa-heart"></i>
                <span class="font-bold" id="likes-count">${itemValue.likesCount}</span>
            </button>
    `
    newSectionEl.innerHTML = cleanHTML(temp)

    // add event listener to the likes button
    newSectionEl.children[3].addEventListener("click", function() {
        if (!(likedIDs.includes(itemID))){
            let exactLocationOfItemInDB = ref(database, `endorsements/${itemID}`)
            let updates = {...itemValue, likesCount: itemValue.likesCount + 1 }
            update(exactLocationOfItemInDB, updates)
            likedIDs.push(itemID);
            localStorage.setItem("likedIDs", JSON.stringify(likedIDs))
        }
    })
    endorsementsPostsEl.appendChild(newSectionEl)

/*  
Manually creating markup
pro: safer, prevent xss attacks
con: a lot code
*/
/*
    let newSectionEl = document.createElement("section")
    newSectionEl.classList.add("post-box")

    let newReceiverEl = document.createElement("p")
    newReceiverEl.classList.add("font-bold")
    if (itemValue.receiver){
        newReceiverEl.textContent ="To " + itemValue.receiver
        newSectionEl.appendChild(newReceiverEl)
    }

    let newContentEl = document.createElement("p")
    newContentEl.textContent = itemValue.content
    newSectionEl.appendChild(newContentEl)

    let newSenderEl = document.createElement("p")
    newSenderEl.classList.add("font-bold")
    if (itemValue.sender){
        newSenderEl.textContent = "From " + itemValue.sender
        newSectionEl.appendChild(newSenderEl)
    }

    let newButtonEl = document.createElement("button")
    newButtonEl.classList.add("likes-button")
    newButtonEl.setAttribute("aria-label", "Like this post")
    newButtonEl.setAttribute("title", "Clike to like this post")
    let newIconEl = document.createElement("i")
    newIconEl.classList.add("fas", "fa-heart")
    let newCounterEl = document.createElement("span")
    newCounterEl.classList.add("font-bold")
    newCounterEl.textContent = itemValue.likesCount
    newButtonEl.append(newIconEl, newCounterEl)
    newButtonEl.addEventListener("click", function() {
        if (!(likedIDs.includes(itemID))){
            let exactLocationOfItemInDB = ref(database, `endorsements/${itemID}`)
            let updates = {...itemValue, likesCount: itemValue.likesCount + 1 }
            update(exactLocationOfItemInDB, updates)
            likedIDs.push(itemID);
            localStorage.setItem("likedIDs", JSON.stringify(likedIDs))
        }
    })
    newSectionEl.appendChild(newButtonEl)
    endorsementsPostsEl.appendChild(newSectionEl)
    //if go through from the start
    // endorsementsPostsEl.insertAdjacentElement("afterbegin", newSectionEl)
*/
}

/**
 * Sanitize an HTML string
 * (c) Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {String}          str   The HTML string to sanitize
 * @param  {Boolean}         nodes If true, returns HTML nodes instead of a string
 * @return {String|NodeList}       The sanitized string or nodes
 */
function cleanHTML (str, nodes) {

	/**
	 * Convert the string to an HTML document
	 * @return {Node} An HTML document
	 */
	function stringToHTML () {
		let parser = new DOMParser();
		let doc = parser.parseFromString(str, 'text/html');
		return doc.body || document.createElement('body');
	}

	/**
	 * Remove <script> elements
	 * @param  {Node} html The HTML
	 */
	function removeScripts (html) {
		let scripts = html.querySelectorAll('script');
		for (let script of scripts) {
			script.remove();
		}
	}

	/**
	 * Check if the attribute is potentially dangerous
	 * @param  {String}  name  The attribute name
	 * @param  {String}  value The attribute value
	 * @return {Boolean}       If true, the attribute is potentially dangerous
	 */
	function isPossiblyDangerous (name, value) {
		let val = value.replace(/\s+/g, '').toLowerCase();
		if (['src', 'href', 'xlink:href'].includes(name)) {
			if (val.includes('javascript:') || val.includes('data:')) return true;
		}
		if (name.startsWith('on')) return true;
	}

	/**
	 * Remove potentially dangerous attributes from an element
	 * @param  {Node} elem The element
	 */
	function removeAttributes (elem) {

		// Loop through each attribute
		// If it's dangerous, remove it
		let atts = elem.attributes;
		for (let {name, value} of atts) {
			if (!isPossiblyDangerous(name, value)) continue;
			elem.removeAttribute(name);
		}

	}

	/**
	 * Remove dangerous stuff from the HTML document's nodes
	 * @param  {Node} html The HTML document
	 */
	function clean (html) {
		let nodes = html.children;
		for (let node of nodes) {
			removeAttributes(node);
			clean(node);
		}
	}

	// Convert the string to HTML
	let html = stringToHTML();

	// Sanitize it
	removeScripts(html);
	clean(html);

	// If the user wants HTML nodes back, return them
	// Otherwise, pass a sanitized string back
	return nodes ? html.childNodes : html.innerHTML;

}
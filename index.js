import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, update} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js" //make sure to import all functions you need

const appSettings = {
    databaseURL: "https://scrimba-project-96533-default-rtdb.firebaseio.com/"
}
const app = initializeApp(appSettings)
const database = getDatabase(app)
const endorsementsInDB = ref(database, "endorsements")

const contentInputEl = document.getElementById("content-input")
const senderInputEl = document.getElementById("sender-input")
const receiverInputEl = document.getElementById("receiver-input")
const publishButtonEl = document.getElementById("publish-button")
const endorsementsPostsEl = document.getElementById("endorsements-posts")

const likedIDsFromLocalStorage = JSON.parse( localStorage.getItem("likedIDs") )
let likedIDs = []

if (likedIDsFromLocalStorage) {
    likedIDs = likedIDsFromLocalStorage
}

publishButtonEl.addEventListener("click", function() {
    if (contentInputEl.value){
        writeNewPost(contentInputEl.value, senderInputEl.value, receiverInputEl.value)
        clearInputFieldEl()
    } else {
        alert("Please write your endorsement.")
    }
})

onValue(endorsementsInDB, function(snapshot) {
    if (snapshot.exists()) {
        clearEndorsementsPostsEl()
        let itemsArray = Object.entries(snapshot.val())
        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i]
            render(currentItem)
        }    
    } else {
        endorsementsPostsEl.innerHTML = "No posts yet, sorry!"
    }
})

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
    while(endorsementsPostsEl.firstChild){
        endorsementsPostsEl.removeChild(endorsementsPostsEl.firstChild);
    }
    // endorsementsPostsEl.innerHTML = ""
}

function render(item) {
    let itemID = item[0]
    let itemValue = item[1]
    
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
    newButtonEl.setAttribute("title", "Like this post")
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
    // endorsementsPostsEl.appendChild(newSectionEl)
    endorsementsPostsEl.insertAdjacentElement("afterbegin", newSectionEl)
}
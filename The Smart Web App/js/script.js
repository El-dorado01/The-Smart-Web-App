if(document.getElementById("defaultOpen")){
    document.getElementById("defaultOpen").click();
}

if(document.getElementById("defaultOpen2")){
    document.getElementById("defaultOpen2").click();
}

if(document.querySelector(".welcome-container .card-btn")){
    const cardBtn = document.querySelector(".welcome-container .card-btn");

    cardBtn.addEventListener("click", () => {
        document.querySelector(".welcome-container").classList.toggle("change");
    });
}

// ===================Hide Bar================= //
var hideBar = document.querySelector(".hide-bar");
var sideBar = document.querySelector(".left");
var navContainer = document.querySelector("nav .container");
var container = document.querySelector("main .container");

var bodyContainer = document.querySelector("main .body-container");

hideBar.addEventListener("click", () => {
    navContainer.classList.toggle("sidebar-close");
    container.classList.toggle("sidebar-close");
    sideBar.classList.toggle("sidebar-close");
})

hideBar.addEventListener("click", () => {
    bodyContainer.classList.toggle("sidebar-close");
    sideBar.classList.toggle("sidebar-close");
})


// =================Active class=============== //

const menuItems = document.querySelectorAll(".menu-item");

const changeActiveItem = () => {
    menuItems.forEach(item => {
        item.classList.remove("active");
    })
}

menuItems.forEach(item => {
    item.addEventListener("click", () => {
        changeActiveItem();
        item.classList.add("active");

        if(item.id != 'notifications'){
            document.querySelector(".notifications-popup").style.display = "none";
        }else{
            document.querySelector(".notifications-popup").style.display = "block";
            document.querySelector("#notifications .notification-count").style.display = "none";
        }
    })
})


// =================Color Pallete==================== //
const colorPallete = document.querySelectorAll(".choose-color span");

const removeActiveColor = () => {
    colorPallete.forEach(color => {
        color.classList.remove("active");
    })
}

colorPallete.forEach(color => {
    color.addEventListener('click', () => {
        let firstHue;
        let secondHue;
        let thirdHue;

        removeActiveColor();

        if(color.classList.contains('color-1')){
            firstHue = 173;
            secondHue = '36%';
            thirdHue = '55%';
        }else if(color.classList.contains('color-2')){
            firstHue = 37;
            secondHue = '76%';
            thirdHue = '74%';
        }else if(color.classList.contains('color-3')){
            firstHue = 252;
            secondHue = '75%';
            thirdHue = '60%';
        }else if(color.classList.contains('color-4')){
            firstHue = 352;
            secondHue = '87.2%';
            thirdHue = '45.9%';
        }else if(color.classList.contains('color-5')){
            firstHue = 209;
            secondHue = '78%';
            thirdHue = '57.3%';
        }

        color.classList.add('active');

        root.style.setProperty('--first-color-hue', firstHue);
        root.style.setProperty('--second-color-hue', secondHue);
        root.style.setProperty('--third-color-hue', thirdHue);
    })
})

// ==============Background Color================ //
const bg1 = document.querySelector(".bg-1");
const bg2 = document.querySelector(".bg-2");
const bg3 = document.querySelector(".bg-3");

let lightColorLightness;
let darkColorLightness;
let whiteColorLightness;

const changeBg = () => {
    root.style.setProperty('--light-color-lightness', lightColorLightness);
    root.style.setProperty('--dark-color-lightness', darkColorLightness);
    root.style.setProperty('--white-color-lightness', whiteColorLightness);
}

bg1.addEventListener('click', () => {

    darkColorLightness = '17%';
    whiteColorLightness = '100%';
    lightColorLightness = '95%';

    bg1.classList.add("active");

    bg2.classList.remove("active");
    bg3.classList.remove("active");

    // window.location.reload();
    changeBg();
})

bg2.addEventListener('click', () => {
    darkColorLightness = '95%';
    whiteColorLightness = '20%';
    lightColorLightness = '15%';

    bg2.classList.add("active");

    bg1.classList.remove("active");
    bg3.classList.remove("active");

    changeBg();
})

bg3.addEventListener('click', () => {
    darkColorLightness = '95%';
    whiteColorLightness = '10%';
    lightColorLightness = '0%';

    bg3.classList.add("active");

    bg1.classList.remove("active");
    bg2.classList.remove("active");

    changeBg();
})


//========================My Updates========================//
if(document.querySelector("#my-updates") && document.querySelector(".updates")){
    const myUpdates = document.querySelector("#my-updates");
    const updates = document.querySelector(".updates");

    const openMyUpdates = () => {
        updates.style.display = "grid";
        startSlides();
    }

    const closeMyUpdates = (e) => {
        if(e.target.classList.contains('updates')){
            updates.style.display = "none";
        }
    }

    const closeMyUpdatesTwo = (e) => {
        updates.style.display = "none";
    }

    myUpdates.addEventListener("click", openMyUpdates);
    updates.addEventListener("click", closeMyUpdates);

    var slideIndex = 0;
    var millis = 5000;
    var interval;

    function startSlides(){
        pauseSlides();
        nextSlide();
        interval = setInterval(nextSlide, millis);
    }

    function pauseSlides(){
        clearInterval(interval);
    }

    function nextSlide(){
        showSlide();
        slideIndex++;
    }

    function resumeSlides() {
        nextSlide();
    }

    function showSlide(){
        var i;
        var slides = document.getElementsByClassName("mySlide");

        for(i = 0; i < slides.length; i++){
            slides[i].style.display = "none";
        }

        if(slideIndex > slides.length) {
            slideIndex = 1;
        }

        if(slideIndex < 1){
            slideIndex = slides.length;
        }

        slides[slideIndex - 1].style.display = "block";
    }

    var closeUpdate = document.querySelectorAll(".back-button");

    closeUpdate.forEach(item => {
        item.addEventListener("click", closeMyUpdatesTwo);
    })

}

//=======================Contact List Modal========================//
if(document.querySelector("#contact-list") && document.querySelector(".close-contact")){
    const contactList = document.querySelector("#contact-list");
    const contactListModal = document.querySelector(".contact-list");
    const closeContact = document.querySelector(".close-contact");

    const openContactListModal = () => {
        contactListModal.style.display = "grid";
    }

    const closeContactListModal = (e) => {
        if(e.target.classList.contains('contact-list')){
            contactListModal.style.display = "none";
        }
    }

    const closeContactListModalTwo = () => {
        contactListModal.style.display = "none";
    }

    contactList.addEventListener("click", openContactListModal);
    contactListModal.addEventListener("click", closeContactListModal);
    closeContact.addEventListener("click", closeContactListModalTwo);
}


// ================Theme Customization========================== //
const theme = document.querySelector("#theme");
const themeModal = document.querySelector(".customize-theme");
const closeTheme = document.querySelector(".close-theme");

const openThemeModal = () => {
    themeModal.style.display = "grid";
}

const closeThemeModal = (e) => {
    if(e.target.classList.contains('customize-theme')){
        themeModal.style.display = "none";
    }
}

const closeThemeModalTwo = () => {
    themeModal.style.display = "none";
}

theme.addEventListener("click", openThemeModal);
themeModal.addEventListener("click", closeThemeModal);
closeTheme.addEventListener("click", closeThemeModalTwo);

// ==============Font size========= //

var root = document.querySelector(":root");
const fontSizes = document.querySelectorAll(".choose-size span");

const removeSizeSelector = () => {
    fontSizes.forEach(size => {
        size.classList.remove("active");
    })
}

fontSizes.forEach(size => {

    size.addEventListener('click', () => {

        removeSizeSelector();
        let fontSize;
        size.classList.toggle("active");

        if(size.classList.contains('font-size-1')){
            fontSize = '10px';
            root.style.setProperty('----sticky-top-left', '5.4rem');
            root.style.setProperty('----sticky-top-right', '5.4rem');
        }else if(size.classList.contains('font-size-2')){
            fontSize = '13px';
            root.style.setProperty('----sticky-top-left', '5.4rem');
            root.style.setProperty('----sticky-top-right', '-7rem');
        }else if(size.classList.contains('font-size-3')){
            fontSize = '16px';
            root.style.setProperty('----sticky-top-left', '-2rem');
            root.style.setProperty("----sticky-top-right", '-17rem');
        }else if(size.classList.contains('font-size-4')){
            fontSize = '17.5px';
            root.style.setProperty('----sticky-top-left', '-5rem');
            root.style.setProperty('----sticky-top-right', '-25rem');
        }

        document.querySelector('html').style.fontSize = fontSize;

    })
})

// ======================Filter Spaces========================= //
if(document.querySelector(".middle .space-body")){
    
    if(document.querySelector(".middle #audio_space")){
        const audioSpace = document.querySelector(".middle #audio_space");
        const audioSpaces = audioSpace.querySelectorAll(".audio-space-body");
        const middleMessageSearch = document.querySelector("#audio_space #message-searchs");

        const middleSearchMessage = () => {
        const vals = middleMessageSearch.value.toLowerCase();

            audioSpaces.forEach(user => {
                let name = user.querySelector('.body h3').textContent.toLowerCase();
                if(name.indexOf(vals) != -1){
                    user.style.display = "block";
                }else{
                    user.style.display = "none";
                }
            })
        }

        middleMessageSearch.addEventListener("keyup", middleSearchMessage);
    }
    
    if(document.querySelector(".middle #video_space")){
        const videoSpace = document.querySelector(".middle #video_space");
        const videoSpaces = videoSpace.querySelectorAll(".v-body");
        const middleMessageSearch = document.querySelector("#video_space #message-searchs");

        const middleSearchMessage = () => {
        const vals = middleMessageSearch.value.toLowerCase();

            videoSpaces.forEach(user => {
                let name = user.querySelector('.foot h3').textContent.toLowerCase();
                if(name.indexOf(vals) != -1){
                    user.style.display = "block";
                }else{
                    user.style.display = "none";
                }
            })
        }

        middleMessageSearch.addEventListener("keyup", middleSearchMessage);
    }
    
}

// =================Hide and Show message Chatroom =================//
if(document.querySelectorAll(".middle .message")){
    const chatLists = document.querySelectorAll(".middle .message");

    chatLists.forEach(item => {

        item.addEventListener("click", () => {
            document.querySelector(".middle").classList.add("open-chat");
        })
    })

    var closeChat = document.querySelector(".close-chat");

    closeChat.addEventListener("click", function(){
        document.querySelector(".middle").classList.remove("open-chat");
    })
}

// =================Filter Messages====================//
if(document.querySelector(".right .messages")){
    const message = document.querySelector(".right .messages");
    const messages = message.querySelectorAll(".message");
    const messageSearch = document.querySelector("#message-searchs");
    const searchMessage = () => {
        const val = messageSearch.value.toLowerCase();

        messages.forEach(user => {
            let name = user.querySelector('h5').textContent.toLowerCase();
            if(name.indexOf(val) != -1){
                user.style.display = "flex";
            }else{
                user.style.display = "none";
            }
        })
    }
    messageSearch.addEventListener("keyup", searchMessage);
}

    
if(document.querySelector(".middle .messages")){
    const middleMessage = document.querySelector(".middle .messages");
    const middleMessages = middleMessage.querySelectorAll(".message");
    const middleMessageSearch = document.querySelector("#message-search");
    const middleSearchMessage = () => {
        const vals = middleMessageSearch.value.toLowerCase();

        middleMessages.forEach(user => {
            let name = user.querySelector('h5').textContent.toLowerCase();
            if(name.indexOf(vals) != -1){
                user.style.display = "flex";
            }else{
                user.style.display = "none";
            }
        })
    }

    middleMessageSearch.addEventListener("keyup", middleSearchMessage);

}



// =====================Switch Tabs====================== //
function openTab(event, tabName){
    var i, postFeeds, tablinks;

    postFeeds = document.getElementsByClassName("postFeeds");

    for (i = 0; i < postFeeds.length; i++){
        postFeeds[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");

    for (i = 0; i < tablinks.length; i++){
        tablinks[i].className = tablinks[i].className.replace("active", "");
    }

    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}
function openTab2(event, tabName){
    var i, postFeeds2, tablinks;

    postFeeds2 = document.getElementsByClassName("postFeeds2");

    for (i = 0; i < postFeeds2.length; i++){
        postFeeds2[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks2");

    for (i = 0; i < tablinks.length; i++){
        tablinks[i].className = tablinks[i].className.replace("active", "");
    }

    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}

// =======================Closetabs in Forum=====================//
function closeTag(){
    var closeForum = document.getElementById("close-forums");
    var forumHead = document.getElementById("forum-heading");
    var angle1 = document.querySelector(".angle1");
    var angle2 = document.querySelector(".angle2");

    if(closeForum.style.display === "block"){
        closeForum.style.display = "none";
        forumHead.style.borderBottom = "none";
        forumHead.style.paddingBottom = "0";
        forumHead.style.marginBottom = "0.3rem";
        angle1.style.display = "none";
        angle2.style.display = "block";
    }else{
        closeForum.style.display = "block";
        forumHead.style.borderBottom = "1px solid var(--color-light)";
        forumHead.style.paddingBottom = "15px";
        forumHead.style.marginBottom = "1rem";
        angle1.style.display = "block";
        angle2.style.display = "none";
    }
}

// ===============Toggle Image======================= //
function toggleImg(obj){
    obj.classList.toggle("toggle");
}

// =====================Live Spaces==================== //
function videoSpace(){
    var videoSpace = document.querySelector(".video-space-modal");
    videoSpace.style.display = "grid";
}

function closeVideoSpaceModal(e){
    if(e.classList.contains('video-space-modal')){
        e.style.display = "none";
    }
}

function closeVideoSpaceModalTwo(){
    var videoSpace = document.querySelector(".video-space-modal");
    videoSpace.style.display = "none";
}

function space(){
    var createSpace = document.querySelector(".create-space");
    createSpace.style.display = "grid";
}

function closeSpaceModal(e){
    if(e.classList.contains('create-space')){
        e.style.display = "none";
    }
}

function closeSpaceModalTwo(){
    var createSpace = document.querySelector(".create-space");
    createSpace.style.display = "none";
}

function updateOption (obj){
    const selected = document.querySelector(".selected");
    var optionsContainer = document.querySelector(".options-container");

    selected.innerHTML = obj.querySelector("label").innerHTML + " <span class='fa fa-angle-down angle1'></span><span class='fa fa-angle-up angle2'></span>";
    
    optionsContainer.classList.remove("active");

    if(document.getElementById("myForum")){
        if(document.getElementById("myForum").checked){
            document.getElementById("myForums").style.display = "block";
        }else{
            document.getElementById("myForums").style.display = "none";
        }
    }else if(document.getElementById("myVideoForum")){
        if(document.getElementById("myVideoForum").checked){
            document.getElementById("myForums").style.display = "block";
        }else{
            document.getElementById("myForums").style.display = "none";
        }
    }else if(document.getElementById("others")){
        if(document.getElementById("others").checked){
            document.getElementById("category-text").style.display = "flex";
        }else{
            document.getElementById("category-text").style.display = "none";
        }
    }
    
}

function updateOption2 (obj){
    
    const selected2 = document.querySelector(".selected2");
    var optionsContainerForum = document.querySelector(".options-container-forum");

    selected2.innerHTML = obj.querySelector("label").innerHTML + " <span class='fa fa-angle-down angle3'></span><span class='fa fa-angle-up angle4'></span>";
    optionsContainerForum.classList.remove("active");
}

function updateVideoOption (obj){
    const selected = document.querySelector(".selected");
    var optionsContainer2 = document.querySelector(".options-container2");

    selected.innerHTML = obj.querySelector("label").innerHTML + " <span class='fa fa-angle-down angle1'></span><span class='fa fa-angle-up angle2'></span>";
    
    optionsContainer2.classList.remove("active");

    if(document.getElementById("myVideoForum")){
        if(document.getElementById("myVideoForum").checked){
            document.getElementById("myVideoForums").style.display = "block";
        }else{
            document.getElementById("myVideoForums").style.display = "none";
        }
    }
    
}

function updateVideoOption2 (obj){
    
    const selected2 = document.querySelector(".selected2");
    var optionsContainerVideoForum = document.querySelector(".options-container-video-forum");

    selected2.innerHTML = obj.querySelector("label").innerHTML + " <span class='fa fa-angle-down angle3'></span><span class='fa fa-angle-up angle4'></span>";
    optionsContainerVideoForum.classList.remove("active");
}

function toggleSpace() {
    var optionsContainer = document.querySelector(".options-container");

    optionsContainer.classList.toggle("active");

    if(optionsContainer.classList.contains("active")){
        document.querySelector(".selected .angle1").style.display = "none";
        document.querySelector(".selected .angle2").style.display = "block";
    }else{
        document.querySelector(".selected .angle1").style.display = "block";
        document.querySelector(".selected .angle2").style.display = "none";
    }
}

function toggleSpace2() {
    var optionsContainerForum = document.querySelector(".options-container-forum");

    optionsContainerForum.classList.toggle("active");

    if(optionsContainerForum.classList.contains("active")){
        document.querySelector(".selected2 .angle3").style.display = "none";
        document.querySelector(".selected2 .angle4").style.display = "block";
    }else{
        document.querySelector(".selected2 .angle3").style.display = "none";
        document.querySelector(".selected2 .angle4").style.display = "block";
    }
}

function toggleVideoSpace() {
    var optionsContainer2 = document.querySelector(".options-container2");

    optionsContainer2.classList.toggle("active");

    if(optionsContainer2.classList.contains("active")){
        document.querySelector(".selected .angle1").style.display = "none";
        document.querySelector(".selected .angle2").style.display = "block";
    }else{
        document.querySelector(".selected .angle1").style.display = "block";
        document.querySelector(".selected .angle2").style.display = "none";
    }
}

function toggleVideoSpace2() {
    var optionsContainerVideoForum = document.querySelector(".options-container-video-forum");

    optionsContainerVideoForum.classList.toggle("active");

    if(optionsContainerVideoForum.classList.contains("active")){
        document.querySelector(".selected2 .angle3").style.display = "none";
        document.querySelector(".selected2 .angle4").style.display = "block";
    }else{
        document.querySelector(".selected2 .angle3").style.display = "none";
        document.querySelector(".selected2 .angle4").style.display = "block";
    }
}
function a(){
    var b = document.getElementById("record");
    if(b.checked == true){
        b.checked = false;
    }   
}
function b(){
        var a = document.getElementById("check");
    if(a.checked == true){
        a.checked = false;
    }   
}
function displayHelpBox(){
    document.querySelector(".help-box").style.display = "block";
}
function undisplayHelpBox(){
    document.querySelector(".help-box").style.display = "none";
}

// ================Help Questions =============== //
function closeQuestion(e){
    var questionOne = document.getElementById("question-one");
    questionOne.classList.toggle("close");

    if(e.classList.contains("fa-plus")){
        e.classList.replace("fa-plus", "fa-minus");
    }else{
        e.classList.replace("fa-minus", "fa-plus");
    }
}
function closeQuestionTwo(e){
    var questionTwo = document.getElementById("question-two");
    questionTwo.classList.toggle("close");

    if(document.querySelector("#question-two .answer").style.display == "none"){
        document.querySelector("#question-two .answer").style.display = "block";
    }else{
        document.querySelector("#question-two .answer").style.display = "none";
    }

    if(e.classList.contains("fa-plus")){
        e.classList.replace("fa-plus", "fa-minus");
    }else{
        e.classList.replace("fa-minus", "fa-plus");
    }
}
function closeQuestionThree(e){
    var questionThree = document.getElementById("question-three");
    questionThree.classList.toggle("close");

    if(document.querySelector("#question-three .answer").style.display == "none"){
        document.querySelector("#question-three .answer").style.display = "block";
    }else{
        document.querySelector("#question-three .answer").style.display = "none";
    }

    if(e.classList.contains("fa-plus")){
        e.classList.replace("fa-plus", "fa-minus");
    }else{
        e.classList.replace("fa-minus", "fa-plus");
    }
}
function closeAccount(e){
    var accountOne = document.getElementById("account-one");
    accountOne.classList.toggle("close");

    if(e.classList.contains("fa-plus")){
        e.classList.replace("fa-plus", "fa-minus");
    }else{
        e.classList.replace("fa-minus", "fa-plus");
    }
}
function closeAccountTwo(e){
    var accountTwo = document.getElementById("account-two");
    accountTwo.classList.toggle("close");

    if(document.querySelector("#account-two .answer").style.display == "none"){
        document.querySelector("#account-two .answer").style.display = "block";
    }else{
        document.querySelector("#account-two .answer").style.display = "none";
    }

    if(e.classList.contains("fa-plus")){
        e.classList.replace("fa-plus", "fa-minus");
    }else{
        e.classList.replace("fa-minus", "fa-plus");
    }
}
function closeAccountThree(e){
    var accountThree = document.getElementById("account-three");
    accountThree.classList.toggle("close");

    if(document.querySelector("#account-three .answer").style.display == "none"){
        document.querySelector("#account-three .answer").style.display = "block";
    }else{
        document.querySelector("#account-three .answer").style.display = "none";
    }

    if(e.classList.contains("fa-plus")){
        e.classList.replace("fa-plus", "fa-minus");
    }else{
        e.classList.replace("fa-minus", "fa-plus");
    }
}

// ================== Help Center====================== //
function altEmail(){
    document.getElementById("alt-email").style.display = "flex";
}

function closeAltEmail(){
    document.getElementById("alt-email").style.display = "none";
}

// ====================Show Profile======================= //
function showProfile (){
    document.querySelector(".user-chatroom").classList.add("show-profile");
}
function closeProfile(){
    document.querySelector(".user-chatroom").classList.replace("show-profile","close-profile");
}

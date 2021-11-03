const side = document.querySelector(".navbar");
const ham = document.getElementById("ham");
const cross = document.querySelector(".mycross");
const over = document.querySelector(".overlay");
side.classList.toggle("mydisp");
ham.classList.remove("mydisp");
ham.addEventListener("click", function() {
    side.classList.toggle("mydisp");
    if (side.classList.contains("mydisp")) {
        cross.classList.remove("showdisp");
        over.classList.remove("showdisp");
        ham.classList.remove("mydisp");
    } else {
        cross.classList.add("showdisp");
        over.classList.add("showdisp");
        ham.classList.add("mydisp");
    }
});
cross.addEventListener("click", function() {
    side.classList.toggle("mydisp");
    if (side.classList.contains("mydisp")) {
        cross.classList.remove("showdisp");
        over.classList.remove("showdisp");
        ham.classList.remove("mydisp");
    } else {
        cross.classList.add("showdisp");
        over.classList.add("showdisp");
        ham.classList.add("mydisp");
    }
});
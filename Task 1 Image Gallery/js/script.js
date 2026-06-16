// Get elements
let gallery = document.getElementById("gallery");
let items = document.querySelectorAll(".gallery-item");
let lightbox = document.getElementById("lightbox");
let lightboxImg = document.getElementById("lightbox-img");
let closeBtn = document.getElementById("close");
let prevBtn = document.getElementById("prev");
let nextBtn = document.getElementById("next");

let currentList = [];    // currently visible items
let currentIndex = 0;

// Update visible items based on filter
function filterItems(category) {
    currentList = [];
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let cat = item.getAttribute("data-category");
        if (category === "all" || cat === category) {
            item.style.display = "block";
            currentList.push(item);
        } else {
            item.style.display = "none";
        }
    }
}

// Open lightbox with clicked image
function openLightbox(index) {
    currentIndex = index;
    let img = currentList[currentIndex].querySelector("img");
    lightboxImg.src = img.src;
    lightbox.style.display = "flex";
}

// Close lightbox
function closeLightbox() {
    lightbox.style.display = "none";
}

// Next image
function nextImage() {
    currentIndex = (currentIndex + 1) % currentList.length;
    let img = currentList[currentIndex].querySelector("img");
    lightboxImg.src = img.src;
}

// Previous image
function prevImage() {
    currentIndex = (currentIndex - 1 + currentList.length) % currentList.length;
    let img = currentList[currentIndex].querySelector("img");
    lightboxImg.src = img.src;
}

// Add click listeners to each gallery item
for (let i = 0; i < items.length; i++) {
    items[i].onclick = (function(idx) {
        return function() { openLightbox(idx); };
    })(i);
}

// Filter buttons
let btns = document.querySelectorAll(".filters button");
for (let btn of btns) {
    btn.onclick = function() {
        for (let b of btns) b.classList.remove("active");
        this.classList.add("active");
        let filter = this.getAttribute("data-filter");
        filterItems(filter);
    };
}

// Event listeners for lightbox controls
closeBtn.onclick = closeLightbox;
prevBtn.onclick = prevImage;
nextBtn.onclick = nextImage;

// Close lightbox when clicking background
lightbox.onclick = function(e) {
    if (e.target === lightbox) closeLightbox();
};

// Keyboard controls
document.onkeydown = function(e) {
    if (lightbox.style.display === "flex") {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") prevImage();
        if (e.key === "ArrowRight") nextImage();
    }
};

// Initialize: show all images
filterItems("all");
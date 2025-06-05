let rooms = 1;
let adults = 2;
let children = 0;

// Guest Button and Dropdown
const guestBtn = document.getElementById("guest-btn");
const dropdown = document.querySelector(".dropdown-content");

guestBtn.addEventListener("click", function () {
    const buttonRect = guestBtn.getBoundingClientRect();
    dropdown.style.left = `${buttonRect.left}px`;
    dropdown.style.top = `${buttonRect.bottom + window.scrollY + 8}px`;
    dropdown.classList.toggle("show");
});

document.addEventListener("click", function (event) {
    if (!dropdown.contains(event.target) && !guestBtn.contains(event.target)) {
        dropdown.classList.remove("show");
    }
});


// Add event listeners for increment/decrement buttons
document.querySelectorAll(".btn").forEach(button => {
    button.addEventListener("click", function () {
        const type = this.getAttribute("data-type");
        const change = parseInt(this.getAttribute("data-change"), 10);
        updateValue(type, change);
    });
});

// Update guest counts
function updateValue(type, change) {
    const element = document.getElementById(type);
    let value = parseInt(element.innerText) + change;
    if (value < 0) value = 0; // Prevent negative values
    element.innerText = value;

    if (type === "rooms") rooms = value;
    if (type === "adults") adults = value;
    if (type === "children") children = value;

    updateDropdown();
}

// Update dropdown text and hidden inputs
function updateDropdown() {
    document.getElementById("guest-btn").innerText = `${rooms} room, ${adults} adults, ${children} children`;
    document.getElementById("hidden-rooms-select").value = rooms;
    document.getElementById("hidden-adults-select").value = adults;
    document.getElementById("hidden-children-select").value = children;
}

// Prepare and send form submission
function prepareFormSubmission(event) {
    event.preventDefault();

    const data = {
        rooms: rooms,
        adults: adults,
        children: children
    };

    fetch('/book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('Booking successful!');
            } else {
                alert('Error booking. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error with booking request:', error);
            alert('Something went wrong! Please try again.');
        });
}

// Add event listener to the form submit button
const bookNowBtn = document.getElementById("book-now-btn");
if (bookNowBtn) {
    bookNowBtn.addEventListener('click', prepareFormSubmission);
}


/**
 * navbar toggle
 */

const overlay = document.querySelector("[data-overlay]");
const navOpenBtn = document.querySelector("[data-nav-open-btn]");
const navbar = document.querySelector("[data-navbar]");
const navCloseBtn = document.querySelector("[data-nav-close-btn]");
const navLinks = document.querySelectorAll("[data-nav-link]");

const navElemArr = [navOpenBtn, navCloseBtn, overlay];

const navToggleEvent = function (elem) {
    for (let i = 0; i < elem.length; i++) {
        elem[i].addEventListener("click", function () {
            navbar.classList.toggle("active");
            overlay.classList.toggle("active");
        });
    }
}

navToggleEvent(navElemArr);
navToggleEvent(navLinks);

/**
 * header sticky & go to top
 */

const header = document.querySelector("[data-header]");
const goTopBtn = document.querySelector("[data-go-top]");

window.addEventListener("scroll", function () {
    if (window.scrollY >= 200) {
        header.classList.add("active");
        goTopBtn.classList.add("active");
    } else {
        header.classList.remove("active");
        goTopBtn.classList.remove("active");
    }
});



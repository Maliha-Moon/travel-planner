
document.addEventListener("DOMContentLoaded", function () {
  // Get the modal elements
  const loginModal = document.getElementById("loginModal");
  const registerModal = document.getElementById("registerModal");
  const closeModalBtns = document.querySelectorAll("[data-close-modal]");

  // Open modal functions
  const openLoginModal = function () {
    loginModal.style.display = "block"; // Show login modal
  };

  const openRegisterModal = function () {
    registerModal.style.display = "block"; // Show register modal
  };

  // Close modal function
  const closeModal = function () {
    loginModal.style.display = "none"; // Hide login modal
    registerModal.style.display = "none"; // Hide register modal
  };

  // Add event listeners to buttons
  const loginBtn = document.querySelector(".login-btn");
  const registerBtn = document.querySelector(".register-btn");

  loginBtn.addEventListener("click", openLoginModal);
  registerBtn.addEventListener("click", openRegisterModal);

  // Event listener for close buttons
  closeModalBtns.forEach(button => {
    button.addEventListener("click", closeModal);
  });

  // Optionally, close modal when clicking outside of it
  window.addEventListener("click", function (event) {
    if (event.target === loginModal || event.target === registerModal) {
      closeModal();
    }
  });

  /* 
     *Handle Login Form Submission
  */
  const loginForm = document.querySelector("#loginModal form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const loginUsername = document.getElementById('loginUsername').value;
      const loginPassword = document.getElementById('loginPassword').value;

      try {
        const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const result = await response.json(); // assuming response is JSON

        if (response.ok) {
          alert('Login successful!');
          closeModal(); // Close the modal after successful login
        } else {
          alert(result.message || 'Login failed. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    });
  }

  // Handle Register Form Submission
const registerForm = document.querySelector("#registerModal form");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Prevent default form submission

        // Get form data
        const registerUsername = document.getElementById('registerUsername').value;
        const email = document.getElementById('email').value;
        const registerPassword = document.getElementById('registerPassword').value;

        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: registerUsername,
                    email: email,
                    password: registerPassword
                }),
            });

            const result = await response.json(); // Get the response body

            if (response.ok) {
                alert('Registration successful! Please log in.');
                // Close modal or redirect
                closeModal(); // Call your modal closing function here
            } else {
                alert(result.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    });
}


});


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
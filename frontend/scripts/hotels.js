document.addEventListener("DOMContentLoaded", function () {
    // Function to handle hotel click
    const hotels = document.querySelectorAll(".hotel");
    hotels.forEach((hotel, index) => {
      hotel.addEventListener("click", function () {
        // Assume each hotel has a unique ID or index
        const hotelDetails = {
          id: index + 1,
          name: hotel.querySelector("h3").innerText,
          price: hotel.querySelector(".hotel-price h4").innerText,
          description: hotel.querySelector("p:nth-of-type(2)").innerText,
          image: hotel.querySelector("img").src,
        };
  
        // Save hotel details in localStorage to pass to the details page
        localStorage.setItem("selectedHotel", JSON.stringify(hotelDetails));
  
        // Redirect to hotel details page
        window.location.href = "hotel_details.html"; // Update this URL as needed
      });
    });
  
    // Sidebar filter functionality
    const filters = document.querySelectorAll(".filter input");
    filters.forEach((filter) => {
      filter.addEventListener("change", function () {
        applyFilters();
      });
    });
  
    // Function to apply filters
    function applyFilters() {
      const selectedFilters = {
        propertyType: [],
        amenities: [],
      };
  
      // Collect selected property types and amenities
      filters.forEach((filter) => {
        if (filter.checked) {
          const id = filter.id;
          if (["house", "hostel", "cottage", "villa", "guest-suit"].includes(id)) {
            selectedFilters.propertyType.push(id);
          } else {
            selectedFilters.amenities.push(id);
          }
        }
      });
  
      // Filter hotels based on selected filters
      hotels.forEach((hotel) => {
        const propertyType = hotel.querySelector("h3").innerText.toLowerCase();
        const amenities = hotel.querySelector("p:nth-of-type(2)").innerText.toLowerCase();
        let matchesFilter = true;
  
        if (
          selectedFilters.propertyType.length &&
          !selectedFilters.propertyType.some((type) =>
            propertyType.includes(type)
          )
        ) {
          matchesFilter = false;
        }
  
        if (
          selectedFilters.amenities.length &&
          !selectedFilters.amenities.every((amenity) =>
            amenities.includes(amenity)
          )
        ) {
          matchesFilter = false;
        }
  
        // Show or hide hotels based on filter match
        hotel.style.display = matchesFilter ? "flex" : "none";
      });
    }
  });
  
  document.getElementById('submitHotel').addEventListener('click', async () => {
    // Extract data from DOM
    const hotelName = "Example Hotel Name"; // Replace with your dynamic hotel name source if applicable
    const roomPriceText = document.querySelector('.hotel-price .price').textContent;
    const roomPrice = parseFloat(roomPriceText.replace('TK', '').trim()); // Extract and clean price
    const childCharge = 0; // If there's a child charge, extract it similarly

    // Prepare the data to send to the backend
    const hotelData = {
        name: hotelName,
        room_price_per_day: roomPrice,
        child_charge_per_day: childCharge,
    };

    try {
        // Send the data to the backend using fetch
        const response = await fetch('/hotels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(hotelData),
        });

        if (response.ok) {
            alert('Hotel info saved successfully!');
        } else {
            alert('Error saving hotel info');
        }
    } catch (error) {
        console.error('Error:', error);
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
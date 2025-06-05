document.getElementById('ticket-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const destination = document.getElementById('destination').value;
    const departureDate = document.getElementById('departure-date').value;
    const passengerCount = document.getElementById('passenger-count').value;

    if (destination && departureDate && passengerCount) {
        // Create data object to send to backend
        const ticketData = {
            destination: destination,
            departure_date: departureDate,
            passenger_count: passengerCount
        };

        // Send data to the backend using fetch
        fetch('server_endpoint_for_ticket_booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketData) // Convert data object to JSON string
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Ticket booked successfully!');
            } else {
                alert('There was an error booking your ticket.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error booking your ticket.');
        });
    } else {
        alert('Please fill all the fields');
    }
});

document.getElementById('car-rental-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const pickupLocation = document.getElementById('pickup-location').value;
    const pickupDate = document.getElementById('pickup-date').value;
    const dropoffDate = document.getElementById('dropoff-date').value;

    if (pickupLocation && pickupDate && dropoffDate) {
        // Create data object to send to backend
        const carRentalData = {
            pickup_location: pickupLocation,
            pickup_date: pickupDate,
            dropoff_date: dropoffDate
        };

        // Send data to the backend using fetch
        fetch('server_endpoint_for_car_rental', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(carRentalData) // Convert data object to JSON string
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Car rented successfully!');
            } else {
                alert('There was an error renting the car.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error renting the car.');
        });
    } else {
        alert('Please fill all the fields');
    }
});

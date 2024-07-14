const API_BASE_URL = 'http://localhost:5001';
const API_TOKEN = '0dbfdf0fd2400f31e9f8f183d73865b91f1dd3b4';

// Function to fetch and display properties
function fetchProperties() {
    fetch(`${API_BASE_URL}/api/properties`, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        const listingsContainer = document.getElementById('latest-listings');
        listingsContainer.innerHTML = '';
        data.forEach(property => {
            const propertyElement = document.createElement('div');
            propertyElement.className = 'property';

            propertyElement.innerHTML = `
                <h3>${property.name}</h3>
                <p>${property.description}</p>
                <p>Price: $${property.price}</p>
                <img src="${property.imageUrl}" alt="${property.name}">
            `;

            listingsContainer.appendChild(propertyElement);
        });
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        const listingsContainer = document.getElementById('latest-listings');
        listingsContainer.innerHTML = '<p>Error loading properties. Please try again later.</p>';
    });
}

// Call the function to fetch properties when the page loads
document.addEventListener('DOMContentLoaded', fetchProperties);
document.addEventListener('DOMContentLoaded', function() {
    const hobbiesList = [
        "coding", "reading", "watching stuff", "crocheting", "drawing/painting",
        "singing", "writing", "tennis", "football", "basketball", "badminton",
        "squash", "volleyball", "frisbee", "throwball"
    ];

    const topicsList = [
        "fashion", "clubs/departments", "politics", "pop culture", "world wars",
        "history", "cricket", "Football (as a topic)", "current affairs"
    ];

    const hobbiesContainer = document.getElementById('hobbies-container');
    const topicsContainer = document.getElementById('topics-container');

    function createCheckboxes(container, items, name) {
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'checkbox-group';
            div.innerHTML = `
                <input type="checkbox" id="${item}" name="${name}" value="${item}">
                <label for="${item}">${item}</label>
            `;
            container.appendChild(div);
        });
    }

    createCheckboxes(hobbiesContainer, hobbiesList, 'hobbies');
    createCheckboxes(topicsContainer, topicsList, 'topics');

    document.getElementById('questionnaireForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        
        // Handle multiple selections for hobbies and topics
        data.hobbies = formData.getAll('hobbies');
        data.topics = formData.getAll('topics');

        console.log('Form data:', data);
        
        // Here you would typically send the data to your backend
        // For now, we'll just log it and redirect to the dashboard
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    });
});
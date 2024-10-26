document.addEventListener('DOMContentLoaded', function() {
    // Get user's email from JWT token
    const token = localStorage.getItem('access_token');
    let userEmail = '';
    
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userEmail = payload.email;
        } catch (error) {
            console.error('Error decoding token:', error);
            window.location.href = 'index.html';
            return;
        }
    } else {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('questionnaireForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Collect form data
        const formData = {
            name: document.getElementById('name').value,
            department: document.getElementById('department').value,
            year: document.getElementById('year').value,
            interests: Array.from(document.querySelectorAll('input[name="interests"]:checked'))
                .map(checkbox => checkbox.value),
            about: document.getElementById('about').value
        };

        try {
            const response = await fetch('http://localhost:3000/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userEmail,
                    answers: formData
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                alert('Questionnaire submitted successfully!');
                form.reset();
            } else {
                throw new Error(data.error || 'Something went wrong');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting questionnaire. Please try again.');
        }
    });
});
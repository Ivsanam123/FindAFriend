function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    // Store the token in localStorage
    localStorage.setItem('access_token', response.credential);
    console.log("User logged in successfully");
    // Redirect to dashboard after successful login
    window.location.href = 'dashboard.html';
}

window.onload = function () {
    google.accounts.id.initialize({
        client_id: '438702058106-br97sspq1g1vp81sk8h8hpk99f49t91c.apps.googleusercontent.com', // Provided Google Client ID
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin'
    });
    google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { 
            theme: "filled_blue",
            size: "large",
            width: 250,
            shape: "rectangular",
            text: "continue_with",
            logo_alignment: "left"
        }
    );

    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    if (token) {
        window.location.href = 'dashboard.html';
    } else {
        google.accounts.id.prompt();
    }
}

// Add click event listener to custom button
document.addEventListener('DOMContentLoaded', function() {
    const googleBtn = document.getElementById('googleBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            google.accounts.id.prompt();
        });
    }
});
# Find A Friend - Login Page

This project implements a login page using Google OAuth for the "Find A Friend" application.

## Local Development

To run this project locally:

1. Make sure you have Python installed on your system.
2. Open a command prompt or terminal.
3. Navigate to the `login-page` directory.
4. Install the required Python package:
   ```
   pip install pyopenssl
   ```
5. Generate a self-signed SSL certificate (required for HTTPS):
   ```
   openssl req -x509 -newkey rsa:4096 -nodes -out localhost.pem -keyout localhost.pem -days 365
   ```
   Follow the prompts, using "localhost" as the Common Name.
6. Run the following command to start the local server:
   ```
   python server.py
   ```
7. Open a web browser and go to `https://localhost:8000`

Note: You may see a security warning in your browser because of the self-signed certificate. This is normal for local development. You can proceed to the site safely.

## Google OAuth Setup

Before the login functionality will work, you need to set up Google OAuth:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to the "APIs & Services" > "Credentials" section.
4. Click on "Create Credentials" and select "OAuth client ID".
5. Choose "Web application" as the application type.
6. Add "https://localhost:8000" to the list of authorized JavaScript origins.
7. Add "https://localhost:8000/dashboard.html" to the authorized redirect URIs.
8. After creating the client ID, you'll receive a client ID.
9. Replace 'YOUR_GOOGLE_CLIENT_ID' in the `script.js` file with your actual client ID.

## Production Deployment

For production deployment on GitHub Pages:

1. Create a new GitHub repository.
2. Push the contents of the `login-page` directory to this repository.
3. Go to the repository settings on GitHub.
4. In the "Pages" section, enable GitHub Pages and select the main branch as the source.
5. Your site will be published at `https://[your-username].github.io/[repository-name]/`

Remember to update the authorized JavaScript origins and redirect URIs in your Google Cloud Console project to include your GitHub Pages URL for the Google OAuth to work on the hosted site.
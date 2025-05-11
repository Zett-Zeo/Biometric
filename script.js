// Configuration
const SPREADSHEET_ID = '1438sgdxp_DGoVWOTyd226gzgfsiSN6vbfZUipU74JfQ';
const API_KEY = 'AIzaSyA8mQDaF3XJppFt6qam-ByHkiK4UG03fj4';
const SHEET_NAME = 'Users';

// DOM Elements
const authContainer = document.getElementById('authContainer');
const formContainer = document.getElementById('formContainer');
const authBtn = document.getElementById('authBtn');
const authStatus = document.getElementById('authStatus');
const secureForm = document.getElementById('secureForm');
const formStatus = document.getElementById('formStatus');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if already authenticated
    if (localStorage.getItem('fingerprintAuthenticated') === 'true') {
        showForm();
    }
    
    // Setup fingerprint auth button
    authBtn.addEventListener('click', handleFingerprintAuth);
    
    // Setup form submission
    secureForm.addEventListener('submit', handleFormSubmit);
});

// Fingerprint Authentication
async function handleFingerprintAuth() {
    try {
        authBtn.classList.add('loading');
        authStatus.textContent = '';
        authStatus.className = 'status';
        
        // Check if WebAuthn is supported
        if (!window.PublicKeyCredential) {
            throw new Error('Browser does not support Web Authentication API');
        }
        
        // Get existing credentials from Google Sheets
        const credentials = await getCredentialsFromSheet();
        
        if (credentials.length === 0) {
            // No credentials found - register new user
            await registerNewCredential();
        } else {
            // Credentials exist - authenticate
            await authenticateWithCredential(credentials);
        }
        
        // Authentication successful
        localStorage.setItem('fingerprintAuthenticated', 'true');
        showForm();
    } catch (error) {
        console.error('Authentication failed:', error);
        authStatus.textContent = error.message || 'Authentication failed';
        authStatus.className = 'status error';
    } finally {
        authBtn.classList.remove('loading');
    }
}

// Get credentials from Google Sheet
async function getCredentialsFromSheet() {
    try {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A2:C?key=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch credentials');
        }
        
        const data = await response.json();
        return data.values || [];
    } catch (error) {
        console.error('Error fetching credentials:', error);
        return [];
    }
}

// Register new credential
async function registerNewCredential() {
    authStatus.textContent = 'No existing credential found. Registering new fingerprint...';
    authStatus.className = 'status';
    
    // In a real implementation, you would use the WebAuthn API here
    // For demo purposes, we'll simulate this with a timeout
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a mock credential ID
    const credentialId = generateId();
    const userId = generateId();
    const username = `user_${Math.floor(Math.random() * 10000)}`;
    
    // Save to Google Sheet
    await saveCredentialToSheet(userId, username, credentialId);
    
    authStatus.textContent = 'Fingerprint registered successfully!';
    authStatus.className = 'status success';
}

// Authenticate with existing credential
async function authenticateWithCredential(credentials) {
    authStatus.textContent = 'Authenticating with fingerprint...';
    authStatus.className = 'status';
    
    // In a real implementation, you would use the WebAuthn API here
    // For demo purposes, we'll simulate this with a timeout
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Randomly succeed or fail for demo
    if (Math.random() > 0.1) { // 90% success rate for demo
        authStatus.textContent = 'Authentication successful!';
        authStatus.className = 'status success';
    } else {
        throw new Error('Fingerprint authentication failed. Please try again.');
    }
}

// Save credential to Google Sheet
async function saveCredentialToSheet(userId, username, credentialId) {
    const values = [[userId, username, credentialId]];
    
    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A2:C:append?valueInputOption=USER_ENTERED&key=${API_KEY}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: values,
            }),
        }
    );
    
    if (!response.ok) {
        throw new Error('Failed to save credential');
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = secureForm.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    formStatus.textContent = '';
    formStatus.className = 'status';
    
    try {
        // Get form data
        const formData = new FormData(secureForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message'),
            timestamp: new Date().toISOString(),
        };
        
        // In a real app, you would send this to your backend
        // For demo, we'll just show a success message
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        formStatus.textContent = 'Form submitted successfully!';
        formStatus.className = 'status success';
        secureForm.reset();
    } catch (error) {
        console.error('Form submission failed:', error);
        formStatus.textContent = 'Form submission failed. Please try again.';
        formStatus.className = 'status error';
    } finally {
        submitBtn.classList.remove('loading');
    }
}

// Helper functions
function showForm() {
    authContainer.style.display = 'none';
    formContainer.style.display = 'block';
}

function generateId() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
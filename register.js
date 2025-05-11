// Configuration
const SPREADSHEET_ID = '1438sgdxp_DGoVWOTyd226gzgfsiSN6vbfZUipU74JfQ';
const API_KEY = 'AIzaSyA8mQDaF3XJppFt6qam-ByHkiK4UG03fj4';
const SHEET_NAME = 'Users';

// DOM Elements
const registrationForm = document.getElementById('registrationForm');
const accountSection = document.getElementById('accountSection');
const biometricSection = document.getElementById('biometricSection');
const completeSection = document.getElementById('completeSection');
const nextBtn1 = document.getElementById('nextBtn1');
const backBtn1 = document.getElementById('backBtn1');
const registerBiometricBtn = document.getElementById('registerBiometricBtn');
const finishBtn = document.getElementById('finishBtn');
const statusMessage = document.getElementById('statusMessage');
const progressBar = document.getElementById('progressBar');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');

// Current step tracking
let currentStep = 1;
let userData = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Setup button event listeners
    nextBtn1.addEventListener('click', handleNextStep1);
    backBtn1.addEventListener('click', handleBackStep1);
    registerBiometricBtn.addEventListener('click', handleBiometricRegistration);
    finishBtn.addEventListener('click', handleFinish);
    
    // Update progress bar
    updateProgress();
});

// Handle next button from account section
async function handleNextStep1() {
    try {
        nextBtn1.classList.add('loading');
        statusMessage.textContent = '';
        statusMessage.className = 'status';
        
        // Validate form
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        
        if (!username || !email) {
            throw new Error('Please fill in all fields');
        }
        
        if (!validateEmail(email)) {
            throw new Error('Please enter a valid email address');
        }
        
        // Check if username/email already exists (in a real app, you'd call your backend)
        const credentials = await getCredentialsFromSheet();
        if (credentials.some(cred => cred[1] === username)) {
            throw new Error('Username already exists');
        }
        
        if (credentials.some(cred => cred[3] === email)) { // Assuming email is in column D
            throw new Error('Email already registered');
        }
        
        // Store user data
        userData = { username, email };
        
        // Proceed to next step
        currentStep = 2;
        updateProgress();
        accountSection.classList.remove('active');
        biometricSection.classList.add('active');
        
    } catch (error) {
        console.error('Error:', error);
        statusMessage.textContent = error.message;
        statusMessage.className = 'status error';
    } finally {
        nextBtn1.classList.remove('loading');
    }
}

// Handle back button from biometric section
function handleBackStep1() {
    currentStep = 1;
    updateProgress();
    biometricSection.classList.remove('active');
    accountSection.classList.add('active');
}

// Handle biometric registration
async function handleBiometricRegistration() {
    try {
        registerBiometricBtn.classList.add('loading');
        statusMessage.textContent = '';
        statusMessage.className = 'status';
        
        // Check if WebAuthn is supported
        if (!window.PublicKeyCredential) {
            throw new Error('Browser does not support Web Authentication API');
        }
        
        // In a real implementation, you would use the WebAuthn API here
        // For demo purposes, we'll simulate this with a timeout
        
        statusMessage.textContent = 'Please follow your device prompts to register your fingerprint...';
        statusMessage.className = 'status';
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate mock credential data
        const userId = generateId();
        const credentialId = generateId();
        
        // Save to Google Sheet
        await saveCredentialToSheet(
            userId, 
            userData.username, 
            credentialId, 
            userData.email
        );
        
        // Proceed to completion
        currentStep = 3;
        updateProgress();
        biometricSection.classList.remove('active');
        completeSection.classList.add('active');
        
    } catch (error) {
        console.error('Biometric registration failed:', error);
        statusMessage.textContent = error.message || 'Biometric registration failed';
        statusMessage.className = 'status error';
    } finally {
        registerBiometricBtn.classList.remove('loading');
    }
}

// Handle finish button
function handleFinish() {
    // Redirect to login page or wherever appropriate
    window.location.href = 'index.html';
}

// Get credentials from Google Sheet
async function getCredentialsFromSheet() {
    try {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A2:D?key=${API_KEY}`
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

// Save credential to Google Sheet
async function saveCredentialToSheet(userId, username, credentialId, email) {
    const values = [[userId, username, credentialId, email]];
    
    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A2:D:append?valueInputOption=USER_ENTERED&key=${API_KEY}`,
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

// Update progress bar and steps
function updateProgress() {
    // Update progress bar width
    const progressWidth = ((currentStep - 1) / 2) * 100;
    progressBar.style.width = `${progressWidth}%`;
    
    // Update step indicators
    step1.className = currentStep >= 1 ? 'step active' : 'step';
    step2.className = currentStep >= 2 ? 'step active' : 'step';
    step3.className = currentStep >= 3 ? 'step completed' : 'step';
    
    if (currentStep === 3) {
        step2.className = 'step completed';
    }
}

// Helper functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function generateId() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
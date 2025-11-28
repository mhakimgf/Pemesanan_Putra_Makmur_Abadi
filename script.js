// IMPORTANT: Replace with your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwaTstwRCcUgnfP982JS5XzsnQAF7WwWTFvViRe7sF4-0YAA0tBawFTV7sumVJ-tQparg/exec';

// Contact configuration - ganti sesuai kebutuhan
const CONTACT_EMAIL = 'mhakimgf@gmail.com';
const CONTACT_SUBJECT = 'Contact Support: Pesanan Putra Makmur Abadi';

function selectColor(element, color) {
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    element.querySelector('input').checked = true;
}

// Handle contact button
document.querySelector('.contact-btn').addEventListener('click', function() {
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&su=${encodeURIComponent(CONTACT_SUBJECT)}`;
    window.open(gmailComposeUrl, '_blank');
});

document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // Add timestamp
    const now = new Date();
    // Processing data format to id
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp =
    pad(now.getDate()) + '/' +
    pad(now.getMonth() + 1) + '/' +
    now.getFullYear() + ' ' +
    pad(now.getHours()) + ':' +
    pad(now.getMinutes()) + ':' +
    pad(now.getSeconds());

    data.timestamp = timestamp;
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Show success message
        document.getElementById('successMessage').style.display = 'block';
        this.reset();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            document.getElementById('successMessage').style.display = 'none';
        }, 5000);
        
    } catch (error) {
        alert('Error submitting form. Please try again.');
        console.error('Error:', error);
    }
});
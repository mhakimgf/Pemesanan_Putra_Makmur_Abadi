

//-----------------CONFIGURATION-----------------//
// IMPORTANT: Replace with your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8rJedGnKmSSZCFnYnbEX5TONDdzZLsidP2jVibIwqnkCq9yshOhXu5-4oKRbBWLY2qA/exec';

// Contact configuration - ganti sesuai kebutuhan
const CONTACT_EMAIL = 'mhakimgf@gmail.com';
const CONTACT_SUBJECT = 'Contact Support: Pesanan Putra Makmur Abadi';

// Price configuration
const PRICE_PER_M = 10000;
//-----------------END CONFIGURATION-----------------//

function selectColor(element, color) {
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    element.querySelector('input').checked = true;
}

// Add event listener when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const quantityInput = document.querySelector('input[name="quantity"]');
    
    if (quantityInput) {
        quantityInput.addEventListener('input', calculateTotal);
        quantityInput.addEventListener('change', calculateTotal);
    }
});

// Handle contact button
document.querySelector('.contact-btn').addEventListener('click', function() {
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&su=${encodeURIComponent(CONTACT_SUBJECT)}`;
    window.open(gmailComposeUrl, '_blank');
});

// Format number to Rupiah
function formatRupiah(number) {
    return 'Rp. ' + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Calculate total price
function calculateTotal() {
    const quantityInput = document.querySelector('input[name="quantity"]');
    const totalDisplay = document.getElementById('totalDisplay');
    const totalValue = document.getElementById('totalValue');
    
    const quantity = parseFloat(quantityInput.value) || 0;
    const total = quantity * PRICE_PER_M;
    
    if (quantity > 0) {
        totalDisplay.value = formatRupiah(total); // Display formatted
        totalValue.value = parseFloat(total); // Store integer for Excel
    } else {
        totalDisplay.value = '';
        totalValue.value = '';
    }
}

// Convert file to Base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Handle form submission
document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const successMsg = document.getElementById('successMessage');
    const loadingMsg = document.getElementById('loadingMessage');
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerText = 'PROCESSING...';
    loadingMsg.style.display = 'block';
    successMsg.style.display = 'none';
    
    try {
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Add timestamp
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const timestamp =
        pad(now.getDate()) + '/' +
        pad(now.getMonth() + 1) + '/' +
        now.getFullYear() + ' ' +
        pad(now.getHours()) + ':' +
        pad(now.getMinutes()) + ':' +
        pad(now.getSeconds());

        data.timestamp = timestamp;

        // HANDLE FILE UPLOAD
        const fileInput = document.getElementById('paymentProof');
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];

            // Validation: Max 2MB
            if (file.size > 2 * 1024 * 1024) {
                throw new Error('File size exceeds 2MB limit. Please upload a smaller image.');
            }

            const base64 = await getBase64(file);
            // split base64 string to get the actual data
            // format usually: "data:image/jpeg;base64,......."
            data.fileData = base64.split(',')[1]; 
            data.mimeType = file.type;
            data.fileName = file.name;
        }

        // Hapus object file mentah agar tidak dikirim (karena kita kirim string base64)
        delete data.paymentProof;

        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Show success message
        loadingMsg.style.display = 'none';
        successMsg.style.display = 'block';
        this.reset();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 8000);
        
    } catch (error) {
        alert(error.message || 'Error submitting form. Please try again.');
        console.error('Error:', error);
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerText = 'PROCEED PAYMENT';
        loadingMsg.style.display = 'none';
    }
});
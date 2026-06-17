class RegistrationApp {
    constructor() {
        this.form = document.getElementById('registrationForm');
        this.statusMessage = document.getElementById('statusMessage');
        this.webhookURL = 'https://your-n8n-domain.com/webhook/your-webhook-id';
        
        this.initializeForm();
    }

    initializeForm() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });
    }

    async handleSubmit() {
        const formData = this.collectFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        this.showStatus('loading', 'Submitting your registration...');
        this.setSubmitButtonEnabled(false);

        try {
            const response = await this.submitToWebhook(formData);
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showStatus('success', result.message || 'Registration successful!');
                this.form.reset();
            } else {
                this.showStatus('error', result.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            this.showStatus('error', 'Network error. Please check your connection and try again.');
        } finally {
            this.setSubmitButtonEnabled(true);
        }
    }

    collectFormData() {
        return {
            staffName: document.getElementById('staffName').value.trim(),
            pfNumber: document.getElementById('pfNumber').value.trim(),
            branchName: document.getElementById('branchName').value.trim(),
            boardingPlace: document.getElementById('boardingPlace').value.trim(),
            mobileNumber: document.getElementById('mobileNumber').value.trim(),
            personsCount: document.getElementById('personsCount').value || '1',
            vehicleRequired: document.querySelector('input[name="vehicleRequired"]:checked')?.value || 'No',
            remarks: document.getElementById('remarks').value.trim()
        };
    }

    validateForm(data) {
        // Clear previous status
        this.hideStatus();

        // Validate required fields
        const requiredFields = ['staffName', 'pfNumber', 'branchName', 'boardingPlace', 'mobileNumber'];
        for (const field of requiredFields) {
            if (!data[field]) {
                this.showStatus('error', `Please fill in all required fields.`);
                document.getElementById(field).focus();
                return false;
            }
        }

        // Validate mobile number (10 digits)
        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(data.mobileNumber)) {
            this.showStatus('error', 'Please enter a valid 10-digit mobile number.');
            document.getElementById('mobileNumber').focus();
            return false;
        }

        // Validate PF number (alphanumeric)
        const pfRegex = /^[A-Za-z0-9]+$/;
        if (!pfRegex.test(data.pfNumber)) {
            this.showStatus('error', 'PF Number should be alphanumeric without spaces.');
            document.getElementById('pfNumber').focus();
            return false;
        }

        return true;
    }

    async submitToWebhook(data) {
        return fetch(this.webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
    }

    showStatus(type, message) {
        this.statusMessage.className = `status-message ${type}`;
        this.statusMessage.textContent = message;
        this.statusMessage.style.display = 'block';
    }

    hideStatus() {
        this.statusMessage.style.display = 'none';
    }

    setSubmitButtonEnabled(enabled) {
        const button = this.form.querySelector('.submit-btn');
        button.disabled = !enabled;
        button.textContent = enabled ? 'Register Now' : 'Submitting...';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new RegistrationApp();
});

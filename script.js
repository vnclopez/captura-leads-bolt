class LeadCapture {
    constructor() {
        this.form = document.getElementById('leadForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.successMessage = document.getElementById('successMessage');
        this.supabaseUrl = 'https://mhkmfjoswocnavhefyup.supabase.co/rest/v1/leads';
        this.apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oa21mam9zd29jbmF2aGVmeXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzUwNDEsImV4cCI6MjA3Mjc1MTA0MX0.fpWZqt2GIi75d883yOX_k7KzBDpEiyrdYfTX_v-AexI';
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Real-time validation
        document.getElementById('nome').addEventListener('input', this.validateNome.bind(this));
        document.getElementById('ddd').addEventListener('input', this.validateDDD.bind(this));
        document.getElementById('numero').addEventListener('input', this.validateNumero.bind(this));
    }

    validateNome() {
        const nome = document.getElementById('nome');
        const errorElement = document.getElementById('nomeError');
        
        if (nome.value.trim().length < 2) {
            //this.showError(nome, errorElement, 'Nome deve ter pelo menos 2 caracteres');
            return false;
        } else {
            //this.showSuccess(nome, errorElement);
            return true;
        }
    }

    validateDDD() {
        const ddd = document.getElementById('ddd');
        const errorElement = document.getElementById('telefoneError');
        const dddValue = ddd.value.replace(/\D/g, '');
        
        // Remove caracteres não numéricos
        ddd.value = dddValue;
        
        if (dddValue.length !== 2) {
            this.showError(ddd, errorElement, 'DDD deve ter 2 dígitos');
            return false;
        } else {
            ddd.classList.remove('error');
            ddd.classList.add('success');
            this.hideError(errorElement);
            return true;
        }
    }

    validateNumero() {
        const numero = document.getElementById('numero');
        const errorElement = document.getElementById('telefoneError');
        const numeroValue = numero.value.replace(/\D/g, '');
        
        // Remove caracteres não numéricos
        numero.value = numeroValue;
        
        if (numeroValue.length < 8 || numeroValue.length > 9) {
            this.showError(numero, errorElement, 'Número deve ter 8 ou 9 dígitos');
            return false;
        } else {
            numero.classList.remove('error');
            numero.classList.add('success');
            this.hideError(errorElement);
            return true;
        }
    }

    showError(input, errorElement, message) {
        input.classList.remove('success');
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    showSuccess(input, errorElement) {
        input.classList.remove('error');
        input.classList.add('success');
        this.hideError(errorElement);
    }

    hideError(errorElement) {
        errorElement.classList.remove('show');
        errorElement.textContent = '';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const isNomeValid = this.validateNome();
        const isDDDValid = this.validateDDD();
        const isNumeroValid = this.validateNumero();
        
        if (!isNomeValid || !isDDDValid || !isNumeroValid) {
            return;
        }
        
        // Get form data
        const nome = document.getElementById('nome').value.trim();
        const ddd = document.getElementById('ddd').value.trim();
        const numero = document.getElementById('numero').value.trim();
        const telefone = `(${ddd}) ${numero}`;
        
        // Show loading state
        this.setLoading(true);
        
        try {
            const response = await fetch(this.supabaseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.apiKey,
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    nome: nome,
                    telefone: telefone
                })
            });

            if (response.ok) {
                this.showSuccess();
                this.form.reset();
                this.clearValidationStates();
            } else {
                const errorData = await response.json();
                console.error('Erro do Supabase:', errorData);
                this.showAlert('Erro ao enviar dados. Tente novamente.', 'error');
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            this.showAlert('Erro de conexão. Verifique sua internet e tente novamente.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        if (loading) {
            this.submitBtn.classList.add('loading');
            this.submitBtn.disabled = true;
        } else {
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
        }
    }

    showSuccess() {
        this.form.style.display = 'none';
        this.successMessage.classList.add('show');
        
        // Reset form after 5 seconds
        setTimeout(() => {
            this.form.style.display = 'flex';
            this.successMessage.classList.remove('show');
        }, 5000);
    }

    clearValidationStates() {
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.classList.remove('success', 'error');
        });
        
        const errorMessages = this.form.querySelectorAll('.error-message');
        errorMessages.forEach(error => {
            this.hideError(error);
        });
    }

    showAlert(message, type = 'error') {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <div class="alert-content">
                <span>${message}</span>
                <button class="alert-close">&times;</button>
            </div>
        `;
        
        // Add alert styles
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(alert);
        
        // Show alert
        setTimeout(() => {
            alert.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            this.hideAlert(alert);
        }, 5000);
        
        // Close button
        alert.querySelector('.alert-close').addEventListener('click', () => {
            this.hideAlert(alert);
        });
    }

    hideAlert(alert) {
        alert.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new LeadCapture();
});
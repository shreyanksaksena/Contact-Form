interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

interface ValidationError {
    field: keyof ContactFormData;
    message: string;
}

interface FormStatus {
    isLoading: boolean;
    message: string | null;
    type: 'success' | 'error' | null;
}

interface ValidationRule {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    message: string;
}

const API_URL = 'https://672a68b9976a834dd0234e03.mockapi.io/form-submissions';

const VALIDATION_RULES: Record<keyof ContactFormData, ValidationRule> = {
    name: {
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s'-]+$/,
        message: 'Name should contain only letters, spaces, hyphens and apostrophes'
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
    },
    phone: {
        pattern: /^\+?[0-9]{10,14}$/,
        message: 'Phone number should be 10-14 digits'
    },
    subject: {
        minLength: 5,
        maxLength: 100,
        message: 'Subject should be between 5 and 100 characters'
    },
    message: {
        minLength: 10,
        maxLength: 1000,
        message: 'Message should be between 10 and 1000 characters'
    }
};

class ContactForm {
    private form: HTMLFormElement = document.getElementById('contactForm') as HTMLFormElement;
    private submitButton: HTMLButtonElement = this.form.querySelector('button[type="submit"]') as HTMLButtonElement;
    private buttonText: HTMLElement = this.submitButton.querySelector('.button-text') as HTMLElement;
    private spinner: HTMLElement = this.submitButton.querySelector('.spinner') as HTMLElement;
    private formStatus: HTMLDivElement = document.getElementById('formStatus') as HTMLDivElement;
    private formFields: Record<keyof ContactFormData, HTMLInputElement | HTMLTextAreaElement> = {
        name: this.form.querySelector('#name') as HTMLInputElement,
        email: this.form.querySelector('#email') as HTMLInputElement,
        phone: this.form.querySelector('#phone') as HTMLInputElement,
        subject: this.form.querySelector('#subject') as HTMLInputElement,
        message: this.form.querySelector('#message') as HTMLTextAreaElement
    };

    constructor() {
        if (!this.validateElements()) {
            throw new Error('Required form elements not found');
        }
        this.initialize();
    }

    private validateElements(): boolean {
        if (!this.form || !this.submitButton || !this.buttonText || 
            !this.spinner || !this.formStatus) {
            return false;
        }

        return Object.values(this.formFields).every(element => element !== null);
    }

    private initialize(): void {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.form.addEventListener('input', this.handleInput.bind(this));
        this.setupFormStatusContainer();
    }

    private setupFormStatusContainer(): void {
        let messageContainer = this.form.querySelector('.form-message-container');
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.className = 'form-message-container';
            messageContainer.appendChild(this.formStatus);
            this.submitButton.parentElement?.insertBefore(messageContainer, this.submitButton);
        }
    }

    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault();
        
        this.clearFieldErrors();
        this.updateFormStatus({ isLoading: false, message: null, type: null });

        const formData = this.getFormData();
        const validationErrors = this.validateForm(formData);

        if (validationErrors.length > 0) {
            this.handleValidationErrors(validationErrors);
            return;
        }

        try {
            await this.submitForm(formData);
        } catch (error) {
            console.error('Form submission failed:', error);
            this.updateFormStatus({
                isLoading: false,
                message: 'Failed to send message. Please try again.',
                type: 'error'
            });
        }
    }

    private handleInput(e: Event): void {
        const target = e.target as HTMLElement;
        if (target.id) {
            const formGroup = target.closest('.form-group');
            const errorElement = document.getElementById(`${target.id}-error`);
            
            if (formGroup && errorElement) {
                formGroup.classList.remove('error');
                errorElement.style.display = 'none';
                
                if (this.formStatus.classList.contains('error')) {
                    this.updateFormStatus({ isLoading: false, message: null, type: null });
                }
            }
        }
    }

    private getFormData(): ContactFormData {
        return {
            name: this.formFields.name.value.trim(),
            email: this.formFields.email.value.trim(),
            phone: this.formFields.phone.value.trim(),
            subject: this.formFields.subject.value.trim(),
            message: this.formFields.message.value.trim()
        };
    }

    private validateForm(data: ContactFormData): ValidationError[] {
        const errors: ValidationError[] = [];

        Object.entries(VALIDATION_RULES).forEach(([field, rules]) => {
            const value = data[field as keyof ContactFormData];

            if (!value) {
                errors.push({
                    field: field as keyof ContactFormData,
                    message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
                });
                return;
            }

            if (rules.minLength && value.length < rules.minLength) {
                errors.push({
                    field: field as keyof ContactFormData,
                    message: rules.message
                });
                return;
            }

            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push({
                    field: field as keyof ContactFormData,
                    message: rules.message
                });
                return;
            }

            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push({
                    field: field as keyof ContactFormData,
                    message: rules.message
                });
            }
        });

        return errors;
    }

    private handleValidationErrors(errors: ValidationError[]): void {
        errors.forEach(error => this.showFieldError(error.field, error.message));
        
        const errorMessages = errors.map(error => error.message);
        this.updateFormStatus({
            isLoading: false,
            message: errorMessages.length > 1 
                ? 'Please correct the following errors in the form.'
                : errorMessages[0],
            type: 'error'
        });
    }

    private showFieldError(field: keyof ContactFormData, message: string): void {
        const errorElement = document.getElementById(`${field}-error`);
        const formGroup = this.formFields[field].closest('.form-group');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        if (formGroup) {
            formGroup.classList.add('error');
        }
    }

    private clearFieldErrors(): void {
        const errorElements = this.form.querySelectorAll('.error-message');
        const formGroups = this.form.querySelectorAll('.form-group');
        
        errorElements.forEach(element => {
            element.textContent = '';
            (element as HTMLElement).style.display = 'none';
        });
        
        formGroups.forEach(group => group.classList.remove('error'));
    }

    private updateFormStatus(status: FormStatus): void {
        if (!status.message) {
            this.formStatus.style.display = 'none';
            this.submitButton.disabled = status.isLoading;
            this.spinner.style.display = 'none';
            this.buttonText.textContent = 'Send';
            return;
        }

        this.formStatus.innerHTML = '';
        const messageContent = document.createElement('span');
        messageContent.textContent = status.message;
        this.formStatus.appendChild(messageContent);

        this.formStatus.className = 'form-status';
        if (status.type) {
            this.formStatus.classList.add(status.type);
        }

        this.formStatus.style.display = 'block';
        requestAnimationFrame(() => {
            this.formStatus.style.opacity = '1';
            this.formStatus.style.transform = 'translateY(0)';
        });

        this.submitButton.disabled = status.isLoading;
        this.spinner.style.display = status.isLoading ? 'inline-block' : 'none';
        this.buttonText.textContent = status.isLoading ? 'Sending...' : 'Send';
    }

    private async submitForm(data: ContactFormData): Promise<void> {
        try {
            this.updateFormStatus({
                isLoading: true,
                message: 'Sending your message...',
                type: null
            });

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Submission failed: ${response.status}`);
            }

            await response.json();

            this.updateFormStatus({
                isLoading: false,
                message: 'Thank you! Your message has been sent successfully.',
                type: 'success'
            });

            this.form.reset();

            setTimeout(() => {
                this.updateFormStatus({
                    isLoading: false,
                    message: null,
                    type: null
                });
            }, 5000);

        } catch (error) {
            throw error;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        new ContactForm();
    } catch (error) {
        console.error('Failed to initialize contact form:', error);
        const formContainer = document.querySelector('.contact-form');
        if (formContainer) {
            formContainer.innerHTML = `
                <div class="form-error">
                    <p>Sorry, there was a problem loading the contact form.</p>
                    <p>Please refresh the page or try again later.</p>
                </div>
            `;
        }
    }
});
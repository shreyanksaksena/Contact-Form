"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const API_URL = 'https://672a68b9976a834dd0234e03.mockapi.io/form-submissions';
const VALIDATION_RULES = {
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
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.buttonText = this.submitButton.querySelector('.button-text');
        this.spinner = this.submitButton.querySelector('.spinner');
        this.formStatus = document.getElementById('formStatus');
        this.formFields = {
            name: this.form.querySelector('#name'),
            email: this.form.querySelector('#email'),
            phone: this.form.querySelector('#phone'),
            subject: this.form.querySelector('#subject'),
            message: this.form.querySelector('#message')
        };
        if (!this.validateElements()) {
            throw new Error('Required form elements not found');
        }
        this.initialize();
    }
    validateElements() {
        if (!this.form || !this.submitButton || !this.buttonText ||
            !this.spinner || !this.formStatus) {
            return false;
        }
        return Object.values(this.formFields).every(element => element !== null);
    }
    initialize() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.form.addEventListener('input', this.handleInput.bind(this));
        this.setupFormStatusContainer();
    }
    setupFormStatusContainer() {
        var _a;
        let messageContainer = this.form.querySelector('.form-message-container');
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.className = 'form-message-container';
            messageContainer.appendChild(this.formStatus);
            (_a = this.submitButton.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(messageContainer, this.submitButton);
        }
    }
    handleSubmit(e) {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield this.submitForm(formData);
            }
            catch (error) {
                console.error('Form submission failed:', error);
                this.updateFormStatus({
                    isLoading: false,
                    message: 'Failed to send message. Please try again.',
                    type: 'error'
                });
            }
        });
    }
    handleInput(e) {
        const target = e.target;
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
    getFormData() {
        return {
            name: this.formFields.name.value.trim(),
            email: this.formFields.email.value.trim(),
            phone: this.formFields.phone.value.trim(),
            subject: this.formFields.subject.value.trim(),
            message: this.formFields.message.value.trim()
        };
    }
    validateForm(data) {
        const errors = [];
        Object.entries(VALIDATION_RULES).forEach(([field, rules]) => {
            const value = data[field];
            if (!value) {
                errors.push({
                    field: field,
                    message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
                });
                return;
            }
            if (rules.minLength && value.length < rules.minLength) {
                errors.push({
                    field: field,
                    message: rules.message
                });
                return;
            }
            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push({
                    field: field,
                    message: rules.message
                });
                return;
            }
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push({
                    field: field,
                    message: rules.message
                });
            }
        });
        return errors;
    }
    handleValidationErrors(errors) {
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
    showFieldError(field, message) {
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
    clearFieldErrors() {
        const errorElements = this.form.querySelectorAll('.error-message');
        const formGroups = this.form.querySelectorAll('.form-group');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
        formGroups.forEach(group => group.classList.remove('error'));
    }
    updateFormStatus(status) {
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
    submitForm(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.updateFormStatus({
                    isLoading: true,
                    message: 'Sending your message...',
                    type: null
                });
                const response = yield fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    throw new Error(`Submission failed: ${response.status}`);
                }
                yield response.json();
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
            }
            catch (error) {
                throw error;
            }
        });
    }
}
document.addEventListener('DOMContentLoaded', () => {
    try {
        new ContactForm();
    }
    catch (error) {
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

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
const API_URL = 'https://671652e53fcb11b265d1e959.mockapi.io/submissions';
function submitForm(data) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Submitting form data:', data);
        try {
            const response = yield fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`Form submission failed: ${response.status}`);
            }
            const responseData = yield response.json();
            console.log('Form submitted successfully. Response:', responseData);
        }
        catch (error) {
            console.error('Error submitting form:', error);
            throw error;
        }
    });
}
function validateForm(data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{10,14}$/;
    return Object.values(data).every(value => value.trim() !== '') &&
        emailRegex.test(data.email) &&
        phoneRegex.test(data.phone);
}
function setupForm() {
    const form = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    if (!form) {
        console.error('Contact form not found in the DOM');
        return;
    }
    form.addEventListener('submit', (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        console.log('Form submission event triggered');
        const formData = {
            name: form.querySelector('#name').value,
            email: form.querySelector('#email').value,
            phone: form.querySelector('#phone').value,
            subject: form.querySelector('#subject').value,
            message: form.querySelector('#message').value
        };
        if (validateForm(formData)) {
            try {
                yield submitForm(formData);
                showFormStatus('Form Submitted successfully!', 'green');
                form.reset();
            }
            catch (error) {
                showFormStatus('Failed to send message. Please try again.', 'red');
            }
        }
        else {
            showFormStatus('Please fill all fields correctly.', 'red');
        }
    }));
}
function showFormStatus(message, color) {
    const formStatus = document.getElementById('formStatus');
    if (formStatus) {
        formStatus.textContent = message;
        formStatus.style.color = color;
        formStatus.style.display = 'block';
    }
}
document.addEventListener('DOMContentLoaded', setupForm);

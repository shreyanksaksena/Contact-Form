interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

const API_URL = 'https://671652e53fcb11b265d1e959.mockapi.io/submissions';

async function submitForm(data: ContactFormData): Promise<void> {
    console.log('Submitting form data:', data);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Form submission failed: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Form submitted successfully. Response:', responseData);
    } catch (error) {
        console.error('Error submitting form:', error);
        throw error;
    }
}

function validateForm(data: ContactFormData): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{10,14}$/;
    return Object.values(data).every(value => value.trim() !== '') &&
           emailRegex.test(data.email) &&
           phoneRegex.test(data.phone);
}

function setupForm(): void {
    const form = document.getElementById('contactForm') as HTMLFormElement;
    const formStatus = document.getElementById('formStatus') as HTMLDivElement;

    if (!form) {
        console.error('Contact form not found in the DOM');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submission event triggered');

        const formData: ContactFormData = {
            name: (form.querySelector('#name') as HTMLInputElement).value,
            email: (form.querySelector('#email') as HTMLInputElement).value,
            phone: (form.querySelector('#phone') as HTMLInputElement).value,
            subject: (form.querySelector('#subject') as HTMLInputElement).value,
            message: (form.querySelector('#message') as HTMLTextAreaElement).value
        };

        if (validateForm(formData)) {
            try {
                await submitForm(formData);
                showFormStatus('Form Submitted successfully!', 'green');
                form.reset();
            } catch (error) {
                showFormStatus('Failed to send message. Please try again.', 'red');
            }
        } else {
            showFormStatus('Please fill all fields correctly.', 'red');
        }
    });
}

function showFormStatus(message: string, color: string): void {
    const formStatus = document.getElementById('formStatus');
    if (formStatus) {
        formStatus.textContent = message;
        formStatus.style.color = color;
        formStatus.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', setupForm);

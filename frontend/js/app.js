

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    alert(response.ok ? 'Registration successful!' : 'Registration failed.');
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('authToken', token);
        window.location.href = './transactions.html';
    } else {
        alert('Login failed.');
    }
});

document.getElementById('guestButton').addEventListener('click', () => {
    localStorage.setItem('isGuest', true);
    window.location.href = '/transactions.html';
});

// login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Login failed.');
        }

        const { token } = await response.json();
        localStorage.setItem('authToken', token);
        localStorage.removeItem('isGuest');
        window.location.href = '/transactions.html';
    } catch (error) {
        console.error('Error logging in:', error);
        alert('Login failed. Please try again.');
    }
});

document.getElementById('guestButton').addEventListener('click', () => {
    window.location.href = 'guest-transactions.html';
});

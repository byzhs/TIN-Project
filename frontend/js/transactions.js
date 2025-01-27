


const authToken = localStorage.getItem('authToken');
if (!authToken) {
    alert('You are not logged in. Redirecting to login page.');
    window.location.href = '/index.html';
}

try {
    const payload = JSON.parse(atob(authToken.split('.')[1]));
    const userDisplay = payload.name || payload.email || 'User';
    const loggedInAs = document.getElementById('loggedInAs');
    if (loggedInAs) {
        loggedInAs.textContent = `Logged in as: ${userDisplay}`;
    }
} catch (error) {
    console.error('Error decoding token:', error);
    alert('Invalid token. Please log in again.');
    localStorage.removeItem('authToken');
    window.location.href = '/index.html';
}

let currentPage = 1;
const limit = 3;

const loadTransactions = async () => {
    try {
        const response = await fetch(`http://localhost:3000/transactions?page=${currentPage}&limit=${limit}`, {
            headers: { Authorization: localStorage.getItem('authToken') },
        });

        if (!response.ok) {
            throw new Error('Failed to load transactions');
        }

        const { transactions, totalPages } = await response.json();
        const transactionsList = document.getElementById('transactionsList');
        transactionsList.innerHTML = '';

        transactions.forEach(transaction => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${transaction.type.toUpperCase()} - ${transaction.category_name} - $${transaction.amount} (${transaction.date})
                <button class="delete-btn" data-id="${transaction.id}">Delete</button>
                <button class="edit-btn" data-id="${transaction.id}" data-type="${transaction.type}" 
                        data-category="${transaction.category_id}" data-amount="${transaction.amount}" 
                        data-date="${transaction.date}">Edit</button>
            `;
            transactionsList.appendChild(li);
        });

        attachDeleteEvents();
        attachEditEvents();

        document.getElementById('currentPage').textContent = `Page ${currentPage}`;
        document.getElementById('prevPage').disabled = currentPage === 1;
        document.getElementById('nextPage').disabled = currentPage === totalPages;
    } catch (error) {
        console.error('Error loading transactions:', error.message);
        alert('Failed to load transactions.');
    }
};

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadTransactions();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    loadTransactions();
});

document.addEventListener('DOMContentLoaded', loadTransactions);

const attachDeleteEvents = () => {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const transactionId = e.target.dataset.id;

            try {
                const response = await fetch(`http://localhost:3000/transactions/${transactionId}`, {
                    method: 'DELETE',
                    headers: { Authorization: authToken },
                });

                if (!response.ok) {
                    throw new Error('Failed to delete transaction');
                }

                alert('Transaction deleted successfully!');
                loadTransactions();
            } catch (error) {
                console.error('Error deleting transaction:', error.message);
                alert('Failed to delete transaction.');
            }
        });
    });
};

const attachEditEvents = () => {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const transactionId = e.target.dataset.id;
            const type = e.target.dataset.type;
            const category = e.target.dataset.category;
            const amount = e.target.dataset.amount;
            const date = e.target.dataset.date;

            document.getElementById('transactionId').value = transactionId;
            document.getElementById('type').value = type;
            document.getElementById('category_id').value = category;
            document.getElementById('amount').value = amount;
            document.getElementById('date').value = date;
        });
    });
};

document.getElementById('addTransactionForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.amount = parseFloat(data.amount);
    data.category_id = parseInt(data.category_id);

    const transactionId = data.transactionId || null;
    const url = transactionId
        ? `http://localhost:3000/transactions/${transactionId}`
        : 'http://localhost:3000/transactions';
    const method = transactionId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: authToken,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to save transaction');
        }

        alert('Transaction saved successfully!');
        loadTransactions();
        e.target.reset();
        document.getElementById('transactionId').value = '';
    } catch (error) {
        console.error('Error saving transaction:', error.message);
        alert('Failed to save transaction.');
    }
});

const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    alert('You have been logged out.');
    window.location.href = '/index.html';
});

document.addEventListener('DOMContentLoaded', loadTransactions);

document.getElementById('manageCategoriesButton').addEventListener('click', () => {
    window.location.href = '/categories.html';
});


const loadCategories = async () => {
    try {
        const response = await fetch('http://localhost:3000/categories', {
            headers: { Authorization: localStorage.getItem('authToken') },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch categories.');
        }

        const categories = await response.json();
        const categoryDropdown = document.getElementById('category_id');
        categoryDropdown.innerHTML = '';

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.category_name;
            categoryDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error.message);
        alert('Failed to load categories.');
    }
};

document.addEventListener('DOMContentLoaded', loadCategories);


document.getElementById('addCategoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const categoryName = document.getElementById('newCategoryName').value;

    try {
        const response = await fetch('http://localhost:3000/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: localStorage.getItem('authToken'),
            },
            body: JSON.stringify({ category_name: categoryName }),
        });

        if (!response.ok) {
            throw new Error('Failed to add category.');
        }

        alert('Category added successfully!');
        document.getElementById('newCategoryName').value = '';
        loadCategories();
    } catch (error) {
        console.error('Error adding category:', error.message);
    }
});

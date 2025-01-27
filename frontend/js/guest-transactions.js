


document.addEventListener('DOMContentLoaded', () => {
    const transactions = [];

    const loadTransactions = () => {
        const transactionsList = document.getElementById('transactionsList');
        transactionsList.innerHTML = '';

        transactions.forEach((transaction, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${transaction.type.toUpperCase()} - ${transaction.category} - $${transaction.amount} (${transaction.date})
                <button class="edit-btn" data-id="${index}">Edit</button>
                <button class="delete-btn" data-id="${index}">Delete</button>
            `;
            transactionsList.appendChild(li);
        });

        attachDeleteEvents();
        attachEditEvents();
    };

    const attachDeleteEvents = () => {
        document.querySelectorAll('.delete-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const transactionId = e.target.dataset.id;
                transactions.splice(transactionId, 1);
                loadTransactions();
            });
        });
    };

    const attachEditEvents = () => {
        document.querySelectorAll('.edit-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const transactionId = e.target.dataset.id;
                const transaction = transactions[transactionId];

                document.getElementById('transactionId').value = transactionId;
                document.getElementById('type').value = transaction.type;
                document.getElementById('category').value = transaction.category;
                document.getElementById('amount').value = transaction.amount;
                document.getElementById('date').value = transaction.date;
            });
        });
    };

    document.getElementById('addTransactionForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.date = data.date || new Date().toISOString().split('T')[0];

        const transactionId = document.getElementById('transactionId').value;
        if (transactionId) {
            transactions[transactionId] = data;
        } else {
            transactions.push(data);
        }

        e.target.reset();
        document.getElementById('transactionId').value = '';
        loadTransactions();
    });

    loadTransactions();

    document.getElementById('goBackButton').addEventListener('click', () => {
        window.location.href = '/index.html';
    });
});



const loadUserCategories = async () => {
    try {
        const response = await fetch('http://localhost:3000/categories', {
            headers: { Authorization: localStorage.getItem('authToken') },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }

        const categories = await response.json();
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = '';

        categories.forEach(category => {
            const li = document.createElement('li');
            li.textContent = category.category_name;
            li.innerHTML += ` <button class="delete-category" data-id="${category.id}">Delete</button>`;
            categoryList.appendChild(li);
        });

        attachDeleteCategoryEvents();
    } catch (error) {
        console.error('Error loading categories:', error.message);
    }
};

const attachDeleteCategoryEvents = () => {
    document.querySelectorAll('.delete-category').forEach(button => {
        button.addEventListener('click', async (e) => {
            const categoryId = e.target.dataset.id;

            try {
                const response = await fetch(`http://localhost:3000/categories/${categoryId}`, {
                    method: 'DELETE',
                    headers: { Authorization: localStorage.getItem('authToken') },
                });

                if (!response.ok) {
                    throw new Error('Failed to delete category');
                }
                alert('Category deleted successfully!');
                loadUserCategories();

            } catch (error) {
                console.error('Error deleting category:', error.message);
            }
        });
    });
};

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
            throw new Error('Failed to add category');
        }

        alert('Category added successfully!');
        document.getElementById('newCategoryName').value = '';
        loadUserCategories();
    } catch (error) {
        console.error('Error adding category:', error.message);
    }
});

document.addEventListener('DOMContentLoaded', loadUserCategories);

document.getElementById('goBackButton').addEventListener('click', () => {
    window.location.href = '/transactions.html';
});


app.get('/categories', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.all(
        `SELECT c.id, c.category_name
         FROM categories c
         JOIN user_categories uc ON c.id = uc.category_id
         WHERE uc.user_id = ?`,
        [userId],
        (err, rows) => {
            if (err) {
                console.error('Error fetching categories:', err.message);
                return res.status(500).json({ error: 'Failed to fetch categories' });
            }
            res.json(rows);
        }
    );
});


app.post('/categories', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { category_name } = req.body;

    db.run(
        `INSERT INTO categories (category_name) VALUES (?)`,
        [category_name],
        function (err) {
            if (err) {
                console.error('Error adding category:', err.message);
                return res.status(500).json({ error: 'Failed to add category' });
            }

            const categoryId = this.lastID;

            db.run(
                `INSERT INTO user_categories (user_id, category_id) VALUES (?, ?)`,
                [userId, categoryId],
                (linkErr) => {
                    if (linkErr) {
                        console.error('Error linking category to user:', linkErr.message);
                        return res.status(500).json({ error: 'Failed to link category to user' });
                    }
                    res.status(201).json({ message: 'Category added successfully', category_id: categoryId });
                }
            );
        }
    );
});

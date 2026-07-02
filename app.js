/**
 * ============================================================================
 * LIBRIS — Modern & Secure Personal Book Library Application
 * ============================================================================
 * Architecture:
 * - Secure DOM Construction (100% XSS immune via createElement/textContent)
 * - UUID-based Item Tracking (accurate state across sorts/filters)
 * - Robust LocalStorage Persistence with Error Recovery & Seeding
 * - Real-time Search, Filter, Sort, and Statistical Analysis Engine
 * - Native HTML5 <dialog> with Light-Dismiss Fallback & Accessibility
 * ============================================================================
 */

(function () {
    'use strict';

    /* --- DOM Elements --- */
    const mainGrid = document.getElementById('mainGrid');
    const emptyState = document.getElementById('emptyState');
    const emptyTitle = document.getElementById('emptyTitle');
    const emptyMessage = document.getElementById('emptyMessage');
    const emptyAddBtn = document.getElementById('emptyAddBtn');
    const addBookBtn = document.getElementById('addBookBtn');
    const bookDialog = document.getElementById('bookDialog');
    const closeDialogBtn = document.getElementById('closeDialogBtn');
    const cancelDialogBtn = document.getElementById('cancelDialogBtn');
    const bookForm = document.getElementById('bookForm');
    const formAlert = document.getElementById('formAlert');
    const dialogTitle = document.getElementById('dialogTitle');

    /* Form Fields */
    const bookIdInput = document.getElementById('bookId');
    const bookTitleInput = document.getElementById('bookTitle');
    const bookAuthorInput = document.getElementById('bookAuthor');
    const bookPagesInput = document.getElementById('bookPages');
    const bookCategoryInput = document.getElementById('bookCategory');
    const bookRatingInput = document.getElementById('bookRating');
    const bookNotesInput = document.getElementById('bookNotes');
    const bookReadInput = document.getElementById('bookRead');

    /* Toolbar & Filters */
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const filterCategory = document.getElementById('filterCategory');
    const filterStatus = document.getElementById('filterStatus');
    const sortBy = document.getElementById('sortBy');
    const exportBtn = document.getElementById('exportBtn');
    const importFileInput = document.getElementById('importFile');

    /* Statistics Dashboard */
    const statTotalBooks = document.getElementById('statTotalBooks');
    const statReadBooks = document.getElementById('statReadBooks');
    const statTotalPages = document.getElementById('statTotalPages');
    const statAvgRating = document.getElementById('statAvgRating');

    /* --- Application State --- */
    const STORAGE_KEY = 'libris_library_data_v1';
    let myLibrary = [];

    /* --- Validation Whitelists --- */
    const VALID_THEMES = new Set(['indigo', 'emerald', 'sunset', 'cyber', 'gold', 'slate']);
    const VALID_CATEGORIES = new Set([
        'Fiction', 'Non-Fiction', 'Sci-Fi & Fantasy', 'Tech & Coding',
        'Mystery & Thriller', 'Biography', 'Business', 'History', 'Other'
    ]);
    const MAX_RATING = 5;
    const MIN_RATING = 0;

    /**
     * Book Class Representation
     */
    class Book {
        constructor(title, author, pages, category = 'Other', rating = 0, coverTheme = 'indigo', notes = '', read = false, id = null, dateAdded = null) {
            this.id = id || generateUUID();
            this.title = String(title).trim();
            this.author = String(author).trim();
            this.pages = Math.max(0, parseInt(pages, 10) || 0);
            this.category = VALID_CATEGORIES.has(category) ? category : 'Other';
            this.rating = Math.max(MIN_RATING, Math.min(MAX_RATING, parseInt(rating, 10) || 0));
            this.coverTheme = VALID_THEMES.has(coverTheme) ? coverTheme : 'indigo';
            this.notes = String(notes).trim();
            this.read = Boolean(read);
            this.dateAdded = dateAdded || new Date().toISOString();
        }
    }

    /**
     * Generate Cryptographically Secure UUID or Fallback
     */
    function generateUUID() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'book-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
    }

    /**
     * Seed Default Books if Storage is Empty
     */
    function getStarterLibrary() {
        return [
            new Book('Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 464, 'Tech & Coding', 5, 'indigo', 'Essential principles for writing clean, readable, and maintainable software.', true),
            new Book('Dune', 'Frank Herbert', 658, 'Sci-Fi & Fantasy', 5, 'cyber', 'A masterpiece of science fiction politics, ecology, and human potential on Arrakis.', true),
            new Book('Atomic Habits', 'James Clear', 320, 'Non-Fiction', 5, 'emerald', 'Tiny changes, remarkable results. Remarkable insights into behavior modification.', true),
            new Book('Project Hail Mary', 'Andy Weir', 496, 'Sci-Fi & Fantasy', 0, 'sunset', 'An interstellar rescue mission full of scientific ingenuity and friendship.', false),
            new Book('The Pragmatic Programmer: Your Journey to Mastery', 'David Thomas & Andrew Hunt', 352, 'Tech & Coding', 4, 'slate', 'Classic philosophies and practical techniques for modern developers.', false)
        ];
    }

    /**
     * Load Library from LocalStorage with Security Validation
     */
    function loadLibrary() {
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (storedData) {
                const parsed = JSON.parse(storedData);
                if (Array.isArray(parsed)) {
                    myLibrary = parsed.map(b => new Book(
                        b.title || 'Untitled',
                        b.author || 'Unknown',
                        b.pages || 0,
                        b.category || 'Other',
                        b.rating || 0,
                        b.coverTheme || 'indigo',
                        b.notes || '',
                        b.read || false,
                        b.id,
                        b.dateAdded
                    ));
                    return;
                }
            }
        } catch (err) {
            console.error('Error reading library from localStorage:', err);
        }
        /* Fallback to starter library if storage empty or corrupted */
        myLibrary = getStarterLibrary();
        saveLibrary();
    }

    /**
     * Save Library to LocalStorage
     */
    function saveLibrary() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(myLibrary));
        } catch (err) {
            console.error('Failed to save to localStorage. Quota might be exceeded:', err);
            alert('Warning: Your browser local storage is full or restricted. Changes may not persist.');
        }
    }

    /**
     * Update Statistics Dashboard
     */
    function updateStatistics() {
        const total = myLibrary.length;
        const readBooks = myLibrary.filter(b => b.read);
        const readCount = readBooks.length;
        const totalPages = readBooks.reduce((sum, b) => sum + (b.pages || 0), 0);

        const ratedBooks = myLibrary.filter(b => b.rating > 0);
        const avgRating = ratedBooks.length > 0 
            ? (ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length).toFixed(1) 
            : '0.0';

        statTotalBooks.textContent = total.toLocaleString();
        statReadBooks.textContent = readCount.toLocaleString();
        statTotalPages.textContent = totalPages.toLocaleString();
        statAvgRating.textContent = avgRating;
    }

    /**
     * Get Filtered and Sorted Library
     */
    function getFilteredAndSortedBooks() {
        const query = searchInput.value.trim().toLowerCase();
        const categoryVal = filterCategory.value;
        const statusVal = filterStatus.value;
        const sortVal = sortBy.value;

        let filtered = myLibrary.filter(book => {
            /* Search Query Filter */
            const matchesQuery = !query || 
                book.title.toLowerCase().includes(query) || 
                book.author.toLowerCase().includes(query) || 
                book.notes.toLowerCase().includes(query);

            /* Category Filter */
            const matchesCategory = categoryVal === 'all' || book.category === categoryVal;

            /* Read Status Filter */
            const matchesStatus = statusVal === 'all' || 
                (statusVal === 'read' && book.read) || 
                (statusVal === 'unread' && !book.read);

            return matchesQuery && matchesCategory && matchesStatus;
        });

        /* Sorting Engine */
        filtered.sort((a, b) => {
            switch (sortVal) {
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'author-asc':
                    return a.author.localeCompare(b.author);
                case 'rating-desc':
                    return b.rating - a.rating;
                case 'pages-desc':
                    return b.pages - a.pages;
                case 'recent':
                default:
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
            }
        });

        return filtered;
    }

    /**
     * Secure DOM Construction for a Book Card
     * Prevents XSS by strictly using createElement and textContent
     */
    function createBookCardElement(book) {
        const card = document.createElement('article');
        card.className = 'book-card';
        card.setAttribute('data-id', book.id);

        /* --- Cover Header --- */
        const cover = document.createElement('div');
        const safeTheme = VALID_THEMES.has(book.coverTheme) ? book.coverTheme : 'indigo';
        cover.className = 'card-cover theme-' + safeTheme;

        const coverTop = document.createElement('div');
        coverTop.className = 'cover-top';

        const categoryBadge = document.createElement('span');
        categoryBadge.className = 'category-badge';
        categoryBadge.textContent = book.category || 'Book';
        coverTop.appendChild(categoryBadge);

        if (book.rating > 0) {
            const ratingBadge = document.createElement('span');
            ratingBadge.className = 'card-rating';
            const starIcon = document.createElement('i');
            starIcon.className = 'fa-solid fa-star';
            const ratingText = document.createElement('span');
            ratingText.textContent = String(book.rating);
            ratingBadge.appendChild(starIcon);
            ratingBadge.appendChild(document.createTextNode(' '));
            ratingBadge.appendChild(ratingText);
            coverTop.appendChild(ratingBadge);
        }

        const titleHeading = document.createElement('h3');
        titleHeading.className = 'card-title';
        titleHeading.textContent = book.title;
        titleHeading.title = book.title;

        cover.appendChild(coverTop);
        cover.appendChild(titleHeading);

        /* --- Card Body --- */
        const body = document.createElement('div');
        body.className = 'card-body';

        const authorPara = document.createElement('p');
        authorPara.className = 'card-author';
        const authorIcon = document.createElement('i');
        authorIcon.className = 'fa-solid fa-user-pen';
        const authorText = document.createElement('span');
        authorText.textContent = book.author;
        authorPara.appendChild(authorIcon);
        authorPara.appendChild(authorText);

        const metaRow = document.createElement('div');
        metaRow.className = 'card-meta-row';

        const pagesSpan = document.createElement('span');
        pagesSpan.className = 'pages-badge';
        pagesSpan.textContent = `${book.pages} pages`;

        const statusSpan = document.createElement('span');
        statusSpan.className = `status-badge ${book.read ? 'status-read' : 'status-unread'}`;
        statusSpan.innerHTML = book.read 
            ? '<i class="fa-solid fa-check"></i> Read' 
            : '<i class="fa-regular fa-clock"></i> Unread';

        metaRow.appendChild(pagesSpan);
        metaRow.appendChild(statusSpan);

        body.appendChild(authorPara);
        body.appendChild(metaRow);

        if (book.notes) {
            const notesPara = document.createElement('p');
            notesPara.className = 'card-notes';
            notesPara.textContent = book.notes;
            body.appendChild(notesPara);
        }

        /* --- Card Footer & Actions --- */
        const footer = document.createElement('div');
        footer.className = 'card-footer';

        const toggleReadBtn = document.createElement('button');
        toggleReadBtn.className = `btn-toggle-read ${book.read ? 'is-read' : ''}`;
        toggleReadBtn.innerHTML = book.read 
            ? '<i class="fa-solid fa-check-double"></i> Finished' 
            : '<i class="fa-regular fa-bookmark"></i> Mark Read';
        toggleReadBtn.title = 'Toggle read status';
        toggleReadBtn.addEventListener('click', () => toggleReadStatus(book.id));

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'card-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn action-edit';
        editBtn.title = 'Edit book details';
        editBtn.setAttribute('aria-label', 'Edit book details');
        editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
        editBtn.addEventListener('click', () => openEditDialog(book.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn action-delete';
        deleteBtn.title = 'Remove from library';
        deleteBtn.setAttribute('aria-label', 'Remove from library');
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deleteBtn.addEventListener('click', () => deleteBook(book.id));

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        footer.appendChild(toggleReadBtn);
        footer.appendChild(actionsDiv);

        /* Assemble Card */
        card.appendChild(cover);
        card.appendChild(body);
        card.appendChild(footer);

        return card;
    }

    /**
     * Render the Bookshelf Grid
     */
    function renderGrid() {
        mainGrid.innerHTML = '';
        const booksToRender = getFilteredAndSortedBooks();

        if (booksToRender.length === 0) {
            emptyState.classList.remove('hidden');
            if (myLibrary.length === 0) {
                emptyTitle.textContent = 'Your Bookshelf is Empty';
                emptyMessage.textContent = 'Start building your personal library by adding your favorite books or reading goals!';
                emptyAddBtn.classList.remove('hidden');
            } else {
                emptyTitle.textContent = 'No Matching Books Found';
                emptyMessage.textContent = 'Try adjusting your search query or filter criteria.';
                emptyAddBtn.classList.add('hidden');
            }
        } else {
            emptyState.classList.add('hidden');
            const fragment = document.createDocumentFragment();
            booksToRender.forEach(book => {
                fragment.appendChild(createBookCardElement(book));
            });
            mainGrid.appendChild(fragment);
        }

        updateStatistics();
    }

    /**
     * Open Modal to Add a New Book
     */
    function openAddDialog() {
        bookForm.reset();
        bookIdInput.value = '';
        dialogTitle.textContent = 'Add New Book';
        formAlert.classList.add('hidden');
        /* Set default radio checked */
        const defaultRadio = bookForm.querySelector('input[name="coverTheme"][value="indigo"]');
        if (defaultRadio) defaultRadio.checked = true;
        
        bookDialog.showModal();
        bookTitleInput.focus();
    }

    /**
     * Open Modal to Edit an Existing Book
     */
    function openEditDialog(id) {
        const book = myLibrary.find(b => b.id === id);
        if (!book) return;

        bookForm.reset();
        formAlert.classList.add('hidden');
        dialogTitle.textContent = 'Edit Book Details';

        bookIdInput.value = book.id;
        bookTitleInput.value = book.title;
        bookAuthorInput.value = book.author;
        bookPagesInput.value = book.pages;
        bookCategoryInput.value = book.category;
        bookRatingInput.value = book.rating;
        bookNotesInput.value = book.notes;
        bookReadInput.checked = book.read;

        /* Safe theme radio selection — uses validated value only */
        const safeEditTheme = VALID_THEMES.has(book.coverTheme) ? book.coverTheme : 'indigo';
        const themeRadios = bookForm.querySelectorAll('input[name="coverTheme"]');
        themeRadios.forEach(radio => {
            radio.checked = (radio.value === safeEditTheme);
        });

        bookDialog.showModal();
        bookTitleInput.focus();
    }

    /**
     * Close Modal Dialog Safe Wrapper
     */
    function closeDialog() {
        bookDialog.close();
    }

    /**
     * Handle Form Submission (Save or Update Book)
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        formAlert.classList.add('hidden');

        /* Validation & Sanitization */
        const title = bookTitleInput.value.trim();
        const author = bookAuthorInput.value.trim();
        const pagesStr = bookPagesInput.value.trim();
        const pages = parseInt(pagesStr, 10);
        const category = bookCategoryInput.value;
        const rating = parseInt(bookRatingInput.value, 10) || 0;
        const notes = bookNotesInput.value.trim();
        const read = bookReadInput.checked;
        const themeRadio = bookForm.querySelector('input[name="coverTheme"]:checked');
        const coverTheme = themeRadio ? themeRadio.value : 'indigo';

        if (!title || !author) {
            showFormAlert('Please enter both the book title and author name.');
            return;
        }

        if (isNaN(pages) || pages < 1 || pages > 10000) {
            showFormAlert('Please enter a valid page count between 1 and 10,000.');
            return;
        }

        const editId = bookIdInput.value;

        if (editId) {
            /* Update Existing Book */
            const index = myLibrary.findIndex(b => b.id === editId);
            if (index !== -1) {
                myLibrary[index].title = title;
                myLibrary[index].author = author;
                myLibrary[index].pages = pages;
                myLibrary[index].category = category;
                myLibrary[index].rating = rating;
                myLibrary[index].coverTheme = coverTheme;
                myLibrary[index].notes = notes;
                myLibrary[index].read = read;
            }
        } else {
            /* Create New Book */
            const newBook = new Book(title, author, pages, category, rating, coverTheme, notes, read);
            myLibrary.push(newBook);
        }

        saveLibrary();
        renderGrid();
        closeDialog();
    }

    /**
     * Show Error Alert in Modal
     */
    function showFormAlert(message) {
        formAlert.textContent = message;
        formAlert.className = 'form-alert alert-error';
    }

    /**
     * Delete Book from Library
     */
    function deleteBook(id) {
        const book = myLibrary.find(b => b.id === id);
        if (!book) return;

        const confirmMsg = `Are you sure you want to remove "${book.title}" from your library?`;
        if (window.confirm(confirmMsg)) {
            myLibrary = myLibrary.filter(b => b.id !== id);
            saveLibrary();
            renderGrid();
        }
    }

    /**
     * Toggle Read Status of a Book
     */
    function toggleReadStatus(id) {
        const book = myLibrary.find(b => b.id === id);
        if (book) {
            book.read = !book.read;
            saveLibrary();
            renderGrid();
        }
    }

    /**
     * Export Library to JSON File
     */
    function exportLibrary() {
        const dataStr = JSON.stringify(myLibrary, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `libris-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Import Library from JSON File
     */
    function importLibrary(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const importedData = JSON.parse(event.target.result);
                if (!Array.isArray(importedData)) {
                    throw new Error('Invalid JSON format: Expected an array of books.');
                }

                /* Validate that items look like books */
                const validBooks = importedData.filter(b => b && b.title && b.author).map(b => new Book(
                    b.title,
                    b.author,
                    b.pages || 0,
                    b.category || 'Other',
                    b.rating || 0,
                    b.coverTheme || 'indigo',
                    b.notes || '',
                    b.read || false,
                    b.id || generateUUID(),
                    b.dateAdded || new Date().toISOString()
                ));

                if (validBooks.length === 0) {
                    alert('No valid books found in the imported file.');
                    return;
                }

                if (window.confirm(`Successfully read ${validBooks.length} books from backup. Do you want to REPLACE your current library? (Cancel to MERGE instead)`)) {
                    myLibrary = validBooks;
                } else {
                    /* Merge avoiding exact ID duplicates */
                    const existingIds = new Set(myLibrary.map(b => b.id));
                    validBooks.forEach(b => {
                        if (!existingIds.has(b.id)) {
                            myLibrary.push(b);
                        } else {
                            /* Generate new ID if collision occurs during merge */
                            b.id = generateUUID();
                            myLibrary.push(b);
                        }
                    });
                }

                saveLibrary();
                renderGrid();
                alert('Library restoration complete!');
            } catch (err) {
                console.error('Import error:', err);
                alert('Error importing JSON file: ' + err.message);
            } finally {
                importFileInput.value = ''; /* Reset input */
            }
        };
        reader.readAsText(file);
    }

    /**
     * Setup Event Listeners & Fallbacks
     */
    function initEventListeners() {
        addBookBtn.addEventListener('click', openAddDialog);
        emptyAddBtn.addEventListener('click', openAddDialog);
        closeDialogBtn.addEventListener('click', closeDialog);
        cancelDialogBtn.addEventListener('click', closeDialog);
        bookForm.addEventListener('submit', handleFormSubmit);

        /* Search & Filters */
        searchInput.addEventListener('input', () => {
            clearSearchBtn.classList.toggle('hidden', !searchInput.value);
            renderGrid();
        });

        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.classList.add('hidden');
            renderGrid();
            searchInput.focus();
        });

        filterCategory.addEventListener('change', renderGrid);
        filterStatus.addEventListener('change', renderGrid);
        sortBy.addEventListener('change', renderGrid);

        /* Backup Controls */
        exportBtn.addEventListener('click', exportLibrary);
        importFileInput.addEventListener('change', importLibrary);

        /**
         * MANDATORY: Light-dismiss fallback for <dialog>
         * For browsers without closedby="any" support or standard light dismiss,
         * close the dialog when clicking outside the modal boundary (on backdrop).
         */
        bookDialog.addEventListener('click', (event) => {
            if (event.target !== bookDialog) return;
            const rect = bookDialog.getBoundingClientRect();
            const isDialogContent = (
                rect.top <= event.clientY &&
                event.clientY <= rect.top + rect.height &&
                rect.left <= event.clientX &&
                event.clientX <= rect.left + rect.width
            );
            if (!isDialogContent) {
                bookDialog.close();
            }
        });
    }

    /* --- Initialize Application on Load --- */
    window.addEventListener('DOMContentLoaded', () => {
        loadLibrary();
        initEventListeners();
        renderGrid();
    });

})();

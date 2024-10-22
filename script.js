let questionsData = []; // Store the questions data globally for filtering and sorting

// Function to save checkbox state to localStorage
function saveCheckboxState(id, isChecked) {
    let checkboxStates = JSON.parse(localStorage.getItem('checkboxStates')) || {};
    checkboxStates[id] = isChecked;
    localStorage.setItem('checkboxStates', JSON.stringify(checkboxStates));
}

// Function to load checkbox states from localStorage
function loadCheckboxState(id) {
    let checkboxStates = JSON.parse(localStorage.getItem('checkboxStates')) || {};
    return checkboxStates[id] || false;  // Return false if no state is found
}

// Function to create and insert a row into the table
function createRow(question) {
    const tbody = document.getElementById('questionTableBody');
    const row = document.createElement('tr');
    row.setAttribute('data-tag', question.pattern.join(' ').toLowerCase());
    row.setAttribute('difficulty-tag', question.difficulty.toLowerCase());

    // Completed (Checkbox)
    const completedCell = document.createElement('td');
    const checkboxSpan = document.createElement('span');
    checkboxSpan.setAttribute('data-tip', `q${question.id}`);
    checkboxSpan.setAttribute('currentItem', 'false');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';

    // Load checkbox state from localStorage
    const isChecked = loadCheckboxState(question.id);
    checkbox.checked = isChecked;

    // Save the checkbox state on change
    checkbox.addEventListener('change', function () {
        saveCheckboxState(question.id, checkbox.checked);
    });

    checkboxSpan.appendChild(checkbox);
    completedCell.appendChild(checkboxSpan);
    row.appendChild(completedCell);

    // Problem (Link)
    const problemCell = document.createElement('td');
    const problemLink = document.createElement('a');
    problemLink.href = `https://leetcode.com/problems/${question.slug}/`;
    problemLink.target = '_blank';
    problemLink.textContent = question.title;
    problemCell.appendChild(problemLink);
    row.appendChild(problemCell);

    // Solution (Link)
    const solutionCell = document.createElement('td');
    const solutionLink = document.createElement('a');
    if (question.solution) {
        solutionLink.href = question.solution;
        solutionLink.target = '_blank';
        solutionLink.textContent = 'Solution';
    }
    else {
        solutionCell.textContent = 'Coming Soon';
    }
    solutionCell.appendChild(solutionLink);
    row.appendChild(solutionCell);

    // Tags
    const tagsCell = document.createElement('td');
    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'tags';
    tagsDiv.textContent = question.pattern.join(', ');
    tagsCell.appendChild(tagsDiv);
    row.appendChild(tagsCell);

    // Difficulty
    const difficultyCell = document.createElement('td');
    const difficultyDiv = document.createElement('div');
    difficultyDiv.className = 'difficulty';
    difficultyDiv.textContent = question.difficulty;
    difficultyCell.appendChild(difficultyDiv);
    row.appendChild(difficultyCell);

    // Append the row to the tbody
    tbody.appendChild(row);
}

// Function to clear the table body
function clearTable() {
    const tbody = document.getElementById('questionTableBody');
    tbody.innerHTML = ''; // Clear the table rows
}

// Function to filter and display the table based on selected filters
function filterTable() {
    const tagFilter = document.getElementById('tagFilter').value.toLowerCase();
    const difficultyFilter = document.getElementById('difficultyFilter').value.toLowerCase();

    clearTable(); // Clear the table first

    questionsData.forEach(question => {
        const questionTags = question.pattern.map(tag => tag.toLowerCase());
        const questionDifficulty = question.difficulty.toLowerCase();

        const matchesTag = !tagFilter || questionTags.includes(tagFilter);
        const matchesDifficulty = !difficultyFilter || questionDifficulty === difficultyFilter;

        if (matchesTag && matchesDifficulty) {
            createRow(question); // Only create rows for filtered questions
        }
    });
}

// Function to sort questions first by difficulty, then by tag
function sortQuestions(questions) {
    return questions.sort((a, b) => {
        // Sort by difficulty first
        const difficultyOrder = ['easy', 'medium', 'hard'];
        const difficultyA = difficultyOrder.indexOf(a.difficulty.toLowerCase());
        const difficultyB = difficultyOrder.indexOf(b.difficulty.toLowerCase());

        if (difficultyA < difficultyB) return -1;
        if (difficultyA > difficultyB) return 1;

        // If the difficulty is the same, sort by the first tag (alphabetically)
        const tagA = a.pattern[0].toLowerCase();
        const tagB = b.pattern[0].toLowerCase();

        if (tagA < tagB) return -1;
        if (tagA > tagB) return 1;

        return 0;
    });
}

// Fetch the questions.json and dynamically populate the table
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questionsData = data.data; // Store the questions data

        // Sort the questions by difficulty first, then by tag
        questionsData = sortQuestions(questionsData);

        // Initially populate the table with all questions
        filterTable();
    })
    .catch(error => console.error('Error loading questions:', error));

// Add event listeners to the filters
document.getElementById('tagFilter').addEventListener('change', filterTable);
document.getElementById('difficultyFilter').addEventListener('change', filterTable);

// Tableau pour stocker les idées
let ideas = [];

// Récupérer les éléments du DOM
const ideaForm = document.getElementById('ideaForm');
const messageBox = document.getElementById('messageBox');
const ideasList = document.getElementById('ideasList');

// Fonction d'affichage des messages
function displayMessage(type, message) {
    messageBox.classList.remove('hidden', 'bg-red-100', 'bg-green-100', 'text-red-700', 'text-green-700');
    messageBox.classList.add(type === 'error' ? 'bg-red-100' : 'bg-green-100', type === 'error' ? 'text-red-700' : 'text-green-700');
    messageBox.textContent = message;

    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 2000);
}

// Fonction de validation des champs
function validateField(field, value) {
    if (!value || value.trim() === '') {
        return `Le champ ${field} est requis.`;
    }
    if (field === 'libelle' && (value.length < 3 || value.length > 100)) {
        return 'Le libellé doit contenir entre 3 et 100 caractères.';
    }
    if (field === 'libelle' && /[^a-zA-Z0-9 'éàçè]/.test(value)) {
        return 'Le libellé ne doit pas contenir de caractères spéciaux autres que é, à, ç, è.';
    }
    if (field === 'message' && value.length < 10) {
        return 'Le message doit contenir au moins 10 caractères.';
    }
    if (field === 'categorie' && !['politique', 'sport', 'sante', 'education'].includes(value)) {
        return 'Catégorie invalide.';
    }
    return '';
}

// Fonction d'assainissement des entrées utilisateur
function sanitizeInput(input) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = input;
    return tempDiv.innerHTML;
}

// Fonction pour charger les idées depuis le local storage
function loadIdeas() {
    const storedIdeas = localStorage.getItem('ideas');
    return storedIdeas ? JSON.parse(storedIdeas) : [];
}

// Fonction pour sauvegarder les idées dans le local storage
function saveIdeas() {
    localStorage.setItem('ideas', JSON.stringify(ideas));
}

// Fonction d'affichage des idées
function displayIdeas() {
    ideasList.innerHTML = '';
    ideas.forEach((idea, index) => {
        const row = document.createElement('article');

        const sanitizedLibelle = sanitizeInput(idea.libelle);
        const sanitizedMessage = sanitizeInput(idea.message);
        const sanitizedCategorie = sanitizeInput(idea.categorie);

        row.innerHTML = `
                <div class="max-w-sm p-6 bg-white  max-h-64 min-h-64 shadow-md rounded-md drop-shadow-lg ${idea.approved ? 'border-green-700 border-2 shadow-2xl hover:bg-green-500 text-white ' : 'border-red-700 hover:bg-red-500 text-white  border-2'}">
    <div class="flex items-center space-x-2">
        <div class="flex-1">
            <h3 class="text-2xl font-medium text-gray-700 overflow-hidden text-ellipsis">${sanitizedLibelle}</h3>
            <span class="text-xl text-gray-500 overflow-hidden text-ellipsis">${sanitizedCategorie}</span>
            <p class="text-sm w-full text-gray-500 overflow-hidden text-ellipsis">${sanitizedMessage}</p>
        </div>
    </div>
    <div class="btb flex-1 content-between gap-10 my-6 space-x-11 justify-end">
        <button onclick="toggleApproval(${index})" class="mr-28 px-2 py-1 rounded-md ${idea.approved ? 'bg-gray-300 text-gray-700' : 'bg-green-500 text-white'}">${idea.approved ? 'Désapprouver' : 'Approuver'}</button>
        <button onclick="deleteIdea(${index})" class="px-2 py-1 bg-red-500 text-white rounded-md"><i class="fa-solid fa-trash"></i></button>
    </div>
</div>

        `;
        ideasList.appendChild(row);
    });
}

// Fonction pour approuver/désapprouver une idée
function toggleApproval(index) {
    ideas[index].approved = !ideas[index].approved;
    saveIdeas();
    displayIdeas();
}

// Fonction pour supprimer une idée
function deleteIdea(index) {
    ideas.splice(index, 1);
    saveIdeas();
    displayIdeas();
}

// Charger les idées depuis le local storage au chargement de la page
ideas = loadIdeas();
displayIdeas();

// Événement de soumission du formulaire
ideaForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const libelle = document.getElementById('libelle').value.trim();
    const categorie = document.getElementById('categorie').value.trim();
    const message = document.getElementById('message').value.trim();

    // Réinitialisation des messages d'erreur
    const messages = ideaForm.querySelectorAll('.message');
    messages.forEach(message => message.textContent = '');

    // Validation des champs
    let isValid = true;
    const errors = {
        libelle: validateField('libelle', libelle),
        categorie: validateField('categorie', categorie),
        message: validateField('message', message)
    };

    for (const [field, error] of Object.entries(errors)) {
        if (error) {
            document.getElementById(field).nextElementSibling.textContent = error;
            isValid = false;
        }
    }

    if (!isValid) {
        displayMessage('error', 'Veuillez corriger les erreurs ci-dessus.');
        return;
    }

    // Assainissement des entrées utilisateur
    const sanitizedLibelle = sanitizeInput(libelle);
    const sanitizedCategorie = sanitizeInput(categorie);
    const sanitizedMessage = sanitizeInput(message);

    // Ajouter l'idée au tableau
    ideas.push({ libelle: sanitizedLibelle, categorie: sanitizedCategorie, message: sanitizedMessage, approved: false });

    // Sauvegarder les idées dans le local storage
    saveIdeas();

    // Afficher le message de succès et réinitialiser le formulaire
    displayMessage('success', 'Idée ajoutée avec succès.');
    ideaForm.reset();
    displayIdeas();
});

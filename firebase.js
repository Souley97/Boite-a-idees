const firebaseConfig = {
    apiKey: "API_KEY_HERE", // Clé d'API Firebase
    authDomain: "boite--a-idees.firebaseapp.com", // Domaine d'authentification Firebase
    databaseURL: "https://boite--a-idees-default-rtdb.firebaseio.com", // URL de la base de données Firebase
    projectId: "boite--a-idees", // ID du projet Firebase
    storageBucket: "boite--a-idees.appspot.com", // Bucket de stockage Firebase
    messagingSenderId: "SENDER_ID_HERE", // ID d'expéditeur de messagerie Firebase
    appId: "APP_ID_HERE", // ID de l'application Firebase
    measurementId: "MEASUREMENT_ID_HERE" // ID de mesure Firebase
};

// Initialise Firebase avec la configuration spécifiée
firebase.initializeApp(firebaseConfig);
const database = firebase.database(); // Initialise la référence à la base de données Firebase

// Récupération des éléments du DOM
const ideaForm = document.getElementById('ideaForm'); // Formulaire d'idée
const messageBox = document.getElementById('messageBox'); // Boîte de messages
const ideasList = document.getElementById('ideasList'); // Liste des idées

// Fonction pour afficher les messages
function displayMessage(type, message) {
    messageBox.classList.remove('hidden', 'bg-red-100', 'bg-green-100', 'text-red-700', 'text-green-700'); // Supprime les classes de style de messageBox
    messageBox.classList.add(type === 'error' ? 'bg-red-100' : 'bg-green-100', type === 'error' ? 'text-red-700' : 'text-green-700'); // Ajoute les classes de style en fonction du type de message
    messageBox.textContent = message; // Définit le texte du messageBox avec le message spécifié

    setTimeout(() => {
        messageBox.classList.add('hidden'); // Masque messageBox après 2 secondes
    }, 2000);
}

// Fonction de validation des champs de formulaire
function validateField(field, value) {
    if (!value || value.trim() === '') {
        return `Le champ ${field} est requis.`; // Retourne un message d'erreur si le champ est vide
    }
    if (field === 'libelle' && (value.length < 3 || value.length > 100)) {
        return 'Le libellé doit contenir entre 3 et 100 caractères.'; // Retourne un message d'erreur si la longueur du libellé est invalide
    }
    if (field === 'libelle' && /[^a-zA-Z0-9 'éàçè]/.test(value)) {
        return 'Le libellé ne doit pas contenir de caractères spéciaux autres que é, à, ç, è.'; // Retourne un message d'erreur si le libellé contient des caractères spéciaux non autorisés
    }
    if (field === 'message' && value.length < 10) {
        return 'Le message doit contenir au moins 10 caractères.'; // Retourne un message d'erreur si la longueur du message est inférieure à 10 caractères
    }
    if (field === 'message' && value.length > 255) {
        return 'Le message doit contenir au plus 255 caractères.'; // Retourne un message d'erreur si la longueur du message dépasse 255 caractères
    }
    if (field === 'categorie' && !['politique', 'sport', 'sante', 'education'].includes(value)) {
        return 'Catégorie invalide.'; // Retourne un message d'erreur si la catégorie n'est pas dans la liste autorisée
    }

    const unwantedCharsRegex = /(\w)\1{5,}/;
    if ((field === 'libelle' || field === 'message') && unwantedCharsRegex.test(value)) {
        return `Le champ ${field} contient une lettre répétée 6 fois ou plus.`; // Retourne un message d'erreur si le champ contient une lettre répétée 6 fois ou plus
    }

    return ''; // Retourne une chaîne vide si aucune erreur n'est trouvée
}

// Fonction pour nettoyer les entrées utilisateur
function sanitizeInput(input) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = input;
    return tempDiv.innerHTML; // Retourne le contenu HTML nettoyé
}

// Fonction pour afficher les idées
const displayIdeas = () => {
    ideasList.innerHTML = ''; // Réinitialise la liste des idées

    // Récupère les idées depuis Firebase
    const ideasRef = database.ref('ideas');
    ideasRef.on('value', (snapshot) => {
        const ideas = snapshot.val();
        if (ideas) {
            Object.keys(ideas).forEach((key) => {
                const idea = ideas[key];
                const row = document.createElement('article'); // Crée un nouvel élément article

                const sanitizedLibelle = sanitizeInput(idea.libelle);
                const sanitizedMessage = sanitizeInput(idea.message);
                const sanitizedCategorie = sanitizeInput(idea.categorie);

                row.innerHTML = `
                    <div class="max-w-full sm:max-w-sm p-6 bg-white shadow-md rounded-md ${idea.approved ? 'border-green-700 border-2 shadow-2xl hover:bg-green-200 text-white ' : 'border-red-700 hover:bg-red-200 text-white border-2'}">
                        <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                            <div class="flex-1">
                                <h3 class="text-lg sm:text-2xl font-medium text-gray-700 overflow-hidden text-ellipsis">${sanitizedLibelle}</h3>
                                <span class="text-base sm:text-xl text-gray-500 overflow-hidden text-ellipsis">${sanitizedCategorie}</span>
                                <p class="text-sm w-full text-gray-500 overflow-hidden text-ellipsis">${sanitizedMessage}</p>
                            </div>
                        </div>
                        <div class="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4 sm:mt-6">
                            <button onclick="toggleApproval('${key}')" class="px-2 py-1 rounded-md ${idea.approved ? 'bg-gray-300 text-gray-700' : 'bg-green-500 text-white'}">${idea.approved ? 'Désapprouver' : 'Approuver'}</button>
                            <button onclick="deleteIdea('${key}')" class="px-2 py-1 bg-red-500 text-white rounded-md"><i class="fa-solid fa-trash"></i></button>
                            <button onclick="openEditForm('${key}', '${sanitizedLibelle}', '${sanitizedCategorie}', '${sanitizedMessage}')" class="px-2 py-1 bg-blue-500 text-white rounded-md"><i class="fa-solid fa-edit"></i></button>
                        </div>
                    </div>
                `;
                ideasList.appendChild(row); // Ajoute la ligne à la liste des idées
            });
        }
    });
};

// Fonction pour basculer l'approbation d'une idée
function toggleApproval(key) {
    const ideaRef = database.ref('ideas').child(key);
    ideaRef.transaction((idea) => {
        if (idea) {
            idea.approved = !idea.approved; // Inverse l'état d'approbation de l'idée
        }
        return idea;
    });
    displayIdeas(); // Rafraîchit l'affichage des idées après la modification
}

// Fonction pour supprimer une idée
function deleteIdea(key) {
    const ideaRef = database.ref('ideas').child(key);
    ideaRef.remove(); // Supprime l'idée de la base de données
    displayIdeas(); // Rafraîchit l'affichage des idées après la suppression
}

// Fonction pour ouvrir le formulaire de modification
function openEditForm(key, libelle, categorie, message) {
    document.getElementById('libelle').value = libelle; // Pré-remplit le champ libellé dans le formulaire
    document.getElementById('categorie').value = categorie; // Pré-remplit le champ catégorie dans le formulaire
    document.getElementById('message').value = message; // Pré-remplit le champ message dans le formulaire
    document.getElementById('submit').innerText = 'Modifier'; // Change le texte du bouton soumettre à 'Modifier'
    currentEditKey = key; // Définit la clé de modification actuelle
}

// Charge les idées depuis Firebase lors du chargement de la page
document.addEventListener('DOMContentLoaded', displayIdeas);

// Écouteur d'événement pour le champ message pour mettre à jour le compteur de caractères
document.getElementById('message').addEventListener('input', function (event) {
    const message = event.target.value;
    const messageCounter = document.getElementById('messageCounter');
    messageCounter.textContent = `${message.length}/255`; // Met à jour le compteur de caractères

    if (message.length > 254) {
        messageCounter.classList.add('text-red-500'); // Ajoute une classe pour indiquer une limite dépassée
    } else {
        messageCounter.classList.remove('text-red-500'); // Supprime la classe de limite dépassée
    }
});

// Écouteur d'événement pour la soumission du formulaire
ideaForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Empêche la soumission par défaut du formulaire
    updateOrAddIdea(); // Appelle la fonction pour mettre à jour ou ajouter une idée
});

// Fonction pour mettre à jour ou ajouter une idée
function updateOrAddIdea() {
    const libelle = document.getElementById('libelle').value.trim(); // Récupère et nettoie la valeur du champ libellé
    const categorie = document.getElementById('categorie').value.trim(); // Récupère et nettoie la valeur du champ catégorie
    const message = document.getElementById('message').value.trim(); // Récupère et nettoie la valeur du champ message

    // Réinitialise les messages d'erreur
    const messages = ideaForm.querySelectorAll('.message');
    messages.forEach(msg => msg.textContent = '');

    // Valide les champs du formulaire
    let isValid = true;
    const errors = {
        libelle: validateField('libelle', libelle),
        categorie: validateField('categorie', categorie),
        message: validateField('message', message)
    };

    for (const [field, error] of Object.entries(errors)) {
        if (error) {
            document.getElementById(field).nextElementSibling.textContent = error; // Affiche les messages d'erreur sous les champs concernés
            isValid = false;
        }
    }

    if (!isValid) {
        displayMessage('error', 'Veuillez corriger les erreurs ci-dessus.'); // Affiche un message d'erreur global s'il y a des erreurs
        return;
    }

    // Nettoie les entrées utilisateur
    const sanitizedLibelle = sanitizeInput(libelle);
    const sanitizedCategorie = sanitizeInput(categorie);
    const sanitizedMessage = sanitizeInput(message);

    // Met à jour ou ajoute l'idée dans Firebase
    if (currentEditKey) {
        const updatedData = {
            libelle: sanitizedLibelle,
            categorie: sanitizedCategorie,
            message: sanitizedMessage
        };

        const ideaRef = database.ref('ideas').child(currentEditKey);
        ideaRef.update(updatedData)
            .then(() => {
                displayMessage('success', 'Idée mise à jour avec succès.'); // Affiche un message de succès après la mise à jour
                ideaForm.reset(); // Réinitialise le formulaire
                document.getElementById('submit').innerText = 'Soumettre'; // Rétablit le texte du bouton soumettre
                currentEditKey = null; // Réinitialise la clé de modification actuelle
                displayIdeas(); // Rafraîchit l'affichage des idées
            })
            .catch((error) => {
                displayMessage('error', `Erreur lors de la mise à jour : ${error.message}`); // Affiche un message d'erreur en cas d'échec de la mise à jour
            });
    } else {
        // Ajoute l'idée dans Firebase
        const newIdeaRef = database.ref('ideas').push();
        newIdeaRef.set({
            libelle: sanitizedLibelle,
            categorie: sanitizedCategorie,
            message: sanitizedMessage,
            approved: false
        })
        .then(() => {
            displayMessage('success', 'Idée ajoutée avec succès.'); // Affiche un message de succès après l'ajout
            ideaForm.reset(); // Réinitialise le formulaire
            document.getElementById('messageCounter').innerText = '0/255'; // Réinitialise le compteur de caractères
            displayIdeas(); // Rafraîchit l'affichage des idées
        })
        .catch((error) => {
            displayMessage('error', `Erreur lors de l'ajout de l'idée : ${error.message}`); // Affiche un message d'erreur en cas d'échec de l'ajout
        });
    }
}

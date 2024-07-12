 // Tableau pour stocker les idées
 let ideas = [];

 // Récupérer les éléments du DOM
 const ideaForm = document.getElementById('ideaForm');
 const messageBox = document.getElementById('messageBox');
 const ideasList = document.getElementById('ideasList');

 // Liste des catégories valides
 const validCategories = ['politique', 'sport', 'sante', 'education'];

 // Fonction de validation des champs
 function validateField(field, value) {
     if (!value || value.trim() === '') {
         return `Le champ ${field} est requis.`;
     }
     if (field === 'libelle' && (value.length < 3 || value.length > 100)) {
         return 'Le libellé doit contenir entre 3 et 100 caractères.';
     }
     if (field === 'message' && value.length < 10) {
         return 'Le message doit contenir au moins 10 caractères.';
     }

     if (field === 'categorie' && !['politique', 'sport', 'sante', 'education'].includes(value)) {
        return 'Catégorie invalide.';
    }
     if (field === 'categorie' && !validCategories.includes(value)) {
         return 'La catégorie sélectionnée est invalide.';
     }
     return '';
 }

 // Fonction d'affichage des messages
 function displayMessage(type, message) {
     messageBox.classList.remove('hidden', 'bg-red-100', 'bg-green-100', 'text-red-700', 'text-green-700');
     messageBox.classList.add(type === 'error' ? 'bg-red-100' : 'bg-green-100', type === 'error' ? 'text-red-700' : 'text-green-700');
     messageBox.textContent = message;

     setTimeout(() => {
         messageBox.classList.add('hidden');
     }, 2000);
 }

 // Fonction d'affichage des idées
 function displayIdeas() {
     ideasList.innerHTML = '';
     ideas.forEach((idea, index) => {
         const row = document.createElement('tr');

         const purifiedLibelle = DOMPurify.sanitize(idea.libelle);
         const purifiedMessage = DOMPurify.sanitize(idea.message);
         const purifiedCategorie = DOMPurify.sanitize(idea.categorie);

         row.innerHTML = `
             <td class="border px-4 py-2">${purifiedLibelle}</td>
             <td class="border px-4 py-2">${purifiedMessage}</td>
             <td class="border px-4 py-2">${purifiedCategorie}</td>
             <td class="border px-4 py-2">
                 <button onclick="toggleApproval(${index})" class="mr-2 px-2 py-1 rounded-md ${idea.approved ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}">${idea.approved ? 'Désapprouver' : 'Approuver'}</button>
                 <button onclick="deleteIdea(${index})" class="px-2 py-1 bg-red-500 text-white rounded-md">Supprimer</button>
             </td>
         `;
         ideasList.appendChild(row);
     });
 }

 // Fonction pour approuver/désapprouver une idée
 function toggleApproval(index) {
     ideas[index].approved = !ideas[index].approved;
     displayIdeas();
 }

 // Fonction pour supprimer une idée
 function deleteIdea(index) {
     ideas.splice(index, 1);
     displayIdeas();
 }

 // Événement de soumission du formulaire
 ideaForm.addEventListener('submit', function(event) {
     event.preventDefault();

     const libelle = DOMPurify.sanitize(document.getElementById('libelle').value.trim());
     const categorie = DOMPurify.sanitize(document.getElementById('categorie').value.trim());
     const message = DOMPurify.sanitize(document.getElementById('message').value.trim());

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

     // Ajouter l'idée au tableau
     ideas.push({ libelle, categorie, message, approved: false });

     // Afficher le message de succès et réinitialiser le formulaire
     displayMessage('success', 'Idée ajoutée avec succès.');
     ideaForm.reset();
     displayIdeas();
 });
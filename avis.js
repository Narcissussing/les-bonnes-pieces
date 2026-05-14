/* global Chart */
// Fonction pour ajouter un listener sur chaque bouton "Afficher les avis"
export function ajoutListenerAvis() {
  // Sélectionne tous les boutons dans chaque article
  const piecesElements = document.querySelectorAll(".fiches article button");

  // Boucle sur chaque bouton
  for (let i = 0; i < piecesElements.length; i++) {
    // Ajoute un événement "click" sur chaque bouton
    piecesElements[i].addEventListener("click", async function (event) {
      // Récupère l'id de la pièce depuis l'attribut data-id du bouton
      // dataset.id retourne une string → on convertit en number
      const id = Number(event.target.dataset.id);

      // Envoie une requête GET pour récupérer les avis de cette pièce
      const reponse = await fetch(`http://localhost:8081/pieces/${id}/avis`);

      // Transforme la réponse JSON en objet JavaScript (tableau d'avis)
      const avis = await reponse.json();

      // Convertit les avis en string JSON pour pouvoir les stocker dans localStorage
      const valeurAvis = JSON.stringify(avis);

      // Convertit les avis (tableau JS) en string JSON car localStorage ne stocke que des chaînes
      // Puis sauvegarde ces avis avec une clé unique par pièce (ex: "avis-piece-4")
      window.localStorage.setItem(`avis-piece-${id}`, valeurAvis);

      // Récupère l'élément article parent (le conteneur de la pièce)
      const pieceElement = event.target.parentElement;

      afficherAvis(pieceElement, avis);
    });
  }
}

export function afficherAvis(pieceElement, avis) {
  //Supprimer les avis affichés sur les articles
  pieceElement
    .querySelectorAll(".avis")
    .forEach((avisPiece) => avisPiece.remove());

  // Crée un élément <p> pour afficher les avis
  const avisElement = document.createElement("p");
  avisElement.classList.add("avis"); // Ajoute une classe pour le style
  // Boucle sur chaque avis
  for (let i = 0; i < avis.length; i++) {
    // Ajoute le contenu HTML de chaque avis
    // <b>utilisateur:</b> commentaire
    avisElement.innerHTML += `<b>${avis[i].utilisateur}:</b> ${avis[i].commentaire}<br>`;
  }
  // Ajoute le bloc des avis dans l'article
  pieceElement.appendChild(avisElement);
}

// Fonction pour gérer l'envoi d'un nouvel avis via le formulaire
export function ajoutListenerEnvoyerAvis() {
  // Sélectionne le formulaire d'avis
  const formulaireAvis = document.querySelector(".formulaire-avis");
  // Ajoute un événement "submit"
  formulaireAvis.addEventListener("submit", function (event) {
    // Empêche le rechargement de la page
    event.preventDefault();
    //Creation de l'objet du nouvel avis
    const pieceId = parseInt(
      event.target.querySelector("[name=piece-id]").value,
    );
    const avis = {
      // Récupère l'id de la pièce et le convertit en nombre
      // La clé est identique au nom de la constante, ici 'pieceId'
      pieceId,

      // Récupère le nom de l'utilisateur
      utilisateur: event.target.querySelector("[name=utilisateur]").value,

      // Récupère le commentaire
      commentaire: event.target.querySelector("[name=commentaire]").value,

      // Récupère le nombre d'étoiles et le convertit en nombre
      nbEtoiles: parseInt(
        event.target.querySelector("[name=nb-etoiles]").value,
      ),
    };
    //Creation de la charge utile au format JSON
    const chargeUtile = JSON.stringify(avis);
    //Apppel de la fonction
    fetch("http://localhost:8081/avis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: chargeUtile,
    });
    formulaireAvis.reset();
    // Affiche les avis mis à jour en cliquant à nouveau sur le bouton "Afficher les avis" de la pièce concernée
    document
      .querySelector(`article[data-id="${pieceId}"]`)
      .querySelector("button")
      .click();
  });
}

export async function afficherGraphiqueAvis() {
  // Récupère tous les avis depuis l'API locale.
  // fetch() envoie une requête HTTP GET vers l'adresse indiquée.
  // await permet d'attendre la réponse avant de continuer.
  const avis = await fetch("http://localhost:8081/avis").then((avis) =>
    avis.json(),
  );

  // Crée un tableau pour compter combien d'avis existent pour chaque note.
  // L'index 0 correspond à 1 étoile, et l'index 4 correspond à 5 étoiles.
  const nb_commentaires = [0, 0, 0, 0, 0];

  // Parcourt chaque avis récupéré et ajoute 1 au compteur de la note correspondante.
  for (let commentaire of avis) {
    nb_commentaires[commentaire.nbEtoiles - 1]++;
  }

  // Définit les étiquettes affichées sur le graphique.
  // Ici, on veut montrer les notes de 5 à 1.
  const labels = ["5", "4", "3", "2", "1"];

  // Prépare les données que Chart.js va utiliser pour dessiner le graphique.
  const data = {
    labels: labels,
    datasets: [
      {
        // Nom de la série de données, affiché dans la légende.
        label: "Étoiles attribuées",
        // Inverse le tableau pour obtenir l'ordre 5 → 1.
        data: nb_commentaires.reverse(),
        // Couleur de remplissage des barres.
        backgroundColor: "rgb(232, 255, 99)",
        // Couleur du contour des barres.
        borderColor: "rgb(20, 9, 11)",
        // Épaisseur du contour.
        borderWidth: 1,
      },
    ],
  };

  // Configure le type de graphique et ses options.
  const config = {
    // Type de graphique : barres.
    type: "bar",
    // Données à afficher.
    data: data,
    // Paramètres d'affichage supplémentaires.
    options: {
      // Affiche les barres horizontalement au lieu de verticalement.
      indexAxis: "y",
    },
  };

  // Crée le graphique dans l'élément HTML qui porte l'id "graphique-avis".
  new Chart(document.querySelector("#graphique-avis"), config);
}

export async function afficherGraphiqueCommentaire() {
  const pieces = await fetch("http://localhost:8081/pieces").then((pieces) =>
    pieces.json(),
  );
  const avis = await fetch("http://localhost:8081/avis").then((avis) =>
    avis.json(),
  );

  // Crée un tableau pour compter combien de commentaire existent pour les dispos et non dispos.
  const categorieDispo = [0, 0];

  for (let i = 0; i < avis.length; i++) {
    const commentaire = avis[i];
    const piece = pieces.find((piece) => piece.id === commentaire.pieceId);
    if (piece.disponibilite) {
      categorieDispo[0]++;
    } else {
      categorieDispo[1]++;
    }
  }
  // Définit les étiquettes affichées sur le graphique.
  // Ici, on veut montrer les catégories "Dispo" et "Non dispo".
  const labels = ["En Stock", "En Rupture"];

  // Prépare les données que Chart.js va utiliser pour dessiner le graphique.
  const data = {
    labels: labels,
    datasets: [
      {
        // Nom de la série de données, affiché dans la légende.
        label: "Nombres commentaires",
        // Inverse le tableau pour obtenir l'ordre 5 → 1.
        data: categorieDispo,
        // Couleur de remplissage des barres.
        backgroundColor: "rgb(128, 255, 99)",
        // Couleur du contour des barres.
        borderColor: "rgb(20, 9, 11)",
        // Épaisseur du contour.
        borderWidth: 1,
      },
    ],
  };

  // Configure le type de graphique et ses options.
  const config = {
    // Type de graphique : barres.
    type: "bar",
    // Données à afficher.
    data: data,
    // Paramètres d'affichage supplémentaires.
    options: {
      // Affiche les barres verticalement.
      indexAxis: "x",
    },
  };

  // Crée le graphique dans l'élément HTML qui porte l'id "graphique-avis".
  new Chart(document.querySelector("#graphique-dispo"), config);
}

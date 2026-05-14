//Importer d'autres function
import {
  ajoutListenerAvis,
  ajoutListenerEnvoyerAvis,
  afficherAvis,
  afficherGraphiqueAvis,
  afficherGraphiqueCommentaire,
} from "./avis.js";

let pieces = window.localStorage.getItem("pieces");
if (pieces === null) {
  // Récupérer les données depuis le fichier JSON
  const reponse = await fetch("http://localhost:8081/pieces");
  const pieces = await reponse.json();

  //Transformation des peices en JSON pour LocalStorage
  const valeurPieces = JSON.stringify(pieces);
  //Enregistrer dans LocalStorage
  window.localStorage.setItem("pieces", valeurPieces);
} else {
  pieces = JSON.parse(pieces);
}

// Sélectionner la section où afficher les fiches
const sectionFiches = document.querySelector(".fiches");

ajoutListenerEnvoyerAvis();

//Function pour generer les pieces, en passant parametre "pieces"
function genererPieces(pieces) {
  // Boucle pour parcourir toutes les pièces
  for (let indexArticle = 0; indexArticle < pieces.length; indexArticle++) {
    // Récupérer une pièce du tableau
    const article = pieces[indexArticle];
    // Création des éléments de contenu (image, nom, prix, etc.
    const imageElement = document.createElement("img");
    imageElement.src = article.image;

    const nomElement = document.createElement("h2");
    nomElement.innerText = article.nom;

    const prixElement = document.createElement("p");
    prixElement.innerText = `Prix : ${article.prix.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} €`;
    const descriptionElement = document.createElement("p");
    descriptionElement.innerText =
      article.description ?? "Pas de description pour cet article";

    const categorieElement = document.createElement("p");
    categorieElement.innerText = article.categorie;

    const disponibilteElement = document.createElement("p");
    disponibilteElement.innerText = article.disponibilite
      ? "En Stock"
      : "En Rupture";

    //Code ajouté
    const avisBouton = document.createElement("button");
    avisBouton.dataset.id = article.id;
    avisBouton.textContent = "Afficher les avis";
    //creer l'element  article
    const articleElement = document.createElement("article");
    articleElement.dataset.id = article.id;

    // Ajouter les éléments dans la carte article
    articleElement.appendChild(imageElement);
    articleElement.appendChild(nomElement);
    articleElement.appendChild(prixElement);
    articleElement.appendChild(descriptionElement);
    articleElement.appendChild(categorieElement);
    articleElement.appendChild(disponibilteElement);
    articleElement.appendChild(avisBouton);

    // Ajouter l'article dans la section principale
    sectionFiches.append(articleElement);
  }
  ajoutListenerAvis();
}
//Premier affichage de la page
genererPieces(pieces);

for (let i = 0; i < pieces.length; i++) {
  const id = pieces[i].id;
  const avisJSON = window.localStorage.getItem(`avis-piece-${id}`);
  const avis = JSON.parse(avisJSON);

  if (avis !== null) {
    const pieceElement = document.querySelector(`article[data-id="${id}"]`);
    afficherAvis(pieceElement, avis);
  }
}

//Trier par prix croissant
const buttonTrierCroissant = document.querySelector(".btn-trier-croissant");
//Ajouter l'Event listner
buttonTrierCroissant.addEventListener("click", () => {
  //Creer une copie de liste "Pieces"
  const piecesOrdonnees = Array.from(pieces);
  //Fucntion sort et passer 2 parametres pour ordonner la liste
  piecesOrdonnees.sort(function (a, b) {
    return a.prix - b.prix;
  });
  // Effacement de l'écran et regénération de la page
  sectionFiches.innerHTML = "";
  //Passer la liste ordonée comme parametre dans "genererPieces"
  genererPieces(piecesOrdonnees);
});

//Trier par prix decroissant
const buttonTrierDecroissant = document.querySelector(".btn-trier-decroissant");
//Ajouter l'Event listner
buttonTrierDecroissant.addEventListener("click", () => {
  //Function sort et passer 2 parametres pour ordonner la liste
  const piecesOrdonnees = Array.from(pieces);
  piecesOrdonnees.sort(function (a, b) {
    return b.prix - a.prix;
  });
  // Effacement de l'écran et regénération de la page
  sectionFiches.innerHTML = "";
  //Passer la liste ordonée comme parametre dans "genererPieces"
  genererPieces(piecesOrdonnees);
});

const buttonDisponibilte = document.querySelector(".btn-filtrer-disponibilte");
//Ajouter l'Event listner
buttonDisponibilte.addEventListener("click", () => {
  const piecesFiltrees = pieces.filter(function (piece) {
    return piece.disponibilite;
  });
  // Effacement de l'écran et regénération de la page
  sectionFiches.innerHTML = "";
  //Passer la liste ordonée comme parametre dans "genererPieces"
  genererPieces(piecesFiltrees);
});

const buttonDescription = document.querySelector(".btn-filtrer-description");
//Ajouter l'Event listner
buttonDescription.addEventListener("click", () => {
  const piecesFiltrees = pieces.filter(function (piece) {
    return piece.description;
  });
  // Effacement de l'écran et regénération de la page
  sectionFiches.innerHTML = "";
  //Passer la liste ordonée comme parametre dans "genererPieces"
  genererPieces(piecesFiltrees);
});

const buttonNonAbordables = document.querySelector(".btn-non-abordables");
//Ajouter l'Event listner
buttonNonAbordables.addEventListener("click", () => {
  const piecesFiltrees = pieces.filter(function (piece) {
    return piece.prix <= 35;
  });
  // Effacement de l'écran et regénération de la page
  sectionFiches.innerHTML = "";
  //Passer la liste ordonée comme parametre dans "genererPieces"
  genererPieces(piecesFiltrees);
});

//Filtrer par peix slider
const inputPrixMax = document.getElementById("inputPrixMax");
//Ajouter l'Event listner
inputPrixMax.addEventListener("input", () => {
  //Function pour filtrer
  const piecesFiltrees = pieces.filter(function (piece) {
    //Convertir la valeur en numero et retourner pieces <= valeur de slider
    const maxPrix = Number(inputPrixMax.value);
    return piece.prix <= maxPrix;
  });
  // Effacement de l'écran et regénération de la page
  sectionFiches.innerHTML = "";
  //Passer la liste ordonée comme parametre dans "genererPieces"
  genererPieces(piecesFiltrees);
});

// Calculer les prix après application de la TVA (20%)
const prixApresTVA = pieces.map((piece) => piece.prix * 1.2);
console.log(prixApresTVA);

// Récupérer les noms des pièces
const noms = pieces.map((piece) => piece.nom);
// Supprimer les pièces non abordables (prix > 35)
for (let i = pieces.length - 1; i >= 0; i--) {
  if (pieces[i].prix > 35) {
    noms.splice(i, 1);
  }
}

// Créer une liste HTML pour afficher les pièces abordables
const abordablesElements = document.createElement("ul");
// Ajouter chaque nom dans la liste
for (let i = 0; i < noms.length; i++) {
  const nomElement = document.createElement("li");
  nomElement.innerText = noms[i];
  abordablesElements.appendChild(nomElement);
}
document.querySelector(".abordables").appendChild(abordablesElements);

// Créer deux tableaux : noms et prix des pièces
const nomsDisponibles = pieces.map((piece) => piece.nom);
const prixDisponibles = pieces.map((piece) => piece.prix);

// Supprimer les pièces non disponibles
for (let i = pieces.length - 1; i >= 0; i--) {
  if (!pieces[i].disponibilite) {
    nomsDisponibles.splice(i, 1);
    prixDisponibles.splice(i, 1);
  }
}
// Créer une liste pour afficher les pièces disponibles
const disponiblesElements = document.createElement("ul");
// Ajouter chaque élément dans la liste avec son prix
for (let i = 0; i < nomsDisponibles.length; i++) {
  const nomElement = document.createElement("li");
  nomElement.innerText = `${nomsDisponibles[i]} - ${prixDisponibles[
    i
  ].toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}€`;
  disponiblesElements.appendChild(nomElement);
}
document.querySelector(".disponibles").appendChild(disponiblesElements);

//Ajout du listener pour mettere à jour des données du localStorage
const buttonMettreAJour = document.querySelector(".btn-maj");
buttonMettreAJour.addEventListener("click", () => {
  window.localStorage.removeItem("pieces");
});

//Ajout du listener pour gerer le dark mode
const buttonDarkMode = document.querySelector(".btn-dark-mode");
buttonDarkMode.addEventListener("click", () => {
  const body = document.querySelector("body");

  body.classList.toggle("dark-mode");
});

await afficherGraphiqueAvis();

await afficherGraphiqueCommentaire();

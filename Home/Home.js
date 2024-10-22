let selectedImage = null;

// Funzione per selezionare un'immagine
function selectImage(imageId) {
    // Rimuove la selezione da tutte le immagini
    document.querySelectorAll('.image-item img').forEach(img => {
        img.classList.remove('selected');
    });

    // Aggiunge la classe 'selected' all'immagine cliccata
    selectedImage = imageId;
    document.getElementById(imageId).classList.add('selected');
}

// Funzione per reindirizzare a una pagina diversa in base all'immagine selezionata
function goToPage() {
    if (!selectedImage) {
        alert('In order to proced, select an enviroment!');
        return;
    }

    // Reindirizzamento in base all'immagine selezionata
    switch (selectedImage) {
        case 'city':
            window.location.href = 'City.html'; // Cambia con il link della pagina della città
            break;
        case 'sea':
            window.location.href = 'Sea.html'; // Cambia con il link della pagina del mare
            break;
        case 'country':
            window.location.href = 'Country.html'; // Cambia con il link della pagina della campagna
            break;
        case 'home':
            window.location.href = 'House.html'; // Cambia con il link della pagina della casa
            break;
        default:
            alert('In order to proced, select an enviroment!');
    }
}
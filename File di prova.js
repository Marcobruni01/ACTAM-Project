// Getting files for the different ambients
let dati; // Variabile per salvare i dati JSON
let ambienteCorrente;
let setCorrente;

fetch('Enviroments.json')
  .then(response => response.json())
  .then(data => {
    dati = data;
    popolaMenuAmbienti(data.ambienti);
  })
  .catch(error => console.error('Errore nel caricamento del JSON:', error));

function popolaMenuAmbienti(ambienti) {
  const ambienteSelect = document.getElementById('ambienteSelect');
  ambienti.forEach(ambiente => {
    const option = document.createElement('option');
    option.value = ambiente.nome;
    option.textContent = ambiente.nome;
    ambienteSelect.appendChild(option);
  });
}

function cambiaAmbiente() {
  const ambienteSelect = document.getElementById('ambienteSelect');
  const setSuoniSelect = document.getElementById('setSuoniSelect');
  const suoniContainer = document.getElementById('suoniContainer');

  suoniContainer.innerHTML = ''; // Reset
  setSuoniSelect.style.display = 'none'; // Nascondi finché non c'è un ambiente selezionato

  ambienteCorrente = dati.ambienti.find(a => a.nome === ambienteSelect.value);

  if (ambienteCorrente) {
    setSuoniSelect.innerHTML = '<option value="">Seleziona un set di suoni</option>';
    ambienteCorrente.setSuoni.forEach(set => {
      const option = document.createElement('option');
      option.value = set.nome;
      option.textContent = set.nome;
      setSuoniSelect.appendChild(option);
    });
    setSuoniSelect.style.display = 'block'; // Mostra menu set di suoni
  }
}

// Cambia sfondo
document.body.style.backgroundImage = `url(${ambienteCorrente.sfondo})`;

function cambiaSetSuoni() {
  const setSuoniSelect = document.getElementById('setSuoniSelect');
  const suoniContainer = document.getElementById('suoniContainer');

  suoniContainer.innerHTML = ''; // Reset
  setCorrente = ambienteCorrente.setSuoni.find(set => set.nome === setSuoniSelect.value);

  if (setCorrente) {
    Object.keys(setCorrente.suoni).forEach(chiave => {
      const button = document.createElement('button');
      button.textContent = chiave; // Nome del suono
      button.onclick = () => cambiaSuono(setCorrente.suoni[chiave]);
      suoniContainer.appendChild(button);
    });
  }
}

function cambiaSuono(url) {
  const audioPlayer = document.getElementById('audioPlayer');
  audioPlayer.src = url;
  audioPlayer.play();
}


   
    

/*

in questo codice cambiare cartelle con setSuoni nel Json e html è:

<select id="ambienteSelect" onchange="cambiaAmbiente()"></select>
<select id="cartellaSelect" onchange="cambiaCartella()"></select>

<div id="suoniContainer"></div>
<audio id="audioPlayer" controls>
  <source src="" type="audio/wav">
  Il tuo browser non supporta l'elemento audio.
</audio>


let dati = {}; // Variabile per i dati JSON caricati

// Carica il JSON e inizializza l'interfaccia
fetch('ambienti.json')
  .then(response => response.json())
  .then(json => {
    dati = json;
    inizializzaAmbienti();
  })
  .catch(error => console.error('Errore nel caricamento del JSON:', error));

function inizializzaAmbienti() {
  const ambienteSelect = document.getElementById('ambienteSelect');
  dati.ambienti.forEach(ambiente => {
    const option = document.createElement('option');
    option.value = ambiente.nome;
    option.textContent = ambiente.nome;
    ambienteSelect.appendChild(option);
  });
  cambiaAmbiente();
}

function cambiaAmbiente() {
  const ambienteSelezionato = document.getElementById('ambienteSelect').value;
  const ambiente = dati.ambienti.find(a => a.nome === ambienteSelezionato);

  // Cambia sfondo
  document.body.style.backgroundImage = `url(${ambiente.sfondo})`;

  // Aggiorna la lista delle cartelle
  const cartellaSelect = document.getElementById('cartellaSelect');
  cartellaSelect.innerHTML = ''; // Pulisce il menu precedente
  ambiente.cartelle.forEach(cartella => {
    const option = document.createElement('option');
    option.value = cartella.nome;
    option.textContent = cartella.nome;
    cartellaSelect.appendChild(option);
  });

  cambiaCartella(); // Aggiorna i suoni per la prima cartella
}

function cambiaCartella() {
  const ambienteSelezionato = document.getElementById('ambienteSelect').value;
  const cartellaSelezionata = document.getElementById('cartellaSelect').value;
  const ambiente = dati.ambienti.find(a => a.nome === ambienteSelezionato);
  const cartella = ambiente.cartelle.find(c => c.nome === cartellaSelezionata);

  const suoniContainer = document.getElementById('suoniContainer');
  suoniContainer.innerHTML = ''; // Pulisce i pulsanti precedenti

  cartella.suoni.forEach(suonoUrl => {
    const button = document.createElement('button');
    button.textContent = `Suono ${suonoUrl.split('/').pop().split('.')[0]}`;
    button.onclick = () => cambiaSuono(suonoUrl);
    suoniContainer.appendChild(button);
  });
}

function cambiaSuono(url) {
  const audioPlayer = document.getElementById('audioPlayer');
  audioPlayer.src = url;
  audioPlayer.play();
}




 
    <select id="ambienteSelect" onchange="cambiaAmbiente()">
        <option value="">Seleziona un ambiente</option>
      </select>
      
      <select id="setSuoniSelect" onchange="cambiaSetSuoni()" style="display: none;">
        <option value="">Seleziona un set di suoni</option>
      </select>
      
      <div id="suoniContainer"></div>
      


*/  
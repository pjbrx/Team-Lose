// script.js

// --- UTILITAIRE ---
function getUser() {
  return supabase.auth.user();
}

// --- CHARGEMENT DU CLASSEMENT ---
async function loadClassement() {
  const { data: membres, error } = await supabase
    .from('membres')
    .select('*')
    .order('points', { ascending: false });

  if (error) {
    console.error("Erreur chargement membres :", error);
    return;
  }

  const tbody = document.querySelector('#table-classement tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  membres.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${m.id}</td><td>${m.points}</td>`;
    tbody.appendChild(tr);
  });
}

// --- CHARGEMENT DES ACTES EN ATTENTE ---
async function loadActes() {
  const { data: actes, error } = await supabase
    .from('actes')
    .select('*')
    .eq('statut', 'pending');

  if (error) {
    console.error("Erreur chargement actes :", error);
    return;
  }

  const container = document.getElementById('actes-en-attente');
  container.innerHTML = '';

  actes.forEach(acte => {
    const div = document.createElement('div');
    div.innerHTML = `
      <strong>${acte.membre}</strong>: ${acte.description} (${acte.points_proposes} points)
      <button onclick="validerActe('${acte.id}')">Valider</button>
      <button onclick="rejeterActe('${acte.id}')">Rejeter</button>
    `;
    container.appendChild(div);
  });
}

// --- VALIDER UN ACTE ---
async function validerActe(id) {
  const currentUser = getUser()?.email;
  if (!currentUser) return alert("Connectez-vous pour valider un acte");

  const { data: acte, error } = await supabase
    .from('actes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !acte) return alert("Acte introuvable");

  let valideurs = acte.validateurs || [];
  if (!valideurs.includes(currentUser)) valideurs.push(currentUser);

  let statut = acte.statut;
  if (valideurs.length >= 3) {
    // appliquer les points
    const { data: membre, error: membreError } = await supabase
      .from('membres')
      .select('*')
      .eq('id', acte.membre)
      .single();

    if (!membreError && membre) {
      await supabase
        .from('membres')
        .update({ points: membre.points + acte.points_proposes })
        .eq('id', acte.membre);
    }

    statut = 'validated';
  }

  await supabase
    .from('actes')
    .update({ validateurs: valideurs, statut: statut })
    .eq('id', id);

  loadClassement();
  loadActes();
}

// --- REJETER UN ACTE ---
async function rejeterActe(id) {
  const currentUser = getUser()?.email;
  if (!currentUser) return alert("Connectez-vous pour rejeter un acte");

  const { data: acte, error } = await supabase
    .from('actes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !acte) return alert("Acte introuvable");

  let rejeteurs = acte.rejeteurs || [];
  if (!rejeteurs.includes(currentUser)) rejeteurs.push(currentUser);

  await supabase
    .from('actes')
    .update({ rejeteurs })
    .eq('id', id);

  loadActes();
}

// --- PROPOSER UN NOUVEL ACTE ---
document.getElementById('form-acte').addEventListener('submit', async e => {
  e.preventDefault();

  const annonceur = getUser()?.email;
  if (!annonceur) return alert("Connectez-vous pour proposer un acte");

  const membre = document.getElementById('membre').value;
  const description = document.getElementById('description').value;
  const points_proposes = parseInt(document.getElementById('points').value);

  await supabase
    .from('actes')
    .insert([{
      membre,
      description,
      points_proposes,
      validateurs: [annonceur], // l'annonceur compte comme 1 validation
      rejeteurs: [],
      statut: 'pending'
    }]);

  document.getElementById('form-acte').reset();
  loadActes();
});

// --- AUTHENTIFICATION ---
document.getElementById('btn-login').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { user, error } = await supabase.auth.signIn({ email, password });
  if (error) alert(error.message);
  else showUser(user);
});

document.getElementById('btn-signup').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { user, error } = await supabase.auth.signUp({ email, password });
  if (error) alert(error.message);
  else showUser(user);
});

document.getElementById('btn-logout').addEventListener('click', async () => {
  await supabase.auth.signOut();
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('user-info').style.display = 'none';
});

function showUser(user) {
  if (!user) return;
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('user-info').style.display = 'block';
  document.getElementById('user-email').textContent = user.email;
}

// --- CHARGEMENT INITIAL ---
loadClassement();
loadActes();

// --- Vérifier si déjà connecté ---
const user = getUser();
if (user) showUser(user);

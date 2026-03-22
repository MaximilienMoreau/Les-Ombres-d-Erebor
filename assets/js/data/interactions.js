/* ============================================
   DONNÉES — Matrice des interactions
   S = Synergie, C = Conflit, D = Détournement
   ============================================ */

const INTERACTIONS = [
  // Héraut de l'Aube
  { roles: ['herald', 'archives'],      type: 'synergie',     emoji: '🤝', description: 'Croiser leurs infos permet d\'isoler précisément une Ombre sans erreur.' },
  { roles: ['herald', 'murmure'],       type: 'conflit',      emoji: '⚔️', description: 'Le Murmure peut fausser les résultats du Héraut, semant la confusion sur la présence des Ombres.' },
  { roles: ['herald', 'fauxherald'],    type: 'detournement', emoji: '🔄', description: 'Le Faux Héraut peut se faire passer pour lui et inverser totalement la confiance du groupe.' },

  // Gardien de la Porte
  { roles: ['gardien', 'capitaine'],    type: 'synergie',     emoji: '🤝', description: 'Le Gardien bloque la fuite, le Capitaine arrête — combo dévastateur pour neutraliser un suspect.' },
  { roles: ['gardien', 'fouet'],        type: 'conflit',      emoji: '⚔️', description: 'Le Fouet de Minuit peut briser le blocage du Gardien en forçant un échange de prisonniers.' },
  { roles: ['gardien', 'changeur'],     type: 'detournement', emoji: '🔄', description: 'Le Changeur de Peau peut faire en sorte que le Gardien bloque la mauvaise personne.' },

  // Prêtresse de la Lune
  { roles: ['pretresse', 'voyant'],     type: 'synergie',     emoji: '🤝', description: 'Soigner un joueur identifié comme bon par le Voyant maximise l\'efficacité de la protection.' },
  { roles: ['pretresse', 'sculpteur'],  type: 'conflit',      emoji: '⚔️', description: 'Le Sculpteur de Cauchemars empêche la Prêtresse d\'agir la nuit, laissant ses alliés sans protection.' },
  { roles: ['pretresse', 'mainombre'],  type: 'detournement', emoji: '🔄', description: 'La Main de l\'Ombre peut corrompre les cibles de la Prêtresse pour qu\'elle protège involontairement des ennemis.' },

  // Maître des Archives
  { roles: ['archives', 'herald'],      type: 'synergie',     emoji: '🤝', description: 'Double confirmation d\'alignement : les fragments + la détection binaire isolent les suspects avec précision.' },
  { roles: ['archives', 'murmure'],     type: 'conflit',      emoji: '⚔️', description: 'Le Murmure insère de fausses données dans les archives, corrompant toute la chaîne d\'information.' },
  { roles: ['archives', 'collectionneur'], type: 'detournement', emoji: '🔄', description: 'Le Collectionneur peut voler les fragments du Maître pour remplir son propre objectif.' },

  // Messager Céleste
  { roles: ['messager', 'chasseur'],    type: 'synergie',     emoji: '🤝', description: 'Transmettre discrètement des cibles confirmées permet des assassinats coordonnés et précis.' },
  { roles: ['messager', 'murmure'],     type: 'conflit',      emoji: '⚔️', description: 'Le Murmure intercepte et réécrit les messages, transformant la coordination en piège mortel.' },
  { roles: ['messager', 'voixneant'],   type: 'detournement', emoji: '🔄', description: 'La Voix du Néant peut parler à la place du destinataire lors de la révélation du message.' },

  // Capitaine de la Garde
  { roles: ['capitaine', 'gardien'],    type: 'synergie',     emoji: '🤝', description: 'Combo blocage + arrestation : aucun suspect ne peut fuir ni voter.' },
  { roles: ['capitaine', 'masque'],     type: 'conflit',      emoji: '⚔️', description: 'Le Masque peut se faire passer pour un innocent et piéger le Capitaine dans une arrestation catastrophique.' },
  { roles: ['capitaine', 'changeur'],   type: 'detournement', emoji: '🔄', description: 'Le Changeur de Peau peut lui faire arrêter un allié crucial au pire moment.' },

  // Voyant Éclipsé
  { roles: ['voyant', 'archives'],      type: 'synergie',     emoji: '🤝', description: 'Confirmer ou infirmer les soupçons des archives avec une vision certaine — la combinaison la plus puissante.' },
  { roles: ['voyant', 'fauxoracle'],    type: 'conflit',      emoji: '⚔️', description: 'La Fausse Oracle peut le tromper avec de fausses visions avant qu\'il n\'utilise son pouvoir unique.' },
  { roles: ['voyant', 'oracles'],       type: 'detournement', emoji: '🔄', description: 'L\'Oracle Fou peut orienter les révélations du Voyant pour fausser les votes dans son sens.' },

  // Chasseur de l'Ombre
  { roles: ['chasseur', 'voyant'],      type: 'synergie',     emoji: '🤝', description: 'Tuer une Ombre confirmée par le Voyant : le combo le plus fiable mais aussi le plus risqué si le Voyant est trompé.' },
  { roles: ['chasseur', 'mainombre'],   type: 'conflit',      emoji: '⚔️', description: 'La Main de l\'Ombre peut convertir la cible du Chasseur juste avant l\'attaque, le condamnant à mort.' },
  { roles: ['chasseur', 'assassin'],    type: 'detournement', emoji: '🔄', description: 'L\'Assassin Muet peut orienter le Chasseur vers sa propre cible pour économiser son unique meurtre.' },

  // Tisserand de Vérité
  { roles: ['tisserand', 'voyant'],     type: 'synergie',     emoji: '🤝', description: 'Forcer une révélation + confirmer avec le Voyant : les Ombres ne peuvent plus se cacher derrière des demi-vérités.' },
  { roles: ['tisserand', 'fauxherald'], type: 'conflit',      emoji: '⚔️', description: 'Le Faux Héraut peut dire une vérité trompeuse suffisamment habile pour passer le test.' },
  { roles: ['tisserand', 'voixneant'],  type: 'detournement', emoji: '🔄', description: 'La Voix du Néant peut parler à la place d\'un joueur contraint, sabotant totalement le pouvoir du Tisserand.' },

  // Apprenti Mystique
  { roles: ['apprenti', 'pretresse'],   type: 'synergie',     emoji: '🤝', description: 'Hériter du rôle de la Prêtresse après sa mort assure la continuité de la protection.' },
  { roles: ['apprenti', 'mainombre'],   type: 'conflit',      emoji: '⚔️', description: 'La Main de l\'Ombre le corrompt juste après qu\'il a hérité d\'un rôle clé — catastrophe pour les bons.' },
  { roles: ['apprenti', 'changeur'],    type: 'detournement', emoji: '🔄', description: 'Le Changeur de Peau peut lui donner un rôle inutile pour gâcher l\'héritage.' },

  // Murmure de l'Abysse
  { roles: ['murmure', 'fauxoracle'],   type: 'synergie',     emoji: '🤝', description: 'Chaos total dans les informations des bons : double couche de désinformation imparable.' },
  { roles: ['murmure', 'collectionneur'], type: 'conflit',    emoji: '⚔️', description: 'Le Collectionneur peut révéler les manipulations du Murmure en croisant les informations reçues.' },
  { roles: ['murmure', 'tisserand'],    type: 'detournement', emoji: '🔄', description: 'Le Tisserand peut le forcer à révéler une vérité sur son pouvoir lors d\'une épreuve publique.' },

  // Assassin Voilé
  { roles: ['assassin', 'mainombre'],   type: 'synergie',     emoji: '🤝', description: 'Convertir un joueur d\'abord, puis éliminer un témoin gênant : la paire la plus meurtrière.' },
  { roles: ['assassin', 'gardien'],     type: 'conflit',      emoji: '⚔️', description: 'Le Gardien de la Porte l\'empêche d\'atteindre sa cible nocturne.' },
  { roles: ['assassin', 'chasseur'],    type: 'detournement', emoji: '🔄', description: 'Le Chasseur de l\'Ombre peut le devancer et l\'éliminer en représailles.' },

  // Changeur de Peau
  { roles: ['changeur', 'mainombre'],   type: 'synergie',     emoji: '🤝', description: 'Échange + corruption : un joueur bon se retrouve avec un rôle Ombre et corrompu. Dévastateur.' },
  { roles: ['changeur', 'apprenti'],    type: 'conflit',      emoji: '⚔️', description: 'L\'Apprenti devient imprévisible après l\'échange — ses nouvelles capacités peuvent surprendre les Ombres.' },
  { roles: ['changeur', 'masque'],      type: 'detournement', emoji: '🔄', description: 'Le Masque peut lui voler l\'identité échangée pour créer une confusion encore plus totale.' },

  // Faux Héraut
  { roles: ['fauxherald', 'fauxoracle'], type: 'synergie',    emoji: '🤝', description: 'Deux imposteurs qui couvrent les rôles clés de divination : les bons n\'ont plus rien de fiable.' },
  { roles: ['fauxherald', 'tisserand'], type: 'conflit',      emoji: '⚔️', description: 'Le Tisserand peut coincer le Faux Héraut dans une contradiction lors d\'un test public.' },
  { roles: ['fauxherald', 'herald'],    type: 'detournement', emoji: '🔄', description: 'Le vrai Héraut peut démasquer le Faux par croisement d\'informations contradictoires.' },

  // Main de l'Ombre
  { roles: ['mainombre', 'changeur'],   type: 'synergie',     emoji: '🤝', description: 'Corruption stratégique après échange : le joueur corrompu ne sait même plus qu\'il l\'est.' },
  { roles: ['mainombre', 'pretresse'],  type: 'conflit',      emoji: '⚔️', description: 'La Prêtresse peut protéger une cible clé juste avant la corruption.' },
  { roles: ['mainombre', 'fouet'],      type: 'detournement', emoji: '🔄', description: 'Le Fouet de Minuit peut déplacer la cible hors de portée avant que la corruption soit effectuée.' },

  // Sculpteur de Cauchemars
  { roles: ['sculpteur', 'assassin'],   type: 'synergie',     emoji: '🤝', description: 'Neutraliser la Prêtresse ou le Gardien avant un assassinat : le meurtre devient garanti.' },
  { roles: ['sculpteur', 'voyant'],     type: 'conflit',      emoji: '⚔️', description: 'Le Voyant peut agir pour la dernière fois avant d\'être bloqué — et sa révélation peut tout changer.' },
  { roles: ['sculpteur', 'masque'],     type: 'detournement', emoji: '🔄', description: 'Le Masque peut se faire passer pour le Sculpteur et bloquer un allié des Ombres par erreur.' },

  // Fausse Oracle
  { roles: ['fauxoracle', 'murmure'],   type: 'synergie',     emoji: '🤝', description: 'Désinformation en chaîne : le Murmure prépare le terrain, la Fausse Oracle le confirme avec des "visions".' },
  { roles: ['fauxoracle', 'voyant'],    type: 'conflit',      emoji: '⚔️', description: 'Le Voyant peut la confronter avec ses propres visions fiables et exposer ses mensonges.' },
  { roles: ['fauxoracle', 'traqueur'],  type: 'detournement', emoji: '🔄', description: 'Le Traqueur de Légendes peut prouver ses mensonges en croisant ses "révélations" avec la réalité.' },

  // Voix du Néant
  { roles: ['voixneant', 'murmure'],    type: 'synergie',     emoji: '🤝', description: 'Forcer un joueur à dire de fausses informations préparées par le Murmure : désinformation en bouche d\'ennemi.' },
  { roles: ['voixneant', 'tisserand'],  type: 'conflit',      emoji: '⚔️', description: 'Le Tisserand peut la piéger en forçant une révélation qui révèle la manipulation.' },
  { roles: ['voixneant', 'collectionneur'], type: 'detournement', emoji: '🔄', description: 'Le Collectionneur peut utiliser une manipulation de la Voix pour obtenir un aveu involontaire.' },

  // Oracle Fou
  { roles: ['oracles', 'fauxoracle'],   type: 'synergie',     emoji: '🤝', description: 'La Fausse Oracle génère de la confusion qui augmente les erreurs de vote — l\'Oracle en profite.' },
  { roles: ['oracles', 'traqueur'],     type: 'conflit',      emoji: '⚔️', description: 'Le Traqueur peut le démasquer en prouvant que ses "prédictions" ne correspondent pas à la réalité.' },
  { roles: ['oracles', 'messager'],     type: 'detournement', emoji: '🔄', description: 'Le Messager Céleste peut saboter sa communication entre quartiers, isolant son influence.' },

  // Assassin Muet
  { roles: ['assassinmuet', 'fouet'],   type: 'synergie',     emoji: '🤝', description: 'Le Fouet place la cible dans son quartier — l\'Assassin Muet n\'a plus qu\'à frapper.' },
  { roles: ['assassinmuet', 'gardien'], type: 'conflit',      emoji: '⚔️', description: 'Le Gardien de la Porte peut bloquer son unique action nocturne et le condamner à l\'échec.' },
  { roles: ['assassinmuet', 'chasseur'], type: 'detournement', emoji: '🔄', description: 'Le Chasseur peut le devancer et tuer sa cible avant lui, le condamnant à l\'inutilité.' },

  // Collectionneur de Secrets
  { roles: ['collectionneur', 'archives'], type: 'synergie',  emoji: '🤝', description: 'Accéder aux fragments du Maître permet de remplir rapidement l\'objectif de 5 informations vérifiées.' },
  { roles: ['collectionneur', 'murmure'],  type: 'conflit',   emoji: '⚔️', description: 'Le Murmure donne de fausses infos — les faux fragments ne comptent pas pour l\'objectif.' },
  { roles: ['collectionneur', 'fauxoracle'], type: 'detournement', emoji: '🔄', description: 'La Fausse Oracle peut le tromper en lui faisant collecter des fragments invalides.' },

  // Traqueur de Légendes
  { roles: ['traqueur', 'voyant'],      type: 'synergie',     emoji: '🤝', description: 'Identifier rapidement des rôles exacts avec l\'aide des visions du Voyant — objectif rempli en quelques tours.' },
  { roles: ['traqueur', 'changeur'],    type: 'conflit',      emoji: '⚔️', description: 'Le Changeur de Peau rend ses recherches caduques du jour au lendemain.' },
  { roles: ['traqueur', 'fauxoracle'],  type: 'detournement', emoji: '🔄', description: 'La Fausse Oracle peut inverser complètement ses déductions en lui donnant de fausses confirmations.' },

  // Le Masque
  { roles: ['masque', 'changeur'],      type: 'synergie',     emoji: '🤝', description: 'Confusion totale sur les identités : le Changeur échange les rôles pendant que le Masque les imite.' },
  { roles: ['masque', 'tisserand'],     type: 'conflit',      emoji: '⚔️', description: 'Le Tisserand peut le coincer lors d\'une vérité forcée qui révèle les contradictions de son impostage.' },
  { roles: ['masque', 'gardien'],       type: 'detournement', emoji: '🔄', description: 'Le Gardien peut l\'empêcher de se déplacer pour copier un pouvoir visible dans un autre quartier.' },

  // Fouet de Minuit
  { roles: ['fouet', 'assassinmuet'],   type: 'synergie',     emoji: '🤝', description: 'Placer la cible dans le bon quartier au bon moment : l\'Assassin Muet peut enfin frapper.' },
  { roles: ['fouet', 'gardien'],        type: 'conflit',      emoji: '⚔️', description: 'Le Gardien de la Porte bloque ses échanges forcés en retenant les joueurs dans leur quartier.' },
  { roles: ['fouet', 'mainombre'],      type: 'detournement', emoji: '🔄', description: 'La Main de l\'Ombre peut corrompre les joueurs déplacés par le Fouet — effet boomerang dévastateur.' },

  // Marchand d'Âmes
  { roles: ['marchand', 'assassin'],    type: 'synergie',     emoji: '🤝', description: 'L\'Assassin crée des morts dans son quartier — le Marchand accumule les âmes sans effort.' },
  { roles: ['marchand', 'pretresse'],   type: 'conflit',      emoji: '⚔️', description: 'La Prêtresse empêche les morts dans le quartier du Marchand, bloquant son accumulation d\'âmes.' },
  { roles: ['marchand', 'fouet'],       type: 'detournement', emoji: '🔄', description: 'Le Fouet de Minuit peut l\'envoyer loin des combats, l\'empêchant de récolter des âmes.' },
];

// Construire un index de lookup rapide
const INTERACTION_MAP = {};
INTERACTIONS.forEach(inter => {
  const [a, b] = inter.roles;
  if (!INTERACTION_MAP[a]) INTERACTION_MAP[a] = {};
  if (!INTERACTION_MAP[b]) INTERACTION_MAP[b] = {};
  INTERACTION_MAP[a][b] = inter;
  INTERACTION_MAP[b][a] = inter;
});

function getInteraction(roleA, roleB) {
  if (roleA === roleB) return { type: 'self', emoji: '—', description: '' };
  return (INTERACTION_MAP[roleA] && INTERACTION_MAP[roleA][roleB]) || null;
}

if (typeof module !== 'undefined') module.exports = { INTERACTIONS, INTERACTION_MAP, getInteraction };

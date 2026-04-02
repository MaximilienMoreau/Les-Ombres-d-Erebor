/* ============================================
   DONNÉES — Matrice des interactions
   S = Synergie, C = Conflit, D = Détournement
   ============================================ */

const INTERACTIONS = [
  // Héraut de l'Aube
  { roles: ['herald', 'archives'],      type: 'synergie',     emoji: '🤝', description: 'Croiser leurs infos permet d\'isoler précisément une Ombre sans erreur.',  descriptionEn: 'Cross-referencing their information allows a Shadow to be pinpointed without error.' },
  { roles: ['herald', 'murmure'],       type: 'conflit',      emoji: '⚔️', description: 'Le Murmure peut fausser les résultats du Héraut, semant la confusion sur la présence des Ombres.', descriptionEn: 'The Abyss Whisper can skew the Herald\'s results, sowing confusion about the presence of Shadows.' },
  { roles: ['herald', 'fauxherald'],    type: 'detournement', emoji: '🔄', description: 'Le Faux Héraut peut se faire passer pour lui et inverser totalement la confiance du groupe.', descriptionEn: 'The False Herald can impersonate him and completely reverse the group\'s trust.' },

  // Gardien de la Porte
  { roles: ['gardien', 'capitaine'],    type: 'synergie',     emoji: '🤝', description: 'Le Gardien bloque la fuite, le Capitaine arrête — combo dévastateur pour neutraliser un suspect.', descriptionEn: 'The Warden blocks escape, the Captain arrests — a devastating combo to neutralise a suspect.' },
  { roles: ['gardien', 'fouet'],        type: 'conflit',      emoji: '⚔️', description: 'Le Fouet de Minuit peut briser le blocage du Gardien en forçant un échange de prisonniers.', descriptionEn: 'The Midnight Whip can break the Warden\'s block by forcing a prisoner exchange.' },
  { roles: ['gardien', 'changeur'],     type: 'detournement', emoji: '🔄', description: 'Le Changeur de Peau peut faire en sorte que le Gardien bloque la mauvaise personne.', descriptionEn: 'The Skinchanger can make the Warden block the wrong person.' },

  // Prêtresse de la Lune
  { roles: ['pretresse', 'voyant'],     type: 'synergie',     emoji: '🤝', description: 'Soigner un joueur identifié comme bon par le Voyant maximise l\'efficacité de la protection.', descriptionEn: 'Healing a player identified as good by the Seer maximises the effectiveness of the protection.' },
  { roles: ['pretresse', 'sculpteur'],  type: 'conflit',      emoji: '⚔️', description: 'Le Sculpteur de Cauchemars empêche la Prêtresse d\'agir la nuit, laissant ses alliés sans protection.', descriptionEn: 'The Nightmare Sculptor prevents the Priestess from acting at night, leaving her allies unprotected.' },
  { roles: ['pretresse', 'mainombre'],  type: 'detournement', emoji: '🔄', description: 'La Main de l\'Ombre peut corrompre les cibles de la Prêtresse pour qu\'elle protège involontairement des ennemis.', descriptionEn: 'The Shadow\'s Hand can corrupt the Priestess\'s targets so she unwittingly protects enemies.' },

  // Maître des Archives
  { roles: ['archives', 'herald'],      type: 'synergie',     emoji: '🤝', description: 'Double confirmation d\'alignement : les fragments + la détection binaire isolent les suspects avec précision.', descriptionEn: 'Double alignment confirmation: the fragments plus binary detection isolate suspects with precision.' },
  { roles: ['archives', 'murmure'],     type: 'conflit',      emoji: '⚔️', description: 'Le Murmure insère de fausses données dans les archives, corrompant toute la chaîne d\'information.', descriptionEn: 'The Whisper inserts false data into the archives, corrupting the entire information chain.' },
  { roles: ['archives', 'collectionneur'], type: 'detournement', emoji: '🔄', description: 'Le Collectionneur peut voler les fragments du Maître pour remplir son propre objectif.', descriptionEn: 'The Collector can steal the Master\'s fragments to fulfil their own objective.' },

  // Messager Céleste
  { roles: ['messager', 'chasseur'],    type: 'synergie',     emoji: '🤝', description: 'Transmettre discrètement des cibles confirmées permet des assassinats coordonnés et précis.', descriptionEn: 'Discreetly transmitting confirmed targets enables coordinated and precise assassinations.' },
  { roles: ['messager', 'murmure'],     type: 'conflit',      emoji: '⚔️', description: 'Le Murmure intercepte et réécrit les messages, transformant la coordination en piège mortel.', descriptionEn: 'The Whisper intercepts and rewrites messages, turning coordination into a deadly trap.' },
  { roles: ['messager', 'voixneant'],   type: 'detournement', emoji: '🔄', description: 'La Voix du Néant peut parler à la place du destinataire lors de la révélation du message.', descriptionEn: 'The Voice of the Void can speak in place of the recipient when the message is revealed.' },

  // Capitaine de la Garde
  { roles: ['capitaine', 'gardien'],    type: 'synergie',     emoji: '🤝', description: 'Combo blocage + arrestation : aucun suspect ne peut fuir ni voter.', descriptionEn: 'Block + arrest combo: no suspect can flee or vote.' },
  { roles: ['capitaine', 'masque'],     type: 'conflit',      emoji: '⚔️', description: 'Le Masque peut se faire passer pour un innocent et piéger le Capitaine dans une arrestation catastrophique.', descriptionEn: 'The Mask can pose as an innocent and trap the Captain in a catastrophic arrest.' },
  { roles: ['capitaine', 'changeur'],   type: 'detournement', emoji: '🔄', description: 'Le Changeur de Peau peut lui faire arrêter un allié crucial au pire moment.', descriptionEn: 'The Skinchanger can make him arrest a crucial ally at the worst moment.' },

  // Voyant Éclipsé
  { roles: ['voyant', 'archives'],      type: 'synergie',     emoji: '🤝', description: 'Confirmer ou infirmer les soupçons des archives avec une vision certaine — la combinaison la plus puissante.', descriptionEn: 'Confirming or disproving archive suspicions with a certain vision — the most powerful combination.' },
  { roles: ['voyant', 'fauxoracle'],    type: 'conflit',      emoji: '⚔️', description: 'La Fausse Oracle peut le tromper avec de fausses visions avant qu\'il n\'utilise son pouvoir unique.', descriptionEn: 'The False Oracle can trick him with false visions before he uses his unique power.' },
  { roles: ['voyant', 'oracles'],       type: 'detournement', emoji: '🔄', description: 'L\'Oracle Fou peut orienter les révélations du Voyant pour fausser les votes dans son sens.', descriptionEn: 'The Mad Oracle can steer the Seer\'s revelations to skew votes in his favour.' },

  // Chasseur de l'Ombre
  { roles: ['chasseur', 'voyant'],      type: 'synergie',     emoji: '🤝', description: 'Tuer une Ombre confirmée par le Voyant : le combo le plus fiable mais aussi le plus risqué si le Voyant est trompé.', descriptionEn: 'Killing a Shadow confirmed by the Seer: the most reliable combo but also the riskiest if the Seer is deceived.' },
  { roles: ['chasseur', 'mainombre'],   type: 'conflit',      emoji: '⚔️', description: 'La Main de l\'Ombre peut convertir la cible du Chasseur juste avant l\'attaque, le condamnant à mort.', descriptionEn: 'The Shadow\'s Hand can convert the Hunter\'s target just before the attack, condemning him to death.' },
  { roles: ['chasseur','assassin'],    type: 'detournement', emoji: '🔄', description: 'L\'Assassin Muet peut orienter le Chasseur vers sa propre cible pour économiser son unique meurtre.', descriptionEn: 'The Silent Assassin can steer the Hunter towards their own target to save their single kill.' },

  // Tisserand de Vérité
  { roles: ['tisserand', 'voyant'],     type: 'synergie',     emoji: '🤝', description: 'Forcer une révélation + confirmer avec le Voyant : les Ombres ne peuvent plus se cacher derrière des demi-vérités.', descriptionEn: 'Forcing a revelation and confirming with the Seer: Shadows can no longer hide behind half-truths.' },
  { roles: ['tisserand', 'fauxherald'], type: 'conflit',      emoji: '⚔️', description: 'Le Faux Héraut peut dire une vérité trompeuse suffisamment habile pour passer le test.', descriptionEn: 'The False Herald can tell a deceptive truth skilful enough to pass the test.' },
  { roles: ['tisserand', 'voixneant'],  type: 'detournement', emoji: '🔄', description: 'La Voix du Néant peut parler à la place d\'un joueur contraint, sabotant totalement le pouvoir du Tisserand.', descriptionEn: 'The Voice of the Void can speak in place of a constrained player, totally sabotaging the Weaver\'s power.' },

  // Apprenti Mystique
  { roles: ['apprenti', 'pretresse'],   type: 'synergie',     emoji: '🤝', description: 'Hériter du rôle de la Prêtresse après sa mort assure la continuité de la protection.', descriptionEn: 'Inheriting the Priestess\'s role after her death ensures continuity of protection.' },
  { roles: ['apprenti', 'mainombre'],   type: 'conflit',      emoji: '⚔️', description: 'La Main de l\'Ombre le corrompt juste après qu\'il a hérité d\'un rôle clé — catastrophe pour les bons.', descriptionEn: 'The Shadow\'s Hand corrupts him just after he has inherited a key role — catastrophic for the good players.' },
  { roles: ['apprenti', 'changeur'],    type: 'detournement', emoji: '🔄', description: 'Le Changeur de Peau peut lui donner un rôle inutile pour gâcher l\'héritage.', descriptionEn: 'The Skinchanger can give him a useless role to waste the inheritance.' },

  // Murmure de l'Abysse
  { roles: ['murmure', 'fauxoracle'],   type: 'synergie',     emoji: '🤝', description: 'Chaos total dans les informations des bons : double couche de désinformation imparable.', descriptionEn: 'Total chaos in the good players\' information: an unstoppable double layer of disinformation.' },
  { roles: ['murmure', 'collectionneur'], type: 'conflit',    emoji: '⚔️', description: 'Le Collectionneur peut révéler les manipulations du Murmure en croisant les informations reçues.', descriptionEn: 'The Collector can expose the Whisper\'s manipulations by cross-referencing received information.' },
  { roles: ['murmure', 'tisserand'],    type: 'detournement', emoji: '🔄', description: 'Le Tisserand peut le forcer à révéler une vérité sur son pouvoir lors d\'une épreuve publique.', descriptionEn: 'The Weaver can force him to reveal a truth about his power during a public trial.' },

  // Assassin Voilé
  { roles: ['assassin', 'mainombre'],   type: 'synergie',     emoji: '🤝', description: 'Convertir un joueur d\'abord, puis éliminer un témoin gênant : la paire la plus meurtrière.', descriptionEn: 'Convert a player first, then eliminate an inconvenient witness: the most deadly pair.' },
  { roles: ['assassin', 'gardien'],     type: 'conflit',      emoji: '⚔️', description: 'Le Gardien de la Porte l\'empêche d\'atteindre sa cible nocturne.', descriptionEn: 'The Gate Warden prevents him from reaching his nightly target.' },
  { roles: ['assassin', 'chasseur'],    type: 'detournement', emoji: '🔄', description: 'Le Chasseur de l\'Ombre peut le devancer et l\'éliminer en représailles.', descriptionEn: 'The Shadow Hunter can get ahead of him and eliminate him in retaliation.' },

  // Changeur de Peau
  { roles: ['changeur', 'mainombre'],   type: 'synergie',     emoji: '🤝', description: 'Échange + corruption : un joueur bon se retrouve avec un rôle Ombre et corrompu. Dévastateur.', descriptionEn: 'Swap + corruption: a good player ends up with a Shadow role and corrupted. Devastating.' },
  { roles: ['changeur', 'apprenti'],    type: 'conflit',      emoji: '⚔️', description: 'L\'Apprenti devient imprévisible après l\'échange — ses nouvelles capacités peuvent surprendre les Ombres.', descriptionEn: 'The Apprentice becomes unpredictable after the swap — their new abilities can surprise the Shadows.' },
  { roles: ['changeur', 'masque'],      type: 'detournement', emoji: '🔄', description: 'Le Masque peut lui voler l\'identité échangée pour créer une confusion encore plus totale.', descriptionEn: 'The Mask can steal the swapped identity to create even greater confusion.' },

  // Faux Héraut
  { roles: ['fauxherald', 'fauxoracle'], type: 'synergie',    emoji: '🤝', description: 'Deux imposteurs qui couvrent les rôles clés de divination : les bons n\'ont plus rien de fiable.', descriptionEn: 'Two impostors covering the key divination roles: the good players have nothing reliable left.' },
  { roles: ['fauxherald', 'tisserand'], type: 'conflit',      emoji: '⚔️', description: 'Le Tisserand peut coincer le Faux Héraut dans une contradiction lors d\'un test public.', descriptionEn: 'The Weaver can trap the False Herald in a contradiction during a public test.' },
  { roles: ['fauxherald', 'herald'],    type: 'detournement', emoji: '🔄', description: 'Le vrai Héraut peut démasquer le Faux par croisement d\'informations contradictoires.', descriptionEn: 'The true Herald can unmask the False one by cross-referencing contradictory information.' },

  // Main de l'Ombre
  { roles: ['mainombre', 'changeur'],   type: 'synergie',     emoji: '🤝', description: 'Corruption stratégique après échange : le joueur corrompu ne sait même plus qu\'il l\'est.', descriptionEn: 'Strategic corruption after a swap: the corrupted player no longer even knows they are.' },
  { roles: ['mainombre', 'pretresse'],  type: 'conflit',      emoji: '⚔️', description: 'La Prêtresse peut protéger une cible clé juste avant la corruption.', descriptionEn: 'The Priestess can protect a key target just before the corruption.' },
  { roles: ['mainombre', 'fouet'],      type: 'detournement', emoji: '🔄', description: 'Le Fouet de Minuit peut déplacer la cible hors de portée avant que la corruption soit effectuée.', descriptionEn: 'The Midnight Whip can move the target out of range before the corruption is carried out.' },

  // Sculpteur de Cauchemars
  { roles: ['sculpteur', 'assassin'],   type: 'synergie',     emoji: '🤝', description: 'Neutraliser la Prêtresse ou le Gardien avant un assassinat : le meurtre devient garanti.', descriptionEn: 'Neutralising the Priestess or the Warden before an assassination: the kill becomes guaranteed.' },
  { roles: ['sculpteur', 'voyant'],     type: 'conflit',      emoji: '⚔️', description: 'Le Voyant peut agir pour la dernière fois avant d\'être bloqué — et sa révélation peut tout changer.', descriptionEn: 'The Seer can act one last time before being blocked — and their revelation can change everything.' },
  { roles: ['sculpteur', 'masque'],     type: 'detournement', emoji: '🔄', description: 'Le Masque peut se faire passer pour le Sculpteur et bloquer un allié des Ombres par erreur.', descriptionEn: 'The Mask can pose as the Sculptor and accidentally block a Shadow ally.' },

  // Fausse Oracle
  { roles: ['fauxoracle', 'murmure'],   type: 'synergie',     emoji: '🤝', description: 'Désinformation en chaîne : le Murmure prépare le terrain, la Fausse Oracle le confirme avec des "visions".', descriptionEn: 'Chained disinformation: the Whisper prepares the ground, the False Oracle confirms it with "visions".' },
  { roles: ['fauxoracle', 'voyant'],    type: 'conflit',      emoji: '⚔️', description: 'Le Voyant peut la confronter avec ses propres visions fiables et exposer ses mensonges.', descriptionEn: 'The Seer can confront her with their own reliable visions and expose her lies.' },
  { roles: ['fauxoracle', 'traqueur'],  type: 'detournement', emoji: '🔄', description: 'Le Traqueur de Légendes peut prouver ses mensonges en croisant ses "révélations" avec la réalité.', descriptionEn: 'The Legend Tracker can prove her lies by cross-referencing her "revelations" with reality.' },

  // Voix du Néant
  { roles: ['voixneant', 'murmure'],    type: 'synergie',     emoji: '🤝', description: 'Forcer un joueur à dire de fausses informations préparées par le Murmure : désinformation en bouche d\'ennemi.', descriptionEn: 'Forcing a player to speak false information prepared by the Whisper: disinformation from the enemy\'s own mouth.' },
  { roles: ['voixneant', 'tisserand'],  type: 'conflit',      emoji: '⚔️', description: 'Le Tisserand peut la piéger en forçant une révélation qui révèle la manipulation.', descriptionEn: 'The Weaver can trap her by forcing a revelation that exposes the manipulation.' },
  { roles: ['voixneant', 'collectionneur'], type: 'detournement', emoji: '🔄', description: 'Le Collectionneur peut utiliser une manipulation de la Voix pour obtenir un aveu involontaire.', descriptionEn: 'The Collector can exploit a manipulation by the Voice to obtain an involuntary confession.' },

  // Oracle Fou
  { roles: ['oracles', 'fauxoracle'],   type: 'synergie',     emoji: '🤝', description: 'La Fausse Oracle génère de la confusion qui augmente les erreurs de vote — l\'Oracle en profite.', descriptionEn: 'The False Oracle generates confusion that increases voting errors — the Oracle exploits this.' },
  { roles: ['oracles', 'traqueur'],     type: 'conflit',      emoji: '⚔️', description: 'Le Traqueur peut le démasquer en prouvant que ses "prédictions" ne correspondent pas à la réalité.', descriptionEn: 'The Tracker can unmask him by proving his "predictions" do not match reality.' },
  { roles: ['oracles', 'messager'],     type: 'detournement', emoji: '🔄', description: 'Le Messager Céleste peut saboter sa communication entre quartiers, isolant son influence.', descriptionEn: 'The Celestial Messenger can sabotage his communication between districts, isolating his influence.' },

  // Assassin Muet
  { roles: ['assassinmuet', 'fouet'],   type: 'synergie',     emoji: '🤝', description: 'Le Fouet place la cible dans son quartier — l\'Assassin Muet n\'a plus qu\'à frapper.', descriptionEn: 'The Whip places the target in their district — the Silent Assassin just has to strike.' },
  { roles: ['assassinmuet', 'gardien'], type: 'conflit',      emoji: '⚔️', description: 'Le Gardien de la Porte peut bloquer son unique action nocturne et le condamner à l\'échec.', descriptionEn: 'The Gate Warden can block their single nocturnal action and condemn them to failure.' },
  { roles: ['assassinmuet', 'chasseur'], type: 'detournement', emoji: '🔄', description: 'Le Chasseur peut le devancer et tuer sa cible avant lui, le condamnant à l\'inutilité.', descriptionEn: 'The Hunter can get ahead and kill their target first, condemning them to uselessness.' },

  // Collectionneur de Secrets
  { roles: ['collectionneur', 'archives'], type: 'synergie',  emoji: '🤝', description: 'Accéder aux fragments du Maître permet de remplir rapidement l\'objectif de 5 informations vérifiées.', descriptionEn: 'Accessing the Master\'s fragments allows the objective of 5 verified pieces of information to be filled quickly.' },
  { roles: ['collectionneur', 'murmure'],  type: 'conflit',   emoji: '⚔️', description: 'Le Murmure donne de fausses infos — les faux fragments ne comptent pas pour l\'objectif.', descriptionEn: 'The Whisper provides false information — fake fragments do not count towards the objective.' },
  { roles: ['collectionneur', 'fauxoracle'], type: 'detournement', emoji: '🔄', description: 'La Fausse Oracle peut le tromper en lui faisant collecter des fragments invalides.', descriptionEn: 'The False Oracle can trick him into collecting invalid fragments.' },

  // Traqueur de Légendes
  { roles: ['traqueur', 'voyant'],      type: 'synergie',     emoji: '🤝', description: 'Identifier rapidement des rôles exacts avec l\'aide des visions du Voyant — objectif rempli en quelques tours.', descriptionEn: 'Quickly identifying exact roles with the help of the Seer\'s visions — objective fulfilled in a few rounds.' },
  { roles: ['traqueur', 'changeur'],    type: 'conflit',      emoji: '⚔️', description: 'Le Changeur de Peau rend ses recherches caduques du jour au lendemain.', descriptionEn: 'The Skinchanger renders their research obsolete overnight.' },
  { roles: ['traqueur', 'fauxoracle'],  type: 'detournement', emoji: '🔄', description: 'La Fausse Oracle peut inverser complètement ses déductions en lui donnant de fausses confirmations.', descriptionEn: 'The False Oracle can completely reverse their deductions by giving false confirmations.' },

  // Le Masque
  { roles: ['masque', 'changeur'],      type: 'synergie',     emoji: '🤝', description: 'Confusion totale sur les identités : le Changeur échange les rôles pendant que le Masque les imite.', descriptionEn: 'Total confusion about identities: the Skinchanger swaps roles while the Mask imitates them.' },
  { roles: ['masque', 'tisserand'],     type: 'conflit',      emoji: '⚔️', description: 'Le Tisserand peut le coincer lors d\'une vérité forcée qui révèle les contradictions de son impostage.', descriptionEn: 'The Weaver can corner him during a forced truth that reveals the contradictions in his impersonation.' },
  { roles: ['masque', 'gardien'],       type: 'detournement', emoji: '🔄', description: 'Le Gardien peut l\'empêcher de se déplacer pour copier un pouvoir visible dans un autre quartier.', descriptionEn: 'The Warden can prevent him from moving to copy a visible power in another district.' },

  // Fouet de Minuit
  { roles: ['fouet', 'assassinmuet'],   type: 'synergie',     emoji: '🤝', description: 'Placer la cible dans le bon quartier au bon moment : l\'Assassin Muet peut enfin frapper.', descriptionEn: 'Placing the target in the right district at the right moment: the Silent Assassin can finally strike.' },
  { roles: ['fouet', 'gardien'],        type: 'conflit',      emoji: '⚔️', description: 'Le Gardien de la Porte bloque ses échanges forcés en retenant les joueurs dans leur quartier.', descriptionEn: 'The Gate Warden blocks its forced swaps by holding players in their district.' },
  { roles: ['fouet', 'mainombre'],      type: 'detournement', emoji: '🔄', description: 'La Main de l\'Ombre peut corrompre les joueurs déplacés par le Fouet — effet boomerang dévastateur.', descriptionEn: 'The Shadow\'s Hand can corrupt players displaced by the Whip — a devastating boomerang effect.' },

  // Marchand d'Âmes
  { roles: ['marchand', 'assassin'],    type: 'synergie',     emoji: '🤝', description: 'L\'Assassin crée des morts dans son quartier — le Marchand accumule les âmes sans effort.', descriptionEn: 'The Assassin creates deaths in his district — the Merchant accumulates souls effortlessly.' },
  { roles: ['marchand', 'pretresse'],   type: 'conflit',      emoji: '⚔️', description: 'La Prêtresse empêche les morts dans le quartier du Marchand, bloquant son accumulation d\'âmes.', descriptionEn: 'The Priestess prevents deaths in the Merchant\'s district, blocking his soul accumulation.' },
  { roles: ['marchand', 'fouet'],       type: 'detournement', emoji: '🔄', description: 'Le Fouet de Minuit peut l\'envoyer loin des combats, l\'empêchant de récolter des âmes.', descriptionEn: 'The Midnight Whip can send him far from combat, preventing him from harvesting souls.' },
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

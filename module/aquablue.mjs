// Import document classes.
import { AquablueActor } from "./documents/actor.mjs";
import { AquablueItem } from "./documents/item.mjs";
import { AquablueCombat } from "./documents/combatAquablue.mjs";
import { RollAquablue } from "./documents/roll.mjs";
// Import sheet classes.
import { AquablueActorSheet } from "./sheets/actor-sheet.mjs";
import { AquablueDonsSheet } from "./sheets/items/dons-sheet.mjs";
import { AquablueDefautsSheet } from "./sheets/items/defauts-sheet.mjs";
import { AquablueEquipementSheet } from "./sheets/items/equipement-sheet.mjs";
import { AquablueArmeProtectionSheet } from "./sheets/items/armeprotection-sheet.mjs";
import { AquablueProdigeSheet } from "./sheets/items/prodige-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { AQUABLUE } from "./helpers/config.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.aquablue = {
    applications: {
      AquablueActorSheet,
      AquablueDonsSheet,
      AquablueDefautsSheet,
      AquablueEquipementSheet,
      AquablueArmeProtectionSheet,
    },
    documents:{
      AquablueActor,
      AquablueItem
    },
    RollAquablue,
    RollAquablueMacro
  };

  // Add custom constants for configuration.
  CONFIG.AQUABLUE = AQUABLUE;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "@maitrises.physique.value",
    decimals: 2
  };

  // Define custom Roll class
  CONFIG.Dice.rolls.unshift(RollAquablue);

  // Define custom Document classes
  CONFIG.Actor.documentClass = AquablueActor;
  CONFIG.Item.documentClass = AquablueItem;
  CONFIG.Combat.documentClass = AquablueCombat;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Items.unregisterSheet("core", ItemSheet);

  Actors.registerSheet("aquablue", AquablueActorSheet, { 
    types: ["pj"],
    makeDefault: true 
  });
  Actors.registerSheet("aquablue", AquablueActorSheet, { 
    types: ["pnj"],
    makeDefault: true 
  });

  Items.registerSheet("aquablue", AquablueDonsSheet, {
    types: ["dons"],
    makeDefault: true,
  });
  Items.registerSheet("aquablue", AquablueDefautsSheet, {
    types: ["defauts"],
    makeDefault: true,
  });
  Items.registerSheet("aquablue", AquablueEquipementSheet, {
    types: ["equipement"],
    makeDefault: true,
  });
  Items.registerSheet("aquablue", AquablueProdigeSheet, {
    types: ["prodigeterre", "prodigeair", "prodigeeau"],
    makeDefault: true,
  });
  Items.registerSheet("aquablue", AquablueArmeProtectionSheet, {
    types: ["armeprotection"],
    makeDefault: true,
  });

  Handlebars.registerHelper('pnj', function (value) {
    return value === "pnj";
  });

  Handlebars.registerHelper('animal', function (value) {
    return value === "animal";
  });
  Handlebars.registerHelper('humain', function (value) {
    return value === "humain";
  });
  Handlebars.registerHelper('mēume', function (value) {
    return value === "mēume";
  });
  Handlebars.registerHelper('métis', function (value) {
    return value === "métis";
  });
  Handlebars.registerHelper('robot', function (value) {
    return value === "robot";
  });
  Handlebars.registerHelper('autre', function (value) {
    return value === "autre";
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  Hooks.on("hotbarDrop", (bar, data, slot) => createMacro(data, slot));
});

async function createMacro(data, slot) {
  // Create the macro command
  const type = data.type;
  const command = `game.aquablue.RollAquablueMacro("${data.actorId}", "${type}", "${data.isProdige}", "${data.label}", "${data.itemId}");`;

  let img = "";

  if(type === "terre" || type === "air" || type === "eau") { 
    if(data.itemId != 0) {
      const item = game.actors.get(data.actorId).items.find(i => i.id === data.itemId);
      img = item.img;
    } 
  } else {
    img = "systems/aquablue/assets/icons/D6Black.svg";
  }

  let macro = await Macro.create({
    name: data.label,
    type: "script",
    img: img,
    command: command,
    flags: { "aquablue.attributMacro": true }
  });
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

function RollAquablueMacro(id, type, isProdige, label, itemId) {
  const speaker = ChatMessage.getSpeaker();

  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  if (!actor) actor = game.actors.get(id);

  const data = actor.data.data;

  const rollDialog = `
    <select id="typeRoll" style="width: 100%;
    text-align: center;
    margin-bottom: 3px;">
      <option value="0">${game.i18n.localize("AQUABLUE.ROLL.DIALOG.Normal")}</option>
      <option value="1">${game.i18n.localize("AQUABLUE.ROLL.DIALOG.AvecAvantage")}</option>
      <option value="2">${game.i18n.localize("AQUABLUE.ROLL.DIALOG.AvecDesavantage")}</option>
    </select>
    `;
  let rollAttribute = 0
  let maitrise = "";

  if(isProdige) { 
    switch(type) {
      case "terre":
        rollAttribute = +data.maitrises.physique.value;
        break;
      case "air":
        rollAttribute = +data.maitrises.mental.value;
        break;
      case "eau":
        rollAttribute = +data.maitrises.social.value;
        break;
    }
  }
  else { 
    rollAttribute = data.maitrises[type].value; 

    switch(type) {
      case "physique":
        maitrise = "PHYSIQUE";
        break;
  
      case "mental":
        maitrise = "MENTAL";
        break;
  
      case "social":
        maitrise = "SOCIAL";
        break;
    }
  }

  new Dialog({
    title: label+" : "+game.i18n.localize("AQUABLUE.ROLL.DIALOG.Label"),
    content: rollDialog,
    buttons: {
      button1: {
        label: game.i18n.localize("AQUABLUE.ROLL.DIALOG.Valider"),
        callback: async (html) => {
          const rollType = +html.find("select#typeRoll").val();
          let title;
          let rollValue;

          switch(rollType) {
            case 1:
              rollValue = `4D6kl3cs<=${rollAttribute}`;
              if(isProdige) { title = game.i18n.localize(`AQUABLUE.ROLL.TYPE.PRODIGE.JetDe`)+" "+label+" "+game.i18n.localize(`AQUABLUE.ROLL.TYPE.PRODIGE.AvecAvantage`); }
              else { title = game.i18n.localize(`AQUABLUE.ROLL.TYPE.${maitrise}.AvecAvantage`); }
              break;

            case 2:
              rollValue = `4D6kh3cs<=${rollAttribute}`;
              if(isProdige) { title = game.i18n.localize(`AQUABLUE.ROLL.TYPE.PRODIGE.JetDe`)+" "+label+" "+game.i18n.localize(`AQUABLUE.ROLL.TYPE.PRODIGE.AvecDesavantage`); }
              else { title = game.i18n.localize(`AQUABLUE.ROLL.TYPE.${maitrise}.AvecDesavantage`); }
              break;

            default:
              rollValue = `3D6cs<=${rollAttribute}`;
              if(isProdige) { title = game.i18n.localize(`AQUABLUE.ROLL.TYPE.PRODIGE.JetDe`)+" "+label; }
              else { title = game.i18n.localize(`AQUABLUE.ROLL.TYPE.${maitrise}.Normal`); }
              break;
          }
          const roll = await new game.aquablue.RollAquablue(rollValue, data);

          if(isProdige) {
            const prodigeTerre = data.maitrises.physique.competences.savoirFaire.liste.prodigeTerre;
            const prodigeAir = data.maitrises.mental.competences.sagesse.liste.prodigeAir;
            const prodigeEau = data.maitrises.social.competences.art.liste.prodigeEau;
            const chamanisme = data.maitrises.social.competences.ame.liste.chamanisme;
            let isChamane = false;

            if(prodigeTerre.v1 || prodigeTerre.v2 || prodigeTerre.v3) { isChamane = true; }
            if(prodigeAir.v1 || prodigeAir.v2 || prodigeAir.v3) { isChamane = true; }
            if(prodigeEau.v1 || prodigeEau.v2 || prodigeEau.v3) { isChamane = true; }
            if(chamanisme.v1 || chamanisme.v2 || chamanisme.v3) { isChamane = true; }

            if(isChamane) { roll.aquablue.isChamane = true; }
          }

          roll.aquablue.label = title;
          await roll.toMessage({
            speaker: {
            actor: this.actor?.id || null,
            token: this.actor?.token?.id || null,
            alias: this.actor?.name || null,
            }
          });
        },
        icon: `<i class="fas fa-check"></i>`
      },
      button2: {
        label: game.i18n.localize("AQUABLUE.ROLL.DIALOG.Annuler"),
        icon: `<i class="fas fa-times"></i>`
      }
    }
  }).render(true);

}
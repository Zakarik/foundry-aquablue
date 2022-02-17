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
    RollAquablue
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

});
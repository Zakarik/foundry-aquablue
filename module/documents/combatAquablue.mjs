/**
 * Extends Combat
 */
 export class AquablueCombat extends Combat {

    async rollInitiative(ids, {formula=null, updateTurn=true, messageOptions={}}={}) {

        // Structure input data
        ids = typeof ids === "string" ? [ids] : ids;
        const currentId = this.combatant?.id;
        const rollMode = messageOptions.rollMode || game.settings.get("core", "rollMode");
    
        // Iterate over Combatants, performing an initiative roll for each
        const updates = [];
        const messages = [];
        for ( let [i, id] of ids.entries() ) {
    
          // Get Combatant data (non-strictly)
          const combatant = this.combatants.get(id);
          if ( !combatant?.isOwner ) return results;
    
          // Produce an initiative roll for the Combatant
          const roll = combatant.getInitiativeRoll(formula);
          await roll.evaluate({async: true});
          updates.push({_id: id, initiative: roll.total});
    
          // Construct chat message data
          let messageData = foundry.utils.mergeObject({
            speaker: {
              scene: this.scene.id,
              actor: combatant.actor?.id,
              token: combatant.token?.id,
              alias: combatant.name
            },
            flavor: game.i18n.localize("AQUABLUE.ROLL.Initiative"),
            flags: {"core.initiativeRoll": true}
          }, messageOptions);
          const chatData = await roll.toMessage(messageData, {
            create: false,
            rollMode: combatant.hidden && (["roll", "publicroll"].includes(rollMode)) ? "gmroll" : rollMode
          });
    
          // Play 1 sound for the whole rolled set
          if ( i > 0 ) chatData.sound = null;
          messages.push(chatData);
        }
        if ( !updates.length ) return this;
    
        // Update multiple combatants
        await this.updateEmbeddedDocuments("Combatant", updates);
    
        // Ensure the turn order remains with the same combatant
        if ( updateTurn && currentId ) {
          await this.update({turn: this.turns.findIndex(t => t.id === currentId)});
        }
    
        // Create multiple chat messages
        await ChatMessage.implementation.create(messages);
        return this;
    }

    /**
     * Define how the array of Combatants is sorted in the displayed list of the tracker.
     * This method can be overridden by a system or module which needs to display combatants in an alternative order.
     * By default sort by initiative, next falling back to name, lastly tie-breaking by combatant id.
     * @private
     */
     _sortCombatants(a, b) {
        // if tie, sort by honor, less honorable first
        if (a.initiative === b.initiative) {
            const actorA = game.actors.get(a.data.actorId);
            const actorB = game.actors.get(b.data.actorId);

            let ra = 0;
            let rb = 0;

            switch(actorA.data.data.type) {
                case "humain":
                    ra = 5;
                    break;
        
                case "métis":
                    ra = 4;
                    break;
        
                case "mēumes":
                    ra = 3;
                    break;
        
                case "robot":
                    ra = 2;
                    break;

                case "animal":
                    ra = 1;
                    break;
        
                default:
                    ra = 0;
                    break;
            }
        
            switch(actorB.data.data.type) {
                case "humain":
                    rb = 5;
                    break;
        
                case "métis":
                    rb = 4;
                    break;
        
                case "mēumes":
                    rb = 3;
                    break;
        
                case "robots":
                    rb = 2;
                    break;

                case "animal":
                    ra = 1;
                    break;
        
                default:
                    rb = 0;
                    break;
            }

            let total = ra-rb;

            if(total === 0) {
                if(actorA.data.type == 'pj') {
                    return -1;
                } else if(actorB.data.type == 'pnj') {
                    return 1;
                } else {
                    return 0;
                }
            } else {
                return total;
            }
        }
        return b.initiative - a.initiative;
    }

    setupTurns() {
        // Determine the turn order and the current turn
        const turns = this.combatants.contents.sort(this._sortCombatants);
        
        if ( this.turn !== null) this.data.turn = Math.clamped(this.data.turn, 0, turns.length-1);
    
          // Update state tracking
        let c = turns[this.data.turn];
        this.current = {
          round: this.data.round,
          turn: this.data.turn,
          combatantId: c ? c.id : null,
          tokenId: c ? c.data.tokenId : null
        };
        return this.turns = turns;
    }
 }
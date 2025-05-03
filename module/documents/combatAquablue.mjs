/**
 * Extends Combat
 */
 export class AquablueCombat extends Combat {
    /**
     * Define how the array of Combatants is sorted in the displayed list of the tracker.
     * This method can be overridden by a system or module which needs to display combatants in an alternative order.
     * By default sort by initiative, next falling back to name, lastly tie-breaking by combatant id.
     * @private
     */
     _sortCombatants(a, b) {
        // if tie, sort by honor, less honorable first
        if (a.initiative === b.initiative) {
            const actorA = a.actor;
            const actorB = b.actor;

            let ra = 0;
            let rb = 0;

            switch(actorA.system.type) {
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

            switch(actorB.system.type) {
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
                if(actorA.type == 'pj') {
                    return -1;
                } else if(actorB.type == 'pnj') {
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
 }
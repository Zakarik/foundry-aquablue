/**
 * Extend the base Item document to support attributes and groups with a custom template creation dialog.
 * @extends {Item}
 */
export class AquablueItem extends Item {
    static async create(data, options = {}) {
        // Replace default image
        if (data.img === undefined) {

            switch(data.type) {
                case "equipement":
                    data.img = "systems/aquablue/assets/icons/equipement.svg";
                    break;

                case "armeprotection":
                    data.img = "systems/aquablue/assets/icons/weapons.svg";
                    break;

                case "dons":
                    data.img = "systems/aquablue/assets/icons/feat.svg";
                    break;

                case "defauts":
                    data.img = "systems/aquablue/assets/icons/fault.svg";
                    break;

                case "prodigeterre":
                    data.img = "systems/aquablue/assets/icons/ground.svg";
                    break;

                case "prodigeair":
                    data.img = "systems/aquablue/assets/icons/air.svg";
                    break;

                case "prodigeeau":
                    data.img = "systems/aquablue/assets/icons/water.svg";
                    break;
            }            
        }

        await super.create(data, options);
    }
}

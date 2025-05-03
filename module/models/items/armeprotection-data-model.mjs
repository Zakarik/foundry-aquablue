export class ArmeProtectionDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const {NumberField, StringField} = foundry.data.fields;
        let data = {
            portee:new StringField({initial:""}),
            traits:new StringField({initial:""}),
            degatsProtections:new NumberField({initial:0}),
        }

		return data;
	}

	_initialize(options = {}) {
		super._initialize(options);
	}

    get item() {
        return this.parent;
    }

    prepareBaseData() {
    }

    prepareDerivedData() {
    }

    static migrateData(source) {
        return super.migrateData(source);
    }
}
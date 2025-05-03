export class ProdigeDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const {NumberField, HTMLField} = foundry.data.fields;
        let data = {
            description:new HTMLField({initial:""}),
            rang:new NumberField({initial:0}),
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
import Common_Models from '../parts/common.mjs';

export class PersonnageDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const {SchemaField, StringField, NumberField, HTMLField} = foundry.data.fields;
        const parts = new Common_Models();

        let data = {
            occupation: new StringField({initial:""}),
            type: new StringField({initial:"humain"}),
            description: new HTMLField({initial:""}),
            richesse: new NumberField({initial:0}),
            energie: new SchemaField({
                value: new NumberField({initial:0}),
                min: new NumberField({initial:0}),
                max: new NumberField({initial:0}),
            }),
            maitrises: new SchemaField({
                physique:new SchemaField(parts.generateMaitrise('physique')),
                mental:new SchemaField(parts.generateMaitrise('mental')),
                social:new SchemaField(parts.generateMaitrise('social')),
            }),
        }

		return data;
	}

	_initialize(options = {}) {
		super._initialize(options);
	}

    get actor() {
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
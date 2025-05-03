export default class Common_Models {
    static SchemaField = foundry.data.fields.SchemaField;
    static BooleanField = foundry.data.fields.BooleanField;
    static NumberField = foundry.data.fields.NumberField;
    static HtmlField = foundry.data.fields.HTMLField;

    constructor() {}

    generateMaitrise(type) {
        const CFG = CONFIG.AQUABLUE.LIST.maitrise[type];
        const CMP = CONFIG.AQUABLUE.LIST.competence;
        let data = {
            min:new Common_Models.NumberField({initial:0}),
            value:new Common_Models.NumberField({initial:0}),
        };

        let cmp = {};

        for(let m of CFG) {
            const d = CMP[m];
            cmp[m] = new Common_Models.SchemaField({
                liste:this._addList(d[0], d[1], d[2]),
            });
        }

        data.competences = new Common_Models.SchemaField(cmp);

        return data;
    }

    _addList(l1, l2, l3) {
        return new Common_Models.SchemaField({
            [l1]:this._addCheck(),
            [l2]:this._addCheck(),
            [l3]:this._addCheck(),
        });
    }

    _addCheck() {
        return new Common_Models.SchemaField({
            v1: new Common_Models.BooleanField({initial:false}),
            v2: new Common_Models.BooleanField({initial:false}),
            v3: new Common_Models.BooleanField({initial:false}),
        });
    }
}

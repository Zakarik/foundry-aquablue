export class RollAquablue {
    static STANDARD = 0;
    static AVANTAGE = 1;
    static DESAVANTAGE = 2;

    constructor(actor, label) {
        this._actor = actor;
        this._results = null;
        this._critique = null;
        this._dices = [];
        this._roll = null;
        this._label = label;
        this._chaman = false;
    }

    get actor() {
        return this._actor;
    }

    set actor(value) {
        this._actor = value;
    }

    get results() {
        return this._results;
    }

    set results(value) {
        this._results = value;
    }

    get isCritique() {
        return this._critique;
    }

    set isCritique(value) {
        this._critique = value;
    }

    get dices() {
        return this._dices;
    }

    set dices(value) {
        this._dices = value;
    }

    get roll() {
        return this._roll;
    }

    set roll(value) {
        this._roll = value;
    }

    get label() {
        return this._label;
    }

    set label(value) {
        this._label = value;
    }

    get chaman() {
        return this._chaman;
    }

    set chaman(value) {
        this._chaman = value;
    }

    get difficulte() {
        return this._difficulte;
    }

    set difficulte(value) {
        this._difficulte = value;
    }

    async doRoll(dices) {
        const difficulte = this.difficulte;
        const roll = new Roll(dices);
        await roll.evaluate();

        const listDices = roll.dice[0].results;
        let allDice = [];
        let success = 0;
        let critique = false;

        for(let d of listDices) {
            if(d.active && d.result <= difficulte) success += 1;
            allDice.push(d)
        }

        if(allDice.length > 0) {
            const valeurReference = allDice[0];
            critique = allDice.every(dice => dice === valeurReference);
        }

        this.isCritique = critique;
        this.dices = allDice;
        this.roll = roll;
        this.results = success;
    }

    async sendMsg() {
        const chatRollMode = game.settings.get("core", "rollMode");
        let main = {};
        main.label = this.label;
        main.critique = this.isCritique;
        main.tooltip = this._formatTooltip(await this.roll.getTooltip());
        main.total = this.results;

        let chatData = {
            user:game.user.id,
            speaker: {
                actor: this.actor?.id ?? null,
                token: this.actor?.token ?? null,
                alias: this.actor?.name ?? null,
                scene: this.actor?.token?.parent?.id ?? null
            },
            content:await renderTemplate('systems/aquablue/templates/dice/roll.html', main),
            sound: CONFIG.sounds.dice,
            rolls:this.roll,
            rollMode:chatRollMode,
        };

        ChatMessage.applyRollMode(chatData, chatRollMode);
        const msg = await ChatMessage.create(chatData);
    }

    _formatTooltip(tooltip) {
        const difficulte = this.difficulte;
        tooltip = tooltip
        .replaceAll('d6 max', 'd6')
        .replaceAll('d6 min', 'd6');

        console.warn(this.chaman);

        if(!this.chaman) {
            for(let i = 1;i <= difficulte;i++) {
                tooltip = tooltip.replaceAll(`">${i}</li>`, ` max">${i}</li>`);
            }
        } else {
            tooltip = tooltip.replaceAll(`<ol class="dice-rolls">`, `<ol class="dice-rolls aquablueProdigeRoll">`);
        }

        return tooltip;
    }
}

/*export class RollAquablue extends Roll {
    static CHAT_TEMPLATE = "systems/aquablue/templates/dice/roll.html";

    constructor(formula, data = {}, options = {}) {
        super(formula, data, options);

        this.aquablue = {
            label: "",
            hasCritique: false,
            isChamane: false
        }
    }

    async render(chatOptions = {}) {
        chatOptions = foundry.utils.mergeObject(
            {
                user: game.user.id,
                flavor: null,
                template: this.constructor.CHAT_TEMPLATE,
                blind: false,
            },
            chatOptions
        );

        const isPrivate = chatOptions.isPrivate;

        // Execute the roll, if needed
        if (!this._evaluated) {
            await this.roll();
        }

        let toolTip = await this.getTooltip({ from: "render" });

        if(this.aquablue.isChamane) {
            toolTip = toolTip.replace(`<ol class="dice-rolls">`, `<ol class="dice-rolls aquablueProdigeRoll">`);
        }



        // Define chat data
        const chatData = {
            formula: isPrivate ? "???" : this._formula,
            flavor: isPrivate ? null : chatOptions.flavor || this.options.flavor,
            user: chatOptions.user,
            isPublicRoll: !isPrivate,
            tooltip: isPrivate ? "" : toolTip,
            total: isPrivate ? "?" : Math.round(this._total * 100) / 100,
            data: this.data,
            aquablue: isPrivate
                ? {
                    label: "???"
                }
                : {
                      ...this.aquablue
                  },
        };


        // Render the roll display template
        return renderTemplate(chatOptions.template, chatData);
    }

    /**
     * Execute the Roll, replacing dice and evaluating the total result
     * @override
     **/
    /* async evaluate({ minimize = false, maximize = false, async = true } = {}) {
        if (this._evaluated) {
            throw new Error("This Roll object has already been rolled.");
        }
        if (this.terms.length < 1) {
            throw new Error("This Roll object need dice to be rolled.");
        }

        // Clean terms (trim symbols)
        this.terms = this.constructor.simplifyTerms(this.terms);

        // Roll
        await super.evaluate({ minimize, maximize, async });
        this._evaluated = true;

        this.terms.forEach((dices) => {
            let list = [];

            for(let i = 0;i < dices.results.length;i++) {
                list.push(dices.results[i].result);
            }

            if(
            list.filter(x => x==1).length >= 3 ||
            list.filter(x => x==2).length >= 3 ||
            list.filter(x => x==3).length >= 3 ||
            list.filter(x => x==4).length >= 3 ||
            list.filter(x => x==5).length >= 3 ||
            list.filter(x => x==7).length >= 3
            ) {
                this.aquablue.hasCritique = true;
            }
        });

        return this;
    }

    async toMessage(messageData = {}, { rollMode = null, create = true } = {}) {
        // Perform the roll, if it has not yet been rolled
        if ( !this._evaluated ) await this.evaluate({async: true});

        // Prepare chat data
        messageData = foundry.utils.mergeObject({
        user: game.user.id,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        content: String(this.total),
        sound: CONFIG.sounds.dice
        }, messageData);
        messageData.rolls = [this];

        // Either create the message or just return the chat data
        const cls = getDocumentClass("ChatMessage");
        const msg = new cls(messageData);

        // Either create or return the data
        if ( create ) {
            let cCls = await cls.create(msg.toObject(), { rollMode });

            if(this.aquablue.isChamane) { cCls._rollExpanded = true; }

            return cCls;
        }
        else {
            if ( rollMode ) msg.applyRollMode(rollMode);
            return msg.toObject();
        }
    }*/

    /** @override
    static fromData(data) {
        const roll = super.fromData(data);

        roll.data = data.data;
        roll.aquablue = data.aquablue;

        return roll;
    }

    toJSON() {
        const json = super.toJSON();

        json.data = foundry.utils.duplicate(this.data);
        json.aquablue = foundry.utils.duplicate(this.aquablue);

        return json;
    }
}*/
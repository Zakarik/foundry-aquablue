/**
 * @extends {ActorSheet}
 */
export class AquablueActorSheet extends ActorSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["aquablue", "sheet", "actor"],
      template: "systems/aquablue/templates/actor-sheet.html",
      width: 700,
      height: 600,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}]
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData() {
    const context = super.getData();

    for (let [key, mast] of Object.entries(context.data.data.maitrises)){
      mast.label = game.i18n.localize(CONFIG.AQUABLUE.maîtrises[key]);

      for (let [keyCat, cat] of Object.entries(mast.competences)){
        cat.label = game.i18n.localize(CONFIG.AQUABLUE.categories[keyCat]);

        for (let [keyComp, comp] of Object.entries(cat.liste)){
          comp.label = game.i18n.localize(CONFIG.AQUABLUE.competences[keyComp]);
        }
      }
    }

    this._prepareCharacterItems(context);

    context.systemData = context.data.data;

    console.log(context);

    return context;
  }

  /**
     * Return a light sheet if in "limited" state
     * @override
     */
   get template() {
    if (!game.user.isGM && this.actor.limited) {
      return "systems/aquablue/templates/limited-sheet.html";
    }
    return this.options.template;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if ( !this.isEditable ) return;

    // CHECKBOX COMPETENCES
    html.find('.checkV1').click(ev => {
      const name = ev.currentTarget.name.split(".");
      const comp = name[6];

      const isCheck = ev.currentTarget.checked;

      if(!isCheck) {
        $("."+comp+"v2").prop("checked", false);
        $("."+comp+"v3").prop("checked", false);
      }
    });

    html.find('.checkV2').click(ev => {
      const name = ev.currentTarget.name.split(".");
      const comp = name[6];

      const isCheck = ev.currentTarget.checked;

      if(isCheck) {
        $("."+comp+"v1").prop("checked", true);
      } else {
        $("."+comp+"v3").prop("checked", false);
      }
    });

    html.find('.checkV3').click(ev => {
      const name = ev.currentTarget.name.split(".");
      const comp = name[6];

      const isCheck = ev.currentTarget.checked;

      if(isCheck) {
        $("."+comp+"v1").prop("checked", true);
        $("."+comp+"v2").prop("checked", true);
      }
    });

    html.find('.roll').hover(ev => {
      $(ev.currentTarget).attr('src','systems/aquablue/assets/icons/D6White.png');
    }, ev => {
      $(ev.currentTarget).attr('src','systems/aquablue/assets/icons/D6Black.png');
    });

    html.find('.extendButton').click(ev => {
      // const name = ev.currentTarget.name.split(".");
      
      $(ev.currentTarget).toggleClass("fa-plus-square fa-minus-square");

      if($(ev.currentTarget).hasClass("fa-minus-square")) {
        $(ev.currentTarget).parents(".extendParent").siblings().css("display", "block");
      } else {
        $(ev.currentTarget).parents(".extendParent").siblings().css("display", "none");
      }
    });

    html.find('.extendButtonSpec').click(ev => {
      // const name = ev.currentTarget.name.split(".");
      
      $(ev.currentTarget).toggleClass("fa-plus-square fa-minus-square");

      if($(ev.currentTarget).hasClass("fa-minus-square")) {
        $(ev.currentTarget).parents(".extendParent").siblings(".toExtend").css("display", "block");
      } else {
        $(ev.currentTarget).parents(".extendParent").siblings(".toExtend").css("display", "none");
      }
    });

    html.find('.item-create').click(this._onItemCreate.bind(this));

    html.find('.item-edit').click(ev => {
      const header = $(ev.currentTarget).parents(".extendParent");
      const item = this.actor.items.get(header.data("item-id"));
      item.sheet.render(true);
    });

    html.find('.item-delete').click(ev => {
      const header = $(ev.currentTarget).parents(".extendParent");
      const item = this.actor.items.get(header.data("item-id"));
      item.delete();
      header.slideUp(200, () => this.render(false));
    });

    html.find('.rollProdige').hover(ev => {
      $(ev.currentTarget).children("img").attr('src','systems/aquablue/assets/icons/D6White.png');
    }, ev => {
      $(ev.currentTarget).children("img").attr('src','systems/aquablue/assets/icons/D6Black.png');
    });
    
    // ROLL
    html.find('.roll').click(this._onRoll.bind(this));

    html.find('.rollProdige').click(this._onRollProdige.bind(this));

    // OPTIONS
    html.find('.options').click(this._options.bind(this));
  }

  /* -------------------------------------------- */
  _onRoll(event) {
    const element = event.currentTarget;
    const dataset = element.dataset;
    const rollmaitrise = dataset.type;    
    const rollAttribute = +dataset.value;    
    const rollDialog = `
      <select id="typeRoll" style="width: 100%;
      text-align: center;
      margin-bottom: 3px;">
        <option value="0">${game.i18n.localize("AQUABLUE.ROLL.DIALOG.Normal")}</option>
        <option value="1">${game.i18n.localize("AQUABLUE.ROLL.DIALOG.AvecAvantage")}</option>
        <option value="2">${game.i18n.localize("AQUABLUE.ROLL.DIALOG.AvecDesavantage")}</option>
      </select>
      `;
    let maitrise;
    
    switch(rollmaitrise) {
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

    new Dialog({
      title: game.i18n.localize(`AQUABLUE.maitrise.${maitrise}.Nom`)+" : "+game.i18n.localize("AQUABLUE.ROLL.DIALOG.Label"),
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
                title = game.i18n.localize(`AQUABLUE.ROLL.TYPE.${maitrise}.AvecAvantage`);
                break;

              case 2:
                rollValue = `4D6kh3cs<=${rollAttribute}`;
                title = game.i18n.localize(`AQUABLUE.ROLL.TYPE.${maitrise}.AvecDesavantage`);
                break;

              default:
                rollValue = `3D6cs<=${rollAttribute}`;
                title = game.i18n.localize(`AQUABLUE.ROLL.TYPE.${maitrise}.Normal`);
                break;
            }

            let roll = new Roll(rollValue, this.actor.data.data);

            roll.evaluate({async:false});
            const toolTip = await roll.getTooltip();
            const result = roll.result;
            const typeJet = this.actor.getFlag("world", "typeJet")
            
            const checkResults = roll.terms[0].results;
            let listDices = [];
            let hasCritique = ``;
            let dataChatMessage = {};

            for(let i = 0;i < checkResults.length;i++) { listDices.push(checkResults[i].result); }
            
            if(
              listDices.filter(x => x==1).length >= 3 ||
              listDices.filter(x => x==2).length >= 3 ||
              listDices.filter(x => x==3).length >= 3 ||
              listDices.filter(x => x==4).length >= 3 ||
              listDices.filter(x => x==5).length >= 3 ||
              listDices.filter(x => x==7).length >= 3
              ) {
                hasCritique = `<h4 class="dice-total" style="margin-top:5px">${game.i18n.localize(`AQUABLUE.ROLL.Critique`)}</h4>`;
              }

            const contentChatMessage = `
              <div class="dice-roll">
                <div class="dice-result">
                  <div class="dice-formula">${title}</div>
                      ${toolTip}
                  <h4 class="dice-total">${result}</h4>
                  ${hasCritique}
                </div>
              </div>
            `;

            dataChatMessage.user = game.user._id;
            dataChatMessage.speaker = ChatMessage.getSpeaker({ actor: this.actor });
            dataChatMessage.content = contentChatMessage;
                          
            switch(typeJet) {
              case "GM":
                dataChatMessage.whisper = ChatMessage.getWhisperRecipients("GM");
                break;
            }

            ChatMessage.create(dataChatMessage, {});
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

  _onRollProdige(event) {
    const element = event.currentTarget;
    const dataset = element.dataset;
    const rollName = dataset.name;    
    const rollAttr = dataset.type;    
    const rollDialog = `
      <select id="typeRoll" style="width: 100%;
      text-align: center;
      margin-bottom: 3px;">
        <option value="0">${game.i18n.localize("AQUABLUE.ROLL.DIALOG.Normal")}</option>
        <option value="1">${game.i18n.localize("AQUABLUE.ROLL.DIALOG.AvecAvantage")}</option>
        <option value="2">${game.i18n.localize("AQUABLUE.ROLL.DIALOG.AvecDesavantage")}</option>
      </select>
      `;
    let prodigeValue = 0;

    switch(rollAttr) {
      case "terre":
        prodigeValue = +this.getData().systemData.maitrises.physique.value;
        break;
      case "air":
        prodigeValue = +this.getData().systemData.maitrises.mental.value;
        break;
      case "eau":
        prodigeValue = +this.getData().systemData.maitrises.social.value;
        break;
    }

    new Dialog({
      title: rollName+" : "+game.i18n.localize("AQUABLUE.ROLL.DIALOG.Label"),
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
                rollValue = `4D6kl3cs<=${prodigeValue}`;
                title = game.i18n.localize(`AQUABLUE.ROLL.TYPE.PRODIGE.JetDe`)+" "+rollName+" "+game.i18n.localize(`AQUABLUE.ROLL.TYPE.PRODIGE.AvecAvantage`);
                break;

              case 2:
                rollValue = `4D6kh3cs<=${prodigeValue}`;
                title = game.i18n.localize(`AQUABLUE.ROLL.TYPE.PRODIGE.JetDe`)+" "+rollName+" "+game.i18n.localize(`AQUABLUE.ROLL.TYPE.PRODIGE.AvecDesavantage`);
                break;

              default:
                rollValue = `3D6cs<=${prodigeValue}`;
                title = game.i18n.localize(`AQUABLUE.ROLL.TYPE.PRODIGE.JetDe`)+" "+rollName;
                break;
            }

            let roll = new Roll(rollValue, this.actor.data.data);

            roll.evaluate({async:false});
            let toolTip = await roll.getTooltip();
            const result = roll.result;
            
            const checkResults = roll.terms[0].results;
            let listDices = [];
            let hasCritique = ``;
            let dataChatMessage = {};

            for(let i = 0;i < checkResults.length;i++) { listDices.push(checkResults[i].result); }
            
            if(
              listDices.filter(x => x==1).length >= 3 ||
              listDices.filter(x => x==2).length >= 3 ||
              listDices.filter(x => x==3).length >= 3 ||
              listDices.filter(x => x==4).length >= 3 ||
              listDices.filter(x => x==5).length >= 3 ||
              listDices.filter(x => x==7).length >= 3
              ) {
                hasCritique = `<h4 class="dice-total" style="margin-top:5px">${game.i18n.localize(`AQUABLUE.ROLL.Critique`)}</h4>`;
              }

            toolTip = toolTip.replace(`<div class="dice-tooltip"`, `<div class="dice-tooltip expanded"`);

            if(this._isChamane()) {
              toolTip = toolTip.replace(`<ol class="dice-rolls">`, `<ol class="dice-rolls aquablueProdigeRoll">`);
            }

            const contentChatMessage = `
              <div class="dice-roll">
                <div class="dice-result">
                  <div class="dice-formula">${title}</div>
                      ${toolTip}
                  <h4 class="dice-total">${result}</h4>
                  ${hasCritique}
                </div>
              </div>
            `;

            dataChatMessage.user = game.user._id;
            dataChatMessage.speaker = ChatMessage.getSpeaker({ actor: this.actor });
            dataChatMessage.content = contentChatMessage;
                          
            switch(typeJet) {
              case "GM":
                dataChatMessage.whisper = ChatMessage.getWhisperRecipients("GM");
                break;
            }

            ChatMessage.create(dataChatMessage, {})
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

  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    const dons = [];
    const defauts = [];
    const equipements = [];
    const armeprotection = [];
    const prodigeTerre = [];
    const prodigeAir = [];
    const prodigeEau = [];

    for (let i of sheetData.items) {
      // DONS.
      if (i.type === 'dons') {
        dons.push(i);
      }
      // DEFAUTS.
      else if (i.type === 'defauts') {
        defauts.push(i);
      }
      // EQUIPEMENTS.
      else if (i.type === 'equipement') {
        equipements.push(i);
      }
      // ARMESPROTECTIONS.
      else if (i.type === 'armeprotection') {
        armeprotection.push(i);
      }
      // PRODIGES.
      else if (i.type === 'prodigeterre') {
        prodigeTerre.push(i);
      }
      else if (i.type === 'prodigeair') {
        prodigeAir.push(i);
      }
      else if (i.type === 'prodigeeau') {
        prodigeEau.push(i);
      }
    }

    actorData.dons = dons;
    actorData.defauts = defauts;
    actorData.equipement = equipements;
    actorData.armeprotection = armeprotection;
    actorData.prodigeTerre = prodigeTerre;
    actorData.prodigeAir = prodigeAir;
    actorData.prodigeEau = prodigeEau;
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `${game.i18n.localize(`ITEM.Type${type.capitalize()}`)}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];
  
    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  _isChamane() {
    const data = this.getData().systemData;
    const prodigeTerre = data.maitrises.physique.competences.savoirFaire.liste.prodigeTerre;
    const prodigeAir = data.maitrises.mental.competences.sagesse.liste.prodigeAir;
    const prodigeEau = data.maitrises.social.competences.art.liste.prodigeEau;
    const chamanisme = data.maitrises.social.competences.ame.liste.chamanisme;
    let result = false;

    if(prodigeTerre.v1 || prodigeTerre.v2 || prodigeTerre.v3) { result = true; }
    if(prodigeAir.v1 || prodigeAir.v2 || prodigeAir.v3) { result = true; }
    if(prodigeEau.v1 || prodigeEau.v2 || prodigeEau.v3) { result = true; }
    if(chamanisme.v1 || chamanisme.v2 || chamanisme.v3) { result = true; }

    return result;
  }

  _options(event) {
    let pub = "selected";
    let GM = "";

    if(this.actor.getFlag("world", "typeJet") === "GM") {
      pub = "";
      GM = "selected";
    }

    const dialog = `
      <select id="typeJet" style="width: 100%;
      text-align: center;
      margin-bottom: 3px;">
        <option value="0" ${pub}>${game.i18n.localize("AQUABLUE.OPTIONS.Jetspublics")}</option>
        <option value="1" ${GM}>${game.i18n.localize("AQUABLUE.OPTIONS.Jetsprives")}</option>
      </select>
      `;

     new Dialog({
      title: game.i18n.localize("AQUABLUE.OPTIONS.Label"),
      content: dialog,
      buttons: {
        button1: {
          label: game.i18n.localize("AQUABLUE.ROLL.DIALOG.Valider"),
          callback: async (html) => {
            const typeJet = +html.find("select#typeJet").val();
            let resultTypeJet = "";

            switch(typeJet) {
              case 1: 
                resultTypeJet = "GM";
                break;
            }

            this.actor.setFlag("world", "typeJet", resultTypeJet);
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
}
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
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      dragDrop: [{dragSelector: ".draggable", dropSelector: null}],
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData() {
    const context = super.getData();

    for (let [key, mast] of Object.entries(context.data.system.maitrises)){
      mast.label = game.i18n.localize(CONFIG.AQUABLUE.maîtrises[key]);

      for (let [keyCat, cat] of Object.entries(mast.competences)){
        cat.label = game.i18n.localize(CONFIG.AQUABLUE.categories[keyCat]);

        for (let [keyComp, comp] of Object.entries(cat.liste)){
          comp.label = game.i18n.localize(CONFIG.AQUABLUE.competences[keyComp]);
        }
      }
    }

    this._prepareCharacterItems(context);

    context.systemData = context.data.system;

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
      $(ev.currentTarget).attr('src','systems/aquablue/assets/icons/D6White.svg');
    }, ev => {
      $(ev.currentTarget).attr('src','systems/aquablue/assets/icons/D6Black.svg');
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
      $(ev.currentTarget).children("img").attr('src','systems/aquablue/assets/icons/D6White.svg');
    }, ev => {
      $(ev.currentTarget).children("img").attr('src','systems/aquablue/assets/icons/D6Black.svg');
    });

    // ROLL
    html.find('.roll').click(this._onRoll.bind(this));

    html.find('.rollProdige').click(this._onRollProdige.bind(this));
  }

  _onDragStart(event) {
    const li = event.currentTarget;

    if ( event.target.classList.contains("content-link") ) return;

    const maitrise = $(li).data("type");
    const isProdige = $(li)?.data("isprodige") || false;
    const label = $(li)?.data("name") || "";

    // Create drag data
    const dragData = {
      actorId: this.actor.id,
      sceneId: this.actor.isToken ? canvas.scene?.id : null,
      tokenId: this.actor.isToken ? this.actor.token.id : null,
      label:label,
      type:maitrise,
      isProdige:isProdige,
      itemId:$(li)?.data("itemid") || 0
    };

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
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
            const roll = await new game.aquablue.RollAquablue(rollValue, this.actor.system);

            roll.aquablue.label = title;
            await roll.toMessage({
              speaker: {
              actor: this.actor?.id || null,
              token: this.actor?.token?.id || null,
              alias: this.actor?.name || null,
              }
            });
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

            const roll = await new game.aquablue.RollAquablue(rollValue, this.actor.system);

            roll.aquablue.label = title;
            if(this._isChamane()) { roll.aquablue.isChamane = true; }

            await roll.toMessage({
              speaker: {
              actor: this.actor?.id || null,
              token: this.actor?.token?.id || null,
              alias: this.actor?.name || null,
              }
            });
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
    const name = `${game.i18n.localize(`TYPES.Item.${type}`)}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };

    switch(type) {
      case "equipement":
          itemData.img = "systems/aquablue/assets/icons/equipement.svg";
          break;

      case "armeprotection":
          itemData.img = "systems/aquablue/assets/icons/weapons.svg";
          break;

      case "dons":
          itemData.img = "systems/aquablue/assets/icons/feat.svg";
          break;

      case "defauts":
          itemData.img = "systems/aquablue/assets/icons/fault.svg";
          break;

      case "prodigeterre":
          itemData.img = "systems/aquablue/assets/icons/ground.svg";
          break;

      case "prodigeair":
          itemData.img = "systems/aquablue/assets/icons/air.svg";
          break;

      case "prodigeeau":
          itemData.img = "systems/aquablue/assets/icons/water.svg";
          break;
    }

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
}
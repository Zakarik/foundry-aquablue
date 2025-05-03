
export default class HooksAquablue {
    static async init() {

        console.warn('test');
        //DEBUT GESTION MESSAGES
        Hooks.on("renderChatMessage", (message, html, messageData) => {
            const tgt = $(html);

            tgt.find('.message-content div.dice-result').click(ev => {
                const header = $(ev.currentTarget).parents('.dice-roll');
                console.warn(header);
                header.toggleClass('expanded');
            });
        });
    }
}
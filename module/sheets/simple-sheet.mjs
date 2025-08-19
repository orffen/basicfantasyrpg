const { HandlebarsApplicationMixin } = foundry.applications.api
const { ActorSheetV2 } = foundry.applications.sheets

/**
 * A very basic Actor Sheet implementation using DocumentSheetV2
 */
export class SimpleActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {

    /** @override */
    static DEFAULT_OPTIONS = {
        ...ActorSheetV2.DEFAULT_OPTIONS,
        classes: ["basicfantasyrpg", "sheet", "actor", "themed", "theme-light"],
        position: {
            width: 400,
            height: 300
        },
        window: {
            resizable: true,
            title: "Just an actor!"
        },
        form: {
            handler: SimpleActorSheet.#onSubmitDocumentForm,
            submitOnChange: true
        }
    };

    /** @override */
    static PARTS = {
        header: {
            template: "systems/basicfantasyrpg/templates/actor/simple-actor-sheet.hbs"
        }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        // Add the actor's basic data to the context
        context.actor = this.document;
        context.system = this.document.system;
        context.name = this.document.name;

        return context;
    }

    /** @override */
    _onRender(context, options) {
        super._onRender(context, options);

        // Add any additional rendering logic here
        console.log("Simple Actor Sheet rendered for:", context.name);
    }

    /**
     * Handle form submission for the actor sheet
     * @param {SubmitEvent} event      The form submission event
     * @param {HTMLFormElement} form   The submitted form
     * @param {FormDataExtended} formData The form data
     * @returns {Promise<void>}
     */
    static async #onSubmitDocumentForm(event, form, formData) {
        const updates = foundry.utils.expandObject(formData.object);
        return this.document.update(updates);
    }
}

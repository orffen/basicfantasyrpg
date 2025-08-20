import { successChatMessage } from '../helpers/chat.mjs';
import { onManageActiveEffect, prepareActiveEffectCategories } from '../helpers/effects.mjs';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Base Actor Sheet class for Basic Fantasy RPG
 * Contains shared functionality for all actor types
 * @extends {ActorSheetV2}
 */
export class BaseActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["basicfantasyrpg", "sheet", "actor", "themed", "theme-light"],
    position: {
      width: 600,
      height: 600
    },
    window: {
      resizable: true
    },
    form: {
      handler: BaseActorSheet.#onSubmitDocumentForm,
      submitOnChange: true
    },
  };

  /** @override */
  async _prepareContext(options) {
      const context = await super._prepareContext(options);

      // Add the actor's basic data to the context
      context.actor = this.document;
      context.system = this.document.system;
      context.name = this.document.name;
      context.data = context.system;

      // // biography editor
      // context.enrichedBiography = await TextEditor.enrichHTML(
      //   this.document.system.biography,
      //   {
      //     async: true,
      //   }
      // );

      return context;
  }

  /**
   * Handle form submission for the actor sheet
   * @param {SubmitEvent} event The form submission event
   * @param {HTMLFormElement} form The submitted form
   * @param {FormDataExtended} formData The form data
   * @returns {Promise<void>}
   */
  static async #onSubmitDocumentForm(event, form, formData) {
    const updates = foundry.utils.expandObject(formData.object);
    return this.document.update(updates);
  }
}
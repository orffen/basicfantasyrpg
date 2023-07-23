/**
 * Check if a roll was successful and format a success/failure message.
 *
 * @param {Number} result The result of the roll
 * @param {Number} targetNumber The target number to beat for the roll to be successful
 * @param {Boolean} rollUnder Whether to check for rolling under the target number (defaults to false)
 *
 * @return {String}
 */
export function successChatMessage(result, targetNumber, rollUnder=false) {
  let msg = '';
  let success = false;
  if (result && !isNaN(result) && targetNumber && !isNaN(targetNumber)) {
    if (rollUnder) {
      success = (Number(result) <= Number(targetNumber));
    } else {
      success = (Number(result) === 20 || (Number(result) > 1 && Number(result) >= Number(targetNumber)));
    }
    msg += `<span class="chat-item-description">`;
    if (success) {
      msg += `<span class="chat-roll-success">&#9989;&nbsp;${game.i18n.localize('BASICFANTASYRPG.Success')}</span>`;
    } else {
      msg += `<span class="chat-roll-failure">&#9940;&nbsp;${game.i18n.localize('BASICFANTASYRPG.Failure')}</span>`;
    }
    msg += ` ${game.i18n.localize('BASICFANTASYRPG.VersusAbbr')} ${game.i18n.localize('BASICFANTASYRPG.TargetNumber').toLowerCase()} <span class="chat-roll-target-number">${targetNumber}</span></span>`;
  }
  return msg;
}

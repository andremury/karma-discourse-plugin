import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { action, set } from "@ember/object";
import VotingHistory from "../../lib/voting-history/index";
import { request } from "../../lib/request";

export default Component.extend({
  router: service(),

  profile: {},

  votes: [],

  async didReceiveAttrs() {
    if (!this.votes.length) {
      this._super(...arguments);
      const votes = await VotingHistory.start(this.profile, {
        SiteSettings: this.siteSettings,
      });
      if (!this.votes.length && votes.length) {
        set(this, "votes", votes);
      }
    }
  },
});

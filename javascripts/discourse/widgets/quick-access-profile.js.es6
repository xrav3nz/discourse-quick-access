import DiscourseURL from "discourse/lib/url";
import QuickAccessPanel from "discourse/widgets/quick-access-panel";
import { createWidgetFrom } from "discourse/widgets/widget";

createWidgetFrom(QuickAccessPanel, "quick-access-profile", {
  buildKey: () => "quick-access-profile",

  hasMore() {
    // Never show the button to the full profile page.
    return false;
  },

  showAll() {
    DiscourseURL.routeTo(this.attrs.path);
  },

  findStaleItems() {
    return this._getItems();
  },

  findNewItems() {
    return Ember.RSVP.Promise.resolve(this._getItems());
  },

  itemHtml(item) {
    return this.attach("quick-access-item", item);
  },

  _getItems() {
    const items = this._getDefaultItems();
    if (this.attrs.showLogoutButton) {
      items.push(this._logOutButton());
    }
    return items;
  },

  _getDefaultItems() {
    return [
      {
        icon: "user",
        href: `${this.attrs.path}/summary`,
        content: I18n.t("user.summary.title")
      },
      {
        icon: "stream",
        href: `${this.attrs.path}/activity`,
        content: I18n.t("user.activity_stream")
      },
      {
        icon: "envelope",
        href: `${this.attrs.path}/messages`,
        content: I18n.t("user.private_messages")
      },
      {
        icon: "cog",
        href: `${this.attrs.path}/preferences`,
        content: I18n.t("user.preferences")
      }
    ];
  },

  _logOutButton() {
    return {
      icon: "sign-out-alt",
      action: "logout",
      href: this.attrs.path,
      content: I18n.t("user.log_out")
    };
  }
});

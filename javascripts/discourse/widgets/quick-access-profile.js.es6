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
    if (this._showToggleAnonymousButton()) {
      items.push(this._toggleAnonymousButton());
    }
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

  _toggleAnonymousButton() {
    if (this.currentUser.is_anonymous) {
      return {
        action: "toggleAnonymous",
        className: "disable-anonymous",
        icon: "ban",
        content: I18n.t("switch_from_anon")
      };
    } else {
      return {
        action: "toggleAnonymous",
        className: "enable-anonymous",
        icon: "user-secret",
        content: I18n.t("switch_to_anon")
      };
    }
  },

  _logOutButton() {
    return {
      icon: "sign-out-alt",
      action: "logout",
      content: I18n.t("user.log_out")
    };
  },

  _showToggleAnonymousButton() {
    return (
      (this.siteSettings.allow_anonymous_posting &&
        this.currentUser.trust_level >=
          this.siteSettings.anonymous_posting_min_trust_level) ||
      this.currentUser.is_anonymous
    );
  }
});

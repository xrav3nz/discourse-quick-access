import { h } from "virtual-dom";
import { withPluginApi } from "discourse/lib/plugin-api";

const UserMenuAction = {
  QUICK_ACCESS: "quickAccess"
};

const QuickAccess = {
  ASSIGNMENTS: "assignments",
  BOOKMARKS: "bookmarks",
  MESSAGES: "messages",
  NOTIFICATIONS: "notifications"
};

const UserMenuLinks = {
  bookmarksGlyph() {
    return Object.assign({}, this._super(), {
      action: UserMenuAction.QUICK_ACCESS,
      actionParam: QuickAccess.BOOKMARKS
    });
  },

  messagesGlyph() {
    return Object.assign({}, this._super(), {
      action: UserMenuAction.QUICK_ACCESS,
      actionParam: QuickAccess.MESSAGES
    });
  },

  isActive({ action, actionParam }) {
    return (
      action === UserMenuAction.QUICK_ACCESS &&
      actionParam === this.attrs.currentQuickAccess
    );
  },

  glyphHtml(glyph) {
    glyph = this._enableQuickAccessPanelFor(glyph);

    if (this.isActive(glyph)) {
      // Clicking on an active quick access tab icon should redirect the user
      // to the full page.
      delete glyph.action;
      delete glyph.actionParam;

      if (glyph.className) {
        glyph.className += " active";
      } else {
        glyph.className = "active";
      }
    }

    glyph.hideLabel = true;

    return this.attach("link", glyph);
  },

  /**
   * Super charge other user menu glyphs (that cannot be easily overriden) with
   * a quick access panel.
   */
  _enableQuickAccessPanelFor(glyph) {
    if (glyph.className === "assigned") {
      return Object.assign({}, glyph, {
        action: UserMenuAction.QUICK_ACCESS,
        actionParam: QuickAccess.ASSIGNMENTS
      });
    }
    return glyph;
  }
};

const UserMenu = {
  quickAccess(type) {
    if (this.state.currentQuickAccess !== type) {
      this.state.currentQuickAccess = type;
    }
  },

  defaultState() {
    return Object.assign({}, this._super(), {
      currentQuickAccess: QuickAccess.NOTIFICATIONS
    });
  },

  panelContents() {
    const path = this.currentUser.get("path");
    const { currentQuickAccess } = this.state;

    const result = [
      this.attach("user-menu-links", {
        path,
        currentQuickAccess
      }),
      this.quickAccessPanel(path)
    ];

    if (this.settings.showLogoutButton || this.state.hasUnread) {
      result.push(h("hr.bottom-area"));
    }

    if (this.settings.showLogoutButton) {
      result.push(
        h("div.logout-link", [
          h(
            "ul.menu-links",
            h(
              "li",
              this.attach("link", {
                action: "logout",
                className: "logout",
                icon: "sign-out-alt",
                href: "",
                label: "user.log_out"
              })
            )
          )
        ])
      );
    }

    if (this.state.hasUnread) {
      result.push(this.attach("user-menu-dismiss-link"));
    }

    return result;
  },

  quickAccessPanel(path) {
    // This deliberately does NOT fallback to a default quick access panel.
    return this.attach(`quick-access-${this.state.currentQuickAccess}`, {
      path
    });
  },

  itemsLoaded({ hasUnread, markRead }) {
    this.state.hasUnread = hasUnread;
    this.state.markRead = markRead;
  }
};

export default {
  name: "discourse-quick-access-initializer",
  initialize() {
    withPluginApi("0.8.7", api => {
      api.addUserMenuGlyph(({ attrs }) => ({
        label: "user.notifications",
        className: "user-notifications-link",
        icon: "bell",
        href: `${attrs.path}/notifications`,
        action: UserMenuAction.QUICK_ACCESS,
        actionParam: QuickAccess.NOTIFICATIONS
      }));

      api.reopenWidget("user-menu-links", UserMenuLinks);
      api.reopenWidget("user-menu", UserMenu);
    });
  }
};
